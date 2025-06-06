// server/services/azureOpenai.ts
import 'dotenv/config';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

/**
 * We keep your existing helper that lazily creates a single OpenAIClient instance.
 */
let openaiClient: OpenAIClient | null = null;

/**
 * Returns a singleton OpenAIClient, throwing if the environment variables are missing.
 */
export function getOpenAIClient(): OpenAIClient {
  if (!openaiClient) {
    if (!process.env.AZURE_OPENAI_KEY) {
      throw new Error('AZURE_OPENAI_KEY environment variable is required');
    }
    if (!process.env.AZURE_OPENAI_ENDPOINT) {
      throw new Error('AZURE_OPENAI_ENDPOINT environment variable is required');
    }

    const credential = new AzureKeyCredential(process.env.AZURE_OPENAI_KEY);
    openaiClient = new OpenAIClient(process.env.AZURE_OPENAI_ENDPOINT, credential);
  }
  return openaiClient;
}

/**
 * Checks whether Azure OpenAI is configured and reachable.
 * (This is presumably already in your file; we leave it as-is.)
 */
export async function checkAzureOpenAI(): Promise<{
  isConfigured: boolean;
  isConnected: boolean;
  deploymentId?: string;
  error?: string;
}> {
  try {
    // 1) Check if env vars are set
    if (!process.env.AZURE_OPENAI_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
      return {
        isConfigured: false,
        isConnected: false,
        error: 'Azure OpenAI environment variables are not configured',
      };
    }

    // 2) Create client
    const client = getOpenAIClient();

    // 3) Attempt a simple chat call to verify connectivity
    const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';

    await client.getChatCompletions(deploymentId, [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello!' },
    ], {
      maxTokens: 10,
    });

    return {
      isConfigured: true,
      isConnected: true,
      deploymentId,
    };
  } catch (error: any) {
    return {
      isConfigured: !!(process.env.AZURE_OPENAI_KEY && process.env.AZURE_OPENAI_ENDPOINT),
      isConnected: false,
      error: error.message || 'Unknown error connecting to Azure OpenAI',
    };
  }
}

/**
 * ========================
 *  ADD THE FOLLOWING AT THE BOTTOM:
 * ========================
 */

/**
 * Parameters for test question generation (simple version for API routes).
 */
export interface GenerateTestParams {
  testType: string;
  categories: string[];
  numQuestions: number;
}

/**
 * Generates DECA test questions using Azure OpenAI.
 */
export async function generateTestQuestions(params: GenerateTestParams): Promise<any> {
  const { testType, categories, numQuestions } = params;

  const prompt = `
You are a DECA test question generator. Create ${numQuestions} multiple-choice questions for the ${testType} event.

Requirements:
- Focus on these categories: ${categories.join(', ')}
- Each question should present a realistic business scenario
- Provide 4 multiple choice options (A, B, C, D)
- Include the correct answer
- Questions should be appropriate for high school DECA competition level

Format your response as a JSON object with this structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here...",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A",
      "category": "Category name",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}
`;

  const client = getOpenAIClient();
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';

  const response = await client.getChatCompletions(deploymentName, [
    { role: 'system', content: 'You are a DECA competition expert who creates realistic business test questions.' },
    { role: 'user', content: prompt }
  ], {
    maxTokens: 2000,
    temperature: 0.7,
    responseFormat: { type: "json_object" }
  });

  const content = response.choices[0].message?.content || '{"questions": []}';
  const testData = JSON.parse(content);
  return testData;
}

/**
 * Parameters for roleplay scenario generation.
 */
export interface GenerateRoleplayParams {
  instructionalArea: string;
  performanceIndicators: string[];
  difficultyLevel: 'District' | 'State' | 'ICDC';
  businessType?: string;
}

/**
 * Generates a DECA roleplay scenario using Azure OpenAI.
 */
export async function generateRoleplay(params: GenerateRoleplayParams): Promise<any> {
  const { instructionalArea, performanceIndicators, difficultyLevel, businessType } = params;

  const prompt = `
You are a DECA roleplay scenario generator. Create a realistic business scenario for the ${difficultyLevel} competition level.

Requirements:
- Instructional Area: ${instructionalArea}
- Performance Indicators to assess: ${performanceIndicators.join(', ')}
- Business Type: ${businessType || 'General business'}
- Difficulty Level: ${difficultyLevel}

Generate a complete roleplay scenario that includes:
1. A realistic business situation/problem
2. Background context about the company
3. Your role in the scenario
4. Specific tasks or decisions you need to make
5. Key stakeholders involved

Format your response as a JSON object with these properties:
- title: Brief title for the scenario
- situation: The main business situation/problem
- background: Company background and context
- yourRole: Description of the participant's role
- tasks: Array of specific tasks or decisions to make
- stakeholders: Array of key people involved
- performanceIndicators: The PIs being assessed
- difficultyLevel: The competition level
`;

  const client = getOpenAIClient();
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o-mini';

  const response = await client.getChatCompletions(deploymentName, [
    { role: 'system', content: 'You are a DECA competition expert who creates realistic business roleplay scenarios.' },
    { role: 'user', content: prompt }
  ], {
    maxTokens: 1000,
    temperature: 0.7,
    responseFormat: { type: "json_object" }
  });

  const roleplayData = JSON.parse(response.choices[0].message?.content || '{}');
  return roleplayData;
}
