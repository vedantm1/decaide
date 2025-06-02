import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

let openaiClient: OpenAIClient | null = null;

/**
 * Get or create an Azure OpenAI client instance
 * Uses environment variables for configuration:
 * - AZURE_OPENAI_KEY: API key for Azure OpenAI
 * - AZURE_OPENAI_ENDPOINT: Azure OpenAI service endpoint URL
 */
export function getOpenAIClient(): OpenAIClient {
  if (!openaiClient) {
    if (!process.env.AZURE_OPENAI_KEY) {
      throw new Error("AZURE_OPENAI_KEY environment variable is required");
    }
    
    if (!process.env.AZURE_OPENAI_ENDPOINT) {
      throw new Error("AZURE_OPENAI_ENDPOINT environment variable is required");
    }
    
    const credential = new AzureKeyCredential(process.env.AZURE_OPENAI_KEY);
    openaiClient = new OpenAIClient(process.env.AZURE_OPENAI_ENDPOINT, credential);
  }
  
  return openaiClient;
}

/**
 * Check if the Azure OpenAI configuration is valid and the service is accessible
 * @returns Object with status and details of the check
 */
export async function checkAzureOpenAI(): Promise<{
  isConfigured: boolean;
  isConnected: boolean;
  deploymentId?: string;
  error?: string;
}> {
  try {
    // Check if environment variables are set
    if (!process.env.AZURE_OPENAI_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
      return {
        isConfigured: false,
        isConnected: false,
        error: "Azure OpenAI environment variables are not configured"
      };
    }
    
    // Try to create a client
    const client = getOpenAIClient();
    
    // Try to get deployments
    const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT || "decaide_test";
    
    // Try a simple chat completion to check connectivity
    await client.getChatCompletions(
      deploymentId,
      [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello!" }
      ],
      {
        maxTokens: 10
      }
    );
    
    return {
      isConfigured: true,
      isConnected: true,
      deploymentId
    };
    
  } catch (error: any) {
    return {
      isConfigured: !!process.env.AZURE_OPENAI_KEY && !!process.env.AZURE_OPENAI_ENDPOINT,
      isConnected: false,
      error: error.message
    };
  }
}

/**
 * Generate a roleplay scenario using Azure OpenAI
 * @param params Parameters for the roleplay generation
 * @returns Generated roleplay scenario
 */
export async function generateRoleplay(params: {
  instructionalArea: string;
  performanceIndicators: string[];
  difficultyLevel: string;
  businessType?: string;
}) {
  const client = getOpenAIClient();
  const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT || "decaide_test";
  
  const difficulty = params.difficultyLevel || "medium";
  const businessType = params.businessType || "retail business";
  
  const prompt = `
  Create a realistic DECA roleplay scenario for a ${difficulty} difficulty level. 
  The scenario should focus on the instructional area of "${params.instructionalArea}" 
  and include the following performance indicators: ${params.performanceIndicators.join(", ")}.
  The scenario should involve a ${businessType}.

  Format your response as a JSON object with the following properties:
  - title: A catchy title for the roleplay
  - scenario: A 2-3 paragraph description of the business situation
  - performanceIndicators: An array of the provided performance indicators
  - difficulty: The difficulty level provided
  - businessType: The type of business involved
  - meetWith: The title/role of the person the student will be meeting with in the roleplay
  `;
  
  try {
    const response = await client.getChatCompletions(
      deploymentId,
      [
        { role: "system", content: "You are a DECA roleplay scenario generator. Create realistic, challenging, and educational DECA roleplay scenarios for high school students." },
        { role: "user", content: prompt }
      ],
      {
        temperature: 0.7,
        maxTokens: 800,
        responseFormat: { type: "json_object" }
      }
    );
    
    const roleplay = JSON.parse(response.choices[0].message?.content || "{}");
    return roleplay;
    
  } catch (error) {
    console.error("Error generating roleplay:", error);
    throw error;
  }
}

/**
 * Generate practice test questions using Azure OpenAI
 * @param params Parameters for test question generation
 * @returns Generated test questions
 */
export async function generateTestQuestions(params: {
  testType: string;
  categories: string[];
  numQuestions: number;
}) {
  const client = getOpenAIClient();
  const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT || "decaide_test";
  
  const numQuestions = Math.min(params.numQuestions || 10, 20); // Limit to 20 questions max
  
  const prompt = `
  Create ${numQuestions} multiple-choice questions for a DECA ${params.testType} test.
  The questions should cover the following categories: ${params.categories.join(", ")}.
  Distribute the questions evenly across the categories.

  Format your response as a JSON array of question objects, where each object has:
  - id: A unique numeric ID
  - question: The question text
  - options: An array of 4 possible answers labeled as strings "A", "B", "C", and "D"
  - correctAnswer: The index of the correct answer (0-3)
  - explanation: A brief explanation of why the correct answer is correct
  - category: The category this question belongs to
  `;
  
  try {
    const response = await client.getChatCompletions(
      deploymentId,
      [
        { role: "system", content: "You are a DECA test question generator. Create realistic, challenging, and educational multiple-choice questions for high school DECA students." },
        { role: "user", content: prompt }
      ],
      {
        temperature: 0.7,
        maxTokens: 2000,
        responseFormat: { type: "json_object" }
      }
    );
    
    const questionsObj = JSON.parse(response.choices[0].message?.content || "{}");
    const questions = Array.isArray(questionsObj) ? questionsObj : questionsObj.questions || [];
    
    return {
      testType: params.testType,
      questions
    };
    
  } catch (error) {
    console.error("Error generating test questions:", error);
    throw error;
  }
}