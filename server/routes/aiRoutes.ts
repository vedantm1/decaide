import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { 
  generateRoleplayScenario, 
  generatePracticeTest, 
  explainPerformanceIndicator,
  generateWrittenEventFeedback
} from "../services/azureOpenai";
import { DECA_EVENTS } from "@shared/schema";

const router = Router();

// Middleware to check if user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized: Please login first" });
};

// Middleware to check if user has permission to access this AI feature
// based on their subscription tier
const checkSubscriptionAccess = async (req: Request, res: Response, next: Function) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: Please login first" });
  }

  try {
    // For roleplays
    if (req.path.includes('/roleplay')) {
      const hasAllowance = await storage.checkRoleplayAllowance(req.user.id);
      if (!hasAllowance) {
        return res.status(403).json({ 
          error: "Subscription limit reached", 
          message: "You've reached your roleplay generation limit for this month. Please upgrade your subscription for unlimited access." 
        });
      }
    }
    
    // For tests
    if (req.path.includes('/test')) {
      const hasAllowance = await storage.checkTestAllowance(req.user.id);
      if (!hasAllowance) {
        return res.status(403).json({ 
          error: "Subscription limit reached", 
          message: "You've reached your practice test generation limit for this month. Please upgrade your subscription for unlimited access." 
        });
      }
    }

    next();
  } catch (error) {
    console.error("Error checking subscription access:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Generate a roleplay scenario based on the user's event
router.post("/roleplay/generate", ensureAuthenticated, checkSubscriptionAccess, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user.eventFormat || !user.eventCode) {
      return res.status(400).json({ error: "Please select an event in your user settings first" });
    }

    // Find the event details from the user's event code
    const format = user.eventFormat === "roleplay" ? "roleplay" : "written";
    const event = DECA_EVENTS[format as keyof typeof DECA_EVENTS]?.find(e => e.code === user.eventCode);
    
    if (!event) {
      return res.status(400).json({ error: "Invalid event code or event not found" });
    }

    // Get difficulty from request or default to medium
    const { difficulty = "medium", selectedPIs = [] } = req.body;
    
    // If no PIs were selected, get random ones from the user's PIs
    let performanceIndicators = selectedPIs;
    if (!performanceIndicators || performanceIndicators.length === 0) {
      const userPIs = await storage.getUserPIs(user.id);
      // Randomly select 3-5 PIs
      const count = Math.floor(Math.random() * 3) + 3; // 3 to 5 PIs
      performanceIndicators = userPIs
        .sort(() => 0.5 - Math.random()) // Shuffle
        .slice(0, count)
        .map(pi => pi.indicator);
    }

    // Generate the roleplay scenario
    const roleplayScenario = await generateRoleplayScenario({
      eventCode: event.code,
      eventName: event.name,
      category: event.category,
      performanceIndicators,
      difficulty
    });

    // Record this generation to track usage
    await storage.recordRoleplayGeneration(user.id);

    // Return the generated scenario
    res.json(roleplayScenario);
  } catch (error) {
    console.error("Error generating roleplay:", error);
    res.status(500).json({ 
      error: "Failed to generate roleplay scenario", 
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Generate a practice test based on the user's event
router.post("/test/generate", ensureAuthenticated, checkSubscriptionAccess, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user.eventFormat || !user.eventCode) {
      return res.status(400).json({ error: "Please select an event in your user settings first" });
    }

    // Find the event details from the user's event code
    const format = user.eventFormat === "roleplay" ? "roleplay" : "written";
    const event = DECA_EVENTS[format as keyof typeof DECA_EVENTS]?.find(e => e.code === user.eventCode);
    
    if (!event) {
      return res.status(400).json({ error: "Invalid event code or event not found" });
    }

    // Get parameters from request
    const { 
      testType = event.type, 
      categories = [], 
      numQuestions = 25,
      difficulty = "medium" 
    } = req.body;

    // Validate number of questions
    const questionsCount = Math.min(Math.max(5, numQuestions), 50); // Between 5 and 50

    // Generate the practice test
    const practiceTest = await generatePracticeTest({
      eventCode: event.code,
      eventName: event.name,
      categories: categories.length > 0 ? categories : [event.category],
      numQuestions: questionsCount,
      difficulty
    });

    // Record this generation to track usage
    await storage.recordTestGeneration(user.id);

    // Return the generated test
    res.json(practiceTest);
  } catch (error) {
    console.error("Error generating practice test:", error);
    res.status(500).json({ 
      error: "Failed to generate practice test", 
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Get explanation for a performance indicator
router.post("/pi/explain", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const { indicator, category, format = "detailed" } = req.body;
    
    if (!indicator || !category) {
      return res.status(400).json({ error: "Performance indicator and category are required" });
    }

    // Generate explanation
    const explanation = await explainPerformanceIndicator({
      indicator,
      category,
      format: format as "concise" | "detailed"
    });

    // Return the explanation
    res.json(explanation);
  } catch (error) {
    console.error("Error explaining performance indicator:", error);
    res.status(500).json({ 
      error: "Failed to generate explanation", 
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Generate feedback for written event sections
router.post("/written/feedback", ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user.eventFormat || !user.eventCode) {
      return res.status(400).json({ error: "Please select an event in your user settings first" });
    }

    // Find the event details from the user's event code
    const format = user.eventFormat === "written" ? "written" : "roleplay";
    const event = DECA_EVENTS[format as keyof typeof DECA_EVENTS]?.find(e => e.code === user.eventCode);
    
    if (!event) {
      return res.status(400).json({ error: "Invalid event code or event not found" });
    }

    const { projectDescription, section } = req.body;
    
    if (!projectDescription || !section) {
      return res.status(400).json({ error: "Project description and section are required" });
    }

    // Generate feedback
    const feedback = await generateWrittenEventFeedback({
      eventCode: event.code,
      eventName: event.name,
      projectDescription,
      section
    });

    // Return the feedback
    res.json(feedback);
  } catch (error) {
    console.error("Error generating written event feedback:", error);
    res.status(500).json({ 
      error: "Failed to generate feedback", 
      message: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

export default router;