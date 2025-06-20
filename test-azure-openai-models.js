// Script to check available deployments in Azure OpenAI
import 'dotenv/config';
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

// Environment variables for Azure OpenAI
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;

async function main() {
  console.log("Testing Azure OpenAI Connection and Listing Available Deployments...");
  
  // Check for required environment variables
  if (!AZURE_OPENAI_KEY || !AZURE_OPENAI_ENDPOINT) {
    console.error("Missing required environment variables:");
    if (!AZURE_OPENAI_KEY) console.error("- AZURE_OPENAI_KEY");
    if (!AZURE_OPENAI_ENDPOINT) console.error("- AZURE_OPENAI_ENDPOINT");
    process.exit(1);
  }
  
  try {
    // Create OpenAI client
    const client = new OpenAIClient(
      AZURE_OPENAI_ENDPOINT,
      new AzureKeyCredential(AZURE_OPENAI_KEY)
    );
    
    console.log("Client created, attempting to list deployments...");
    
    // List deployments (models)
    console.log("\nAvailable Deployments (this may not be comprehensive):");
    console.log("-----------------------------------------------");
    console.log("Current deployment set in environment variable:", AZURE_OPENAI_DEPLOYMENT);
    console.log("-----------------------------------------------");
    
    // Attempt to list models - this might not work with Azure OpenAI service
    try {
      const models = await client.listModels();
      for (const model of models) {
        console.log(`- ${model.id}`);
      }
    } catch (modelListError) {
      console.log("Could not list models directly. This is normal with Azure OpenAI.");
      console.log("You'll need to check your Azure portal for available deployments.");
    }
    
    // Test a common model name that might be available
    const modelOptions = ["gpt-4", "gpt-35-turbo", "gpt-4o-mini", "gpt-4o", "text-embedding-ada-002"];
    
    console.log("\nTesting common model deployments:");
    console.log("--------------------------------");
    
    for (const modelName of modelOptions) {
      try {
        // Just try to create a simple completion to see if the model exists
        await client.getChatCompletions(
          modelName,
          [{ role: "user", content: "Hello" }],
          { maxTokens: 5 }
        );
        console.log(`✅ ${modelName} - AVAILABLE`);
      } catch (error) {
        console.log(`❌ ${modelName} - NOT AVAILABLE: ${error.message.split('.')[0]}`);
      }
    }
    
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