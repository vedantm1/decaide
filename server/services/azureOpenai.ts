import { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import dotenv from "dotenv";

dotenv.config();

// Environment variables for Azure OpenAI
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_DEPLOYMENT = "gpt-4o-mini";

// Check if required environment variables are set
if (!AZURE_OPENAI_KEY || !AZURE_OPENAI_ENDPOINT) {
  console.warn("Azure OpenAI credentials are missing. AI features will not work properly.");
}

/**
 * Get an instance of the OpenAI client
 */
export function getOpenAIClient(): OpenAIClient {
  if (!AZURE_OPENAI_KEY || !AZURE_OPENAI_ENDPOINT) {
    throw new Error("Azure OpenAI credentials are missing. Please provide AZURE_OPENAI_KEY and AZURE_OPENAI_ENDPOINT.");
  }
  
  return new OpenAIClient(
    AZURE_OPENAI_ENDPOINT,
    new AzureKeyCredential(AZURE_OPENAI_KEY)
  );
}

/**
 * Generate a roleplay scenario based on event and performance indicators
 */
export async function generateRoleplayScenario(params: {
  eventCode: string;
  eventName: string;
  category: string;
  performanceIndicators: string[];
  difficulty: "easy" | "medium" | "hard";
}): Promise<{
  id: string;
  title: string;
  scenario: string;
  preparation: string;
  role: string;
  instructions: string;
  performanceIndicators: string[];
  difficulty: string;
  businessDescription?: string;
  meetWith?: string;
}> {
  try {
    const client = getOpenAIClient();
    
    const { eventCode, eventName, category, performanceIndicators, difficulty } = params;
    
    // Create the system prompt
    const systemPrompt = `You are an expert DECA competition coach who creates professional roleplay scenarios for DECA competitions.
You will create a realistic and challenging roleplay scenario for event ${eventCode}: ${eventName} 
in the ${category} category at ${difficulty} difficulty level.

The scenario must incorporate all of these performance indicators:
${performanceIndicators.map((pi, index) => `${index + 1}. ${pi}`).join('\n')}

Your response should include:
1. A creative title for the roleplay
2. A detailed scenario background (200-300 words)
3. Participant preparation instructions (100-150 words)
4. The specific role the student will play
5. The specific judge role (who they're meeting with)
6. A realistic business description
7. Clear instructions for what the participant needs to accomplish`;

    // Create the user prompt - simple instruction
    const userPrompt = `Please create a DECA roleplay scenario for the ${eventName} event with difficulty level: ${difficulty}.`;
    
    // Make the API call
    const response = await client.getChatCompletions(
      AZURE_OPENAI_DEPLOYMENT,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      {
        temperature: 0.7,
        maxTokens: 2000
      }
    );
    
    // Extract the content
    const generatedContent = response.choices[0]?.message?.content || "";
    
    // Parse the content and format it
    // For now, return a simplified structure - in a real application, you'd parse the response more carefully
    return {
      id: Date.now().toString(),
      title: extractTitle(generatedContent),
      scenario: extractSection(generatedContent, "Scenario", "Preparation"),
      preparation: extractSection(generatedContent, "Preparation", "Role"),
      role: extractSection(generatedContent, "Role", "Meet With"),
      meetWith: extractSection(generatedContent, "Meet With", "Business Description"),
      businessDescription: extractSection(generatedContent, "Business Description", "Instructions"),
      instructions: extractSection(generatedContent, "Instructions", null),
      performanceIndicators,
      difficulty
    };
  } catch (error) {
    console.error("Error generating roleplay:", error);
    throw new Error("Failed to generate roleplay scenario");
  }
}

/**
 * Generate a practice test with questions and answers
 */
export async function generatePracticeTest(params: {
  eventCode: string;
  eventName: string;
  categories: string[];
  numQuestions: number;
  difficulty: "easy" | "medium" | "hard";
}): Promise<{
  id: string;
  title: string;
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
}> {
  try {
    const client = getOpenAIClient();
    
    const { eventCode, eventName, categories, numQuestions, difficulty } = params;
    
    // Create the system prompt
    const systemPrompt = `You are an expert DECA test question creator.
Create a practice test for the DECA event ${eventCode}: ${eventName} 
with ${numQuestions} multiple-choice questions at ${difficulty} difficulty level.

The questions should be focused on these business categories:
${categories.join(', ')}

For each question:
1. Provide a clear, concise question about a relevant business concept
2. Include 4 possible answer choices labeled A, B, C, and D
3. Indicate which answer (0=A, 1=B, 2=C, 3=D) is correct
4. Provide a brief explanation of why the answer is correct

Return the results in JSON format that matches this structure:
{
  "questions": [
    {
      "id": 1,
      "question": "What is...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 2,
      "explanation": "Option C is correct because..."
    }
  ]
}`;

    // Create the user prompt
    const userPrompt = `Generate ${numQuestions} ${difficulty} level questions for the ${eventName} event covering ${categories.join(', ')}.`;
    
    // Make the API call
    const response = await client.getChatCompletions(
      AZURE_OPENAI_DEPLOYMENT,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      {
        temperature: 0.5,
        maxTokens: 4000
      }
    );
    
    // Extract the content
    const generatedContent = response.choices[0]?.message?.content || "";
    
    // Extract the JSON part of the response
    const jsonMatch = generatedContent.match(/```json([\s\S]*?)```/) || 
                     generatedContent.match(/{[\s\S]*}/);
                     
    if (!jsonMatch) {
      throw new Error("Could not parse generated test questions");
    }
    
    // Parse the JSON
    let testData;
    try {
      const jsonContent = jsonMatch[1] || jsonMatch[0];
      testData = JSON.parse(jsonContent.trim());
    } catch (e) {
      console.error("Failed to parse JSON from OpenAI response:", e);
      throw new Error("Could not parse generated test questions");
    }
    
    // Return the formatted test
    return {
      id: Date.now().toString(),
      title: `${eventName} Practice Test - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
      questions: testData.questions || []
    };
  } catch (error) {
    console.error("Error generating practice test:", error);
    throw new Error("Failed to generate practice test");
  }
}

/**
 * Generate an explanation for a performance indicator
 */
export async function explainPerformanceIndicator(params: {
  indicator: string;
  category: string;
  format: "concise" | "detailed";
}): Promise<{
  indicator: string;
  explanation: string;
  examples: string[];
  tips: string[];
}> {
  try {
    const client = getOpenAIClient();
    
    const { indicator, category, format } = params;
    
    // Create the system prompt
    const systemPrompt = `You are an expert DECA coach who specializes in explaining performance indicators to students.
Explain the performance indicator "${indicator}" from the ${category} category in a ${format} format.

Your response should include:
1. A clear explanation of what the performance indicator means in business contexts
2. 3 specific examples of how this performance indicator might be demonstrated in a DECA roleplay
3. 3 practical tips for students to effectively demonstrate this performance indicator

Your tone should be educational, clear, and encouraging to high school DECA students.`;

    // Create the user prompt
    const userPrompt = `Please explain the performance indicator "${indicator}" from the ${category} category.`;
    
    // Make the API call
    const response = await client.getChatCompletions(
      AZURE_OPENAI_DEPLOYMENT,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      {
        temperature: 0.3,
        maxTokens: 1000
      }
    );
    
    // Extract the content
    const generatedContent = response.choices[0]?.message?.content || "";
    
    // Parse the sections
    const explanation = extractSection(generatedContent, "Explanation", "Examples") || 
                     extractSection(generatedContent, "", "Examples");
    const examplesText = extractSection(generatedContent, "Examples", "Tips");
    const tipsText = extractSection(generatedContent, "Tips", null);
    
    // Extract bullet points
    const examples = extractBulletPoints(examplesText);
    const tips = extractBulletPoints(tipsText);
    
    return {
      indicator,
      explanation,
      examples,
      tips
    };
  } catch (error) {
    console.error("Error explaining performance indicator:", error);
    throw new Error("Failed to generate performance indicator explanation");
  }
}

/**
 * Generate feedback for a written event section
 */
export async function generateWrittenEventFeedback(params: {
  eventCode: string;
  eventName: string;
  projectDescription: string;
  section: string;
}): Promise<{
  section: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  score: number;
}> {
  try {
    const client = getOpenAIClient();
    
    const { eventCode, eventName, projectDescription, section } = params;
    
    // Create the system prompt
    const systemPrompt = `You are an expert DECA judge who evaluates written business plans.
Evaluate the following ${section} section for a ${eventName} (${eventCode}) project.

Provide constructive feedback in this format:
1. 3 strengths of the section
2. 3 areas for improvement
3. 3 specific suggestions to enhance the section
4. A score from 1-10, where 10 is excellent

You should be critical but constructive, focusing on helping the student improve their written event.`;

    // Create the user prompt
    const userPrompt = `Project description: ${projectDescription}\n\nPlease evaluate the ${section} section of this DECA written event.`;
    
    // Make the API call
    const response = await client.getChatCompletions(
      AZURE_OPENAI_DEPLOYMENT,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      {
        temperature: 0.4,
        maxTokens: 1500
      }
    );
    
    // Extract the content
    const generatedContent = response.choices[0]?.message?.content || "";
    
    // Parse the sections
    const strengthsText = extractSection(generatedContent, "Strengths", "Areas for Improvement") || 
                      extractSection(generatedContent, "Strengths", "Weaknesses");
    const weaknessesText = extractSection(generatedContent, "Areas for Improvement", "Suggestions") || 
                       extractSection(generatedContent, "Weaknesses", "Suggestions");
    const suggestionsText = extractSection(generatedContent, "Suggestions", "Score");
    const scoreText = extractSection(generatedContent, "Score", null);
    
    // Extract bullet points
    const strengths = extractBulletPoints(strengthsText);
    const weaknesses = extractBulletPoints(weaknessesText);
    const suggestions = extractBulletPoints(suggestionsText);
    
    // Extract score
    const scoreMatch = scoreText?.match(/(\d+(\.\d+)?)\s*\/\s*10/) || 
                    scoreText?.match(/(\d+(\.\d+)?)/);
    let score = 0;
    if (scoreMatch) {
      score = parseFloat(scoreMatch[1]);
    }
    
    return {
      section,
      strengths,
      weaknesses,
      suggestions,
      score
    };
  } catch (error) {
    console.error("Error generating written event feedback:", error);
    throw new Error("Failed to generate written event feedback");
  }
}

// Helper functions for parsing the generated content

/**
 * Extract title from generated content
 */
function extractTitle(content: string): string {
  const titleMatch = content.match(/^#\s*(.+)$/m) || // Markdown
                  content.match(/^Title:\s*(.+)$/m) || // Plain text with label
                  content.match(/^(.+)$/m); // First line
  return titleMatch ? titleMatch[1].trim() : "DECA Roleplay Scenario";
}

/**
 * Extract a section from the generated content
 */
function extractSection(content: string, sectionStart: string, sectionEnd: string | null): string {
  if (!content) return "";
  
  let startPattern = sectionStart ? new RegExp(`#+\\s*${sectionStart}:?|${sectionStart}:`, 'i') : /^/;
  let endPattern = sectionEnd ? new RegExp(`#+\\s*${sectionEnd}:?|${sectionEnd}:`, 'i') : /$/;
  
  const startMatch = sectionStart ? content.match(startPattern) : { index: 0 };
  if (!startMatch) return "";
  
  const startIndex = (startMatch.index ?? 0) + (startMatch[0]?.length ?? 0);
  const endMatch = sectionEnd ? content.slice(startIndex).match(endPattern) : null;
  const endIndex = endMatch ? startIndex + endMatch.index! : content.length;
  
  return content.slice(startIndex, endIndex).trim();
}

/**
 * Extract bullet points from text
 */
function extractBulletPoints(text: string | null): string[] {
  if (!text) return [];
  
  // Match numbered or bulleted lists
  const bulletRegex = /(?:^|\n)(?:\d+\.|\*|\-|\•)\s*(.+?)(?=(?:\n(?:\d+\.|\*|\-|\•)|\n\n|$))/g;
  const bullets: string[] = [];
  let match;
  
  while ((match = bulletRegex.exec(text)) !== null) {
    bullets.push(match[1].trim());
  }
  
  // If no bullet points found, split by newlines and filter
  if (bullets.length === 0) {
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^#+\s/));
  }
  
  return bullets;
}