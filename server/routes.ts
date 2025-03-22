import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  EVENT_TYPES, 
  PI_CATEGORIES, 
  SUBSCRIPTION_LIMITS 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API routes
  // Get subscription info
  app.get("/api/subscription-tiers", (req, res) => {
    res.json(SUBSCRIPTION_LIMITS);
  });

  // Get event types
  app.get("/api/event-types", (req, res) => {
    res.json(EVENT_TYPES);
  });

  // Get PI categories
  app.get("/api/pi-categories", (req, res) => {
    res.json(PI_CATEGORIES);
  });

  // Get user stats
  app.get("/api/user/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve user stats" });
    }
  });

  // Get recent activities
  app.get("/api/user/activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const activities = await storage.getUserActivities(userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve user activities" });
    }
  });

  // Get learning items (in-progress activities)
  app.get("/api/user/learning", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const learningItems = await storage.getLearningItems(userId);
      res.json(learningItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve learning items" });
    }
  });

  // Get performance indicators
  app.get("/api/user/performance-indicators", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const category = req.query.category as string;
      const pis = await storage.getUserPIs(userId, category);
      res.json(pis);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve performance indicators" });
    }
  });

  // Update performance indicator status
  app.post("/api/user/performance-indicators/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const piId = parseInt(req.params.id);
      const { status } = req.body;
      
      const updated = await storage.updatePIStatus(userId, piId, status);
      if (!updated) {
        return res.status(404).json({ error: "Performance indicator not found" });
      }
      
      res.json({ success: true, status });
    } catch (error) {
      res.status(500).json({ error: "Failed to update performance indicator" });
    }
  });

  // Get roleplay scenarios
  app.post("/api/roleplay/generate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const { instructionalArea, performanceIndicators, difficultyLevel, businessType } = req.body;
      
      // Check if user has available roleplay generations based on subscription
      const canGenerate = await storage.checkRoleplayAllowance(userId);
      if (!canGenerate) {
        return res.status(403).json({ error: "Roleplay generation limit reached for your subscription tier" });
      }
      
      // Generate roleplay (mock for now)
      const roleplay = {
        id: Date.now(),
        title: `${businessType || "Business"} ${instructionalArea} Roleplay`,
        scenario: `You are a specialist in ${instructionalArea}. The client needs your expertise on ${performanceIndicators.join(", ")}.`,
        performanceIndicators,
        difficulty: difficultyLevel,
        businessType,
        meetWith: "The business owner"
      };
      
      // Record the usage
      await storage.recordRoleplayGeneration(userId);
      
      res.json(roleplay);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate roleplay scenario" });
    }
  });

  // Generate test questions
  app.post("/api/test/generate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const { testType, categories, numQuestions } = req.body;
      
      // Check if user has available test generations based on subscription
      const canGenerate = await storage.checkTestAllowance(userId);
      if (!canGenerate) {
        return res.status(403).json({ error: "Test generation limit reached for your subscription tier" });
      }
      
      // Generate test questions (mock for now)
      const questions = Array.from({ length: numQuestions }).map((_, i) => ({
        id: i + 1,
        question: `Question about ${categories[i % categories.length]}`,
        options: [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        correctAnswer: Math.floor(Math.random() * 4)
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
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const { testType, score, details } = req.body;
      
      const session = await storage.recordPracticeSession({
        userId,
        type: "test",
        score,
        completedAt: new Date(),
        details: JSON.stringify({ testType, ...details })
      });
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to save test results" });
    }
  });

  // Submit roleplay results
  app.post("/api/roleplay/submit", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const { roleplayId, score, details } = req.body;
      
      const session = await storage.recordPracticeSession({
        userId,
        type: "roleplay",
        score,
        completedAt: new Date(),
        details: JSON.stringify({ roleplayId, ...details })
      });
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to save roleplay results" });
    }
  });

  // Get daily challenge
  app.get("/api/daily-challenge", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const challenge = await storage.getDailyChallenge(userId);
      res.json(challenge);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve daily challenge" });
    }
  });

  // Complete daily challenge
  app.post("/api/daily-challenge/complete", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const result = await storage.completeDailyChallenge(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete daily challenge" });
    }
  });

  // Update user settings
  app.post("/api/user/settings", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const { eventType, instructionalArea } = req.body;
      
      const updated = await storage.updateUserSettings(userId, { eventType, instructionalArea });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user settings" });
    }
  });

  // Update subscription
  app.post("/api/user/subscription", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const { tier } = req.body;
      
      // In a real app, this would connect to a payment processor
      if (!SUBSCRIPTION_LIMITS[tier as keyof typeof SUBSCRIPTION_LIMITS]) {
        return res.status(400).json({ error: "Invalid subscription tier" });
      }
      
      const updated = await storage.updateSubscription(userId, tier);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update subscription" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
