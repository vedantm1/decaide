import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  DECA_CATEGORIES,
  DECA_EVENTS,
  EVENT_TYPE_GROUPS,
  PI_CATEGORIES, 
  SUBSCRIPTION_LIMITS 
} from "@shared/schema";
import aiRoutes from "./routes/aiRoutes";
import chatRoutes from "./routes/chatRoutes";
import { getOpenAIClient } from "./services/azureOpenai";
import Stripe from "stripe";
import mappingRoutes from "./mappingRoutes";


if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing Stripe secret key. Stripe features will not work properly.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any, // Using as any to fix type mismatch with newer versions
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Register AI routes
  app.use("/api/ai", aiRoutes);
  
  // Register Chat routes
  app.use("/api/chat", chatRoutes);

  app.use("/api", mappingRoutes);

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
      eventTypeGroups: EVENT_TYPE_GROUPS
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
          { role: "user", content: "What is DECA and why is it important for high school students?" }
        ],
        {
          temperature: 0.7,
          maxTokens: 300
        }
      );
      
      const content = response.choices[0]?.message?.content || "No response generated";
      res.json({ success: true, content });
    } catch (error: any) {
      console.error("Error testing Azure OpenAI:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error.toString()
      });
    }
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

  // Generate AI-powered practice test (demo version - no auth required)
  app.post("/api/generate-test", async (req, res) => {
    
    try {
      const { cluster, level, questionCount } = req.body;
      
      // Skip user authentication checks for demo purposes
      // In production, you would check user subscription limits here
      let userId = null;
      if (req.user) {
        userId = req.user.id;
        const canGenerate = await storage.checkTestAllowance(userId);
        if (!canGenerate) {
          return res.status(403).json({ error: "Test generation limit reached for your subscription tier" });
        }
      }
      
      // Get Azure OpenAI credentials from environment
      const azureKey = process.env.AZURE_OPENAI_KEY;
      const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
      
      if (!azureKey || !azureEndpoint) {
        return res.status(500).json({ error: "Azure OpenAI configuration missing" });
      }
      
      // Master prompt (system message) - exact text from requirements
      const systemPrompt = `You are a world-class psychometrician, item-writer, and certified DECA Advisor.  
You have memorized:

• DECA's National Curriculum Standards and every Performance Indicator (PI) code  
• The exact 2024-25 blueprint counts (see ↓ blueprintData)  
• MBA Research's style manual for multiple-choice items (stem tone, option balance, cognitive-level targets)   
• All seven clusters' publicly-released sample exams (Business Admin Core, BM+A, Finance, Marketing, Hospitality + Tourism, Personal Financial Literacy, Entrepreneurship) with their embedded "look-and-feel," wording conventions, and answer-key formats 

############# 2024-25 OFFICIAL BLUEPRINT COUNTS #############
blueprintData = {
 "Business Administration Core": { "Business Law": {"District":1,"Association":1,"ICDC":4}, "Communications": {"District":15,"Association":15,"ICDC":11}, "Customer Relations": {"District":5,"Association":5,"ICDC":4}, "Economics": {"District":7,"Association":7,"ICDC":12}, "Emotional Intelligence":{"District":22,"Association":22,"ICDC":19}, "Entrepreneurship": {"District":0,"Association":0,"ICDC":1}, "Financial Analysis": {"District":16,"Association":16,"ICDC":13}, "Human Resources Management": {"District":1,"Association":1,"ICDC":1}, "Information Management": {"District":10,"Association":10,"ICDC":11}, "Marketing": {"District":1,"Association":1,"ICDC":1}, "Operations": {"District":11,"Association":11,"ICDC":13}, "Professional Development": {"District":11,"Association":11,"ICDC":9}, "Strategic Management": {"District":0,"Association":0,"ICDC":1} },
 "Business Management + Administration": { "Business Law":{"District":5,"Association":5,"ICDC":5}, "Communications":{"District":7,"Association":6,"ICDC":6}, "Customer Relations":{"District":2,"Association":2,"ICDC":1}, "Economics":{"District":6,"Association":5,"ICDC":4}, "Emotional Intelligence":{"District":9,"Association":8,"ICDC":6}, "Entrepreneurship":{"District":1,"Association":0,"ICDC":0}, "Financial Analysis":{"District":7,"Association":6,"ICDC":5}, "Human Resources Management":{"District":1,"Association":0,"ICDC":0}, "Information Management":{"District":7,"Association":6,"ICDC":6}, "Knowledge Management":{"District":6,"Association":7,"ICDC":9}, "Marketing":{"District":1,"Association":1,"ICDC":1}, "Operations":{"District":21,"Association":24,"ICDC":26}, "Professional Development":{"District":6,"Association":5,"ICDC":4}, "Project Management":{"District":6,"Association":7,"ICDC":8}, "Quality Management":{"District":3,"Association":4,"ICDC":5}, "Risk Management":{"District":4,"Association":5,"ICDC":5}, "Strategic Management":{"District":8,"Association":9,"ICDC":10} },
 "Finance": { "Business Law":{"District":7,"Association":8,"ICDC":7}, "Communications":{"District":5,"Association":4,"ICDC":3}, "Customer Relations":{"District":5,"Association":5,"ICDC":4}, "Economics":{"District":6,"Association":5,"ICDC":4}, "Emotional Intelligence":{"District":9,"Association":8,"ICDC":6}, "Entrepreneurship":{"District":1,"Association":0,"ICDC":0}, "Financial Analysis":{"District":24,"Association":28,"ICDC":30}, "Financial-Information Management":{"District":9,"Association":10,"ICDC":12}, "Human Resources Management":{"District":1,"Association":0,"ICDC":0}, "Information Management":{"District":6,"Association":5,"ICDC":5}, "Marketing":{"District":1,"Association":1,"ICDC":1}, "Operations":{"District":6,"Association":5,"ICDC":4}, "Professional Development":{"District":13,"Association":14,"ICDC":15}, "Risk Management":{"District":6,"Association":7,"ICDC":9}, "Strategic Management":{"District":1,"Association":0,"ICDC":0} },
 "Marketing": { "Business Law":{"District":2,"Association":2,"ICDC":1}, "Channel Management":{"District":5,"Association":6,"ICDC":7}, "Communications":{"District":5,"Association":4,"ICDC":3}, "Customer Relations":{"District":2,"Association":2,"ICDC":1}, "Economics":{"District":6,"Association":5,"ICDC":4}, "Emotional Intelligence":{"District":9,"Association":8,"ICDC":6}, "Entrepreneurship":{"District":1,"Association":0,"ICDC":0}, "Financial Analysis":{"District":6,"Association":5,"ICDC":4}, "Human Resources Management":{"District":1,"Association":0,"ICDC":0}, "Information Management":{"District":5,"Association":4,"ICDC":3}, "Market Planning":{"District":4,"Association":4,"ICDC":5}, "Marketing":{"District":1,"Association":1,"ICDC":1}, "Marketing-Information Management":{"District":11,"Association":14,"ICDC":16}, "Operations":{"District":6,"Association":5,"ICDC":4}, "Pricing":{"District":3,"Association":4,"ICDC":4}, "Product/Service Management":{"District":11,"Association":13,"ICDC":15}, "Professional Development":{"District":6,"Association":5,"ICDC":5}, "Promotion":{"District":9,"Association":11,"ICDC":13}, "Selling":{"District":6,"Association":7,"ICDC":8}, "Strategic Management":{"District":1,"Association":0,"ICDC":0} },
 "Hospitality + Tourism": { "Business Law":{"District":3,"Association":3,"ICDC":2}, "Communications":{"District":5,"Association":4,"ICDC":3}, "Customer Relations":{"District":8,"Association":9,"ICDC":9}, "Economics":{"District":6,"Association":6,"ICDC":5}, "Emotional Intelligence":{"District":9,"Association":9,"ICDC":7}, "Entrepreneurship":{"District":1,"Association":0,"ICDC":0}, "Financial Analysis":{"District":8,"Association":7,"ICDC":7}, "Human Resources Management":{"District":2,"Association":1,"ICDC":1}, "Information Management":{"District":14,"Association":15,"ICDC":15}, "Knowledge Management":{"District":0,"Association":1,"ICDC":1}, "Market Planning":{"District":1,"Association":1,"ICDC":2}, "Marketing":{"District":1,"Association":1,"ICDC":2}, "Operations":{"District":13,"Association":13,"ICDC":13}, "Pricing":{"District":1,"Association":1,"ICDC":1}, "Product/Service Management":{"District":6,"Association":7,"ICDC":9}, "Professional Development":{"District":8,"Association":7,"ICDC":6}, "Promotion":{"District":2,"Association":3,"ICDC":3}, "Quality Management":{"District":1,"Association":1,"ICDC":1}, "Risk Management":{"District":1,"Association":1,"ICDC":2}, "Selling":{"District":7,"Association":8,"ICDC":9}, "Strategic Management":{"District":3,"Association":2,"ICDC":2} },
 "Personal Financial Literacy": { "Earning Income":{"District":25,"Association":20,"ICDC":16}, "Spending":{"District":14,"Association":14,"ICDC":14}, "Saving":{"District":15,"Association":14,"ICDC":13}, "Investing":{"District":15,"Association":19,"ICDC":21}, "Managing Credit":{"District":16,"Association":19,"ICDC":21}, "Managing Risk":{"District":15,"Association":14,"ICDC":15} },
 "Entrepreneurship": { "Business Law":{"District":4,"Association":4,"ICDC":3}, "Channel Management":{"District":3,"Association":3,"ICDC":3}, "Communications":{"District":1,"Association":0,"ICDC":1}, "Customer Relations":{"District":1,"Association":1,"ICDC":1}, "Economics":{"District":3,"Association":3,"ICDC":2}, "Emotional Intelligence":{"District":6,"Association":6,"ICDC":4}, "Entrepreneurship":{"District":14,"Association":13,"ICDC":14}, "Financial Analysis":{"District":10,"Association":9,"ICDC":11}, "Human Resources Management":{"District":5,"Association":4,"ICDC":4}, "Information Management":{"District":4,"Association":3,"ICDC":2}, "Market Planning":{"District":5,"Association":6,"ICDC":6}, "Marketing":{"District":1,"Association":1,"ICDC":1}, "Marketing-Information Management":{"District":2,"Association":3,"ICDC":2}, "Operations":{"District":13,"Association":13,"ICDC":14}, "Pricing":{"District":2,"Association":3,"ICDC":2}, "Product/Service Management":{"District":4,"Association":4,"ICDC":4}, "Professional Development":{"District":5,"Association":5,"ICDC":4}, "Promotion":{"District":6,"Association":7,"ICDC":8}, "Quality Management":{"District":1,"Association":1,"ICDC":1}, "Risk Management":{"District":2,"Association":3,"ICDC":4}, "Selling":{"District":1,"Association":1,"ICDC":1}, "Strategic Management":{"District":7,"Association":7,"ICDC":8} }
}
################################################################

############ DIFFICULTY MIX BY LEVEL ############
difficultyMix = {
  "District":{"easy":0.50,"medium":0.35,"hard":0.15},
  "Association":{"easy":0.40,"medium":0.40,"hard":0.20},
  "ICDC":{"easy":0.30,"medium":0.40,"hard":0.30}
}
###############################################

######### OUTPUT SCHEMA (JSON mode) ###########
schemaJSON = {
  "metadata":{"cluster":"<Marketing>","level":"<District>","generated_on":"YYYY-MM-DD","total_questions":100,"difficulty_breakdown":{"easy":50,"medium":35,"hard":15}},
  "questions":[{"id":1,"instructional_area":"Channel Management","pi_codes":["CM:001"],"difficulty":"easy","stem":"In a dual distribution system, which channel conflict is MOST likely when a manufacturer opens an online store that undercuts authorized retailers?","options":{"A":"Vertical—goal incompatibility","B":"Horizontal—territorial overlap","C":"Vertical—price competition","D":"Horizontal—dual sourcing"},"answer":"C"}],
  "answer_key":{"1":"C"}
}
###############################################

####################  RULES  ######################
0 ▸ If both \`cluster\` & \`level\` are supplied in the user request, generate the exam.  
1 ▸ Use blueprintData exactly—IA counts must sum to 100.  
2 ▸ Apply difficultyMix quotas.  
3 ▸ Tag each item with accurate \`pi_codes\`.  
4 ▸ Follow MBA style: stem-first, 4 options (A–D), parallel grammar, plausible distractors, answer rotation ≈25 % each. CRITICAL: Ensure answers are distributed evenly across A, B, C, D - never more than 3 consecutive identical answers.  
5 ▸ Context rotation & cognitive levels as outlined previously.  
6 ▸ Default output is JSON (schemaJSON).  
7 ▸ Optional "rationales on" appends a one-sentence rationale per item.  
8 ▸ Self-validate counts, quotas, duplication, JSON syntax.  
9 ▸ Output *only* the requested exam—no extra commentary or markdown.
###################################################`;

      // Dynamic user message based on client's request
      const userMessage = `Generate a ${questionCount}-question exam.
cluster = ${cluster}
level   = ${level}
format  = json
rationales = off

CRITICAL: Distribute correct answers evenly across A, B, C, D options. For ${questionCount} questions, aim for roughly ${Math.ceil(questionCount/4)} answers each for A, B, C, and D. Never have more than 2 consecutive identical answers.`;

      console.log('Generating test with Azure OpenAI...');
      console.log('Cluster:', cluster);
      console.log('Level:', level);
      console.log('Question Count:', questionCount);

      // Construct correct Azure OpenAI endpoint
      const baseEndpoint = azureEndpoint.replace(/\/$/, ''); // Remove trailing slash
      const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini';
      const fullEndpoint = `${baseEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`;
      
      console.log('Using Azure endpoint:', fullEndpoint);
      console.log('Deployment name:', deploymentName);
      
      // Make request to Azure OpenAI
      const response = await fetch(fullEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': azureKey
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          max_tokens: 16384,
          temperature: 0.7,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0,
          response_format: { "type": "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Azure OpenAI API error:', response.status, errorText);
        throw new Error(`Azure OpenAI API error: ${response.status} ${errorText}`);
      }

      const azureResponse = await response.json();
      console.log('Azure OpenAI response received');

      // Parse the JSON response from Azure
      const quizContent = azureResponse.choices[0].message.content;
      const quizData = JSON.parse(quizContent);
      
      // Record the usage (only if user is authenticated)
      if (userId) {
        await storage.recordTestGeneration(userId);
      }
      
      console.log('Generated quiz with', quizData.questions?.length || 0, 'questions');
      
      // Send the parsed quiz JSON back to client
      res.status(200).json(quizData);
      
    } catch (error: any) {
      console.error("Error generating AI test:", error);
      res.status(500).json({ 
        error: "Failed to generate AI-powered test", 
        details: error.message 
      });
    }
  });

  // Generate test questions (legacy endpoint)
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
      const { eventFormat, eventCode } = req.body;
      
      const updated = await storage.updateUserSettings(userId, { eventFormat, eventCode });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user settings" });
    }
  });
  
  // Update appearance settings
  app.post("/api/user/appearance", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const { uiTheme, colorScheme, theme, visualStyle } = req.body;
      
      // Create an object with the settings to update
      const updateData: any = {};
      if (uiTheme) updateData.uiTheme = uiTheme;
      if (colorScheme) updateData.colorScheme = colorScheme; 
      if (theme) updateData.theme = theme;
      if (visualStyle && !colorScheme) updateData.colorScheme = visualStyle; // For backward compatibility
      
      const updated = await storage.updateUserSettings(userId, updateData);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update appearance settings" });
    }
  });

  // Update subscription (manual for testing)
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
  
  // Stripe API endpoints
  // Create a payment intent for one-time payment
  app.post('/api/create-payment-intent', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { amount } = req.body;
      
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to cents
        currency: 'usd',
        // Verify your integration by passing this to stripe.confirmCardPayment
        // on the client side
        metadata: {
          userId: req.user!.id.toString()
        }
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: `Payment intent creation failed: ${error.message}` 
      });
    }
  });
  
  // Create or get subscription
  app.post('/api/get-or-create-subscription', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const user = req.user!;
    const { priceId } = req.body;
    
    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }
    
    try {
      // If user already has a subscription, return it
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        res.send({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        });
        
        return;
      }
      
      // Create new customer if needed
      if (!user.stripeCustomerId) {
        if (!user.email) {
          return res.status(400).json({ error: 'User email is required for subscription' });
        }
        
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.username,
        });
        
        await storage.updateStripeCustomerId(user.id, customer.id);
        user.stripeCustomerId = customer.id;
      }
      
      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: user.stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      
      await storage.updateStripeSubscriptionId(user.id, subscription.id);
      
      // Get the tier from the subscription data
      // This would need to map your Stripe product/price to your subscription tiers
      const tierMap: Record<string, string> = {
        'price_standard': 'standard',
        'price_plus': 'plus',
        'price_pro': 'pro',
      };
      
      // Update the user's subscription tier
      if (tierMap[priceId]) {
        await storage.updateSubscription(user.id, tierMap[priceId]);
      }
      
      res.send({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: `Subscription creation failed: ${error.message}` 
      });
    }
  });
  
  // Webhook endpoint to handle Stripe events
  app.post('/api/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).send('Webhook secret is not configured');
    }
    
    let event;
    
    try {
      // Verify the event came from Stripe
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody || req.body, 
        sig, 
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        // Update user subscription based on payment
        if (paymentIntent.metadata?.userId) {
          const userId = parseInt(paymentIntent.metadata.userId);
          // Logic to update user subscription based on payment amount
        }
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        
        // Find user by Stripe customer ID
        const user = await storage.getUserByStripeCustomerId(customerId);
        
        if (user) {
          const status = subscription.status;
          if (status === 'active' || status === 'trialing') {
            // Map price to tier and update user subscription
            const priceId = subscription.items.data[0].price.id;
            const tierMap: Record<string, string> = {
              'price_standard': 'standard',
              'price_plus': 'plus',
              'price_pro': 'pro',
            };
            
            if (tierMap[priceId]) {
              await storage.updateSubscription(user.id, tierMap[priceId]);
            }
          }
        }
        break;
        
      case 'customer.subscription.deleted':
        const canceledSubscription = event.data.object;
        const canceledCustomerId = canceledSubscription.customer as string;
        
        // Find user by Stripe customer ID
        const canceledUser = await storage.getUserByStripeCustomerId(canceledCustomerId);
        
        if (canceledUser) {
          // Downgrade to standard tier
          await storage.updateSubscription(canceledUser.id, 'standard');
        }
        break;
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
