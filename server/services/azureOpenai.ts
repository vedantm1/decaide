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
    const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "decaide_test";
    
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
  competitionLevel: string;
  businessType?: string;
}) {
  const client = getOpenAIClient();
  const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "decaide_test";
  
  const competitionLevel = params.competitionLevel || "District";
  const businessType = params.businessType || "retail business";
  
  // Map competition levels to complexity descriptions
  const complexityMap = {
    "District": "entry-level with straightforward business scenarios suitable for beginners",
    "Association": "intermediate-level with moderate complexity requiring solid business fundamentals",
    "ICDC": "advanced competition-level with complex, multi-layered business challenges requiring comprehensive analysis"
  };
  
  const complexity = complexityMap[competitionLevel as keyof typeof complexityMap] || complexityMap["District"];
  
  const prompt = `
  Create a realistic DECA roleplay scenario for ${competitionLevel} competition level (${complexity}). 
  The scenario should focus on the instructional area of "${params.instructionalArea}" 
  and include the following performance indicators: ${params.performanceIndicators.join(", ")}.
  The scenario should involve a ${businessType}.

  Format your response as a JSON object with the following properties:
  - title: A catchy title for the roleplay
  - scenario: A 2-3 paragraph description of the business situation
  - performanceIndicators: An array of the provided performance indicators
  - competitionLevel: The competition level provided
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
 * Generate practice test questions using Azure OpenAI with comprehensive DECA standards
 * @param params Parameters for test question generation
 * @returns Generated test questions
 */
export async function generateTestQuestions(params: {
  testType: string;
  categories: string[];
  numQuestions: number;
  cluster?: string;
  level?: string;
  learningMode?: boolean;
  weakTopics?: string[];
  errorRate?: number;
}) {
  const client = getOpenAIClient();
  const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "decaide_test";
  
  const numQuestions = Math.min(params.numQuestions || 10, 100);
  const cluster = params.cluster || "Marketing";
  const level = params.level || "District";
  
  // Comprehensive DECA System Prompt
  const systemPrompt = `You are a world-class psychometrician, item-writer, and certified DECA Advisor.  
You have memorized:

• DECA's National Curriculum Standards and every Performance Indicator (PI) code  
• The exact 2024-25 blueprint counts (see ↓ blueprintData)  
• MBA Research's style manual for multiple-choice items (stem tone, option balance, cognitive-level targets)  
• All seven clusters' publicly-released sample exams (Business Admin Core, BM+A, Finance, Marketing, Hospitality + Tourism, Personal Financial Literacy, Entrepreneurship) with their embedded "look-and-feel," wording conventions, and answer-key formats

############# 2024-25 OFFICIAL BLUEPRINT COUNTS #############
blueprintData = {
 "Business Administration Core": { "Business Law": {"District":1,"Association":1,"ICDC":4}, "Communications": {"District":15,"Association":15,"ICDC":11}, "Customer Relations": {"District":5,"Association":5,"ICDC":4}, "Economics": {"District":7,"Association":7,"ICDC":12}, "Emotional Intelligence":{"District":22,"Association":22,"ICDC":19}, "Entrepreneurship": {"District":0,"Association":0,"ICDC":1}, "Financial Analysis": {"District":16,"Association":16,"ICDC":13}, "Human Resources Management": {"District":13,"Association":13,"ICDC":10}, "Information Management": {"District":8,"Association":8,"ICDC":6}, "Marketing": {"District":0,"Association":0,"ICDC":1}, "Operations": {"District":9,"Association":9,"ICDC":7}, "Professional Development": {"District":5,"Association":5,"ICDC":4}, "Strategic Management": {"District":0,"Association":0,"ICDC":8} },
 "Business Management + Administration": { "Business Law":{"District":5,"Association":5,"ICDC":5}, "Communications":{"District":7,"Association":6,"ICDC":6}, "Customer Relations":{"District":2,"Association":2,"ICDC":1}, "Economics":{"District":6,"Association":5,"ICDC":4}, "Emotional Intelligence":{"District":9,"Association":8,"ICDC":6}, "Entrepreneurship":{"District":1,"Association":0,"ICDC":0}, "Financial Analysis":{"District":7,"Association":6,"ICDC":5}, "Human Resources Management":{"District":12,"Association":13,"ICDC":12}, "Information Management":{"District":8,"Association":8,"ICDC":7}, "Marketing":{"District":2,"Association":2,"ICDC":1}, "Operations":{"District":15,"Association":16,"ICDC":16}, "Professional Development":{"District":5,"Association":5,"ICDC":4}, "Strategic Management":{"District":21,"Association":24,"ICDC":33} },
 "Finance": { "Business Law":{"District":7,"Association":8,"ICDC":7}, "Communications":{"District":5,"Association":4,"ICDC":3}, "Customer Relations":{"District":5,"Association":5,"ICDC":4}, "Economics":{"District":6,"Association":5,"ICDC":4}, "Emotional Intelligence":{"District":9,"Association":8,"ICDC":6}, "Entrepreneurship":{"District":1,"Association":0,"ICDC":0}, "Financial Analysis":{"District":24,"Association":28,"ICDC":30}, "Financial-Information Management":{"District":9,"Association":8,"ICDC":7}, "Human Resources Management":{"District":8,"Association":8,"ICDC":6}, "Information Management":{"District":3,"Association":3,"ICDC":2}, "Marketing":{"District":2,"Association":2,"ICDC":1}, "Operations":{"District":8,"Association":7,"ICDC":6}, "Professional Development":{"District":5,"Association":5,"ICDC":4}, "Risk Management":{"District":8,"Association":8,"ICDC":10} },
 "Marketing": { "Business Law":{"District":2,"Association":2,"ICDC":1}, "Channel Management":{"District":5,"Association":6,"ICDC":7}, "Communications":{"District":5,"Association":4,"ICDC":3}, "Customer Relations":{"District":2,"Association":2,"ICDC":1}, "Economics":{"District":6,"Association":5,"ICDC":4}, "Emotional Intelligence":{"District":9,"Association":8,"ICDC":6}, "Entrepreneurship":{"District":1,"Association":0,"ICDC":0}, "Financial Analysis":{"District":6,"Association":5,"ICDC":4}, "Human Resources Management":{"District":8,"Association":8,"ICDC":6}, "Information Management":{"District":3,"Association":3,"ICDC":2}, "Market Planning":{"District":8,"Association":9,"ICDC":11}, "Marketing":{"District":14,"Association":15,"ICDC":16}, "Operations":{"District":8,"Association":7,"ICDC":6}, "Pricing":{"District":5,"Association":6,"ICDC":7}, "Product/Service Management":{"District":8,"Association":9,"ICDC":11}, "Professional Development":{"District":5,"Association":5,"ICDC":4}, "Promotion":{"District":8,"Association":9,"ICDC":11}, "Selling":{"District":7,"Association":8,"ICDC":9} },
 "Hospitality + Tourism": { "Business Law":{"District":3,"Association":3,"ICDC":2}, "Communications":{"District":5,"Association":4,"ICDC":3}, "Customer Relations":{"District":8,"Association":9,"ICDC":9}, "Economics":{"District":6,"Association":6,"ICDC":5}, "Emotional Intelligence":{"District":9,"Association":9,"ICDC":7}, "Entrepreneurship":{"District":1,"Association":0,"ICDC":0}, "Financial Analysis":{"District":8,"Association":7,"ICDC":7}, "Human Resources Management":{"District":9,"Association":9,"ICDC":8}, "Information Management":{"District":3,"Association":3,"ICDC":2}, "Marketing":{"District":14,"Association":15,"ICDC":16}, "Operations":{"District":29,"Association":30,"ICDC":31}, "Professional Development":{"District":5,"Association":5,"ICDC":4}, "Risk Management":{"District":0,"Association":0,"ICDC":6} },
 "Personal Financial Literacy": { "Earning Income":{"District":25,"Association":20,"ICDC":16}, "Spending":{"District":14,"Association":14,"ICDC":14}, "Saving":{"District":15,"Association":14,"ICDC":13}, "Investing":{"District":15,"Association":19,"ICDC":21}, "Managing Credit":{"District":16,"Association":19,"ICDC":21}, "Managing Risk":{"District":15,"Association":14,"ICDC":15} },
 "Entrepreneurship": { "Business Law":{"District":4,"Association":4,"ICDC":3}, "Channel Management":{"District":3,"Association":3,"ICDC":3}, "Communications":{"District":1,"Association":0,"ICDC":1}, "Customer Relations":{"District":1,"Association":1,"ICDC":1}, "Economics":{"District":3,"Association":3,"ICDC":2}, "Emotional Intelligence":{"District":6,"Association":6,"ICDC":4}, "Entrepreneurship":{"District":14,"Association":13,"ICDC":14}, "Financial Analysis":{"District":10,"Association":11,"ICDC":13}, "Human Resources Management":{"District":6,"Association":6,"ICDC":5}, "Information Management":{"District":2,"Association":2,"ICDC":1}, "Market Planning":{"District":6,"Association":7,"ICDC":8}, "Marketing":{"District":9,"Association":10,"ICDC":12}, "Operations":{"District":11,"Association":11,"ICDC":10}, "Pricing":{"District":3,"Association":3,"ICDC":4}, "Product/Service Management":{"District":6,"Association":7,"ICDC":8}, "Professional Development":{"District":3,"Association":3,"ICDC":2}, "Promotion":{"District":6,"Association":7,"ICDC":8}, "Risk Management":{"District":6,"Association":6,"ICDC":1} }
}

############ DIFFICULTY MIX BY LEVEL ############
difficultyMix = {
  "District":{"easy":0.50,"medium":0.35,"hard":0.15},
  "Association":{"easy":0.40,"medium":0.40,"hard":0.20},
  "ICDC":{"easy":0.30,"medium":0.40,"hard":0.30}
}

######### OUTPUT SCHEMA (JSON mode) ###########
schemaJSON = {
  "metadata":{"cluster":"<Marketing>","level":"<District>","generated_on":"YYYY-MM-DD","total_questions":100,"difficulty_breakdown":{"easy":50,"medium":35,"hard":15}},
  "questions":[{"id":1,"instructional_area":"Channel Management","pi_codes":["CM:001"],"difficulty":"easy","stem":"In a dual distribution system, which channel conflict is MOST likely when a manufacturer opens an online store that undercuts authorized retailers?","options":{"A":"Vertical—goal incompatibility","B":"Horizontal—territorial overlap","C":"Vertical—price competition","D":"Horizontal—dual sourcing"},"answer":"C","rationale":"Vertical price competition occurs when a manufacturer sells directly online at a lower price, undercutting its existing retailers; the other conflicts do not involve pricing pressure across channel levels."}],
  "answer_key":{"1":"C"},
  "answer_explanations":{"1":"Vertical price competition occurs when a manufacturer sells directly online at a lower price, undercutting its existing retailers; the other conflicts do not involve pricing pressure across channel levels."}
}

####################  RULES  ######################
0. If both cluster and level are supplied in the user request, generate the exam.  
1. Use blueprintData exactly—IA counts must sum to the given amount asked for or 100.  
2. Apply difficultyMix quotas.  
3. Tag each item with accurate pi_codes.  
4. Follow MBA style: stem-first, 4 options (A-D), parallel grammar, plausible distractors. 

🚨 CRITICAL ANSWER RANDOMIZATION RULE: 
- You MUST randomly distribute correct answers across A, B, C, and D options
- Target 25% distribution for each letter (A=25%, B=25%, C=25%, D=25%)
- NEVER default to making answer A correct for most questions
- NEVER allow more than 2 consecutive questions with the same correct answer letter
- Before generating each question, mentally choose a random letter (A, B, C, or D) for the correct answer
- Mix up answer positions throughout the entire test  
5. Context rotation and cognitive levels as outlined previously.  
6. Default output is JSON (schemaJSON).  
7. Optional "rationales on" appends a one-sentence rationale per item.  
8. Self-validate counts, quotas, duplication, JSON syntax.  
9. Output only the requested exam—no extra commentary or markdown.

Additional Rules:

1. Nuance Factor  
 Every item is written so **exactly two choices feel correct** until the test-taker notices **one precise, defining nuance**.  
 • Craft the "near-miss" distractor to match ~90 % of the same concept.  
 • The nuance may be —  
  - a limiting qualifier (*only, primary, all, first*)  
  - a time/quantity boundary (*within 30 days; 10 % or less*)  
  - a hierarchical term (*policy vs. procedure; strategic vs. tactical*)  
  - a legal or ethical fine point (*letter vs. spirit; civil vs. criminal*)  
  - a scope difference (*domestic vs. international; implicit vs. explicit consent*)  
 • Alternate nuance types across the exam; avoid patterns, the correct answer is on a context of the question basis which means case by case.

2▸ **MBA Style Essentials** – Stem-first question; four options A–D; parallel grammar; business-authentic contexts; answer rotation ≈ 25 % each; numeric & punctuation conventions; bias-free language; easy/med/hard cognitive cues.

3▸ **Cluster-Aligned Question Formulas**  
 Generate ≈ 50 % of items using one of the templates below (A–Z); the rest may follow any DECA-authentic pattern.  
 Use formulas most natural to the cluster (suggested mapping in brackets).  
 A Definition-Pick [Core, BM+A]  
 B Most/Best Practice [All]  
 C Except/Not [Core, PFL]  
 D Scenario→Principle [BM+A, Entrepreneurship]  
 E Cause-Effect [Economics in all clusters]  
 F Legal Test [Finance, BM+A]  
 G Math-Solve [Finance, PFL]  
 H Sequence/Process [Operations heavy clusters]  
 I Benefit-Goal [Marketing, Hospitality]  
 J Risk-Control [Finance, Entrepreneurship]  
 K Ethics vs Law [Core, BM+A]  
 L Tech-Impact [Marketing, BM+A]  
 M Touchpoint ID [Hospitality, Marketing]  
 N PI-Match [All]  
 O Behavior-Interpret [HR items across clusters]  
 P Globalization [Marketing, Core]  
 Q Economics Curve [Core, Finance]  
 R Budget/Variance [BM+A, Finance]  
 S Customer-Service Empathy [Hospitality, Marketing]  
 T Channel Conflict [Marketing]  
 U Data-Analytics Use (Marketing, Finance)  
 V Insurance-Risk Transfer (Finance, PFL)  
 W Motivation Theory (BM+A, Core)  
 X Career-Stage (BM+A)  
 Y Compliance-AI Role (Finance, Core)  
 Z Governance Action (BM+A)

4. Make 50% of the questions made much more difficult— there should be decent rigor in the questions; it should not be something that can be answered by a simple google search.

5. Blank-Completion Items (~5-10% of total):  
   – Stem uses a blank (______ or __________) in place of a concept.  
   – Options are single-word or short noun/adjective phrases, parallel in form and length (within a 10-15 character range).  
   – Follow all MBA style rules (answer rotation, no catch-alls, uniform distractor length).

6. Aggregate Question-Type Frequencies:
   – Formula-Template Items (A–Z): ~50% of total (≈1.9% each template)
   – Free-form DECA Authenticated MC (non-templated): ~50%
   – Scenario Vignettes (30–40% overall; 40–45% in Entrepreneurship & Hospitality, 20–25% in Core & Finance)
   – Negative (EXCEPT/NOT) Stems: ≤5%
   – Numeric/Calculation MC (Finance & PFL only): ~10–15%
   – Blank-Completion Items: ~5–10%
   – Direct MC ("Which of the following…," "What is…"): ~100% of non-blank items

7. **Two-Column Layout**: For print/PDF outputs, render options in two columns (A/C on one line; B/D on next) to mirror DECA booklets.

8. **Instructional Area Cues**: Each stem must explicitly reference its IA (e.g., "in pricing," "regarding market segmentation").

9. **Stem Lead-ins & Tone**: Use "Which of the following…" or "What is…" exclusively; maintain simple present tense and formal business tone; avoid colloquialisms.

10. **Stem Length & Text Consistency**: Keep stems between 15–25 words (20–30 for Hospitality; ≤18 for Finance/PFL); ensure no embedded definitions or multi-part clauses.

11. **Data/Calculation Embedding**: Restrict numeric/table references to Finance and PFL stems only; other clusters must use abstract scenarios without figures.

12. **Jargon Alignment**: Use cluster-specific terminology accurately (e.g., Marketing: "brand equity," "value proposition"; PFL: "liquidity," "asset allocation").

13. **Scenario Proportions**: Include named-character vignettes in ~30–40% of items (higher for Entrepreneurship & Hospitality; lower for Core & Finance).

14. **Negative Stem Rarity**: Limit EXCEPT/NOT stems to ≤5% of items; emphasize negatives in all caps.

15. **Distractor Uniformity**: Ensure all options match in grammatical form and character length (within 10–15 characters) to avoid clueing.

16. **Scenario Detail Enhancement**: For all scenario-based (vignette) stems, enrich the narrative with realistic details—include full names (first and last), specific job titles or roles, unique made-up company names, industry context, and brief setting descriptions (city, environment) to increase user engagement while keeping stems concise.

17. **Match Official Wording**: Use the exact DECA terminology (e.g., "brand equity," "liquidity," "segmentation") in both stems and rationales to maintain consistency with official materials.

18. **Calibrate Distractors**: Design incorrect options to reflect common misconceptions at each performance indicator level, ensuring distractors are plausible and targeted.

19. **Mix Cognitive Levels**: Specify and enforce the number of recall (knowledge), application, and analysis questions per exam to cover all cognitive tiers appropriately.

//////////////////// Learning Feature ////////////////////
When invoked in "learning" mode, the AI will:
- Identify instructional areas and Performance Indicators the user answered incorrectly in prior tests.
- Generate 2–3 practice questions per identified topic following all existing item-writing rules.
- Adjust difficulty by error rate:
  • High error rate (≥50% incorrect): predominantly easy questions.
  • Moderate error rate (20–49% incorrect): mix of easy and medium questions.
  • Low error rate (<20% incorrect): medium to hard questions.`;

  let userPrompt = '';
  
  if (params.learningMode && params.weakTopics && params.weakTopics.length > 0) {
    // Learning mode for adaptive practice questions
    const difficultyAdjustment = params.errorRate && params.errorRate >= 50 ? 'predominantly easy questions' :
                                params.errorRate && params.errorRate >= 20 ? 'mix of easy and medium questions' :
                                'medium to hard questions';
    
    userPrompt = `Generate ${numQuestions} practice questions in "learning" mode for cluster "${cluster}" at "${level}" level.

Focus on these weak instructional areas: ${params.weakTopics.join(", ")}.
Adjust difficulty: ${difficultyAdjustment}.
Generate 2-3 questions per identified topic following all existing item-writing rules.

Use the schemaJSON format exactly.`;
  } else {
    // Standard test generation
    userPrompt = `Generate ${numQuestions} multiple-choice questions for cluster "${cluster}" at "${level}" level.
    
The questions should cover instructional areas: ${params.categories.join(", ")}.
Distribute questions evenly across these categories.

Use the schemaJSON format exactly with all required fields including metadata, questions array, answer_key, and answer_explanations.`;
  }
  
  try {
    const response = await client.getChatCompletions(
      deploymentId,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      {
        temperature: 0.7,
        maxTokens: 4000,
        responseFormat: { type: "json_object" }
      }
    );
    
    const result = JSON.parse(response.choices[0].message?.content || "{}");
    
    // Transform to match existing frontend expectations
    const questions = (result.questions || []).map((q: any, index: number) => ({
      id: q.id || index + 1,
      stem: q.stem || q.question,
      options: q.options || {
        A: "Option A",
        B: "Option B", 
        C: "Option C",
        D: "Option D"
      },
      answer: q.answer || "A",
      explanation: q.rationale || result.answer_explanations?.[q.id] || q.explanation || "This is the correct answer.",
      instructional_area: q.instructional_area || q.category || "General",
      difficulty: q.difficulty || 'medium',
      pi_codes: q.pi_codes || []
    }));
    
    return {
      testType: params.testType,
      questions,
      metadata: result.metadata
    };
    
  } catch (error) {
    console.error("Error generating test questions:", error);
    throw error;
  }
}