import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import dotenv from "dotenv";

// Initialize environment variables
dotenv.config();

// Check for required environment variables
if (!process.env.AZURE_OPENAI_KEY) {
  console.warn("Missing AZURE_OPENAI_KEY environment variable. Azure OpenAI services will not function.");
}

if (!process.env.AZURE_OPENAI_ENDPOINT) {
  console.warn("Missing AZURE_OPENAI_ENDPOINT environment variable. Azure OpenAI services will not function.");
}

// Create a singleton client that can be reused across requests
let openAIClient: OpenAIClient | null = null;

// Initialize the Azure OpenAI client
export function getOpenAIClient(): OpenAIClient {
  if (!openAIClient && process.env.AZURE_OPENAI_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
    openAIClient = new OpenAIClient(
      process.env.AZURE_OPENAI_ENDPOINT,
      new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
    );
  }
  
  if (!openAIClient) {
    throw new Error("Azure OpenAI client could not be initialized. Check your environment variables.");
  }
  
  return openAIClient;
}

// Default deployment name for GPT-4o-mini
// This can be configured in your Azure OpenAI service
const DEFAULT_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini";

// Generate roleplay scenario based on event type and performance indicators
export async function generateRoleplayScenario(params: {
  eventCode: string;
  eventName: string;
  category: string;
  performanceIndicators: string[];
  difficulty?: "easy" | "medium" | "hard";
}): Promise<{
  title: string;
  scenario: string;
  backgroundInfo: string;
  customerRole: string;
  participantRole: string;
  performanceIndicators: string[];
}> {
  const client = getOpenAIClient();
  const { eventCode, eventName, category, performanceIndicators, difficulty = "medium" } = params;
  
  // Create a detailed system prompt for roleplay generation
  const systemPrompt = `You are an expert DECA roleplay scenario creator with years of experience judging DECA competitions.
Your task is to create a realistic, detailed roleplay scenario for a ${eventName} (${eventCode}) event in the ${category} category.
The difficulty level should be ${difficulty}.
Create a scenario that allows the student to demonstrate understanding of these performance indicators: ${performanceIndicators.join(", ")}.
Format the response as a valid JSON object with these fields:
{
  "title": "A descriptive title for the scenario",
  "scenario": "A detailed situation description (200-300 words)",
  "backgroundInfo": "Additional context for the participant (100-150 words)",
  "customerRole": "Description of who the judge will be portraying",
  "participantRole": "Description of the student's role in this scenario",
  "performanceIndicators": ["List of 3-5 performance indicators being tested"]
}
Make the scenario realistic, challenging, and reflective of current business practices in ${category}.`;

  try {
    const result = await client.getChatCompletions(
      DEFAULT_DEPLOYMENT,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create a ${difficulty} difficulty roleplay scenario for ${eventName} (${eventCode}) that tests these performance indicators: ${performanceIndicators.join(", ")}` }
      ],
      {
        temperature: 0.7,
        maxTokens: 1500,
        responseFormat: { type: "json_object" }
      }
    );

    // Parse the JSON response
    const completion = result.choices[0]?.message?.content || "{}";
    return JSON.parse(completion);
  } catch (error) {
    console.error("Error generating roleplay scenario:", error);
    throw new Error("Failed to generate roleplay scenario. Please try again later.");
  }
}

// Generate practice test questions based on DECA knowledge areas
export async function generatePracticeTest(params: {
  eventCode: string;
  eventName: string;
  categories: string[];
  numQuestions: number;
  difficulty?: "easy" | "medium" | "hard";
}): Promise<{
  testTitle: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}> {
  const client = getOpenAIClient();
  const { eventCode, eventName, categories, numQuestions, difficulty = "medium" } = params;
  
  // Create a system prompt for test generation
  const systemPrompt = `You are an expert DECA exam creator with deep knowledge of business concepts tested in DECA competitive events.
Your task is to generate a practice test for the ${eventName} (${eventCode}) event focusing on these categories: ${categories.join(", ")}.
Create ${numQuestions} multiple-choice questions at ${difficulty} difficulty level.
Format the response as a valid JSON object with these fields:
{
  "testTitle": "A descriptive title for this practice test",
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Explanation of why the correct answer is correct"
    },
    ...
  ]
}
Make questions realistic and similar to actual DECA exam questions. Include questions that test both knowledge and application.`;

  try {
    const result = await client.getChatCompletions(
      DEFAULT_DEPLOYMENT,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Create a ${difficulty} level practice test with ${numQuestions} questions for ${eventName} (${eventCode}) covering these categories: ${categories.join(", ")}` }
      ],
      {
        temperature: 0.7,
        maxTokens: Math.min(4000, 500 + (numQuestions * 350)), // Adjust token limit based on question count
        responseFormat: { type: "json_object" }
      }
    );

    // Parse the JSON response
    const completion = result.choices[0]?.message?.content || "{}";
    return JSON.parse(completion);
  } catch (error) {
    console.error("Error generating practice test:", error);
    throw new Error("Failed to generate practice test. Please try again later.");
  }
}

// Generate detailed explanation for a performance indicator
export async function explainPerformanceIndicator(params: {
  indicator: string;
  category: string;
  format?: "concise" | "detailed";
}): Promise<{
  indicator: string;
  explanation: string;
  businessExamples: string[];
  relatedConcepts: string[];
  testingTips: string[];
}> {
  const client = getOpenAIClient();
  const { indicator, category, format = "detailed" } = params;
  
  // System prompt for performance indicator explanation
  const systemPrompt = `You are an expert DECA coach and judge with extensive knowledge of business concepts and performance indicators.
Your task is to provide a ${format} explanation of the performance indicator: "${indicator}" in the ${category} category.
Format the response as a valid JSON object with these fields:
{
  "indicator": "The performance indicator being explained",
  "explanation": "A thorough explanation of the concept and its importance (150-200 words)",
  "businessExamples": ["3-5 real-world examples of this concept in business"],
  "relatedConcepts": ["3-5 related business concepts the student should also understand"],
  "testingTips": ["3-5 tips for demonstrating mastery of this indicator in a DECA event"]
}
Ensure the explanation is accurate, informative, and helpful for a high school DECA student.`;

  try {
    const result = await client.getChatCompletions(
      DEFAULT_DEPLOYMENT,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Explain the performance indicator "${indicator}" for ${category} at a ${format === "detailed" ? "comprehensive" : "high-level"} level of detail.` }
      ],
      {
        temperature: 0.5,
        maxTokens: 1200,
        responseFormat: { type: "json_object" }
      }
    );

    // Parse the JSON response
    const completion = result.choices[0]?.message?.content || "{}";
    return JSON.parse(completion);
  } catch (error) {
    console.error("Error generating performance indicator explanation:", error);
    throw new Error("Failed to generate explanation. Please try again later.");
  }
}

// Generate written event feedback
export async function generateWrittenEventFeedback(params: {
  eventCode: string;
  eventName: string;
  projectDescription: string;
  section: string;
}): Promise<{
  overallFeedback: string;
  strengthPoints: string[];
  improvementAreas: string[];
  suggestedRevisions: string[];
  score: number;
}> {
  const client = getOpenAIClient();
  const { eventCode, eventName, projectDescription, section } = params;
  
  // System prompt for written event feedback
  const systemPrompt = `You are an experienced DECA written event judge and coach.
Your task is to review the ${section} section of a ${eventName} (${eventCode}) written project and provide constructive feedback.
Format the response as a valid JSON object with these fields:
{
  "overallFeedback": "A summary assessment of the section (100-150 words)",
  "strengthPoints": ["3-5 specific strengths"],
  "improvementAreas": ["3-5 specific areas that need improvement"],
  "suggestedRevisions": ["3-5 actionable suggestions for improving the section"],
  "score": 85
}
The score should be between 1-100 and reflect how well the section meets DECA's standards and evaluation criteria.
Be constructive, specific, and actionable in your feedback.`;

  try {
    const result = await client.getChatCompletions(
      DEFAULT_DEPLOYMENT,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Review this ${section} section of a ${eventName} (${eventCode}) written project: "${projectDescription}"` }
      ],
      {
        temperature: 0.6,
        maxTokens: 1000,
        responseFormat: { type: "json_object" }
      }
    );

    // Parse the JSON response
    const completion = result.choices[0]?.message?.content || "{}";
    return JSON.parse(completion);
  } catch (error) {
    console.error("Error generating written event feedback:", error);
    throw new Error("Failed to generate feedback. Please try again later.");
  }
}