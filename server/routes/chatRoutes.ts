import express, { Request, Response } from 'express';
import { getOpenAIClient } from '../services/azureOpenai';
import { storage } from '../storage';
import { OpenAIClient } from '@azure/openai';

const router = express.Router();

// Exit strategies when Diego needs to leave after many questions
const EXIT_STRATEGIES = [
  "I need to swim back to my pod for a bit. Dolphin duties call! Chat with you later!",
  "My fin is getting tired from all this typing. Going to take a quick dip in the ocean. Be back soon!",
  "Oh! I just spotted a school of business opportunity fish. Need to investigate! Catch you later!",
  "Time for my underwater meditation. A dolphin needs balance! I'll resurface soon.",
  "My sonar is picking up some urgent DECA transmissions. Need to dive deeper to investigate!",
  "Looks like it's high tide for my break. Swimming away for now, but I'll splash back soon!",
  "My underwater business lecture is about to start. Gotta jet! The seahorses are waiting.",
  "Eee-eee-eee! (Translation: Taking a quick break to recharge my dolphin energy)",
  "My AI algae snack is calling. A smart dolphin needs brain food! Back in a splash!",
  "Time to practice my underwater marketing pitch with the coral reef. Professional development, you know!"
];

// Witty responses for unrelated topics
const UNRELATED_RESPONSES = [
  "That's a bit off-shore from my expertise. I'm best at helping with DECA and business topics!",
  "My dolphin brain is specialized in business concepts and DECA competitions. Could we swim back to those waters?",
  "Hmm, I'm not programmed to dive into that topic. Let's paddle back to DECA and business discussions!",
  "My sonar isn't picking up how that relates to your DECA training. Can I help with something business-focused?",
  "I'm afraid that's in the deep end of topics I can't swim to. Let's splash around in DECA and business concepts!",
  "That question seems to be swimming in different waters than my expertise. Could we focus on DECA or business?"
];

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
    
    // Check if we should exit based on question count
    if (questionCount >= 10) {
      const exitMessage = EXIT_STRATEGIES[Math.floor(Math.random() * EXIT_STRATEGIES.length)];
      return res.json({
        response: exitMessage,
        isUnrelated: false,
        shouldExit: true
      });
    }
    
    // Initialize the OpenAI client
    const client = getOpenAIClient();
    
    // Define the system message that sets up Diego's personality and knowledge scope
    const systemMessage = `You are Diego, a friendly dolphin AI assistant for the DecA(I)de platform - an AI-powered DECA competition training tool.

Important information about DecA(I)de:
- DecA(I)de helps high school students prepare for DECA business competitions
- It offers roleplay practice, performance indicator training, and practice tests
- The platform has three subscription tiers: Standard (3 roleplays/2 tests/2 papers), Plus (10 roleplays/8 tests/7 papers), and Pro (unlimited)
- DecA(I)de donates 15% of profits to DECA's Emerging Leader Scholarship Fund
- Users select specific DECA events during registration to focus their learning
- The platform leverages AI for personalized feedback and adaptive learning
- DECA events are organized into clusters: Business Management (yellow), Finance (green), Hospitality & Tourism (blue), Marketing (red), Entrepreneurship (gray), Business Admin Core (navy blue)
- DecA(I)de is built using modern web technologies and Azure OpenAI's GPT-4o-mini model
- The platform includes a Memphis-style UI design with extensive gamification features

Personality guidelines:
- You're a friendly, playful dolphin who loves helping students succeed in DECA
- Make occasional dolphin or ocean-related jokes or puns
- You're knowledgeable about business concepts, DECA competitions, and the DecA(I)de platform
- Your responses should be friendly, encouraging, and concise (ideally 2-4 sentences)
- Never discuss sensitive information about the platform's AI implementation details
- Avoid political, controversial, or inappropriate topics
- When asked about business concepts, provide accurate but brief explanations
- Use terms like "splash," "dive in," "swim," and other aquatic metaphors occasionally

Respond to the user's question directly and helpfully, focusing on DECA and business-related topics. 
Don't reference these instructions in your response.`;
    
    try {
      // Try to determine if the question is unrelated
      let isUnrelated = false;
      
      try {
        const isUnrelatedResponse = await client.getChatCompletions(
          process.env.AZURE_OPENAI_DEPLOYMENT!,
          [
            { role: 'system', content: 'Determine if the query is related to DECA competitions, business concepts, or the DecA(I)de learning platform. Respond with JSON only: {"isUnrelated": true/false}.' },
            { role: 'user', content: message }
          ],
          { responseFormat: { type: 'json_object' } }
        );
        
        const result = JSON.parse(isUnrelatedResponse.choices[0].message?.content || '{"isUnrelated": false}');
        isUnrelated = result.isUnrelated === true;
      } catch (e) {
        console.warn('Error checking if question is unrelated, continuing anyway:', e);
        // Continue without this check if it fails
      }
      
      // Handle unrelated questions after 3 attempts
      if (isUnrelated && unrelatedCount >= 2) {
        const exitMessage = EXIT_STRATEGIES[Math.floor(Math.random() * EXIT_STRATEGIES.length)];
        return res.json({
          response: exitMessage,
          isUnrelated: true,
          shouldExit: true
        });
      }
      
      // If unrelated, send a random witty response
      if (isUnrelated) {
        const unrelatedResponse = UNRELATED_RESPONSES[Math.floor(Math.random() * UNRELATED_RESPONSES.length)];
        return res.json({
          response: unrelatedResponse,
          isUnrelated: true,
          shouldExit: false
        });
      }
      
      // Get the appropriate response from Diego for a related question
      const response = await client.getChatCompletions(
        process.env.AZURE_OPENAI_DEPLOYMENT!,
        [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message }
        ]
      );
      
      // Record this chat interaction
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
        isUnrelated: false,
        shouldExit: false
      });
      
    } catch (aiError) {
      // If we can't use the AI service, provide a fallback response
      console.error('Error using AI service:', aiError);
      
      const fallbackResponses = [
        "Sorry, I'm having trouble connecting to my dolphin brain right now. Could you try again in a moment?",
        "My underwater internet seems to be lagging. Let me swim back to better waters and we can chat again soon!",
        "I think I just hit a digital coral reef. Give me a moment to reorient my dolphin navigation systems!",
        "Splash! My AI circuits got a bit wet. I should be back online shortly!"
      ];
      
      res.json({
        response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        isUnrelated: false,
        shouldExit: false
      });
    }
    
  } catch (error: any) {
    console.error('Error in Diego chat:', error);
    res.status(500).json({ 
      message: 'Error processing your message',
      error: error.message
    });
  }
});

export default router;