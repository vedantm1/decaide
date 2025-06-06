import express, { Request, Response } from 'express';
import { generateTestQuestions } from '../services/azureOpenai.js';

const router = express.Router();

// Generate test questions
router.post('/generate-test', async (req: Request, res: Response) => {
  try {
    const { testType, categories, numQuestions } = req.body;
    
    if (!testType || !categories || !numQuestions) {
      return res.status(400).json({ 
        error: "Missing required parameters: testType, categories, and numQuestions are required" 
      });
    }
    
    // Generate the test questions
    const test = await generateTestQuestions({
      testType,
      categories: Array.isArray(categories) ? categories : [categories],
      numQuestions: Number(numQuestions)
    });
    
    res.json({ test: test.questions || test });
  } catch (error: any) {
    console.error("Error generating test:", error);
    res.status(500).json({ 
      error: "Failed to generate test questions", 
      details: error.message 
    });
  }
});

export default router;