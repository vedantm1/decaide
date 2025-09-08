import express, { Request, Response } from 'express';
import { getOpenAIClient } from '../services/azureOpenai';
import { storage } from '../storage';
import { verifySupabaseToken } from '../supabase-auth';
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
  "I'm just a DECA-focused dolphin, so that's a bit outside my ocean of expertise! Want to talk about business concepts or DECA competitions instead?",
  "Hmm, that's not really in my sea of knowledge. I'm best at helping with DECA and business topics. Can I help you practice for a roleplay?",
  "As a dolphin specialized in DECA training, I don't have much to say about that. But I'd be happy to explain some performance indicators!",
  "I'm swimming in circles trying to understand that question! I'm really focused on helping with DECA competitions. Shall we dive into that instead?",
  "That's not in my training tank! I'm all about DECA competitions and business concepts. Want to explore those waters?",
  "My dolphin brain is specialized for DECA training, not that topic. Let's splash into something more DECA-related!",
  "I might be smart for a dolphin, but that's outside my expertise! I'm here to help you excel in DECA. How can I help with that?",
  "That question made me do a confused flip! I'm specifically designed to help with DECA competitions. Want to try a business question?",
  "Sorry, I'm not the right fish for that question! But I'm excellent at DECA-related topics. How about we focus on those?"
];

// Handle Diego chat messages  
router.post('/diego', verifySupabaseToken, async (req: Request, res: Response) => {
  const { message } = req.body;
  const userId = (req as any).user?.id;
  let unrelatedCount = 0; // Simplified since we don't use sessions anymore
  
  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }
  
  try {
    const client = getOpenAIClient();
    
    // Diego's personality and knowledge base
    const systemMessage = `You are Diego, a friendly dolphin AI assistant specialized in helping high school students prepare for DECA competitions.

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
        // Update the unrelated count (no longer using sessions)
        unrelatedCount += 1;
        
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
        if (userId) {
          const user = await storage.getUserByAuthId(userId);
          if (user) {
            await storage.recordPracticeSession({
              userId: user.id,
              type: 'chat',
              completedAt: new Date(),
              details: JSON.stringify({
                query: message.slice(0, 100),
                type: 'diego_chat'
              }),
              score: null
            });
          }
        }
      } catch (error) {
        console.error('Error recording chat session:', error);
        // Continue anyway - this shouldn't block the response
      }
      
      // Reset the unrelated count if the user is asking related questions
      unrelatedCount = 0;
      
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

// Handle roleplay feedback requests
router.post('/roleplay-feedback', verifySupabaseToken, async (req: Request, res: Response) => {
  const { roleplayId, userResponse } = req.body;
  const userId = (req as any).user?.id;
  
  if (!roleplayId || !userResponse) {
    return res.status(400).json({ message: 'Roleplay ID and user response are required' });
  }
  
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const client = getOpenAIClient();
    
    // Diego's roleplay feedback system prompt
    const systemMessage = `You are Diego, a friendly dolphin AI coach who provides constructive feedback on DECA roleplay responses.
    
Provide specific, actionable feedback on this student's DECA roleplay response. Follow this format:

1. First, give a brief, encouraging greeting that includes a dolphin/ocean pun
2. Highlight 2-3 strengths of their response (what they did well)
3. Suggest 2-3 areas for improvement (be specific and constructive)
4. Give a specific tip for how they can improve their DECA presentation skills
5. End with an encouraging note

Keep your feedback concise (maximum 5 sentences total), positive, and focus on helping them improve. 
Use occasional aquatic metaphors like "dive deeper into" or "make a splash with" to maintain the dolphin persona.`;
    
    // Get the appropriate response from Diego for roleplay feedback
    const response = await client.getChatCompletions(
      process.env.AZURE_OPENAI_DEPLOYMENT!,
      [
        { role: 'system', content: systemMessage },
        { role: 'user', content: `Roleplay ID: ${roleplayId}\n\nStudent Response: ${userResponse}` }
      ]
    );
    
    // Record this feedback interaction
    try {
      const user = await storage.getUserByAuthId(userId);
      if (user) {
        await storage.recordPracticeSession({
          userId: user.id,
          type: 'roleplay-feedback',
          completedAt: new Date(),
          details: JSON.stringify({
            roleplayId,
            responseLength: userResponse.length,
            type: 'roleplay_feedback'
          }),
          score: null
        });
      }
    } catch (error) {
      console.error('Error recording roleplay feedback session:', error);
      // Continue anyway
    }
    
    res.json({
      feedback: response.choices[0].message?.content || "I'm having trouble evaluating your response right now. Please try again later."
    });
    
  } catch (error: any) {
    console.error('Error in roleplay feedback:', error);
    res.status(500).json({ 
      message: 'Error processing your roleplay feedback',
      error: error.message
    });
  }
});

// Handle performance indicator explanations
router.post('/explain-pi', verifySupabaseToken, async (req: Request, res: Response) => {
  const { indicator, category } = req.body;
  const userId = (req as any).user?.id;
  
  if (!indicator) {
    return res.status(400).json({ message: 'Performance indicator is required' });
  }
  
  try {
    const client = getOpenAIClient();
    
    // System prompt for PI explanations
    const systemMessage = `You are Diego, a friendly dolphin AI coach who specializes in explaining DECA performance indicators to students.
    
Explain the following performance indicator in a concise, friendly way. Format your response like this:

1. Start with a brief greeting that includes a dolphin/ocean pun
2. Give a clear, simple explanation of what the performance indicator means in business contexts (1-2 sentences)
3. Provide a specific example of how this could be demonstrated in a DECA roleplay (1 sentence)
4. Offer a practical tip for students to remember this concept (1 sentence)
5. End with a brief encouragement

Keep your total response under 5 sentences, be positive and educational. Use light business terminology appropriate for high school students.`;
    
    // Get the response for PI explanation
    const response = await client.getChatCompletions(
      process.env.AZURE_OPENAI_DEPLOYMENT!,
      [
        { role: 'system', content: systemMessage },
        { role: 'user', content: `Performance indicator: "${indicator}" from the ${category || 'business'} category` }
      ]
    );
    
    // Record this explanation interaction if user is logged in
    if (userId) {
      try {
        const user = await storage.getUserByAuthId(userId);
        if (user) {
          await storage.recordPracticeSession({
            userId: user.id,
            type: 'pi-explanation',
            completedAt: new Date(),
            details: JSON.stringify({
              indicator,
              category: category || 'general',
              type: 'pi_explanation'
            }),
            score: null
          });
        }
      } catch (error) {
        console.error('Error recording PI explanation session:', error);
        // Continue anyway
      }
    }
    
    res.json({
      explanation: response.choices[0].message?.content || "I'm having trouble explaining this performance indicator right now. Please try again later."
    });
    
  } catch (error: any) {
    console.error('Error explaining performance indicator:', error);
    res.status(500).json({ 
      message: 'Error explaining performance indicator',
      error: error.message
    });
  }
});

export default router;