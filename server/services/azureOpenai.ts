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
 * Parameters for test‐question generation.
 */
export interface GenerateTestParams {
  testType: string;
  difficulty: 'District' | 'State' | 'ICDC';
  filteredBlueprint: Record<string, number>;
  fewShotExamples: string[];
  numQuestions: number;
}

/**
 * Calls Azure OpenAI to generate scenario‐style practice questions.
 *
 * - Builds a prompt that instructs the model how many questions total,
 *   how to distribute them by instructional area, and includes a few‐shot
 *   example block if provided.
 * - Uses `getOpenAIClient()` to get the client, then calls `getCompletions`.
 * - Splits the response text on lines beginning with "Question X:" and returns them.
 */
export async function generateTestQuestions(params: GenerateTestParams): Promise<string[]> {
  const { testType, difficulty, filteredBlueprint, fewShotExamples, numQuestions } = params;

  // 1) Build a bullet‐list of the category‐distribution: "- CategoryA: 5\n- CategoryB: 6\n..."
  const blueprintLines = Object.entries(filteredBlueprint)
    .map(([category, count]) => `- ${category}: ${count}`)
    .join('\n');

  // 2) Build a few‐shot block if any examples are passed
  let fewShotSection = '';
  if (fewShotExamples && fewShotExamples.length > 0) {
    fewShotSection =
      'Here are some example questions from past tests (same cluster & difficulty):\n' +
      fewShotExamples.map((q) => `> ${q}`).join('\n') +
      '\n\n';
  }

  // 3) Construct the full prompt string
  const prompt = `
You are a DECA practice‐test generator for the "${testType}" cluster at the ${difficulty} competition level.
We need exactly ${numQuestions} scenario‐style questions total, distributed by instructional area as follows:
${blueprintLines}

${fewShotSection}
Now generate ${numQuestions} brand‐new scenario questions. Number each one as "Question 1:", "Question 2:", etc.
Do NOT provide answers—only list the scenario questions themselves. Ensure each question references a realistic business scenario relevant to "${testType}".
`;

  // 4) Get the client and call getCompletions
  const client = getOpenAIClient();
  // You can override the deployment via env, or fall back to "gpt-4o-mini" (or your own deployment)
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-mini';

  const response = await client.getCompletions(deploymentName, prompt, {
    maxTokens: 1200,
    temperature: 0.7,
    topP: 0.9,
  });

  const text = response.choices[0].text || '';
  // 5) Split on lines beginning with "Question X:"
  const questions = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^Question\s+\d+:/.test(line));

  return questions;
}
