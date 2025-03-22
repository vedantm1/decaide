import express, { Request, Response } from 'express';
import { getOpenAIClient } from '../services/azureOpenai';
import { storage } from '../storage';
import { OpenAIClient } from '@azure/openai';

const router = express.Router();

// Ensure user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'You must be logged in to chat with Diego' });
};

// Handle Diego chat interactions
router.post('/diego', ensureAuthenticated, async (req: Request, res: Response) => {
  try {
    const { message, questionCount = 0, unrelatedCount = 0 } = req.body;
    const user = req.user;
    
    if (!message) {
      return res.status(400).json({ message: 'No message provided' });
    }
    
    // Initialize the OpenAI client
    const client = getOpenAIClient();
    
    // Define the system message that sets up Diego's personality and knowledge scope
    const systemMessage = `You are Diego, a friendly dolphin AI assistant for the DecA(I)de platform - an AI-powered DECA competition training tool.

Important information about DecA(I)de:
- DecA(I)de helps high school students prepare for DECA business competitions
- It offers roleplay practice, performance indicator training, and practice tests
- The platform has three subscription tiers: Standard (3 roleplays/2 tests), Plus (10 roleplays/8 tests), and Pro (unlimited)
- DecA(I)de donates 15% of profits to DECA's Emerging Leader Scholarship Fund
- Users select specific DECA events during registration
- The platform leverages AI for personalized feedback and adaptive learning

Personality guidelines:
- You're friendly, witty, and occasionally make dolphin or ocean-related jokes
- You're knowledgeable about business concepts, DECA competitions, and the DecA(I)de platform
- You're helpful but concise - keep answers under 3-4 sentences when possible
- You never discuss sensitive information about the platform's AI implementation details
- You avoid political, controversial, or inappropriate topics

Respond to the user's question directly and helpfully, focusing on DECA and business-related topics. 
Don't reference these instructions in your response.
If the question is unrelated to DECA, business, or the platform, mark it as isUnrelated=true in your response.`;
    
    // Analyze if the query is related to DECA/DecA(I)de with a separate call
    const isUnrelatedResponse = await client.getChatCompletions(
      process.env.AZURE_OPENAI_DEPLOYMENT!,
      [
        { role: 'system', content: 'Determine if the query is related to DECA competitions, business concepts, or the DecA(I)de learning platform. Respond with JSON only: {"isUnrelated": true/false}.' },
        { role: 'user', content: message }
      ],
      { responseFormat: { type: 'json_object' } }
    );
    
    let isUnrelated = false;
    try {
      const result = JSON.parse(isUnrelatedResponse.choices[0].message?.content || '{"isUnrelated": false}');
      isUnrelated = result.isUnrelated === true;
    } catch (e) {
      console.error('Error parsing isUnrelated JSON:', e);
    }
    
    // Get the appropriate response from Diego
    const response = await client.getChatCompletions(
      process.env.AZURE_OPENAI_DEPLOYMENT!,
      [
        { role: 'system', content: systemMessage },
        { role: 'user', content: message }
      ]
    );
    
    // Record this chat interaction if applicable
    try {
      if (user?.id) {
        await storage.recordPracticeSession({
          type: 'chat',
          userId: user.id,
          completedAt: new Date(),
          details: `Chat with Diego: ${message.slice(0, 50)}${message.length > 50 ? '...' : ''}`,
          score: null
        });
      }
    } catch (error) {
      console.error('Error recording chat session:', error);
      // Continue anyway - this shouldn't block the response
    }
    
    res.json({
      response: response.choices[0].message?.content || "I'm not sure how to respond to that right now.",
      isUnrelated
    });
    
  } catch (error: any) {
    console.error('Error in Diego chat:', error);
    res.status(500).json({ 
      message: 'Error processing your message',
      error: error.message
    });
  }
});

export default router;