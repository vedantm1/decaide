import express, { Request, Response } from 'express';
import { getOpenAIClient, generateRoleplay, generateTestQuestions } from '../services/azureOpenai';
import { storage } from '../storage';
import { verifySupabaseToken } from '../supabase-auth';

const router = express.Router();

// Get Azure OpenAI status
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const client = getOpenAIClient();
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
    
    // Try a simple completion to check if it works
    const response = await client.getChatCompletions(
      deployment,
      [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say 'Azure OpenAI is working properly'." }
      ],
      {
        maxTokens: 20
      }
    );
    
    const isWorking = response.choices[0]?.message?.content?.includes('working');
    
    res.json({
      status: isWorking ? 'operational' : 'degraded',
      deployment,
      message: response.choices[0]?.message?.content || "No response"
    });
  } catch (error: any) {
    console.error("Azure OpenAI status check failed:", error);
    res.status(500).json({
      status: 'unavailable',
      error: error.message
    });
  }
});

// Generate AI roleplay scenario
router.post('/generate-roleplay', verifySupabaseToken, async (req: Request, res: Response) => {
  
  try {
    const { 
      instructionalArea, 
      performanceIndicators, 
      competitionLevel, 
      businessType 
    } = req.body;
    
    if (!instructionalArea || !performanceIndicators || !competitionLevel) {
      return res.status(400).json({ 
        error: "Missing required parameters: instructionalArea, performanceIndicators, and competitionLevel are required" 
      });
    }
    
    
    
    // Generate the roleplay
    const roleplay = await generateRoleplay({
      instructionalArea,
      performanceIndicators: Array.isArray(performanceIndicators) ? performanceIndicators : [performanceIndicators],
      competitionLevel,
      businessType
    });
    
    // Record usage - get user ID from the Supabase auth
    const userId = (req.user as any)?.id;
    if (userId) {
      const user = await storage.getUserByAuthId(userId);
      if (user) {
        await storage.recordRoleplayGeneration(user.id);
      }
    }
    
    res.json(roleplay);
  } catch (error: any) {
    console.error("Error generating roleplay:", error);
    res.status(500).json({ 
      error: "Failed to generate roleplay scenario", 
      details: error.message 
    });
  }
});

// Generate test questions with comprehensive DECA standards
router.post('/generate-test', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  try {
    const { 
      testType, 
      categories, 
      numQuestions, 
      cluster, 
      level,
      learningMode,
      weakTopics,
      errorRate
    } = req.body;
    
    if (!testType || !categories || !numQuestions) {
      return res.status(400).json({ 
        error: "Missing required parameters: testType, categories, and numQuestions are required" 
      });
    }
    
    // Generate the test questions with enhanced DECA system
    const test = await generateTestQuestions({
      testType,
      categories: Array.isArray(categories) ? categories : [categories],
      numQuestions: Number(numQuestions),
      cluster: cluster || "Marketing",
      level: level || "District", 
      learningMode: Boolean(learningMode),
      weakTopics: Array.isArray(weakTopics) ? weakTopics : (weakTopics ? [weakTopics] : []),
      errorRate: errorRate ? Number(errorRate) : undefined
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
    
    
    
    const client = getOpenAIClient();
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
    
    // Create prompt for written event feedback
    const prompt = `
    You are a DECA judge reviewing a ${eventType} written event. Provide constructive feedback on the following content.
    
    Focus on these areas:
    - Organization and presentation
    - Business strategy and relevance
    - Financial analysis (if applicable)
    - Marketing approach (if applicable)
    - Overall quality and professionalism
    
    The following sections were submitted:
    ${sections ? JSON.stringify(sections) : "Complete document review"}
    
    Content to review:
    ${content}
    
    Format your response as a JSON object with these properties:
    - overallScore: A number from 1-100
    - strengths: Array of 3-5 specific strengths
    - improvements: Array of 3-5 specific areas for improvement
    - sectionFeedback: Object with section names as keys and specific feedback as values (if sections were provided)
    - summary: Brief overall assessment (2-3 sentences)
    `;
    
    const response = await client.getChatCompletions(
      deployment,
      [
        { role: "system", content: "You are a DECA judge with experience evaluating written business documents." },
        { role: "user", content: prompt }
      ],
      {
        temperature: 0.7,
        maxTokens: 1000,
        responseFormat: { type: "json_object" }
      }
    );
    
    const feedback = JSON.parse(response.choices[0].message?.content || "{}");
    
    // Record usage
    await storage.recordTestGeneration(req.user!.id);
    
    res.json(feedback);
  } catch (error: any) {
    console.error("Error generating written event feedback:", error);
    res.status(500).json({ 
      error: "Failed to generate written event feedback", 
      details: error.message 
    });
  }
});



export default router;