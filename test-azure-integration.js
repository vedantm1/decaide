// Simple test for Azure OpenAI integration
import { getOpenAIClient } from './server/services/azureOpenai.js';
import dotenv from 'dotenv';

dotenv.config();

async function testAzureOpenAI() {
  try {
    console.log("Creating Azure OpenAI client...");
    const client = getOpenAIClient();
    console.log("Client created successfully!");
    
    console.log("Testing chat completions...");
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";
    
    const response = await client.getChatCompletions(
      deployment,
      [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What is DECA?" }
      ],
      {
        temperature: 0.7,
        maxTokens: 200
      }
    );
    
    console.log("Response received!");
    console.log("Content:", response.choices[0]?.message?.content);
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Error testing Azure OpenAI:", error);
  }
}

testAzureOpenAI();