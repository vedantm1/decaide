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
