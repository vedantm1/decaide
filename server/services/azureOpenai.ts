/**
 * Make a direct HTTP request to Azure OpenAI
 * Uses environment variables for configuration:
 * - AZURE_OPENAI_KEY: API key for Azure OpenAI
 * - AZURE_OPENAI_ENDPOINT: Azure OpenAI service endpoint URL
 * - AZURE_OPENAI_DEPLOYMENT: Deployment name
 */
async function makeAzureOpenAIRequest(messages: any[], options: any = {}) {
  if (!process.env.AZURE_OPENAI_KEY) {
    throw new Error("AZURE_OPENAI_KEY environment variable is required");
  }
  
  if (!process.env.AZURE_OPENAI_ENDPOINT) {
    throw new Error("AZURE_OPENAI_ENDPOINT environment variable is required");
  }
  
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "decaide_test";
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const url = `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=2025-01-01-preview`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.AZURE_OPENAI_KEY
    },
    body: JSON.stringify({
      messages,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      response_format: options.responseFormat ? { type: options.responseFormat.type } : undefined,
      model: deployment
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Azure OpenAI API error: ${error.error?.message || response.statusText}`);
  }
  
  return response.json();
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
    
    const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT || "decaide_test";
    
    // Try a simple chat completion to check connectivity
    await makeAzureOpenAIRequest(
      [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello!" }
      ],
      { maxTokens: 10 }
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
    const response = await makeAzureOpenAIRequest(
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
  const numQuestions = Math.min(params.numQuestions || 10, 50); // Allow up to 50 questions
  
  const prompt = `
  Create ${numQuestions} high-quality multiple-choice questions for a DECA ${params.testType} test.
  The questions should cover the following categories: ${params.categories.join(", ")}.
  Distribute the questions evenly across the categories.

  Each question should:
  - Be realistic and relevant to actual business scenarios
  - Test practical knowledge and application of concepts
  - Include plausible distractors that test common misconceptions
  - Be at an appropriate difficulty level for high school DECA competitors

  Format your response as a JSON object with a "questions" array, where each question object has:
  - id: A unique numeric ID (starting from 1)
  - question: The question text (clear and concise)
  - options: An array of exactly 4 possible answers as strings
  - correctAnswer: The index of the correct answer (0-3)
  - explanation: A detailed explanation of why the correct answer is right and why others are wrong
  - category: The category this question belongs to (from the provided list)
  - difficulty: Either "easy", "medium", or "hard"
  `;
  
  try {
    const response = await makeAzureOpenAIRequest(
      [
        { role: "system", content: "You are a DECA test question generator. Create realistic, challenging, and educational multiple-choice questions for high school DECA students." },
        { role: "user", content: prompt }
      ],
      {
        temperature: 0.7,
        maxTokens: 3000,
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