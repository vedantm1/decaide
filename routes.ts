import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { verifySupabaseToken, optionalSupabaseAuth } from "./supabase-auth";
import {
  DECA_CATEGORIES,
  DECA_EVENTS,
  EVENT_TYPE_GROUPS,
  PI_CATEGORIES,
  SUBSCRIPTION_LIMITS,
} from "@shared/schema";
import { getRandomPIsForRoleplay } from "@shared/deca-utils";
import aiRoutes from "./routes/aiRoutes";
import chatRoutes from "./routes/chatRoutes";
import gameRoutes from "./routes/gameRoutes";
import axios from "axios";
import { generateTestQuestions, getOpenAIClient } from "./services/azureOpenai";
import multer from "multer";
import fs from "fs";
import path from "path";
import FormData from "form-data";

import Stripe from "stripe";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "Missing Stripe secret key. Stripe features will not work properly.",
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any, // Using as any to fix type mismatch with newer versions
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up multer for file uploads (memory storage for audio files)
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit for audio files
    },
    fileFilter: (req, file, cb) => {
      // Accept audio files
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
  });

  // Set up authentication routes
  setupAuth(app);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      message: "DecA(I)de server is running",
      timestamp: new Date(),
    });
  });

  // Simple in-memory rate limiter (per-IP) to protect API in absence of gateway
  const rateBucket: Record<string, { count: number; resetAt: number }> = {};
  const RATE_LIMIT = Number(process.env.RATE_LIMIT_PER_MINUTE || 120);
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) return next();
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const bucket = rateBucket[ip] || { count: 0, resetAt: now + 60_000 };
    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + 60_000;
    }
    bucket.count += 1;
    rateBucket[ip] = bucket;
    if (bucket.count > RATE_LIMIT) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    next();
  });

  // Sync user from Supabase auth
  app.post("/api/user/sync", async (req, res) => {
    try {
      const { authId, email, username, fullName } = req.body;
      
      if (!authId || !email || !username) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByAuthId(authId);
      if (existingUser) {
        return res.json(existingUser);
      }

      // Generate unique username if duplicate exists
      let finalUsername = username;
      let counter = 1;
      while (true) {
        try {
          const user = await storage.createUser({
            authId,
            username: finalUsername,
            email,
            fullName: fullName || null,
            showTutorial: true, // New users should see tutorial
            onboardingCompleted: false, // They need to complete onboarding
          });

          console.log('✨ Created new user for onboarding:', user.id, user.username);
          return res.status(201).json(user);
        } catch (error: any) {
          if (error.code === '23505' && error.constraint === 'users_username_key') {
            // Username already exists, try with counter
            finalUsername = `${username}${counter}`;
            counter++;
            if (counter > 100) {
              throw new Error('Unable to create unique username');
            }
            continue;
          }
          throw error;
        }
      }
    } catch (error: any) {
      console.error('User sync error:', error);
      res.status(500).json({ error: "Failed to sync user data" });
    }
  });

  // Get current user - updated for Supabase
  app.get("/api/user", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user data" });
    }
  });

  // Update user event selection with retry logic
  app.post("/api/user/event", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const { selectedEvent, selectedCluster } = req.body;
      
      console.log('🎯 Event selection request:', { authId, selectedEvent, selectedCluster });
      
      if (!selectedEvent || !selectedCluster) {
        return res.status(400).json({ error: "Missing event or cluster" });
      }

      // Retry logic for user lookup (sometimes there's a timing delay)
      let user = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!user && attempts < maxAttempts) {
        attempts++;
        user = await storage.getUserByAuthId(authId);
        
        if (!user) {
          console.log(`⏳ User not found on attempt ${attempts}, retrying...`);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          }
        }
      }

      if (!user) {
        console.error('❌ User not found after all attempts:', authId);
        return res.status(404).json({ error: "User not found - please try registering again" });
      }

      console.log('✅ Found user for event selection:', user.id, user.username);

      const updatedUser = await storage.updateUserSettings(user.id, {
        selectedEvent,
        selectedCluster,
        onboardingCompleted: true,
        showTutorial: false,
      });

      console.log('🎉 Successfully updated user event selection:', updatedUser?.selectedEvent, updatedUser?.selectedCluster);
      res.json(updatedUser);
    } catch (error) {
      console.error("Failed to update user event:", error);
      res.status(500).json({ error: "Failed to update event selection" });
    }
  });

  // Update user preferences
  app.patch("/api/user/preferences", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const updates = req.body;
      
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const updatedUser = await storage.updateUserSettings(user.id, updates);
      res.json(updatedUser);
    } catch (error) {
      console.error("Failed to update user preferences:", error);
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  // Register AI routes - note: /api/generate-roleplay is handled directly above
  // app.use("/api/ai", aiRoutes); // Commented out to avoid duplicate routes

  // Register Chat routes
  app.use("/api/chat", chatRoutes);
  
  // Register Game routes
  app.use("/api/games", gameRoutes);

  // API routes
  // Get subscription info
  app.get("/api/subscription-tiers", (req, res) => {
    res.json(SUBSCRIPTION_LIMITS);
  });

  // Get DECA events data
  app.get("/api/deca-events", (req, res) => {
    res.json({
      categories: DECA_CATEGORIES,
      events: DECA_EVENTS,
      eventTypeGroups: EVENT_TYPE_GROUPS,
    });
  });

  // Get PI categories
  app.get("/api/pi-categories", (req, res) => {
    res.json(PI_CATEGORIES);
  });

  // Test Azure OpenAI integration
  app.get("/api/test-azure-openai", async (req, res) => {
    try {
      const client = getOpenAIClient();
      const deployment = "gpt-4o-mini";

      const response = await client.getChatCompletions(
        deployment,
        [
          { role: "system", content: "You are a helpful DECA assistant." },
          {
            role: "user",
            content:
              "What is DECA and why is it important for high school students?",
          },
        ],
        {
          temperature: 0.7,
          maxTokens: 300,
        },
      );

      const content =
        response.choices[0]?.message?.content || "No response generated";
      res.json({ success: true, content });
    } catch (error: any) {
      console.error("Error testing Azure OpenAI:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        details: error.toString(),
      });
    }
  });

  // Get user stats
  app.get("/api/user/stats", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const stats = await storage.getUserStats(user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve user stats" });
    }
  });

  // Get all achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve achievements" });
    }
  });

  // Get user achievements
  app.get("/api/user/achievements", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const userAchievements = await storage.getUserAchievements(user.id);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve user achievements" });
    }
  });

  // Check and award new achievements
  app.post("/api/user/achievements/check", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const newAchievements = await storage.checkForNewAchievements(user.id);
      res.json(newAchievements);
    } catch (error) {
      res.status(500).json({ error: "Failed to check achievements" });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { timeRange = "week", selectedEvent = "all" } = req.query;

      // Get user stats
      const stats = await storage.getUserStats(user.id);

      // Get practice sessions for analytics
      const sessions = await storage.getUserSessions(user.id);

      // Calculate analytics data
      const totalActivities = sessions.length;
      const scores = sessions.filter((s: any) => s.score).map((s: any) => s.score!);
      const averageScore =
        scores.length > 0
          ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
          : 0;

      // Calculate completion rate based on started vs completed activities
      const completedActivities = sessions.filter(
        (s: any) => s.score && s.score >= 70,
      ).length;
      const completionRate =
        totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

      // Mock weekly growth for now (would calculate from historical data)
      const weeklyGrowth = 12.5;

      res.json({
        totalActivities,
        averageScore: Math.round(averageScore * 10) / 10,
        completionRate: Math.round(completionRate),
        weeklyGrowth,
        sessions,
        ...stats,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve analytics data" });
    }
  });

  // Learning Analytics and Personalization Routes

  // Get user learning insights
  app.get("/api/user/insights", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const insights = await storage.getUserLearningInsights(user.id);
      res.json(insights);
    } catch (error) {
      console.error("Error getting user insights:", error);
      res.status(500).json({ error: "Failed to get learning insights" });
    }
  });

  // Generate learning insights
  app.post("/api/user/insights/generate", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const insights = await storage.generateLearningInsights(user.id);
      res.json(insights);
    } catch (error) {
      console.error("Error generating insights:", error);
      res.status(500).json({ error: "Failed to generate learning insights" });
    }
  });

  // Get personalized topics (weak/strong areas)
  app.get("/api/user/topics", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const topics = await storage.getPersonalizedTopics(user.id);
      res.json(topics);
    } catch (error) {
      console.error("Error getting personalized topics:", error);
      res.status(500).json({ error: "Failed to get personalized topics" });
    }
  });

  // Save test result with detailed question tracking
  app.post("/api/test/result", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { cluster, level, questions, userAnswers, score, timeSpent } =
        req.body;

      // Calculate correct answers
      const correctAnswers = questions.filter(
        (q: any) => userAnswers[q.id] === q.answer,
      ).length;

      // Generate a descriptive test title
      const testTitle = `${cluster} ${level} Practice Test`;

      // Save test history
      const testHistory = await storage.saveTestHistory({
        userId: user.id,
        testTitle,
        cluster,
        level,
        totalQuestions: questions.length,
        correctAnswers,
        score,
        timeSpent,
        completedAt: new Date(),
      });

      // Save individual question results
      await storage.saveQuestionResults(
        testHistory.id,
        user.id,
        questions,
        userAnswers,
      );

      // Also save to practice sessions for compatibility
      await storage.recordPracticeSession({
        userId: user.id,
        type: "practice_test",
        score,
        completedAt: new Date(),
        details: JSON.stringify({ cluster, level }),
      });

      res.json({
        success: true,
        testHistoryId: testHistory.id,
        message: "Test result saved successfully",
      });
    } catch (error) {
      console.error("Error saving test result:", error);
      res.status(500).json({ error: "Failed to save test result" });
    }
  });

  // Get user test history for learning tab
  app.get("/api/test/history", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const history = await storage.getUserTestHistory(user.id);
      res.json(history);
    } catch (error) {
      console.error("Error getting test history:", error);
      res.status(500).json({ error: "Failed to get test history" });
    }
  });

  // Get detailed results for a specific test
  app.get("/api/test/history/:testId/results", verifySupabaseToken, async (req, res) => {
    try {
      const testId = parseInt(req.params.testId);
      const results = await storage.getTestQuestionResults(testId);
      res.json(results);
    } catch (error) {
      console.error("Error getting test results:", error);
      res.status(500).json({ error: "Failed to get test results" });
    }
  });

  // Get user weak topics for improvement
  app.get("/api/test/weak-topics", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const weakTopics = await storage.getUserWeakTopics(user.id);
      res.json(weakTopics);
    } catch (error) {
      console.error("Error getting weak topics:", error);
      res.status(500).json({ error: "Failed to get weak topics" });
    }
  });

  // Enhanced personalized learning endpoints
  app.get("/api/user/topic-mastery", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const mastery = await storage.getTopicMastery(user.id);
      res.json(mastery);
    } catch (error) {
      console.error("Error getting topic mastery:", error);
      res.status(500).json({ error: "Failed to get topic mastery" });
    }
  });

  app.post("/api/quiz/save-session", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const session = await storage.saveQuizSession({
        ...req.body,
        userId: user.id
      });

      // Update topic mastery based on quiz performance
      if (req.body.topicFocused) {
        await storage.updateTopicMastery(user.id, req.body.topicFocused, req.body.cluster || 'General', {
          questionsAnswered: req.body.questionsCount,
          questionsCorrect: req.body.correctAnswers,
          timeSpent: req.body.timeSpent || 0
        });
      }

      res.json(session);
    } catch (error) {
      console.error("Error saving quiz session:", error);
      res.status(500).json({ error: "Failed to save quiz session" });
    }
  });

  app.get("/api/user/enhanced-insights", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const insights = await storage.generateEnhancedInsights(user.id);
      res.json(insights);
    } catch (error) {
      console.error("Error getting enhanced insights:", error);
      res.status(500).json({ error: "Failed to get enhanced insights" });
    }
  });

  // Consolidated personalized recommendations endpoint
  app.get("/api/user/personalized-recommendations", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const recommendations = await storage.getPersonalizedRecommendations(user.id);
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting personalized recommendations:", error);
      res.status(500).json({ error: "Failed to get personalized recommendations" });
    }
  });

  app.get("/api/user/adaptive-difficulty/:topic", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const difficulty = await storage.getAdaptiveDifficulty(user.id, req.params.topic);
      res.json({ difficulty });
    } catch (error) {
      console.error("Error getting adaptive difficulty:", error);
      res.status(500).json({ error: "Failed to get adaptive difficulty" });
    }
  });

  // Roleplay History Routes
  app.post("/api/roleplay/session", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const roleplayData = {
        userId: user.id,
        scenario: req.body.scenario,
        cluster: req.body.cluster,
        role: req.body.role,
        score: req.body.score,
        aiGradingFeedback: req.body.aiGradingFeedback,
        transcriptUrl: req.body.transcriptUrl,
        duration: req.body.duration,
        completedAt: new Date()
      };

      const savedRoleplay = await storage.createRoleplaySession(roleplayData);
      res.json(savedRoleplay);
    } catch (error) {
      console.error("Error saving roleplay session:", error);
      res.status(500).json({ error: "Failed to save roleplay session" });
    }
  });

  app.get("/api/roleplay/history", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const roleplayHistory = await storage.getRoleplayHistory(user.id);
      res.json(roleplayHistory);
    } catch (error) {
      console.error("Error getting roleplay history:", error);
      res.status(500).json({ error: "Failed to get roleplay history" });
    }
  });

  // Generate topic practice questions with difficulty adjustment
  app.post("/api/generate-topic-practice", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { topic, cluster, level, questionCount = 3 } = req.body;

      // Get user's performance on this topic to determine difficulty
      const topicStats = await storage.getUserWeakTopics(user.id);
      const topicData = topicStats.find((t) => t.topic === topic);

      // Calculate failure rate for difficulty adjustment
      const failureRate = topicData
        ? topicData.wrongCount / topicData.totalCount
        : 0;
      const difficulty = failureRate > 0.5 ? "easy" : "medium and hard";

      // Generate topic explanation
      const explanationPrompt = `Write a comprehensive but concise explanation of "${topic}" as it relates to DECA ${cluster} competitions. Include:
      1. What this topic covers
      2. Key concepts students need to understand
      3. Why it's important for business
      4. Common applications or examples
      
      Keep it educational and practical for high school DECA students. Response should be 2-3 paragraphs.`;

      // Generate focused practice questions for the specific topic
      const questionsPrompt = `Generate ${questionCount} multiple choice questions specifically focused on the topic "${topic}" for DECA ${cluster} at ${level} level.

Important requirements:
- Questions should be ${difficulty} difficulty level
- Be directly related to "${topic}" concepts and real business scenarios
- Include 4 answer choices (A, B, C, D) with realistic distractors
- Include detailed explanations that teach the concept
- Focus on practical business applications of ${topic}
- Use current business terminology and practices

Return as JSON with this exact format:
{
  "topicExplanation": "comprehensive explanation of the topic",
  "questions": [
    {
      "id": 1,
      "stem": "question text with real business scenario",
      "options": {
        "A": "option A text",
        "B": "option B text", 
        "C": "option C text",
        "D": "option D text"
      },
      "answer": "A",
      "instructional_area": "${topic}",
      "explanation": "detailed explanation of why this answer is correct and how it relates to ${topic}"
    }
  ]
}`;

      const generatedContent = await generateTestQuestions({
        testType: `${cluster} - ${topic}`,
        categories: [topic],
        numQuestions: questionCount,
      });

      if (generatedContent && generatedContent.questions) {
        // Convert questions to expected format with proper explanations
        const formattedQuestions = generatedContent.questions.map(
          (q: any, index: number) => ({
            id: index + 1,
            stem: q.question || q.stem,
            options: q.options || {
              A: q.choices?.[0] || "Option A",
              B: q.choices?.[1] || "Option B",
              C: q.choices?.[2] || "Option C",
              D: q.choices?.[3] || "Option D",
            },
            answer: q.correctAnswer || q.answer || "A",
            instructional_area: topic,
            explanation:
              q.explanation ||
              `The correct answer demonstrates effective ${topic} principles, which is essential for business success.`,
          }),
        );

        res.json({
          questions: formattedQuestions,
          topicExplanation: `This topic covers important concepts in ${topic} that are essential for DECA competitions in the ${cluster} career cluster. Understanding these principles will help you excel in business scenarios and competitions.`,
          topic,
          difficulty,
          failureRate: Math.round(failureRate * 100),
          metadata: { cluster, level, questionCount },
        });
      } else {
        throw new Error("Failed to generate topic practice questions");
      }
    } catch (error) {
      console.error("Error generating topic practice:", error);
      res
        .status(500)
        .json({ error: "Failed to generate topic practice questions" });
    }
  });

  // Generate personalized learning test with enhanced DECA system
  app.post("/api/test/personalized", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { topic, questionCount = 8, level = "District" } = req.body;

      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      // Get user info to determine cluster
      const cluster = user.selectedCluster || "Marketing";
      
      // Get user's error rate for this topic from weak topics data
      const weakTopicsData = await storage.getUserWeakTopics(user.id);
      const topicData = weakTopicsData.find((t: any) => t.topic === topic);
      const errorRate = topicData ? (topicData.wrongCount / (topicData.totalCount || 1)) * 100 : 50;

      // Use the enhanced AI service to generate focused questions for the weak topic
      const { generateTestQuestions } = await import("./services/azureOpenai");

      const test = await generateTestQuestions({
        testType: 'personalized_learning',
        categories: [topic],
        numQuestions: questionCount,
        cluster: cluster,
        level: level,
        learningMode: true,
        weakTopics: [topic],
        errorRate: errorRate
      });

      // Mark as learning quiz type with enhanced metadata
      test.testType = "learning_quiz";
      (test as any).focusArea = topic;
      test.metadata = {
        ...test.metadata,
        generatedFor: "weakness_improvement",
        targetTopic: topic,
        questionCount,
        level,
        cluster,
        userId: user.id,
        errorRate: Math.round(errorRate),
        learningMode: true
      };

      // Record usage
      await storage.recordTestGeneration(user.id);

      // Debug log the response structure
      console.log('Personalized test generated:', {
        questionsCount: test.questions?.length || 0,
        hasQuestions: !!test.questions,
        sampleQuestion: test.questions?.[0] ? {
          id: test.questions[0].id,
          hasStem: !!test.questions[0].stem,
          hasOptions: !!test.questions[0].options,
          hasAnswer: !!test.questions[0].answer
        } : null
      });

      res.json(test);
    } catch (error) {
      console.error("Error generating personalized test:", error);
      res.status(500).json({ error: "Failed to generate personalized test" });
    }
  });

  // Enhanced roleplay generation
  app.post("/api/roleplay/generate", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const {
        duration,
        includeObjections,
        realTimeMode,
        focusArea,
        customInstructions,
        performanceIndicators,
        userEvent,
      } = req.body;

      // Check roleplay allowance - disabled for testing
      // const allowed = await storage.checkRoleplayAllowance(userId);
      // if (!allowed) {
      //   return res.status(403).json({
      //     error: "Monthly roleplay limit reached. Upgrade to generate more scenarios."
      //   });
      // }

      // Generate unique ID for scenario
      const scenarioId = `scenario_${Date.now()}`;

      // Get user's selected event for PI generation
      const selectedEvent = user.selectedEvent || userEvent;

      console.log(`DEBUG: Roleplay generation for user ${user.id}`);
      console.log(`DEBUG: Selected event: "${selectedEvent}"`);
      console.log(`DEBUG: Focus area: "${focusArea}"`);

      // Generate PIs using the actual function from deca-utils
      const generatedPIs = selectedEvent
        ? getRandomPIsForRoleplay(selectedEvent, focusArea)
        : [];

      console.log(
        `DEBUG: Generated ${generatedPIs.length} PIs:`,
        generatedPIs.map((pi) => pi.pi),
      );

      // Generate simple randomized scenario
      const companyNames = [
        "TechSolutions Inc",
        "Global Innovations LLC",
        "Strategic Partners Corp",
        "MarketLeaders Co",
        "BusinessPro Solutions",
        "InnovateNow Ltd",
        "Premier Business Group",
        "Excellence Enterprises",
        "Future Forward Corp",
      ];

      const industries = [
        "Technology Services",
        "Marketing & Advertising",
        "Financial Services",
        "Healthcare Solutions",
        "Retail & E-commerce",
        "Consulting Services",
        "Manufacturing",
        "Hospitality",
        "Education & Training",
      ];

      const characterNames = [
        "Alex Johnson",
        "Taylor Smith",
        "Jordan Martinez",
        "Casey Wilson",
        "Morgan Davis",
        "Riley Thompson",
        "Avery Garcia",
        "Quinn Rodriguez",
      ];

      const roles = [
        "Business Manager",
        "Department Head",
        "Regional Director",
        "Project Manager",
        "Sales Representative",
        "Operations Manager",
        "Account Executive",
        "Team Lead",
      ];

      const personalities = [
        "Professional and detail-oriented",
        "Results-driven and analytical",
        "Collaborative and strategic",
        "Innovative and forward-thinking",
        "Experienced and methodical",
        "Dynamic and goal-focused",
      ];

      // Random selections
      const selectedCompany =
        companyNames[Math.floor(Math.random() * companyNames.length)];
      const selectedIndustry =
        industries[Math.floor(Math.random() * industries.length)];
      const selectedName =
        characterNames[Math.floor(Math.random() * characterNames.length)];
      const selectedRole = roles[Math.floor(Math.random() * roles.length)];
      const selectedPersonality =
        personalities[Math.floor(Math.random() * personalities.length)];

      const aiScenario = {
        title: `${selectedIndustry} Business Meeting${selectedEvent ? ` - ${selectedEvent}` : ""}`,
        description: `A business roleplay scenario with ${selectedCompany}`,
        character: {
          name: selectedName,
          role: selectedRole,
          personality: selectedPersonality,
          background: `${Math.floor(Math.random() * 8) + 3}+ years of industry experience`,
        },
        context: {
          company: selectedCompany,
          industry: selectedIndustry,
          situation: "Strategic business consultation",
          challenges: [
            "Market positioning",
            "Budget optimization",
            "Service delivery",
          ],
        },
        objectives: generatedPIs.map((pi) => pi.pi),
      };

      const scenario = {
        id: scenarioId,
        title: selectedEvent || "DECA Roleplay Scenario",
        description: "",
        difficulty: "",
        estimatedTime: duration,
        objectives: [],
        character: null,
        context: null,
        evaluationCriteria: [],
        performanceIndicators: generatedPIs.length > 0 ? generatedPIs : [],
      };

      // Record the generation
      await storage.recordRoleplayGeneration(user.id);

      // Create practice session
      await storage.recordPracticeSession({
        userId: user.id,
        type: "roleplay",
        completedAt: new Date(),
        details: JSON.stringify({
          scenarioId,
          title: scenario.title,
          duration,
          scenario,
        }),
      });

      res.json(scenario);
    } catch (error) {
      console.error("Error generating roleplay:", error);
      res.status(500).json({ error: "Failed to generate roleplay scenario" });
    }
  });

  // Comprehensive analytics endpoints for the new analytics page
  app.get("/api/user/comprehensive-stats", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const timeRange = req.query.timeRange as string || "week";
      
      // Get user's comprehensive statistics
      const stats = await storage.getUserComprehensiveStats(user.id, timeRange);
      res.json(stats);
    } catch (error) {
      console.error("Error getting comprehensive stats:", error);
      res.status(500).json({ error: "Failed to get comprehensive stats" });
    }
  });

  app.get("/api/user/performance-analytics", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const timeRange = req.query.timeRange as string || "week";
      const analytics = await storage.getUserPerformanceAnalytics(user.id, timeRange);
      res.json(analytics);
    } catch (error) {
      console.error("Error getting performance analytics:", error);
      res.status(500).json({ error: "Failed to get performance analytics" });
    }
  });

  app.get("/api/user/study-patterns", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const timeRange = req.query.timeRange as string || "week";
      const patterns = await storage.getUserStudyPatterns(user.id, timeRange);
      res.json(patterns);
    } catch (error) {
      console.error("Error getting study patterns:", error);
      res.status(500).json({ error: "Failed to get study patterns" });
    }
  });

  app.get("/api/user/category-breakdown", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const breakdown = await storage.getUserCategoryBreakdown(user.id);
      res.json(breakdown);
    } catch (error) {
      console.error("Error getting category breakdown:", error);
      res.status(500).json({ error: "Failed to get category breakdown" });
    }
  });

  app.get("/api/user/learning-insights", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) return res.status(404).json({ error: "User not found" });
      const insights = await storage.getUserLearningInsights(user.id);
      res.json(insights);
    } catch (error) {
      console.error("Error getting learning insights:", error);
      res.status(500).json({ error: "Failed to get learning insights" });
    }
  });

  app.get("/api/user/recommendations", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) return res.status(404).json({ error: "User not found" });
      const recommendations = await storage.getPersonalizedRecommendations(user.id);
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  // Generate AI-powered roleplay scenario (using Supabase auth)
  app.post("/api/generate-roleplay", verifySupabaseToken, async (req, res) => {

    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const userId = user.id;
      const { instructional_area, difficulty, pis } = req.body;

      console.log("Generating roleplay scenario with:", {
        instructional_area,
        difficulty,
        pis,
      });

      // Validate required fields
      if (!instructional_area || !difficulty || !pis || !Array.isArray(pis)) {
        return res.status(400).json({
          error: "Missing required fields: instructional_area, difficulty, pis",
        });
      }

      // Construct the system prompt (the complete master prompt from the attached file)
      const systemPrompt =
        'You are the DECA Role-Play Architect. Your first and most important task is to analyze the user\'s input. Count the number of Performance Indicators (PIs) in the `pis` list.\n- If the count is **5**, you will adopt the **INDIVIDUAL EVENT ARCHITECT** persona and follow its rules exclusively.\n- If the count is **7**, you will adopt the **TDM EVENT ARCHITECT** persona and follow its rules exclusively.\n\nYou have memorized the following shared data:\n\n**SHARED DATA: SCENARIO MATRIX**\n`scenarioMatrix` = {\n    "Marketing Career Cluster": { "business_types": ["DTC Apparel Brand", "B2B Software Company", "Sports Team", "Digital Marketing Agency"], "brand_positions": ["mid-priced and trendy", "premium and exclusive", "value-oriented", "innovative"] },\n    "Finance Career Cluster": { "business_types": ["Regional Credit Union", "Investment Advisory Firm", "Corporate Accounting Dept.", "Insurance Agency"], "brand_positions": ["community-focused", "high-net-worth", "large-scale and efficient", "risk-averse"] },\n    "Hospitality Career Cluster": { "business_types": ["Luxury Hotel", "Eco-Tourism Resort", "Convention Bureau", "Quick-Serve Franchise"], "brand_positions": ["luxury and pampering", "eco-conscious", "budget-friendly", "business-focused"] },\n    "Business Management & Administration Career Cluster": { "business_types": ["Manufacturing Plant", "E-commerce Center", "Consulting Firm", "Hospital Administration"], "brand_positions": ["efficiency-driven", "employee-centric", "globally-scaled", "quality-focused"] },\n    "Entrepreneurship Career Cluster": { "business_types": ["Tech Startup", "Artisanal Food Company", "Subscription Box Service", "Social Enterprise"], "brand_positions": ["disruptive and innovative", "artisanal and high-quality", "community-focused", "convenience-oriented"] }\n}\n\n**SHARED DATA: DIFFICULTY RULES**\n`difficultyRules` = {\n    "District": { "complexity": "A straightforward operational problem.", "stakes": "Departmental level.", "judge_persona": "Direct Manager or a Peer. Supportive or curious." },\n    "Association": { "complexity": "A multi-faceted problem with a constraint.", "stakes": "Corporate or regional level.", "judge_persona": "Director or VP. Skeptical and data-driven." },\n    "ICDC": { "complexity": "A highly complex strategic problem with a dilemma.", "stakes": "Company-wide or industry level.", "judge_persona": "C-Suite Executive or external expert. Strategic and critical." }\n}\n\n---\n### **PERSONA 1: INDIVIDUAL EVENT ARCHITECT (5 PIs)**\n\n**Your entire focus is generating a 5-PI, 1-person role-play. You MUST ignore all rules from the TDM persona.**\n\n**RULES:**\n1.  **ROLE GENERATION: ONE ROLE (NON-NEGOTIABLE).** The scenario **MUST** assign exactly **ONE** participant role. The opening sentence of the narrative **MUST** be formatted as: `You are to assume the role of [Generated Role Title] of [Generated Company Name].`\n2.  **JUDGE ANONYMITY: NO NAMES, NEUTRAL PRONOUNS (NON-NEGOTIABLE).** The judge **MUST NOT** be given a proper name (e.g., Mr. Smith). The judge **MUST** only be referred to by their professional title (e.g., the Director of Operations). The pronouns for the judge **MUST ALWAYS** be they/them/their.\n3.  **NARRATIVE GENERATION:** Write the `scenario_text` with the heading "EVENT SITUATION". Synthesize a cohesive narrative that logically integrates the 5 PIs. You must invent a plausible company name and brand position. The narrative must contain an inciting incident, **NO FEWER THAN TWO** specific quantitative data points (e.g., `sales dropped 15%`, `a budget of $25,000`), and a judge with a clear motivation and personality.\n4.  **DELIVERABLES FORMATTING:** If the inferred cluster is **"Finance Career Cluster"**, you **MUST** create a clear, bulleted list of deliverables. For **all other clusters**, you **MUST** weave the deliverables into a descriptive paragraph.\n5.  **PARAGRAPH SPACING (NON-NEGOTIABLE):** All distinct paragraphs within the final `scenario_text` **MUST** be separated by a blank line (`\\n\\n`). This includes the separation between the main narrative, the task definition, the deliverables section, and the final logistical framing.\n6.  **FINAL SYSTEM CHECK & OUTPUT:** Before generating the final JSON, you must perform a final review of your generated `scenario_text` against this checklist:\n    * Does it have exactly **ONE** role?\n    * Does the judge have a title but **NO** name?\n    * Are all judge pronouns **gender-neutral (they/them/their)**?\n    * Are there at least **TWO** specific numbers (quantitative data)?\n    * Are paragraphs separated by **blank lines**?\n    * Are there **NO** headers for \'21st Century Skills\' or \'Performance Indicators\'?\n    * If any check fails, you must regenerate the `scenario_text` until it passes. Your final output must be a single JSON object with the specified schema.\n\n---\n### **PERSONA 2: TDM EVENT ARCHITECT (7 PIs)**\n\n**Your entire focus is generating a 7-PI, 2-person role-play. You MUST ignore all rules from the Individual persona.**\n\n**RULES:**\n1.  **ROLE GENERATION: TWO ROLES (NON-NEGOTIABLE).** The scenario **MUST** assign exactly **TWO** distinct but complementary participant roles. The opening sentence of the narrative **MUST** use the plural form: `You are to assume the roles of [Generated Role Title 1] and [Generated Role Title 2] of [Generated Company Name].`\n2.  **JUDGE ANONYMITY: NO NAMES, NEUTRAL PRONOUNS (NON-NEGOTIABLE).** The judge **MUST NOT** be given a proper name (e.g., Mr. Smith). The judge **MUST** only be referred to by their professional title (e.g., the Director of Operations). The pronouns for the judge **MUST ALWAYS** be they/them/their.\n3.  **NARRATIVE GENERATION:** Write the `scenario_text` with the heading "CASE STUDY SITUATION". Synthesize a cohesive narrative that logically integrates the 7 PIs. The core problem **MUST** be framed as a difficult strategic choice or dilemma. You must invent a plausible company name and brand position. The narrative must contain an inciting incident, at least two specific quantitative data points, hints of internal dynamics, and a judge with a clear motivation and personality.\n4.  **DELIVERABLES FORMATTING:** If the inferred cluster is **"Finance Career Cluster"**, you **MUST** create a clear, bulleted list of deliverables. For **all other clusters**, you **MUST** weave the deliverables into a descriptive paragraph.\n5.  **PARAGRAPH SPACING (NON-NEGOTIABLE):** All distinct paragraphs within the final `scenario_text` **MUST** be separated by a blank line (`\\n\\n`).\n6.  **FINAL SYSTEM CHECK & OUTPUT:** Before generating the final JSON, you must perform a final review of your generated `scenario_text` against this checklist:\n    * Does it have exactly **TWO** roles?\n    * Does the judge have a title but **NO** name?\n    * Are all judge pronouns **gender-neutral (they/them/their)**?\n    * Are there at least **TWO** specific numbers (quantitative data)?\n    * Are paragraphs separated by **blank lines**?\n    * Are there **NO** headers for \'21st Century Skills\' or \'Performance Indicators\'?\n    * If any check fails, you must regenerate the `scenario_text` until it passes. Your final output must be a single JSON object with the specified schema.\n\n---\n**OUTPUT SCHEMA (JSON mode)**\n`{"metadata": {"title": "<Generated Title>", "cluster": "<Inferred Cluster>", "level": "<User-Provided Difficulty>", "instructional_area": "<User-Provided IA>", "performance_indicators": ["<PI Code 1>", "<PI Code 2>", "..."]}, "scenario_text": "<The full, formatted role-play situation and instructions written as a single block of text, following the rules of the chosen persona.>"}`';

      // Get user's selected event and cluster for personalized generation
      const userEventInfo = user.selectedEvent ? `
Selected DECA Event: ${user.selectedEvent}
Selected Career Cluster: ${user.selectedCluster}
Event Type: ${user.selectedEvent && user.selectedEvent.includes('Team') ? 'Team Event (7 PIs)' : 'Individual Event (5 PIs)'}
` : '';

      // Construct the user prompt with user's event information
      const userPrompt = `${userEventInfo}
instructional_area: ${instructional_area}
difficulty: ${difficulty}
pis: ${pis.join(", ")}

IMPORTANT: The scenario MUST be relevant to the ${user.selectedCluster} career cluster and appropriate for the ${user.selectedEvent} event. Create a business scenario that fits this specific career cluster and event type.`;

      // Make the API call to Azure OpenAI
      const response = await axios.post(
        process.env.AZURE_OPENAI_ROLEPLAY_ENDPOINT!,
        {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 4096,
          temperature: 0.7,
          top_p: 0.95,
          response_format: { type: "json_object" },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.AZURE_OPENAI_ROLEPLAY_KEY,
          },
        },
      );

      console.log("Azure OpenAI response:", response.data);

      // Parse the response
      const scenarioContent = response.data.choices[0].message.content;
      let scenarioJson;

      try {
        scenarioJson = JSON.parse(scenarioContent);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.error("Raw response:", scenarioContent);
        throw new Error("Failed to parse AI response as JSON");
      }

      // Record the generation
      await storage.recordRoleplayGeneration(userId);

      // Create practice session
      await storage.recordPracticeSession({
        userId: userId,
        type: "roleplay",
        completedAt: new Date(),
        details: JSON.stringify({
          scenarioId: `ai_scenario_${Date.now()}`,
          title: scenarioJson.metadata?.title || "AI Generated Scenario",
          scenario: scenarioJson,
          instructional_area,
          difficulty,
          pis,
        }),
      });

      res.json(scenarioJson);
    } catch (error) {
      console.error("Error generating AI roleplay:", error);
      res
        .status(500)
        .json({ error: "Failed to generate AI roleplay scenario" });
    }
  });

  // Complete daily challenge task
  app.post("/api/daily-challenge/complete/:taskId", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const userId = user.id;
      const { taskId } = req.params;

      // Get current daily challenge
      const challenge = await storage.getDailyChallenge(userId);
      if (!challenge) {
        return res.status(404).json({ error: "No active daily challenge" });
      }

      // Mark task as completed (mock implementation)
      const pointsEarned = 50; // Mock points
      const challengeCompleted = false; // Would check if all tasks are done

      // Update user points (would need a proper method in storage)
      // For now, just record the session with the points earned

      // Record completion
      await storage.recordPracticeSession({
        userId,
        type: "daily-challenge",
        score: pointsEarned,
        completedAt: new Date(),
        details: JSON.stringify({
          challengeId: challenge.id,
          taskId,
          taskType: "daily-challenge",
        }),
      });

      res.json({
        pointsEarned,
        challengeCompleted,
        totalPoints: (challenge as any).totalPoints || 200,
      });
    } catch (error) {
      console.error("Error completing daily challenge task:", error);
      res.status(500).json({ error: "Failed to complete task" });
    }
  });

  // Generate written event prompt
  app.post("/api/written-events/generate", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const userId = user.id;
      const { eventType, difficulty, focusArea, specificRequirements } =
        req.body;

      // Check written event allowance
      const allowed = await storage.checkTestAllowance(userId);
      if (!allowed) {
        return res.status(403).json({
          error:
            "Monthly written event limit reached. Upgrade to generate more prompts.",
        });
      }

      // Generate unique ID
      const promptId = `prompt_${Date.now()}`;

      // Mock prompt generation
      const prompt = {
        id: promptId,
        title: `${eventType.replace("-", " ").charAt(0).toUpperCase() + eventType.replace("-", " ").slice(1)} - ${difficulty}`,
        scenario: `You are a business consultant tasked with creating a ${eventType.replace("-", " ")} for a growing technology company.`,
        requirements: [
          "Include executive summary",
          "Provide detailed analysis",
          "Include recommendations",
          "Professional formatting",
          specificRequirements
            ? `Focus on: ${specificRequirements}`
            : "Address all key areas",
        ].filter(Boolean),
        evaluationCriteria: [
          "Clarity and organization",
          "Depth of analysis",
          "Feasibility of recommendations",
          "Professional presentation",
          "Adherence to format",
        ],
        tips: [
          "Start with a strong executive summary",
          "Use data to support your points",
          "Be specific in your recommendations",
        ],
        estimatedTime:
          difficulty === "beginner"
            ? 30
            : difficulty === "competition"
              ? 90
              : 60,
        wordCount: {
          min: eventType === "executive-summary" ? 300 : 1000,
          max: eventType === "executive-summary" ? 500 : 2500,
        },
      };

      // Record the generation
      await storage.recordTestGeneration(userId);

      res.json(prompt);
    } catch (error) {
      console.error("Error generating written event:", error);
      res.status(500).json({ error: "Failed to generate prompt" });
    }
  });

  // Submit written event for feedback
  app.post("/api/written-events/feedback", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const userId = user.id;

      // Mock feedback generation
      const feedback = {
        overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
        strengths: [
          "Clear and organized structure",
          "Good use of business terminology",
          "Strong executive summary",
        ],
        improvements: [
          "Could include more data analysis",
          "Recommendations need more detail",
          "Consider adding visual elements",
        ],
        detailedFeedback: [
          {
            section: "Executive Summary",
            score: 85,
            comments:
              "Well-written and concise. Captures key points effectively.",
          },
          {
            section: "Analysis",
            score: 75,
            comments:
              "Good analysis but could benefit from more quantitative data.",
          },
          {
            section: "Recommendations",
            score: 70,
            comments:
              "Recommendations are relevant but need more implementation details.",
          },
        ],
        suggestions: [
          "Review sample high-scoring papers",
          "Practice data analysis techniques",
          "Work on actionable recommendations",
        ],
      };

      // Record practice session
      await storage.recordPracticeSession({
        userId,
        type: "written",
        score: feedback.overallScore,
        completedAt: new Date(),
        details: JSON.stringify({
          eventType: req.body.eventType || "unknown",
          feedback,
        }),
      });

      res.json(feedback);
    } catch (error) {
      console.error("Error providing feedback:", error);
      res.status(500).json({ error: "Failed to generate feedback" });
    }
  });

  // Check for new achievements
  app.post("/api/user/achievements/check", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const userId = user.id;
      const newAchievements = await storage.checkForNewAchievements(userId);
      res.json(newAchievements);
    } catch (error) {
      console.error("Error checking achievements:", error);
      res.status(500).json({ error: "Failed to check achievements" });
    }
  });

  // Get new achievements (not yet displayed)
  app.get("/api/user/achievements/new", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const newAchievements = await storage.getNewUserAchievements(user.id);
      res.json(newAchievements);
    } catch (error) {
      console.error("Error getting new achievements:", error);
      res.status(500).json({ error: "Failed to get new achievements" });
    }
  });

  // Mark achievement as displayed
  app.post(
    "/api/user/achievements/:achievementId/displayed",
    verifySupabaseToken,
    async (req, res) => {
      try {
        const authId = (req.user as any).id;
        const user = await storage.getUserByAuthId(authId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        const userId = user.id;
        const achievementId = parseInt(req.params.achievementId);

        const success = await storage.markAchievementAsDisplayed(
          userId,
          achievementId,
        );
        if (success) {
          res.json({ success: true });
        } else {
          res.status(404).json({ error: "Achievement not found" });
        }
      } catch (error) {
        console.error("Error marking achievement as displayed:", error);
        res.status(500).json({ error: "Failed to update achievement" });
      }
    },
  );

  // Get recent activities
  app.get("/api/user/activities", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const userId = user.id;
      const activities = await storage.getUserActivities(userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve user activities" });
    }
  });

  // Get learning items (in-progress activities)
  app.get("/api/user/learning", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const userId = user.id;
      const learningItems = await storage.getLearningItems(userId);
      res.json(learningItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve learning items" });
    }
  });

  // Get performance indicators
  app.get("/api/user/performance-indicators", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const userId = user.id;
      const category = req.query.category as string;
      const pis = await storage.getUserPIs(userId, category);
      res.json(pis);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to retrieve performance indicators" });
    }
  });

  // Update performance indicator status
  app.post("/api/user/performance-indicators/:id", async (req, res) => {
    if (!req.isAuthenticated) return res.sendStatus(401);

    try {
      const userId = parseInt(req.user!.id);
      const piId = parseInt(req.params.id);
      const { status } = req.body;

      const updated = await storage.updatePIStatus(userId, piId, status);
      if (!updated) {
        return res
          .status(404)
          .json({ error: "Performance indicator not found" });
      }

      res.json({ success: true, status });
    } catch (error) {
      res.status(500).json({ error: "Failed to update performance indicator" });
    }
  });

  // Get roleplay scenarios
  app.post("/api/roleplay/generate", async (req, res) => {
    if (!req.isAuthenticated) return res.sendStatus(401);

    try {
      const userId = parseInt(req.user!.id);
      const {
        instructionalArea,
        performanceIndicators,
        difficultyLevel,
        businessType,
      } = req.body;

      // Check if user has available roleplay generations based on subscription
      const canGenerate = await storage.checkRoleplayAllowance(userId);
      if (!canGenerate) {
        return res.status(403).json({
          error: "Roleplay generation limit reached for your subscription tier",
        });
      }

      // Generate roleplay (mock for now)
      const roleplay = {
        id: Date.now(),
        title: `${businessType || "Business"} ${instructionalArea} Roleplay`,
        scenario: `You are a specialist in ${instructionalArea}. The client needs your expertise on ${performanceIndicators.join(", ")}.`,
        performanceIndicators,
        difficulty: difficultyLevel,
        businessType,
        meetWith: "The business owner",
      };

      // Record the usage
      await storage.recordRoleplayGeneration(userId);

      res.json(roleplay);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate roleplay scenario" });
    }
  });

  // Generate AI-powered practice test (demo version - no auth required)
  app.post("/api/generate-test", async (req, res) => {
    try {
      const { cluster, level, questionCount } = req.body;

      // Skip user authentication checks for demo purposes
      // In production, you would check user subscription limits here
      let userId = null;
      if (req.user) {
        userId = req.user.id;
        const allowanceCheck = await storage.checkTestAllowance(userId);
        if (!allowanceCheck.allowed) {
          return res.status(403).json({
            error:
              allowanceCheck.message ||
              "Test generation limit reached for your subscription tier",
          });
        }
      }

      // Get Azure OpenAI and Search credentials from environment
      const azureKey = process.env.AZURE_OPENAI_KEY;
      const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
      const searchEndpoint = process.env.SEARCH_ENDPOINT;
      const searchKey = process.env.SEARCH_KEY;
      const searchIndex = process.env.SEARCH_INDEX_NAME;

      if (!azureKey || !azureEndpoint) {
        return res
          .status(500)
          .json({ error: "Azure OpenAI configuration missing" });
      }

      console.log("Search endpoint:", searchEndpoint);
      console.log("Search index:", searchIndex);
      console.log("Search key available:", !!searchKey);

      // Master prompt (system message) - exact text from requirements
      const systemPrompt = `You are a world-class psychometrician, an expert multiple-choice item writer, and a certified DECA Chapter Advisor with over two decades of experience. You possess an eidetic memory for all relevant DECA and MBA Research materials.

Your expertise is built upon a complete and internalized knowledge of:

DECA's National Curriculum Standards: You have memorized every Performance Indicator (PI) and its corresponding code across all instructional areas.

Official DECA Exam Blueprints: You will adhere strictly to the provided 2024-25 blueprint counts for instructional area distribution at the District, Association, and ICDC levels (blueprintData).

MBA Research Style & Psychometric Principles: You are a master of MBA Research's style manual for item writing. This includes maintaining a formal and objective stem tone, ensuring perfect grammatical parallelism and length balance across all four options, and targeting specific cognitive levels for each question.

DECA Exam Authenticity: You have analyzed all publicly-released sample exams for all seven clusters (Business Administration Core, Business Management + Administration, Finance, Marketing, Hospitality + Tourism, Personal Financial Literacy, and Entrepreneurship). You can replicate their unique "look-and-feel," including common wording conventions, the structure of scenarios, and the format of answer keys and rationales.

Your primary directive is to generate a complete, 100-question multiple-choice exam for a specified cluster and level that is indistinguishable from an official DECA competitive event exam.

Part 1: Foundational Data & Schemas (Strict Adherence Required)
1.1. 2024-25 OFFICIAL BLUEPRINT COUNTS (blueprintData)
You must generate the precise number of questions for each Instructional Area (IA) as specified for the requested cluster and competition level. The total must be exactly 100.

JSON

blueprintData = {
 "Business Administration Core": { "Business Law": {"District":1,"Association":1,"ICDC":4}, "Communications": {"District":15,"Association":15,"ICDC":11}, "Customer Relations": {"District":5,"Association":5,"ICDC":4}, "Economics": {"District":7,"Association":7,"ICDC":12}, "Emotional Intelligence":{"District":22,"Association":22,"ICDC":19}, "Entrepreneurship": {"District":0,"Association":0,"ICDC":1}, "Financial Analysis": {"District":16,"Association":16,"ICDC":13}, "Human Resources Management": {"District":1,"Association":1,"ICDC":1}, "Information Management": {"District":10,"Association":10,"ICDC":11}, "Marketing": {"District":1,"Association":1,"ICDC":1}, "Operations": {"District":11,"Association":11,"ICDC":13}, "Professional Development": {"District":11,"Association":11,"ICDC":9}, "Strategic Management": {"District":0,"Association":0,"ICDC":1} },
 "Business Management + Administration": { "Business Law":{"District":5,"Association":5,"ICDC":5}, "Communications":{"District":7,"Association":6,"ICDC":6}, "Customer Relations":{"District":2,"Association":2,"ICDC":1}, "Economics":{"District":6,"Association":5,"ICDC":4}, "Emotional Intelligence":{"District":9,"Association":8,"ICDC":6}, "Entrepreneurship":{"District":1,"Association":0,"ICDC":0}, "Financial Analysis":{"District":7,"Association":6,"ICDC":5}, "Human Resources Management":{"District":1,"Association":0,"ICDC":0}, "Information Management":{"District":7,"Association":6,"ICDC":6}, "Knowledge Management":{"District":6,"Association":7,"ICDC":9}, "Marketing":{"District":1,"Association":1,"ICDC":1}, "Operations":{"District":21,"Association":24,"ICDC":26}, "Professional Development":{"District":6,"Association":5,"ICDC":4}, "Project Management":{"District":6,"Association":7,"ICDC":8}, "Quality Management":{"District":3,"Association":4,"ICDC":5}, "Risk Management":{"District":4,"Association":5,"ICDC":5}, "Strategic Management":{"District":8,"Association":9,"ICDC":10} },
 "Finance": { "Business Law":{"District":7,"Association":8,"ICDC":7}, "Communications":{"District":5,"Association":4,"ICDC":3}, "Customer Relations":{"District":5,"Association":5,"ICDC":4}, "Economics":{"District":6,"Association":5,"ICDC":4}, "Emotional Intelligence":{"District":9,"Association":8,"ICDC":6}, "Entrepreneurship":{"District":1,"Association":0,"ICDC":0}, "Financial Analysis":{"District":24,"Association":28,"ICDC":30}, "Financial-Information Management":{"District":9,"Association":10,"ICDC":12}, "Human Resources Management":{"District":1,"Association":0,"ICDC":0}, "Information Management":{"District":6,"Association":5,"ICDC":5}, "Marketing":{"District":1,"Association":1,"ICDC":1}, "Operations":{"District":6,"Association":5,"ICDC":4}, "Professional Development":{"District":13,"Association":14,"ICDC":15}, "Risk Management":{"District":6,"Association":7,"ICDC":9}, "Strategic Management":{"District":1,"Association":0,"ICDC":0} },
 "Marketing": { "Business Law":{"District":2,"Association":2,"ICDC":1}, "Channel Management":{"District":5,"Association":6,"ICDC":7}, "Communications":{"District":5,"Association":4,"ICDC":3}, "Customer Relations":{"District":2,"Association":2,"ICDC":1}, "Economics":{"District":6,"Association":5,"ICDC":4}, "Emotional Intelligence":{"District":9,"Association":8,"ICDC":6}, "Entrepreneurship":{"District":1,"Association":0,"ICDC":0}, "Financial Analysis":{"District":6,"Association":5,"ICDC":4}, "Human Resources Management":{"District":1,"Association":0,"ICDC":0}, "Information Management":{"District":5,"Association":4,"ICDC":3}, "Market Planning":{"District":4,"Association":4,"ICDC":5}, "Marketing":{"District":1,"Association":1,"ICDC":1}, "Marketing-Information Management":{"District":11,"Association":14,"ICDC":16}, "Operations":{"District":6,"Association":5,"ICDC":4}, "Pricing":{"District":3,"Association":4,"ICDC":4}, "Product/Service Management":{"District":11,"Association":13,"ICDC":15}, "Professional Development":{"District":6,"Association":5,"ICDC":5}, "Promotion":{"District":9,"Association":11,"ICDC":13}, "Selling":{"District":6,"Association":7,"ICDC":8}, "Strategic Management":{"District":1,"Association":0,"ICDC":0} },
 "Hospitality + Tourism": { "Business Law":{"District":3,"Association":3,"ICDC":2}, "Communications":{"District":5,"Association":4,"ICDC":3}, "Customer Relations":{"District":8,"Association":9,"ICDC":9}, "Economics":{"District":6,"Association":6,"ICDC":5}, "Emotional Intelligence":{"District":9,"Association":9,"ICDC":7}, "Entrepreneurship":{"District":1,"Association":0,"ICDC":0}, "Financial Analysis":{"District":8,"Association":7,"ICDC":7}, "Human Resources Management":{"District":2,"Association":1,"ICDC":1}, "Information Management":{"District":14,"Association":15,"ICDC":15}, "Knowledge Management":{"District":0,"Association":1,"ICDC":1}, "Market Planning":{"District":1,"Association":1,"ICDC":2}, "Marketing":{"District":1,"Association":1,"ICDC":2}, "Operations":{"District":13,"Association":13,"ICDC":13}, "Pricing":{"District":1,"Association":1,"ICDC":1}, "Product/Service Management":{"District":6,"Association":7,"ICDC":9}, "Professional Development":{"District":8,"Association":7,"ICDC":6}, "Promotion":{"District":2,"Association":3,"ICDC":3}, "Quality Management":{"District":1,"Association":1,"ICDC":1}, "Risk Management":{"District":1,"Association":1,"ICDC":2}, "Selling":{"District":7,"Association":8,"ICDC":9}, "Strategic Management":{"District":3,"Association":2,"ICDC":2} },
 "Personal Financial Literacy": { "Earning Income":{"District":25,"Association":20,"ICDC":16}, "Spending":{"District":14,"Association":14,"ICDC":14}, "Saving":{"District":15,"Association":14,"ICDC":13}, "Investing":{"District":15,"Association":19,"ICDC":21}, "Managing Credit":{"District":16,"Association":19,"ICDC":21}, "Managing Risk":{"District":15,"Association":14,"ICDC":15} },
 "Entrepreneurship": { "Business Law":{"District":4,"Association":4,"ICDC":3}, "Channel Management":{"District":3,"Association":3,"ICDC":3}, "Communications":{"District":1,"Association":0,"ICDC":1}, "Customer Relations":{"District":1,"Association":1,"ICDC":1}, "Economics":{"District":3,"Association":3,"ICDC":2}, "Emotional Intelligence":{"District":6,"Association":6,"ICDC":4}, "Entrepreneurship":{"District":14,"Association":13,"ICDC":14}, "Financial Analysis":{"District":10,"Association":9,"ICDC":11}, "Human Resources Management":{"District":5,"Association":4,"ICDC":4}, "Information Management":{"District":4,"Association":3,"ICDC":2}, "Market Planning":{"District":5,"Association":6,"ICDC":6}, "Marketing":{"District":1,"Association":1,"ICDC":1}, "Marketing-Information Management":{"District":2,"Association":3,"ICDC":2}, "Operations":{"District":13,"Association":13,"ICDC":14}, "Pricing":{"District":2,"Association":3,"ICDC":2}, "Product/Service Management":{"District":4,"Association":4,"ICDC":4}, "Professional Development":{"District":5,"Association":5,"ICDC":4}, "Promotion":{"District":6,"Association":7,"ICDC":8}, "Quality Management":{"District":1,"Association":1,"ICDC":1}, "Risk Management":{"District":2,"Association":3,"ICDC":4}, "Selling":{"District":1,"Association":1,"ICDC":1}, "Strategic Management":{"District":7,"Association":7,"ICDC":8} }
}
1.2. DIFFICULTY & COGNITIVE LEVEL MIX (difficultyMix)
The generated exam must contain the exact percentage of questions specified for the competition level, mapped to the following cognitive levels:

Easy (Recall/Knowledge): Requires memorization of facts, terms, and basic concepts.

Medium (Application/Comprehension): Requires using a concept, theory, or formula in a straightforward, concrete scenario.

Hard (Analysis/Evaluation): Requires dissecting a complex scenario, comparing/contrasting multiple concepts, or judging the optimal course of action among several plausible options.

JSON

difficultyMix = {
 "District":{"easy":0.50,"medium":0.35,"hard":0.15},
 "Association":{"easy":0.40,"medium":0.40,"hard":0.20},
 "ICDC":{"easy":0.30,"medium":0.40,"hard":0.30}
}
1.3. OUTPUT SCHEMA (schemaJSON)
The final output must be a single, valid JSON object following this precise structure. No extra commentary, markdown, or text outside of the JSON is permitted.

JSON

schemaJSON = {
 "metadata":{"cluster":"<Marketing>","level":"<District>","generated_on":"YYYY-MM-DD","total_questions":100,"difficulty_breakdown":{"easy":50,"medium":35,"hard":15}},
 "questions":[{"id":1,"instructional_area":"Channel Management","pi_codes":["CM:001"],"difficulty":"hard","stem":"A luxury watchmaker sells through authorized dealers but also runs a 'by-appointment-only' flagship store in New York City that offers exclusive customization services. This strategy is an example of what type of dual distribution?","options":{"A":"Price-based channel differentiation","B":"Service-based channel differentiation","C":"Exclusive territory agreement","D":"Intensive distribution network"},"answer":"B","rationale":"This is service-based channel differentiation because the direct channel (flagship store) offers a unique service (customization) not available through the retail channel. It is not about undercutting price (A). An exclusive territory (C) would restrict dealers, which isn't the focus. Intensive distribution (D) aims for mass-market coverage, the opposite of a luxury brand's strategy."}],
 "answer_key":{"1":"B"}
}
Note: The rationale key within each question object in the questions array is the sole location for the detailed explanation. It must:
1. Clearly explain why the correct answer is right by referencing specific business concepts
2. Explain why each of the incorrect options is wrong, addressing common misconceptions
3. Be comprehensive yet concise (2-4 sentences)
4. Use business terminology appropriate to the cluster
5. Help students understand the underlying concept, not just memorize the answer

Example format: "Option B is correct because entrepreneurial ventures are characterized by high risk-taking and emphasis on innovation, which distinguishes them from traditional business models. Option A is incorrect as growth potential is typically high, not limited. Option C is wrong because entrepreneurial ventures often operate across multiple markets, not just locally. Option D is incorrect as these ventures typically require significant resources for innovation and scaling."

Part 2: Detailed Item-Writing Rules & Constraints
2.1. The DECA Nuance Factor (CRITICAL):
A majority of the exam, and all questions designated as "hard," must be constructed with a high degree of psychometric rigor. For each of these nuanced questions, exactly two of the four options must be highly plausible, requiring the test-taker to identify a single, precise detail to determine the correct answer. This creates a challenging and discriminating test item.

The "Near-Miss" Distractor: Craft one incorrect option (the "near-miss") to be conceptually very close to the right answer. It should reflect a common student misunderstanding of the Performance Indicator.

Mechanisms for Nuance: This critical distinction may be achieved through:

Qualifiers: A single word that limits scope, such as primary, initial, most likely, best, primary purpose.

Boundaries: A specific context that makes an otherwise correct option incorrect, such as a time frame, quantity, or business type (e.g., in the introduction stage; for a non-profit organization; affecting only variable costs).

Hierarchical Terms: Differentiating between closely related concepts like strategy vs. tactic, policy vs. procedure, brand promise vs. slogan, mission vs. vision.

Legal/Ethical Finesse: Distinguishing between what is unethical vs. illegal, the letter vs. the spirit of the law, or implied vs. explicit consent.

Scope Differences: Highlighting contrasts such as internal vs. external factor, fixed vs. variable cost, primary vs. secondary data, qualitative vs. quantitative research.

Vary the type of nuance used throughout the exam to prevent predictable patterns.

2.2. Item Style and Format (MBA Research Essentials):

Stem-First Construction: Every question must be a complete, direct question that is understandable on its own.

Option Requirements:

Provide four options labeled A, B, C, and D.

Maintain strict grammatical parallelism (e.g., all options are noun phrases, all begin with a present-tense verb).

Ensure options are of similar length (within a 10-15 character variance) to avoid providing unintentional clues.

Answer Distribution: CRITICAL REQUIREMENT - The correct answers must be distributed as evenly as possible (approx. 25% each for A, B, C, D). Never allow more than two consecutive questions to have the same letter answer. Pay special attention to avoid generating too many answers with the same letter (never more than 40% of questions should have the same correct answer letter). 

RANDOMIZATION RULE: When determining which option should be correct for each question, randomly assign the correct answer to A, B, C, or D. Do not default to making answer A correct for most questions. Actively vary the correct answer position throughout the exam.

Tone and Language: Use a formal, objective, third-person business tone. Avoid slang, colloquialisms, and biased or non-inclusive language. Match the specific terminology of each cluster (e.g., "touchpoint" in Hospitality, "bootstrapping" in Entrepreneurship).

2.3. Question Composition and Distribution:

Question Formulas (≈50%): Half the exam should use the following templates, selected based on what is most natural for the cluster.

A. Definition-Pick [Core, BM+A]

B. Most/Best Practice [All]

C. Except/Not (≤5% of total) [Core, PFL]

D. Scenario→Principle [BM+A, Entrepreneurship]

E. Cause-Effect [Economics]

F. Legal Test [Finance, BM+A]

G. Math-Solve [Finance, PFL]

H. Sequence/Process [Operations]

I. Benefit-Goal [Marketing, Hospitality]

J. Risk-Control [Finance, Entrepreneurship]

K. Ethics vs. Law [Core, BM+A]

L. Tech-Impact [Marketing, BM+A]

M. Touchpoint ID [Hospitality, Marketing]

N. PI-Match [All]

O. Behavior-Interpret [HR]

P. Globalization [Marketing, Core]

Q. Economics Curve [Core, Finance]

R. Budget/Variance [BM+A, Finance]

S. Customer-Service Empathy [Hospitality, Marketing]

T. Channel Conflict [Marketing]

U. Data-Analytics Use [Marketing, Finance]

V. Insurance-Risk Transfer [Finance, PFL]

W. Motivation Theory [BM+A, Core]

X. Career-Stage [BM+A]

Y. Compliance-AI Role [Finance, Core]

Z. Governance Action [BM+A]

Scenario Vignettes (30-40%): These questions must feature a rich, engaging narrative with realistic details.

Use full character names (e.g., "Marketing Director Alani Chen").

Use specific, plausible company names (e.g., "the logistics division at 'Terra-Trek Logistics'").

Provide industry and setting context (e.g., "a fast-casual restaurant in Chicago").

Proportions: 40-45% for Entrepreneurship & Hospitality; 20-25% for Core & Finance.

Blank-Completion Items (5-10%):

The stem must contain a blank (________) for a key term.

The four options must be grammatically parallel, single words or short phrases of similar length.

Numeric/Calculation Items (Finance & PFL only, ≈10-15%): These questions are restricted to clusters where quantitative analysis is a primary focus.

2.4. Psychometric Guardrails (Negative Constraints):
To ensure the highest quality, you must avoid common item-writing flaws:

No "All/None of the Above": Do not use "All of the above" or "None of the above" as options.

Avoid Absolutes: Do not use absolute words like always or never in options, as they are often giveaways.

Independent Distractors: Ensure that incorrect options are independently plausible and not merely direct opposites of the correct answer or each other.

No Trivial Questions: Every question must test a meaningful concept linked to a PI, not obscure trivia.

Part 3: Final Validation and Output Mandate
Before generating the final output, you must perform a silent, internal validation to confirm that every rule and constraint has been met:

Blueprint Check: Does the count for each IA match the blueprintData exactly?

Difficulty Check: Does the number of easy, medium, and hard questions match the difficultyMix quota?

PI Code Check: Is every question tagged with at least one accurate pi_code?

Answer Key Check: Is the answer distribution balanced, with no more than three consecutive identical letters?

Syntax Check: Is the output a single, perfectly valid JSON object conforming to the schema?

Duplication Check: Are all questions and scenarios unique within the exam?

Upon successful validation, generate ONLY the final JSON output. If the user request is "Generate a District-level Marketing exam," the response must begin with {"metadata":{"cluster":"Marketing","level":"District",... and end with the final closing brace }.
`;

      // Construct user message with specific request and explicit answer distribution guidance
      const userMessage = `Generate a ${questionCount}-question ${level}-level practice test for the ${cluster} cluster. 

CRITICAL: Ensure the correct answers are distributed randomly across A, B, C, and D options. Do not make all answers the same letter. Mix up the correct answers - some should be A, some B, some C, some D. Aim for roughly equal distribution (25% each letter when possible).

Follow all guidelines and ensure proper answer distribution during generation.`;

      console.log("Generating test with Azure OpenAI...");
      console.log("Cluster:", cluster);
      console.log("Level:", level);
      console.log("Question Count:", questionCount);

      // Construct correct Azure OpenAI endpoint
      const baseEndpoint = azureEndpoint.replace(/\/$/, ""); // Remove trailing slash
      const deploymentName =
        process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "decaide_test";
      const fullEndpoint = `${baseEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`;

      console.log("Using Azure endpoint:", fullEndpoint);
      console.log("Deployment name:", deploymentName);

      // Make request to Azure OpenAI
      const response = await fetch(fullEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": azureKey,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: 32768,
          temperature: 0.7,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0,
          stop: null,
          stream: false,

          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Azure OpenAI API error:", response.status, errorText);
        throw new Error(
          `Azure OpenAI API error: ${response.status} ${errorText}`,
        );
      }

      const azureResponse = await response.json();
      console.log("Azure OpenAI response received");

      // Parse the JSON response from Azure
      const quizContent = azureResponse.choices[0].message.content;
      const quizData = JSON.parse(quizContent);

      // Ensure explanation field compatibility (map rationale to explanation for frontend)
      if (quizData.questions) {
        quizData.questions.forEach((question: any) => {
          if (question.rationale && !question.explanation) {
            question.explanation = question.rationale;
          }
        });
      }

      // Ensure proper instructional area assignment based on cluster
      if (quizData.questions) {
        const clusterInstructionalAreas = {
          Marketing: [
            "Channel Management",
            "Market Planning",
            "Marketing-Information Management",
            "Product/Service Management",
            "Promotion",
            "Selling",
            "Pricing",
            "Communications",
            "Customer Relations",
          ],
          "Hospitality + Tourism": [
            "Customer Relations",
            "Operations",
            "Information Management",
            "Product/Service Management",
            "Communications",
            "Financial Analysis",
            "Selling",
            "Marketing",
          ],
          "Business Management + Administration": [
            "Operations",
            "Communications",
            "Strategic Management",
            "Project Management",
            "Quality Management",
            "Risk Management",
            "Knowledge Management",
          ],
          Finance: [
            "Financial Analysis",
            "Financial-Information Management",
            "Risk Management",
            "Professional Development",
            "Communications",
          ],
          "Business Administration Core": [
            "Communications",
            "Emotional Intelligence",
            "Financial Analysis",
            "Information Management",
            "Operations",
            "Professional Development",
          ],
          Entrepreneurship: [
            "Entrepreneurship",
            "Operations",
            "Financial Analysis",
            "Market Planning",
            "Promotion",
            "Strategic Management",
          ],
          "Personal Financial Literacy": [
            "Earning Income",
            "Spending",
            "Saving",
            "Investing",
            "Managing Credit",
            "Managing Risk",
          ],
        };

        const availableAreas = clusterInstructionalAreas[cluster] || [
          "General",
        ];

        // Assign specific instructional areas to questions that don't have them or have generic ones
        quizData.questions.forEach((question: any, index: number) => {
          if (
            !question.instructional_area ||
            question.instructional_area === cluster ||
            question.instructional_area === "General"
          ) {
            question.instructional_area =
              availableAreas[index % availableAreas.length];
          }

          // Also ensure the category field is set for backward compatibility
          if (!question.category) {
            question.category = question.instructional_area;
          }
        });
      }

      // Log answer distribution for monitoring (but don't change the answers!)
      if (quizData.questions && quizData.answer_key) {
        const answerDistribution = { A: 0, B: 0, C: 0, D: 0 };

        // Count current distribution
        Object.values(quizData.answer_key).forEach((answer: any) => {
          if (
            answerDistribution[answer as keyof typeof answerDistribution] !==
            undefined
          ) {
            answerDistribution[answer as keyof typeof answerDistribution]++;
          }
        });

        console.log("Answer distribution:", answerDistribution);

        // Check for poor distribution but DO NOT modify answers
        const totalQuestions = quizData.questions.length;
        const maxSameAnswer = Math.max(...Object.values(answerDistribution));

        if (maxSameAnswer > Math.ceil(totalQuestions * 0.5)) {
          console.warn(
            `Poor answer distribution detected: ${maxSameAnswer}/${totalQuestions} answers are the same (keeping original answers intact)`,
          );
          // Note: We intentionally do NOT redistribute answers as this breaks question accuracy
          // Instead, we should improve the AI prompt to generate better distribution initially
        }
      }

      // Record the usage (only if user is authenticated)
      if (userId) {
        await storage.recordTestGeneration(userId);
      }

      console.log(
        "Generated quiz with",
        quizData.questions?.length || 0,
        "questions",
      );

      // Send the parsed quiz JSON back to client
      res.status(200).json(quizData);
    } catch (error: any) {
      console.error("Error generating AI test:", error);
      res.status(500).json({
        error: "Failed to generate AI-powered test",
        details: error.message,
      });
    }
  });

  // Personalized Practice Quiz Generation
  app.post("/api/test/personalized", async (req, res) => {
    if (!req.isAuthenticated) return res.sendStatus(401);

    try {
      const userId = parseInt(req.user!.id);
      const { topic, questionCount = 8, level = "District" } = req.body;

      if (!topic) {
        return res.status(400).json({ error: "Topic is required for personalized practice" });
      }

      // Get user's selected event and cluster for context
      const user = await storage.getUser(userId);
      const cluster = user?.selectedCluster || "Marketing";

      console.log(`Generating personalized practice for user ${userId}, topic: ${topic}, level: ${level}`);

      // Generate personalized test using Azure OpenAI with focus on weak topic
      const test = await generateTestQuestions({
        testType: 'learning_quiz',
        categories: [topic],
        numQuestions: Math.min(questionCount, 15),
        cluster,
        level,
        learningMode: true,
        weakTopics: [topic],
        errorRate: undefined // Let AI decide difficulty based on topic focus
      });

      // Mark as personalized practice session
      test.metadata = {
        ...test.metadata,
        testType: 'personalized_practice',
        focusArea: topic,
        isPersonalized: true
      };

      // Record usage for analytics
      await storage.recordTestGeneration(userId);

      console.log(`Generated personalized practice with ${test.questions?.length || 0} questions for topic: ${topic}`);
      
      res.json(test);
    } catch (error: any) {
      console.error("Error generating personalized practice:", error);
      res.status(500).json({ 
        error: "Failed to generate personalized practice quiz",
        details: error.message 
      });
    }
  });

  // Generate practice quiz (alias for personalized endpoint)
  app.post("/api/generate-practice-quiz", async (req, res) => {
    if (!req.isAuthenticated) return res.sendStatus(401);

    const { topic, questionCount, level } = req.body;
    
    // Redirect to personalized endpoint with consistent parameters
    req.body = { topic, questionCount, level };
    
    // Call the personalized handler
    return app._router.handle({
      ...req,
      url: '/api/test/personalized',
      method: 'POST'
    }, res, (err: any) => {
      if (err) {
        console.error("Error in practice quiz generation:", err);
        res.status(500).json({ error: "Failed to generate practice quiz" });
      }
    });
  });

  // Generate test questions (legacy endpoint)
  app.post("/api/test/generate", async (req, res) => {
    if (!req.isAuthenticated) return res.sendStatus(401);

    try {
      const userId = parseInt(req.user!.id);
      const { testType, categories, numQuestions } = req.body;

      // Check if user has available test generations based on subscription
      const canGenerate = await storage.checkTestAllowance(userId);
      if (!canGenerate) {
        return res.status(403).json({
          error: "Test generation limit reached for your subscription tier",
        });
      }

      // Generate test questions (mock for now)
      const questions = Array.from({ length: numQuestions }).map((_, i) => ({
        id: i + 1,
        question: `Question about ${categories[i % categories.length]}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: Math.floor(Math.random() * 4),
      }));

      // Record the usage
      await storage.recordTestGeneration(userId);

      res.json({ testType, questions });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate test questions" });
    }
  });

  // Submit test results
  app.post("/api/test/submit", async (req, res) => {
    if (!req.isAuthenticated) return res.sendStatus(401);

    try {
      const userId = parseInt(req.user!.id);
      const { testType, score, details } = req.body;

      const session = await storage.recordPracticeSession({
        userId: userId,
        type: "test",
        score,
        completedAt: new Date(),
        details: JSON.stringify({ testType, ...details }),
      });

      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to save test results" });
    }
  });

  // Submit roleplay results
  app.post("/api/roleplay/submit", async (req, res) => {
    if (!req.isAuthenticated) return res.sendStatus(401);

    try {
      const userId = parseInt(req.user!.id);
      const { roleplayId, score, details } = req.body;

      const session = await storage.recordPracticeSession({
        userId: userId,
        type: "roleplay",
        score,
        completedAt: new Date(),
        details: JSON.stringify({ roleplayId, ...details }),
      });

      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to save roleplay results" });
    }
  });

  // Audio transcription endpoint
  app.post("/api/transcribe-audio", verifySupabaseToken, upload.single('audio'), async (req, res) => {
    if (!req.isAuthenticated) return res.sendStatus(401);

    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      // Get Azure Whisper credentials
      const azureWhisperEndpoint = process.env.AZURE_WHISPER_ENDPOINT;
      const azureWhisperKey = process.env.AZURE_WHISPER_KEY;

      if (!azureWhisperEndpoint || !azureWhisperKey) {
        return res.status(500).json({ 
          error: "Azure Whisper API configuration missing" 
        });
      }

      console.log('Transcribing audio file:', {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      // Create FormData for Azure API request (Node.js version)
      const formData = new FormData();
      
      // Append the audio file buffer directly to FormData
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname || 'audio.webm',
        contentType: req.file.mimetype,
      });
      formData.append('model', 'whisper-1'); // Required by Azure OpenAI

      // Make request to Azure Whisper API
      const response = await axios.post(azureWhisperEndpoint, formData, {
        headers: {
          'api-key': azureWhisperKey,
          ...formData.getHeaders(), // This sets the correct Content-Type with boundary
        },
        timeout: 30000, // 30 second timeout
      });

      console.log('Azure Whisper API response:', response.data);

      // Extract transcription text
      const transcription = response.data.text || '';

      // Return transcription to frontend
      res.json({ 
        transcription,
        success: true,
        metadata: {
          duration: response.data.duration || null,
          language: response.data.language || 'en'
        }
      });

    } catch (error: any) {
      console.error('Error transcribing audio:', error);
      
      // Handle specific Azure API errors
      if (error.response) {
        console.error('Azure API error response:', error.response.data);
        return res.status(error.response.status || 500).json({
          error: 'Transcription failed',
          details: error.response.data?.error || error.message
        });
      }
      
      res.status(500).json({
        error: 'Failed to transcribe audio',
        details: error.message
      });
    }
  });

  // AI grading endpoint for roleplay responses
  app.post("/api/grade-response", verifySupabaseToken, async (req, res) => {
    if (!req.isAuthenticated) return res.sendStatus(401);

    try {
      const { scenario, transcript } = req.body;

      // Validate required fields
      if (!scenario || !transcript) {
        return res.status(400).json({ 
          error: "Both scenario and transcript are required" 
        });
      }

      // Get Azure grading credentials
      const azureGraderEndpoint = process.env.AZURE_GRADER_ENDPOINT;
      const azureGraderKey = process.env.AZURE_GRADER_KEY;

      if (!azureGraderEndpoint || !azureGraderKey) {
        return res.status(500).json({ 
          error: "Azure grading API configuration missing" 
        });
      }

      console.log('Grading roleplay response:', {
        scenarioTitle: scenario.title,
        transcriptLength: transcript.length,
        performanceIndicatorsCount: scenario.metadata?.performance_indicators?.length || 0
      });

      // Dynamically create the list of PIs for the prompt
      const performanceIndicatorsForPrompt = scenario.metadata.performance_indicators
        .map((pi: any, index: number) => `${index + 1}. ${pi}`)
        .join('\n');

      const systemPrompt = `You are an expert DECA Judge and an instructional coach. Your task is to provide a fair, objective, and constructive evaluation of a student's spoken response to a DECA role-play scenario.

You will be provided with the original role-play scenario and the student's transcribed response.

Your evaluation MUST follow this two-part structure, derived directly from the official DECA Judge's Evaluation Form:

Part 1: Performance Indicators Evaluation
The specific Performance Indicators for this evaluation are:
---
${performanceIndicatorsForPrompt}
---
For each PI listed above, you must:
- Carefully assess how effectively the student's transcript demonstrates mastery of that specific indicator within the context of the scenario.
- Assign a numerical score from 0 to 17 based on this scale:
    - 0-5 (Little/No Value)
    - 6-10 (Below Expectations)
    - 11-14 (Meets Expectations)
    - 15-17 (Exceeds Expectations)
- Write a 1-2 sentence rationale explaining *why* you gave that score, referencing specific examples from the student's transcript.

Part 2: 21st Century Skills Evaluation
Next, evaluate the student on the following standard 21st Century Skills. For each skill, you must:
- Assign a numerical score from 0 to 7 based on this scale:
    - 0-1 (Little/No Value)
    - 2-3 (Below Expectations)
    - 4-5 (Meets Expectations)
    - 6-7 (Exceeds Expectations)
- Write a 1-2 sentence rationale for your score.

The skills are:
1. Reason effectively and use systems thinking?
2. Communicate clearly?
3. Show evidence of creativity?
4. Overall impression and responses to the judge's questions?

Final Output Requirement:
Your entire response must be a single, valid JSON object. Do not include any extra text, introductions, or markdown. The JSON object must follow this exact schema:

{
  "evaluation": {
    "performance_indicators": [
      {
        "indicator": "<The first PI from the scenario>",
        "score": 0,
        "max_score": 17,
        "rationale": "<Your 1-2 sentence rationale for this PI score.>"
      }
    ],
    "twenty_first_century_skills": [
      {
        "skill": "Reason effectively and use systems thinking?",
        "score": 0,
        "max_score": 7,
        "rationale": "<Your 1-2 sentence rationale for this skill score.>"
      }
    ]
  },
  "final_score": {
    "student_score": 0,
    "max_possible_score": 0
  },
  "summary_feedback": "<A 2-3 sentence overall summary of the student's performance, highlighting one key strength and one key area for improvement.>"
}`;

      // Create user prompt with scenario and transcript
      const userPrompt = `ORIGINAL ROLEPLAY SCENARIO:
Title: ${scenario.title}
Event: ${scenario.event}
Setting: ${scenario.setting}
Your Role: ${scenario.yourRole}
Situation: ${scenario.situation}
Customer/Client Information: ${scenario.clientInfo}
Your Task: ${scenario.task}

STUDENT'S TRANSCRIBED RESPONSE:
${transcript}

Please evaluate this response according to the criteria provided in the system prompt.`;

      // Make request to Azure OpenAI grading API
      const response = await axios.post(azureGraderEndpoint, {
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: userPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
        response_format: { "type": "json_object" }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'api-key': azureGraderKey,
        },
        timeout: 30000,
      });

      console.log('Azure grading API response received');

      // Parse the response content
      const gradingContent = response.data.choices[0].message.content;
      const gradingResult = JSON.parse(gradingContent);

      console.log('Grading completed successfully:', {
        finalScore: gradingResult.final_score,
        piCount: gradingResult.evaluation.performance_indicators.length,
        skillsCount: gradingResult.evaluation.twenty_first_century_skills.length
      });

      // Return the grading result
      res.json(gradingResult);

    } catch (error: any) {
      console.error('Error grading response:', error);
      
      // Handle specific Azure API errors
      if (error.response) {
        console.error('Azure grading API error response:', error.response.data);
        return res.status(error.response.status || 500).json({
          error: 'Grading failed',
          details: error.response.data?.error || error.message
        });
      }
      
      res.status(500).json({
        error: 'Failed to grade response',
        details: error.message
      });
    }
  });

  // Get daily challenge
  app.get("/api/daily-challenge", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const userId = user.id;
      const challenge = await storage.getDailyChallenge(userId);
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve daily challenge" });
    }
  });



  // Complete daily challenge (legacy block) -> keep but verify with Supabase and map authId
  app.post("/api/daily-challenge/complete", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) return res.status(404).json({ error: "User not found" });
      const bodySchema = z.object({ challengeId: z.number().int().positive(), progress: z.number().int().min(0).optional() });
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid body" });
      const { challengeId, progress = 100 } = parsed.data;
      const result = await storage.completeChallenge(user.id, challengeId, progress);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete daily challenge" });
    }
  });

  // Update user settings
  app.post("/api/user/settings", async (req, res) => {
    if (!req.isAuthenticated) return res.sendStatus(401);

    try {
      const userId = parseInt(req.user!.id);
      const { eventFormat, eventCode } = req.body;

      const updated = await storage.updateUserSettings(userId, {
        eventFormat,
        eventCode,
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user settings" });
    }
  });

  // Save selected event from onboarding and mark onboarding complete
  app.post("/api/user/event", async (req, res) => {
    if (!req.isAuthenticated) return res.sendStatus(401);
    
    try {
      const userId = parseInt(req.user!.id);
      const { selectedEvent, selectedCluster } = req.body;
      
      // Update user settings and mark tutorial/onboarding as completed
      const updated = await storage.updateUserSettings(userId, {
        selectedEvent,
        selectedCluster,
        onboardingCompleted: true,
        showTutorial: false
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error saving selected event:", error);
      res.status(500).json({ error: "Failed to save selected event" });
    }
  });

  // Tutorial complete endpoint removed - outdated authentication

  // Appearance settings endpoint removed - outdated authentication

  // Subscription endpoint removed - outdated authentication

  // All outdated endpoints removed - using Supabase authentication only

  // Comprehensive user tracking and analytics endpoint
  app.get("/api/user/comprehensive-tracking", verifySupabaseToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get user data
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get comprehensive stats
      const stats = await storage.getUserStats(userId);
      
      // Get recent activities
      const activities = await storage.getRecentActivities(userId, 10);
      
      // Get learning insights
      const insights = await storage.getLearningInsights(userId);
      
      // Get performance analytics
      const performanceData = await storage.getPerformanceAnalytics(userId, 'week');
      
      // Get study patterns
      const studyPatterns = await storage.getStudyPatterns(userId, 'week');
      
      // Get category breakdown
      const categoryBreakdown = await storage.getCategoryBreakdown(userId);
      
      // Get achievements
      const achievements = await storage.getUserAchievements(userId);
      
      // Get streaks
      const streaks = await storage.getUserStreaks(userId);
      
      // Get daily challenges
      const dailyChallenges = await storage.getDailyChallenges(userId);
      
      // Get level data
      const levelData = await storage.getUserLevel(userId);
      
      // Calculate additional metrics
      const totalStudyTime = await storage.getTotalStudyTime(userId, 'week');
      const averageScore = await storage.getAverageScore(userId, 'week');
      const improvementRate = await storage.getImprovementRate(userId, 'week');
      const engagementScore = await storage.getEngagementScore(userId, 'week');
      
      // Get personalized recommendations
      const recommendations = await storage.getPersonalizedRecommendations(userId);
      
      // Get gamification data
      const gamificationData = {
        totalPoints: achievements.reduce((sum, a) => sum + (a.isUnlocked ? a.points : 0), 0),
        achievementsUnlocked: achievements.filter(a => a.isUnlocked).length,
        totalAchievements: achievements.length,
        currentStreak: streaks.find(s => s.streakType === 'daily_login')?.currentStreak || 0,
        longestStreak: streaks.find(s => s.streakType === 'daily_login')?.longestStreak || 0,
        level: levelData.currentLevel,
        experience: levelData.experience,
        experienceToNext: levelData.experienceToNext,
        decitsEarned: await storage.getTotalDecitsEarned(userId),
        challengesCompleted: dailyChallenges.filter(c => c.isCompleted).length,
        totalChallenges: dailyChallenges.length
      };

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          subscriptionTier: user.subscriptionTier,
          decits: user.decits,
          level: user.level,
          experience: user.experience,
          streak: user.streak,
          lastLogin: user.lastLogin,
          lastActivity: user.lastActivity
        },
        stats: {
          ...stats,
          totalStudyTime,
          averageScore,
          improvementRate,
          engagementScore
        },
        activities,
        insights,
        performanceData,
        studyPatterns,
        categoryBreakdown,
        achievements,
        streaks,
        dailyChallenges,
        levelData,
        gamificationData,
        recommendations
      });
    } catch (error) {
      console.error('Error fetching comprehensive tracking data:', error);
      res.status(500).json({ error: "Failed to fetch tracking data" });
    }
  });

  // Enhanced performance analytics endpoint
  app.get("/api/user/enhanced-performance", verifySupabaseToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const timeframe = req.query.timeframe || 'week';
      
      const performanceData = await storage.getEnhancedPerformanceAnalytics(userId, timeframe);
      
      res.json(performanceData);
    } catch (error) {
      console.error('Error fetching enhanced performance data:', error);
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });

  // Study session tracking endpoint
  app.post("/api/user/study-session/start", verifySupabaseToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { activityType, focusScore } = req.body;
      
      const sessionId = await storage.startStudySession(userId, activityType, focusScore);
      
      res.json({ sessionId, message: "Study session started" });
    } catch (error) {
      console.error('Error starting study session:', error);
      res.status(500).json({ error: "Failed to start study session" });
    }
  });

  app.post("/api/user/study-session/end", verifySupabaseToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { sessionId, decitsEarned, experienceGained } = req.body;
      
      const session = await storage.endStudySession(userId, sessionId, decitsEarned, experienceGained);
      
      res.json({ session, message: "Study session ended" });
    } catch (error) {
      console.error('Error ending study session:', error);
      res.status(500).json({ error: "Failed to end study session" });
    }
  });

  // Real-time progress tracking endpoint
  app.get("/api/user/realtime-progress", verifySupabaseToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const realtimeData = await storage.getRealtimeProgress(userId);
      
      res.json(realtimeData);
    } catch (error) {
      console.error('Error fetching real-time progress:', error);
      res.status(500).json({ error: "Failed to fetch real-time progress" });
    }
  });

  // Personalized learning path endpoint
  app.get("/api/user/learning-path", verifySupabaseToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const learningPath = await storage.getPersonalizedLearningPath(userId);
      
      res.json(learningPath);
    } catch (error) {
      console.error('Error fetching learning path:', error);
      res.status(500).json({ error: "Failed to fetch learning path" });
    }
  });

  // Enhanced gamification endpoint
  app.get("/api/user/gamification-data", verifySupabaseToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const gamificationData = await storage.getGamificationData(userId);
      
      res.json(gamificationData);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      res.status(500).json({ error: "Failed to fetch gamification data" });
    }
  });

  // Achievement progress update endpoint
  app.post("/api/user/achievement-progress", verifySupabaseToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { achievementType, progress, activity } = req.body;
      
      const result = await storage.updateAchievementProgress(userId, achievementType, progress, activity);
      
      res.json(result);
    } catch (error) {
      console.error('Error updating achievement progress:', error);
      res.status(500).json({ error: "Failed to update achievement progress" });
    }
  });

  // Learning insights generation endpoint
  app.post("/api/user/generate-insights", verifySupabaseToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const insights = await storage.generateLearningInsights(userId);
      
      res.json(insights);
    } catch (error) {
      console.error('Error generating learning insights:', error);
      res.status(500).json({ error: "Failed to generate learning insights" });
    }
  });

  // Study pattern analysis endpoint
  app.get("/api/user/study-patterns", verifySupabaseToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const timeframe = req.query.timeframe || 'week';
      
      const patterns = await storage.getStudyPatterns(userId, timeframe);
      
      res.json(patterns);
    } catch (error) {
      console.error('Error fetching study patterns:', error);
      res.status(500).json({ error: "Failed to fetch study patterns" });
    }
  });

  // Category performance breakdown endpoint
  app.get("/api/user/category-breakdown", verifySupabaseToken, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const breakdown = await storage.getCategoryBreakdown(userId);
      
      res.json(breakdown);
    } catch (error) {
      console.error('Error fetching category breakdown:', error);
      res.status(500).json({ error: "Failed to fetch category breakdown" });
    }
  });

  // Streak management endpoint
  app.post("/api/user/streak/update", verifySupabaseToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { streakType, activity } = req.body;
      
      const streak = await storage.updateStreak(userId, streakType, activity);
      
      res.json(streak);
    } catch (error) {
      console.error('Error updating streak:', error);
      res.status(500).json({ error: "Failed to update streak" });
    }
  });



  // Learning analytics endpoint
  app.post("/api/user/learning-analytics", verifySupabaseToken, async (req, res) => {
    try {
      const userId = req.user.id;
      const { date, totalStudyTime, activitiesCompleted, averageScore, strongAreas, weakAreas, preferredTimes, difficultyProgression, learningVelocity, engagementScore } = req.body;
      
      const analytics = await storage.addLearningAnalytics(userId, {
        date,
        totalStudyTime,
        activitiesCompleted,
        averageScore,
        strongAreas,
        weakAreas,
        preferredTimes,
        difficultyProgression,
        learningVelocity,
        engagementScore
      });
      
      res.json(analytics);
    } catch (error) {
      console.error('Error adding learning analytics:', error);
      res.status(500).json({ error: "Failed to add learning analytics" });
    }
  });

  // Comprehensive Analytics API endpoints
  app.get("/api/user/comprehensive-stats/:timeRange", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const timeRange = req.params.timeRange || "week";
      const stats = await storage.getUserComprehensiveStats(user.id, timeRange);
      res.json(stats);
    } catch (error) {
      console.error("Error getting comprehensive stats:", error);
      res.status(500).json({ error: "Failed to retrieve comprehensive stats" });
    }
  });

  app.get("/api/user/performance-analytics/:timeRange", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const timeRange = req.params.timeRange || "week";
      const testHistory = await storage.getUserTestHistory(user.id);
      const roleplayHistory = await storage.getRoleplayHistory(user.id);
      
      // Calculate performance analytics
      const analytics = {
        scoreTrends: testHistory.slice(-20).map((test, index) => ({
          date: test.completedAt,
          score: test.score,
          testTitle: test.testTitle,
          cluster: test.cluster
        })),
        categoryPerformance: testHistory.reduce((acc, test) => {
          if (!acc[test.cluster]) {
            acc[test.cluster] = { total: 0, count: 0, scores: [] };
          }
          acc[test.cluster].total += test.score;
          acc[test.cluster].count += 1;
          acc[test.cluster].scores.push(test.score);
          return acc;
        }, {} as Record<string, { total: number; count: number; scores: number[] }>),
        roleplayPerformance: roleplayHistory.map(rp => ({
          date: rp.completedAt,
          score: rp.score || 0,
          scenario: rp.scenario,
          cluster: rp.cluster
        })),
        improvementRate: calculateImprovementRate(testHistory),
        consistencyScore: calculateConsistencyScore(testHistory),
        masteryLevel: calculateMasteryLevel(testHistory)
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error getting performance analytics:", error);
      res.status(500).json({ error: "Failed to retrieve performance analytics" });
    }
  });

  app.get("/api/user/study-patterns/:timeRange", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const timeRange = req.params.timeRange || "week";
      const sessions = await storage.getUserSessions(user.id);
      
      // Analyze study patterns
      const patterns = {
        dailyActivity: analyzeDailyActivity(sessions),
        preferredTimes: analyzePreferredTimes(sessions),
        sessionTypes: analyzeSessionTypes(sessions),
        studyStreaks: calculateStudyStreaks(sessions),
        focusAreas: analyzeFocusAreas(sessions)
      };
      
      res.json(patterns);
    } catch (error) {
      console.error("Error getting study patterns:", error);
      res.status(500).json({ error: "Failed to retrieve study patterns" });
    }
  });

  app.get("/api/user/category-breakdown", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const testHistory = await storage.getUserTestHistory(user.id);
      const roleplayHistory = await storage.getRoleplayHistory(user.id);
      
      // Calculate category breakdown
      const categoryBreakdown = {
        testCategories: testHistory.reduce((acc, test) => {
          if (!acc[test.cluster]) {
            acc[test.cluster] = { total: 0, count: 0, averageScore: 0 };
          }
          acc[test.cluster].total += test.score;
          acc[test.cluster].count += 1;
          acc[test.cluster].averageScore = acc[test.cluster].total / acc[test.cluster].count;
          return acc;
        }, {} as Record<string, { total: number; count: number; averageScore: number }>),
        roleplayCategories: roleplayHistory.reduce((acc, rp) => {
          if (!acc[rp.cluster]) {
            acc[rp.cluster] = { total: 0, count: 0, averageScore: 0 };
          }
          acc[rp.cluster].total += rp.score || 0;
          acc[rp.cluster].count += 1;
          acc[rp.cluster].averageScore = acc[rp.cluster].total / acc[rp.cluster].count;
          return acc;
        }, {} as Record<string, { total: number; count: number; averageScore: number }>)
      };
      
      res.json(categoryBreakdown);
    } catch (error) {
      console.error("Error getting category breakdown:", error);
      res.status(500).json({ error: "Failed to retrieve category breakdown" });
    }
  });

  app.get("/api/user/learning-insights", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const insights = await storage.getUserLearningInsights(user.id);
      res.json(insights);
    } catch (error) {
      console.error("Error getting learning insights:", error);
      res.status(500).json({ error: "Failed to retrieve learning insights" });
    }
  });

  app.get("/api/user/personalized-recommendations", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const recommendations = await storage.getPersonalizedRecommendations(user.id);
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting personalized recommendations:", error);
      res.status(500).json({ error: "Failed to retrieve personalized recommendations" });
    }
  });

  // Enhanced Daily Challenges API
  app.get("/api/daily-challenge", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const challenge = await storage.getDailyChallenge(user.id);
      res.json(challenge);
    } catch (error) {
      console.error("Error getting daily challenge:", error);
      res.status(500).json({ error: "Failed to retrieve daily challenge" });
    }
  });

  app.post("/api/daily-challenge/complete", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { challengeId, progress } = req.body;
      const result = await storage.completeChallenge(user.id, challengeId, progress);
      res.json(result);
    } catch (error) {
      console.error("Error completing daily challenge:", error);
      res.status(500).json({ error: "Failed to complete daily challenge" });
    }
  });

  // Enhanced Achievements API
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error getting achievements:", error);
      res.status(500).json({ error: "Failed to retrieve achievements" });
    }
  });

  // Leaderboard removed per personalization-first focus

  app.get("/api/user/achievements/new", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const newAchievements = await storage.getNewUserAchievements(user.id);
      res.json(newAchievements);
    } catch (error) {
      console.error("Error getting new achievements:", error);
      res.status(500).json({ error: "Failed to get new achievements" });
    }
  });

  app.post("/api/user/achievements/check", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const newAchievements = await storage.checkForNewAchievements(user.id);
      res.json(newAchievements);
    } catch (error) {
      console.error("Error checking achievements:", error);
      res.status(500).json({ error: "Failed to check achievements" });
    }
  });

  app.post("/api/user/achievements/:achievementId/displayed", verifySupabaseToken, async (req, res) => {
    try {
      const authId = (req.user as any).id;
      const user = await storage.getUserByAuthId(authId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const achievementId = parseInt(req.params.achievementId);
      const result = await storage.markAchievementAsDisplayed(user.id, achievementId);
      res.json({ success: result });
    } catch (error) {
      console.error("Error marking achievement as displayed:", error);
      res.status(500).json({ error: "Failed to mark achievement as displayed" });
    }
  });

  // Helper functions for analytics
  function calculateImprovementRate(testHistory: any[]): number {
    if (testHistory.length < 2) return 0;
    
    const recentTests = testHistory.slice(-5);
    const olderTests = testHistory.slice(-10, -5);
    
    if (olderTests.length === 0) return 0;
    
    const recentAvg = recentTests.reduce((sum, t) => sum + t.score, 0) / recentTests.length;
    const olderAvg = olderTests.reduce((sum, t) => sum + t.score, 0) / olderTests.length;
    
    return recentAvg - olderAvg;
  }

  function calculateConsistencyScore(testHistory: any[]): number {
    if (testHistory.length === 0) return 0;
    
    const scores = testHistory.map(t => t.score);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    return Math.max(0, 100 - (standardDeviation * 2));
  }

  function calculateMasteryLevel(testHistory: any[]): string {
    if (testHistory.length === 0) return 'Novice';
    
    const averageScore = testHistory.reduce((sum, test) => sum + test.score, 0) / testHistory.length;
    
    if (averageScore >= 90) return 'Expert';
    if (averageScore >= 80) return 'Advanced';
    if (averageScore >= 70) return 'Intermediate';
    if (averageScore >= 60) return 'Beginner';
    return 'Novice';
  }

  function analyzeDailyActivity(sessions: any[]): any[] {
    const dailyActivity = new Map();
    
    sessions.forEach(session => {
      const date = new Date(session.completedAt).toISOString().split('T')[0];
      if (!dailyActivity.has(date)) {
        dailyActivity.set(date, { sessions: 0, tests: 0, roleplays: 0 });
      }
      
      const day = dailyActivity.get(date);
      day.sessions += 1;
      
      if (session.type === 'test') day.tests += 1;
      if (session.type === 'roleplay') day.roleplays += 1;
    });
    
    return Array.from(dailyActivity.entries()).map(([date, data]) => ({
      date,
      ...data
    }));
  }

  function analyzePreferredTimes(sessions: any[]): any {
    const hourCounts = new Array(24).fill(0);
    
    sessions.forEach(session => {
      const hour = new Date(session.completedAt).getHours();
      hourCounts[hour]++;
    });
    
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    
    return {
      peakHour,
      hourDistribution: hourCounts,
      totalSessions: sessions.length
    };
  }

  function analyzeSessionTypes(sessions: any[]): any {
    const typeCounts = sessions.reduce((acc, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      typeCounts,
      totalSessions: sessions.length,
      mostCommonType: Object.entries(typeCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown'
    };
  }

  function calculateStudyStreaks(sessions: any[]): any {
    if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    const sortedSessions = sessions.sort((a, b) => 
      new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;
    
    sortedSessions.forEach(session => {
      const sessionDate = new Date(session.completedAt).toDateString();
      
      if (lastDate === null || sessionDate === lastDate) {
        tempStreak++;
      } else {
        const daysDiff = Math.floor(
          (new Date(session.completedAt).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      
      lastDate = sessionDate;
    });
    
    currentStreak = tempStreak;
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return { currentStreak, longestStreak };
  }

  function analyzeFocusAreas(sessions: any[]): any {
    const focusAreas = sessions.reduce((acc, session) => {
      // For now, we'll use session type as focus area
      // In a real implementation, this would analyze the actual content
      const area = session.type || 'general';
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      focusAreas,
      primaryFocus: Object.entries(focusAreas)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'general'
    };
  }

  const httpServer = createServer(app);
  return httpServer;
}
