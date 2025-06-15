import { Express } from "express";
import { createServer, Server } from "http";
import { IStorage } from "./storage";
import { AzureOpenAI } from "@azure/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  const storage = app.get("storage") as IStorage;

  // Test generation endpoint
  app.post("/api/generate-test", async (req, res) => {
    try {
      const { cluster, level, questionCount } = req.body;
      
      // Skip user authentication checks for demo purposes
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
      const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
      
      if (!azureKey || !azureEndpoint || !deploymentName) {
        return res.status(500).json({ error: "Azure OpenAI configuration missing" });
      }
      
      console.log('Generating test with Azure OpenAI...');
      console.log('Cluster:', cluster);
      console.log('Level:', level);
      console.log('Question count:', questionCount);
      
      // Create Azure OpenAI client
      const client = new AzureOpenAI({
        apiKey: azureKey,
        endpoint: azureEndpoint,
        apiVersion: "2024-02-15-preview"
      });

      // System prompt for DECA test generation
      const systemPrompt = `You are a world-class psychometrician and certified DECA Advisor specializing in creating authentic DECA competition exam questions.

Generate a ${questionCount}-question multiple choice exam for:
- Cluster: ${cluster}
- Level: ${level}

Requirements:
1. Create authentic DECA-style questions with realistic business scenarios
2. Use proper Performance Indicator (PI) codes for each question
3. Include instructional areas relevant to the cluster
4. Vary difficulty levels appropriately for the competition level
5. Distribute correct answers evenly across A, B, C, D options
6. Each question should have exactly 4 options (A, B, C, D)
7. Include a brief rationale for each correct answer

Format the response as valid JSON with this structure:
{
  "questions": [
    {
      "id": 1,
      "stem": "Question text here",
      "options": {
        "A": "Option A text",
        "B": "Option B text", 
        "C": "Option C text",
        "D": "Option D text"
      },
      "answer": "A",
      "rationale": "Brief explanation of why this is correct",
      "instructional_area": "Communications",
      "pi_codes": ["PD:001"],
      "difficulty": "easy"
    }
  ],
  "metadata": {
    "cluster": "${cluster}",
    "level": "${level}",
    "total_questions": ${questionCount}
  }
}`;

      // Generate test using Azure OpenAI
      const response = await client.getChatCompletions(deploymentName, {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate the ${questionCount}-question exam now.` }
        ],
        temperature: 0.7,
        maxTokens: 16384,
        topP: 0.95
      });

      if (!response.choices || response.choices.length === 0) {
        throw new Error("No response from Azure OpenAI");
      }

      const content = response.choices[0].message?.content;
      if (!content) {
        throw new Error("Empty response from Azure OpenAI");
      }

      console.log('Raw AI Response:', content);

      // Parse JSON response
      let testData;
      try {
        // Clean the response to extract JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        testData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Content that failed to parse:', content);
        throw new Error("Invalid JSON response from AI");
      }

      // Validate the response structure
      if (!testData.questions || !Array.isArray(testData.questions)) {
        throw new Error("Invalid test data structure");
      }

      // Record the usage if user is authenticated
      if (userId) {
        await storage.recordTestGeneration(userId);
      }

      console.log('Successfully generated test with', testData.questions.length, 'questions');
      res.json(testData);

    } catch (error) {
      console.error('Test generation error:', error);
      res.status(500).json({ 
        error: "Failed to generate test", 
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Other existing routes...
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}