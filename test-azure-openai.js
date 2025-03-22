// Simple test to verify Azure OpenAI setup
require('dotenv').config();
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

// Environment variables for Azure OpenAI
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;

async function main() {
  console.log("Testing Azure OpenAI Connection...");
  
  // Check for required environment variables
  if (!AZURE_OPENAI_KEY || !AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_DEPLOYMENT) {
    console.error("Missing required environment variables:");
    if (!AZURE_OPENAI_KEY) console.error("- AZURE_OPENAI_KEY");
    if (!AZURE_OPENAI_ENDPOINT) console.error("- AZURE_OPENAI_ENDPOINT");
    if (!AZURE_OPENAI_DEPLOYMENT) console.error("- AZURE_OPENAI_DEPLOYMENT");
    process.exit(1);
  }
  
  try {
    // Create OpenAI client
    const client = new OpenAIClient(
      AZURE_OPENAI_ENDPOINT,
      new AzureKeyCredential(AZURE_OPENAI_KEY)
    );
    
    console.log("Client created, attempting to send a test message...");
    
    // Test completion
    const response = await client.getChatCompletions(
      AZURE_OPENAI_DEPLOYMENT,
      [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What is DECA?" }
      ],
      {
        temperature: 0.7,
        maxTokens: 500
      }
    );
    
    // Show the response
    console.log("✅ SUCCESS! Azure OpenAI is working properly.");
    console.log("\nModel Response:");
    console.log(response.choices[0].message.content);
    
  } catch (error) {
    console.error("❌ ERROR connecting to Azure OpenAI:", error.message);
    if (error.message.includes("404")) {
      console.error("\nThis could mean your deployment name is incorrect.");
    }
    if (error.message.includes("401")) {
      console.error("\nThis could mean your API key is incorrect.");
    }
    if (error.message.includes("403")) {
      console.error("\nThis could mean you don't have permission to access this resource.");
    }
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});