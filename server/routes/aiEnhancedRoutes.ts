
import { Router } from "express";
import { getOpenAIClient } from "../services/azureOpenai";

const router = Router();

// AI Insights endpoint - provides real-time dashboard insights
router.get("/api/ai-insights", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Mock AI insights generation (replace with actual user data analysis)
    const mockInsights = {
      userLevel: "Advanced Learner",
      personalizedGreeting: "You're on fire! 🔥 Your consistency is paying off.",
      performanceTrend: "📈 Your roleplay scores improved 23% this week! Marketing concepts are clicking.",
      focusArea: "🎯 Consider practicing Finance scenarios - they'll complement your Marketing strength.",
      nextMilestone: "🏆 Complete 2 more practice tests to unlock your 'Marketing Maven' badge!",
      milestoneReached: Math.random() > 0.8, // 20% chance of milestone
      milestoneMessage: "Congratulations! You've mastered 10 Performance Indicators!",
      milestoneTitle: "PI Master",
      milestoneDescription: "You've shown excellent understanding across multiple business areas",
      pointsEarned: 100,
      hasNewNotifications: Math.random() > 0.5
    };

    res.json(mockInsights);
  } catch (error) {
    console.error("AI insights error:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

// Live Performance endpoint - real-time performance tracking
router.get("/api/live-performance", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Mock live performance data (replace with actual user activity tracking)
    const mockPerformance = {
      weeklyActivities: Math.floor(Math.random() * 25) + 5, // 5-30 activities
      weeklyTarget: 20,
      roleplayGrowth: Math.floor(Math.random() * 40) + 40, // 40-80%
      roleplayIncrease: Math.floor(Math.random() * 5) + 1, // 1-5 increase
      testGrowth: Math.floor(Math.random() * 30) + 30, // 30-60%
      averageScore: Math.floor(Math.random() * 30) + 60, // 60-90%
      masteryLevel: ["Beginner", "Intermediate", "Advanced"][Math.floor(Math.random() * 3)]
    };

    res.json(mockPerformance);
  } catch (error) {
    console.error("Live performance error:", error);
    res.status(500).json({ error: "Failed to fetch performance data" });
  }
});

// Smart Recommendations endpoint - AI-powered learning suggestions
router.get("/api/smart-recommendations", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Mock smart recommendations (replace with AI-generated suggestions)
    const mockRecommendations = [
      {
        title: "Master Finance Fundamentals",
        description: "Your Marketing skills are strong. Finance will round out your business acumen perfectly.",
        priority: "high",
        type: "skill_development"
      },
      {
        title: "Practice Roleplay Presentations",
        description: "Work on your closing techniques to improve competition performance.",
        priority: "medium",
        type: "presentation_skills"
      },
      {
        title: "Review Economic Indicators",
        description: "Recent tests show this as a growth area. 15 minutes of study could boost scores significantly.",
        priority: "high",
        type: "knowledge_gap"
      }
    ];

    res.json(mockRecommendations);
  } catch (error) {
    console.error("Smart recommendations error:", error);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

// Adaptive Test Generation endpoint
router.post("/api/generate-adaptive-test", async (req, res) => {
  try {
    const { cluster, level, questionCount, adaptiveMode, targetDifficulty, userProfile } = req.body;
    
    const client = getOpenAIClient();
    if (!client) {
      return res.status(500).json({ error: "AI service unavailable" });
    }

    // Enhanced prompt for adaptive test generation
    const adaptivePrompt = `You are an AI test generation specialist creating personalized DECA practice tests.

USER PROFILE:
- Target Cluster: ${cluster}
- Competition Level: ${level}
- Adaptive Mode: ${adaptiveMode ? 'Enabled' : 'Disabled'}
- Target Difficulty: ${targetDifficulty}
- User History: ${JSON.stringify(userProfile)}

ADAPTIVE INSTRUCTIONS:
${adaptiveMode ? `
- Start with ${targetDifficulty === 'adaptive' ? 'medium' : targetDifficulty} difficulty
- Include difficulty progression tracking
- Add real-time adjustment capabilities
- Focus on personalized learning patterns
` : `
- Maintain consistent ${targetDifficulty} difficulty
- Standard question progression
`}

Generate exactly ${questionCount} high-quality multiple choice questions for ${cluster} at ${level} level.

REQUIRED OUTPUT FORMAT:
{
  "metadata": {
    "cluster": "${cluster}",
    "level": "${level}",
    "adaptive_mode": ${adaptiveMode},
    "starting_difficulty": "${targetDifficulty === 'adaptive' ? 'medium' : targetDifficulty}",
    "personalization_applied": true
  },
  "questions": [
    {
      "id": 1,
      "stem": "Question text here...",
      "options": {
        "A": "First option",
        "B": "Second option", 
        "C": "Third option",
        "D": "Fourth option"
      },
      "answer": "A",
      "difficulty": "medium",
      "instructional_area": "Marketing Research",
      "rationale": "Explanation of why this answer is correct...",
      "adaptive_weight": 1.0
    }
  ],
  "answer_key": {"1": "A", "2": "B", ...},
  "difficulty_progression": ["medium", "medium", "hard", ...],
  "adaptive_metadata": {
    "difficulty_adjustment_points": [5, 10, 15],
    "performance_thresholds": {"easy": 0.9, "medium": 0.7, "hard": 0.5}
  }
}

Focus on authentic business scenarios, current DECA competition standards, and real-world application.`;

    const completion = await client.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: adaptivePrompt
        },
        {
          role: "user", 
          content: `Generate ${questionCount} adaptive questions for ${cluster} - ${level} level.`
        }
      ],
      temperature: 0.7,
      max_tokens: 8000
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error("Empty response from AI");
    }

    // Parse and validate the response
    let quizData;
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }
      
      quizData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Invalid response format from AI");
    }

    // Validate the structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error("Invalid quiz structure");
    }

    // Add adaptive enhancements
    quizData.adaptive_enabled = adaptiveMode;
    quizData.generation_timestamp = new Date().toISOString();

    res.json(quizData);

  } catch (error) {
    console.error("Adaptive test generation error:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to generate adaptive test" 
    });
  }
});

// Adaptive Feedback endpoint - real-time AI coaching
router.post("/api/adaptive-feedback", async (req, res) => {
  try {
    const { questionId, selectedOption, isCorrect, responseTime, currentStats, questionDifficulty } = req.body;
    
    // Generate intelligent feedback based on performance
    let feedback = {
      message: "",
      showEncouragement: false,
      title: "",
      description: "",
      difficultyAdjustment: 0
    };

    if (isCorrect) {
      if (responseTime < 10000) { // Less than 10 seconds
        feedback = {
          message: "🚀 Lightning fast and correct! You're mastering this concept.",
          showEncouragement: currentStats.currentStreak >= 3,
          title: "Excellent!",
          description: `${currentStats.currentStreak} question streak! You're on fire!`,
          difficultyAdjustment: 0.1
        };
      } else {
        feedback = {
          message: "✅ Correct! Take your time - accuracy is more important than speed.",
          showEncouragement: false,
          title: "Good job!",
          description: "Keep up the steady progress.",
          difficultyAdjustment: 0
        };
      }
    } else {
      feedback = {
        message: "🤔 Not quite right. Remember to analyze all options carefully before choosing.",
        showEncouragement: false,
        title: "Learning Opportunity",
        description: "Every mistake is a step toward mastery. Keep going!",
        difficultyAdjustment: -0.1
      };
    }

    // Add adaptive coaching based on overall performance
    if (currentStats.accuracy > 80) {
      feedback.message += " Your high accuracy suggests you're ready for more challenging questions!";
    } else if (currentStats.accuracy < 60) {
      feedback.message += " Consider reviewing the fundamentals for this topic area.";
    }

    res.json(feedback);

  } catch (error) {
    console.error("Adaptive feedback error:", error);
    res.status(500).json({ error: "Failed to generate feedback" });
  }
});

// Test Analysis endpoint - comprehensive AI analysis after test completion
router.post("/api/test-analysis", async (req, res) => {
  try {
    const { userAnswers, quizData, realTimeStats, testConfig } = req.body;
    
    // Calculate detailed performance metrics
    const totalQuestions = quizData.questions.length;
    const correctAnswers = Object.keys(userAnswers).filter(questionId => {
      const question = quizData.questions.find((q: any) => q.id.toString() === questionId);
      return question && userAnswers[questionId] === question.answer;
    }).length;
    
    const accuracy = (correctAnswers / totalQuestions) * 100;
    
    // Generate AI analysis
    const client = getOpenAIClient();
    let aiAnalysis = {
      overallAssessment: "",
      recommendedLevel: "",
      recommendations: [],
      questionAnalysis: {}
    };

    if (client) {
      try {
        const analysisPrompt = `Analyze this DECA practice test performance:

PERFORMANCE DATA:
- Cluster: ${testConfig.selectedCluster}
- Level: ${testConfig.selectedLevel}
- Score: ${correctAnswers}/${totalQuestions} (${accuracy.toFixed(1)}%)
- Current Streak: ${realTimeStats.currentStreak}
- Average Response Time: ${(realTimeStats.avgResponseTime / 1000).toFixed(1)}s
- Adaptive Mode: ${testConfig.adaptiveMode}

Provide a comprehensive analysis including:
1. Overall performance assessment (2-3 sentences)
2. Recommended difficulty level for next practice
3. 3-4 specific learning recommendations
4. Insights on pacing and accuracy balance

Format as JSON:
{
  "overallAssessment": "...",
  "recommendedLevel": "intermediate/advanced/expert",
  "recommendations": ["rec1", "rec2", "rec3", "rec4"]
}`;

        const completion = await client.chat.completions.create({
          model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are an expert DECA coach providing personalized feedback." },
            { role: "user", content: analysisPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        const response = completion.choices[0].message.content;
        if (response) {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiAnalysis = { ...aiAnalysis, ...JSON.parse(jsonMatch[0]) };
          }
        }
      } catch (error) {
        console.error("AI analysis error:", error);
      }
    }

    // Fallback analysis if AI fails
    if (!aiAnalysis.overallAssessment) {
      if (accuracy >= 85) {
        aiAnalysis.overallAssessment = "Outstanding performance! You demonstrate strong mastery of the concepts and excellent test-taking skills.";
        aiAnalysis.recommendedLevel = "advanced";
      } else if (accuracy >= 70) {
        aiAnalysis.overallAssessment = "Good solid performance with room for growth. Your foundation is strong, focus on reinforcing key concepts.";
        aiAnalysis.recommendedLevel = "intermediate";
      } else {
        aiAnalysis.overallAssessment = "Great effort! Focus on building foundational knowledge through targeted practice and review.";
        aiAnalysis.recommendedLevel = "beginner";
      }

      aiAnalysis.recommendations = [
        `Practice more ${testConfig.selectedCluster} scenarios to build confidence`,
        "Review Performance Indicators for your target competition areas",
        "Focus on time management - aim for consistent pacing",
        "Consider forming a study group for collaborative learning"
      ];
    }

    res.json(aiAnalysis);

  } catch (error) {
    console.error("Test analysis error:", error);
    res.status(500).json({ error: "Failed to generate analysis" });
  }
});

export default router;
