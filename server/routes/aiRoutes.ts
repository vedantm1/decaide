import express, { Request, Response } from 'express';
import { checkAzureOpenAI, generateRoleplay, generateTestQuestions } from '../services/azureOpenai';
import { storage } from '../storage';

const router = express.Router();

// Get Azure OpenAI status
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await checkAzureOpenAI();
    res.json(status);
  } catch (error: any) {
    console.error("Azure OpenAI status check failed:", error);
    res.status(500).json({
      status: 'unavailable',
      error: error.message
    });
  }
});

// Generate AI roleplay scenario
router.post('/generate-roleplay', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  try {
    const { 
      instructionalArea, 
      performanceIndicators, 
      difficultyLevel, 
      businessType 
    } = req.body;
    
    if (!instructionalArea || !performanceIndicators || !difficultyLevel) {
      return res.status(400).json({ 
        error: "Missing required parameters: instructionalArea, performanceIndicators, and difficultyLevel are required" 
      });
    }
    
    // Check user subscription
    const canGenerate = await storage.checkRoleplayAllowance(req.user!.id);
    if (!canGenerate) {
      return res.status(403).json({ 
        error: "You have reached your roleplay generation limit for your subscription tier" 
      });
    }
    
    // Generate the roleplay
    const roleplay = await generateRoleplay({
      instructionalArea,
      performanceIndicators: Array.isArray(performanceIndicators) ? performanceIndicators : [performanceIndicators],
      difficultyLevel,
      businessType
    });
    
    // Record usage
    await storage.recordRoleplayGeneration(req.user!.id);
    
    res.json(roleplay);
  } catch (error: any) {
    console.error("Error generating roleplay:", error);
    res.status(500).json({ 
      error: "Failed to generate roleplay scenario", 
      details: error.message 
    });
  }
});

// Generate test questions
router.post('/generate-test', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  try {
    const { testType, categories, numQuestions } = req.body;
    
    if (!testType || !categories || !numQuestions) {
      return res.status(400).json({ 
        error: "Missing required parameters: testType, categories, and numQuestions are required" 
      });
    }
    
    // Check user subscription
    const canGenerate = await storage.checkTestAllowance(req.user!.id);
    if (!canGenerate) {
      return res.status(403).json({ 
        error: "You have reached your test generation limit for your subscription tier" 
      });
    }
    
    // Generate the test questions
    const test = await generateTestQuestions({
      testType,
      categories: Array.isArray(categories) ? categories : [categories],
      numQuestions: Number(numQuestions)
    });
    
    // Record usage
    await storage.recordTestGeneration(req.user!.id);
    
    res.json(test);
  } catch (error: any) {
    console.error("Error generating test:", error);
    res.status(500).json({ 
      error: "Failed to generate test questions", 
      details: error.message 
    });
  }
});

// Generate written event feedback
router.post('/written-event-feedback', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  try {
    const { eventType, content, sections } = req.body;
    
    if (!eventType || !content) {
      return res.status(400).json({ 
        error: "Missing required parameters: eventType and content are required" 
      });
    }
    
    // Check user subscription for written event feedback
    const canGenerate = await storage.checkWrittenEventAllowance(req.user!.id);
    if (!canGenerate) {
      return res.status(403).json({ 
        error: "You have reached your written event feedback limit for your subscription tier" 
      });
    }
    
    // This feature would require additional Azure OpenAI integration
    // For now, return a basic response structure
    const writtenFeedback = {
      overallScore: 75,
      strengths: ["Well structured content", "Clear business focus"],
      improvements: ["Add more specific data", "Expand on implementation details"],
      summary: "Good foundation with room for enhancement in analytical depth."
    };
    
    // Record usage
    await storage.recordWrittenEventGeneration(req.user!.id);
    
    res.json(writtenFeedback);
  } catch (error: any) {
    console.error("Error generating written event feedback:", error);
    res.status(500).json({ 
      error: "Failed to generate written event feedback", 
      details: error.message 
    });
  }
});

export default router;