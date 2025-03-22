# DecA(I)de Azure OpenAI Integration

This document outlines the integration of Azure OpenAI within the DecA(I)de platform, including setup, implementation, prompt engineering, and best practices.

## Overview

DecA(I)de utilizes Azure OpenAI service to power its AI-driven features, including roleplay scenario generation, performance indicator explanations, practice test generation, and written event feedback. The platform uses GPT-4o-mini model for optimal cost-performance balance.

## Configuration

### Environment Variables

The following environment variables are used for Azure OpenAI configuration:

```
AZURE_OPENAI_KEY=<your-api-key>
AZURE_OPENAI_ENDPOINT=<your-endpoint-url>
AZURE_OPENAI_DEPLOYMENT=<your-deployment-name>
```

### Service Setup

The Azure OpenAI service requires proper configuration in both Azure Portal and our application code:

1. **Azure Portal Configuration:**
   - Resource creation in Azure Portal
   - Model deployment (GPT-4o-mini)
   - API access key generation
   - CORS and network settings

2. **Application Configuration:**
   - Environment variable management
   - Authentication handling
   - Error handling and retry logic
   - Rate limit management

## Implementation

### Client Setup

The Azure OpenAI client is configured in `server/services/azureOpenai.ts`:

```typescript
import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

/**
 * Get an instance of the OpenAI client
 */
export function getOpenAIClient(): OpenAIClient {
  const azureOpenAIKey = process.env.AZURE_OPENAI_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  
  if (!azureOpenAIKey || !endpoint) {
    throw new Error("Azure OpenAI credentials not found in environment variables");
  }
  
  return new OpenAIClient(endpoint, new AzureKeyCredential(azureOpenAIKey));
}
```

### API Functions

The implementation includes several specialized functions for different AI tasks:

#### 1. Roleplay Scenario Generation

```typescript
/**
 * Generate a roleplay scenario based on event and performance indicators
 */
export async function generateRoleplayScenario(params: {
  eventCode: string;
  performanceIndicators: string[];
}): Promise<{
  title: string;
  scenario: string;
  requirements: string[];
  judgeEvaluationCriteria: string[];
}> {
  const client = getOpenAIClient();
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  
  if (!deployment) {
    throw new Error("Azure OpenAI deployment name not found");
  }
  
  // Implementation details...
}
```

#### 2. Practice Test Generation

```typescript
/**
 * Generate a practice test with questions and answers
 */
export async function generatePracticeTest(params: {
  eventCode: string;
  questionCount: number;
  difficulty: "beginner" | "intermediate" | "advanced";
}): Promise<{
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}> {
  // Implementation details...
}
```

#### 3. Performance Indicator Explanation

```typescript
/**
 * Generate an explanation for a performance indicator
 */
export async function explainPerformanceIndicator(params: {
  performanceIndicator: string;
  eventContext?: string;
  depth: "basic" | "detailed" | "comprehensive";
}): Promise<{
  explanation: string;
  examples: string[];
  tips: string[];
}> {
  // Implementation details...
}
```

#### 4. Written Event Feedback

```typescript
/**
 * Generate feedback for a written event section
 */
export async function generateWrittenEventFeedback(params: {
  eventType: string;
  section: string;
  content: string;
}): Promise<{
  strengths: string[];
  areas_for_improvement: string[];
  suggestions: string[];
  overall_assessment: string;
}> {
  // Implementation details...
}
```

## Prompt Engineering

### Roleplay Scenario Prompts

The system uses carefully engineered prompts to generate consistent, high-quality roleplay scenarios:

```
You are a DECA roleplay scenario creator. Your task is to create a realistic, engaging roleplay scenario for the {eventCode} event focusing on these performance indicators: {performanceIndicators}.

Structure your response as follows:
1. TITLE: A descriptive title for the scenario.
2. SCENARIO: A detailed business situation (250-300 words) that incorporates all performance indicators naturally.
3. REQUIREMENTS: List 3-5 specific tasks the participant must complete.
4. JUDGE EVALUATION CRITERIA: List 5-7 specific points the judge should look for when evaluating.

Ensure the scenario:
- Is realistic and industry-appropriate
- Provides clear context and background information
- Introduces a specific problem or opportunity to address
- Incorporates all performance indicators organically
- Has appropriate complexity for high school students
- Avoids presenting a solution (that's the participant's job)
```

### Test Question Prompts

For generating accurate test questions with appropriate distractors:

```
Create {questionCount} multiple-choice questions for the DECA {eventCode} exam at {difficulty} level.

For each question:
1. Write a clear, concise question based on relevant business concepts
2. Provide 4 answer options (A, B, C, D) with only one correct answer
3. Indicate the correct answer
4. Include a brief explanation of why the answer is correct

Questions should test application of knowledge, not just memorization.
For {difficulty} level, focus on [specific difficulty parameters].
```

### Content Extraction

The system uses helper functions to extract and format structured content from AI responses:

```typescript
/**
 * Extract a section from the generated content
 */
function extractSection(content: string, sectionStart: string, sectionEnd: string | null): string {
  const startIndex = content.indexOf(sectionStart);
  if (startIndex === -1) return "";
  
  const actualStartIndex = startIndex + sectionStart.length;
  
  if (sectionEnd === null) {
    return content.substring(actualStartIndex).trim();
  }
  
  const endIndex = content.indexOf(sectionEnd, actualStartIndex);
  if (endIndex === -1) {
    return content.substring(actualStartIndex).trim();
  }
  
  return content.substring(actualStartIndex, endIndex).trim();
}

/**
 * Extract bullet points from text
 */
function extractBulletPoints(text: string | null): string[] {
  if (!text) return [];
  
  // Parse numbered lists or bullet points
  const bulletPattern = /(?:^|\n)[\s]*(?:[-•*]|\d+[.)]) +(.*)/g;
  const matches = [...text.matchAll(bulletPattern)];
  
  return matches.map(match => match[1].trim());
}
```

## Error Handling

The Azure OpenAI integration includes comprehensive error handling:

```typescript
try {
  // API call logic
} catch (error) {
  if (error.statusCode === 429) {
    // Rate limit handling
    console.error("Rate limit exceeded for Azure OpenAI API");
    throw new Error("Service is currently busy. Please try again in a few moments.");
  } else if (error.statusCode >= 500) {
    // Server error handling
    console.error("Azure OpenAI service error:", error);
    throw new Error("An error occurred with the AI service. Please try again later.");
  } else {
    // Other errors
    console.error("Error calling Azure OpenAI:", error);
    throw new Error("Unable to generate content. Please try again or contact support.");
  }
}
```

## Rate Limiting and Optimization

### Token Usage Optimization

To minimize costs and improve performance:

1. **Context Length Management:**
   - Limit prompt lengths to essential information
   - Use efficient format for structured data
   - Set appropriate max_tokens for responses

2. **Batch Processing:**
   - Group related requests when possible
   - Implement request queuing for high traffic periods

3. **Caching Strategy:**
   - Cache common responses (e.g., standard PI explanations)
   - Implement TTL-based cache invalidation
   - Use content-based cache keys for similar requests

### Rate Limit Handling

The system implements rate limit handling:

```typescript
// Exponential backoff retry logic
async function callWithRetry(fn, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (error.statusCode !== 429 || retries >= maxRetries) {
        throw error;
      }
      
      retries++;
      const delay = initialDelay * Math.pow(2, retries - 1);
      console.log(`Rate limited. Retrying in ${delay}ms (Attempt ${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## Subscription Tier Management

The platform enforces usage limits based on subscription tiers:

```typescript
// In server/routes/aiRoutes.ts
const checkSubscriptionAccess = async (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const user = req.user;
  const isRoleplay = req.path.includes("/roleplay");
  
  // Check allowance based on request type
  const allowed = isRoleplay 
    ? await storage.checkRoleplayAllowance(user.id)
    : await storage.checkTestAllowance(user.id);
    
  if (!allowed) {
    return res.status(403).json({ 
      error: "Usage limit reached",
      upgradeRequired: true,
      currentTier: user.subscriptionTier 
    });
  }
  
  // Record usage
  if (isRoleplay) {
    await storage.recordRoleplayGeneration(user.id);
  } else {
    await storage.recordTestGeneration(user.id);
  }
  
  next();
};
```

## Security Considerations

1. **API Key Management:**
   - Store API keys in environment variables
   - Never expose keys to the client
   - Rotate keys periodically

2. **Content Filtering:**
   - Implement pre-processing of user inputs
   - Apply content moderation on outputs
   - Define acceptable use policies

3. **Request Validation:**
   - Validate all parameters before API calls
   - Implement rate limiting per user
   - Log abnormal usage patterns

## Testing and Monitoring

1. **Integration Tests:**
   - Unit tests for API functions
   - Mock response testing
   - Error handling verification

2. **Performance Monitoring:**
   - Track token usage by feature
   - Monitor response times
   - Alert on error rate increases

3. **Quality Assurance:**
   - Review generated content samples
   - Test with edge cases
   - Validate against educational standards

## Future Improvements

Planned enhancements to the Azure OpenAI integration:

1. **Model Fine-Tuning:**
   - Explore fine-tuning for DECA-specific content
   - Evaluate cost/benefit of custom models

2. **Advanced Features:**
   - Multi-modal capabilities (image generation)
   - Real-time feedback during roleplays
   - Voice interaction for practice sessions

3. **Optimization:**
   - Implement more sophisticated caching
   - Explore parallel processing for batch requests
   - Develop failover mechanisms