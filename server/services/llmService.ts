import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerateRequest, StudySet, StudySetSchema } from '../schemas/studySchema';
import { AppError } from '../middleware/errorHandler';

/**
 * Dedicated Prompt Builder for RecallForge
 * Enforces structured output format, interview prep depth, and exact count constraints.
 */
export const buildStudyPrompt = (params: GenerateRequest): string => {
  const { topic, flashcardCount, quizCount, difficulty } = params;

  return `You are a study-content generator. Return ONLY valid JSON matching the provided schema. Do not use Markdown fences. Do not add explanations outside JSON. Generate educationally accurate content. Ensure every quiz question has exactly four options and correctAnswer is the zero-based index of the correct option.

Make the generated content useful for technical interview preparation. Avoid vague or repetitive questions. Focus on core architectural concepts, trade-offs, practical syntax, and edge cases.

TOPIC / STUDY MATERIAL:
"""
${topic}
"""

TARGET SPECIFICATIONS:
- Flashcard Count: Exactly ${flashcardCount} cards
- Quiz Question Count: Exactly ${quizCount} questions
- Difficulty Level: "${difficulty}"

OUTPUT JSON SCHEMA:
{
  "title": "Concise, descriptive title for the study set",
  "summary": "2-3 sentence executive summary explaining key concepts and study goals",
  "difficulty": "${difficulty}",
  "flashcards": [
    {
      "id": "card-1",
      "question": "Clear, direct active-recall question testing understanding",
      "answer": "Concise, accurate answer with explanation of key mechanics or trade-offs"
    }
  ],
  "quiz": [
    {
      "id": "quiz-1",
      "question": "Specific scenario, concept, or interview-style problem",
      "options": [
        "First plausible option",
        "Second plausible option",
        "Third plausible option",
        "Fourth plausible option"
      ],
      "correctAnswer": 0,
      "explanation": "Clear explanation of why this option is correct and why common misconceptions are wrong"
    }
  ]
}

CRITICAL RULES:
1. "correctAnswer" MUST be an integer between 0 and 3 (0 for first option, 1 for second, 2 for third, 3 for fourth).
2. "options" MUST contain EXACTLY 4 non-empty string items.
3. Every string field must be non-empty.
4. "flashcards" MUST contain exactly ${flashcardCount} items.
5. "quiz" MUST contain exactly ${quizCount} items.
6. Return ONLY raw JSON. No \`\`\`json or \`\`\` wrappers.`;
};

/**
 * Strips accidental markdown backticks or wrappers from LLM output
 */
export const cleanJsonResponse = (rawText: string): string => {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
};

/**
 * Sample fallback generator for development and testing when GEMINI_API_KEY is not configured.
 * Implements Section 31 (Sample Development Data) while keeping it isolated.
 */
export const generateMockStudySet = (params: GenerateRequest): StudySet => {
  const { topic, flashcardCount, quizCount, difficulty } = params;
  const cleanTopic = topic.slice(0, 40);

  const flashcards = Array.from({ length: flashcardCount }, (_, i) => ({
    id: `mock-fc-${i + 1}`,
    question: `Key Concept #${i + 1} regarding ${cleanTopic}: What is the core mechanism and its trade-offs?`,
    answer: `In ${cleanTopic}, this mechanism balances resource utilization against latency. It is crucial for system predictability and architectural scalability.`,
  }));

  const quiz = Array.from({ length: quizCount }, (_, i) => {
    const correctIdx = (i % 4) as 0 | 1 | 2 | 3;
    const options: [string, string, string, string] = [
      `Primary approach emphasizing direct synchronous execution`,
      `Optimal pattern ensuring fault tolerance and isolated state`,
      `Heuristic relying on eventual consistency guarantees`,
      `Deprecated method prone to deadlock and resource contention`,
    ];
    // Rotate to make correct option match correctIdx
    return {
      id: `mock-qz-${i + 1}`,
      question: `Question ${i + 1}: When designing solutions for ${cleanTopic}, which architectural decision is optimal?`,
      options,
      correctAnswer: correctIdx,
      explanation: `Option ${String.fromCharCode(65 + correctIdx)} is correct because modern systems favor isolated state management to prevent race conditions and improve testability.`,
    };
  });

  return {
    title: `${cleanTopic} Study Mastery`,
    summary: `Structured active-recall session covering core fundamentals, architectural patterns, and interview questions for ${cleanTopic}.`,
    difficulty,
    flashcards,
    quiz,
  };
};

/**
 * Calls Gemini LLM to generate study set, parses JSON, and validates with Zod.
 * Throws controlled AppError for parsing, schema, or API issues.
 */
export const generateStudySetFromLLM = async (params: GenerateRequest): Promise<StudySet> => {
  const apiKey = process.env.GEMINI_API_KEY;

  // Development / Mock fallback when API key is missing (Section 31)
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    console.warn(
      '[RecallForge] Notice: GEMINI_API_KEY not configured in .env. Using development fallback generator (Section 31).'
    );
    // Simulate realistic network delay for UI testing
    await new Promise((resolve) => setTimeout(resolve, 800));
    return generateMockStudySet(params);
  }

  const prompt = buildStudyPrompt(params);

  let rawOutput = '';
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    rawOutput = response.text();
  } catch (error: any) {
    const errString = String(error?.message || error);
    console.error('[RecallForge LLM Error]:', errString);

    if (errString.includes('429') || errString.toLowerCase().includes('quota') || errString.toLowerCase().includes('rate limit')) {
      throw new AppError(
        'RATE_LIMIT_ERROR',
        'Gemini API rate limit exceeded. Please wait a moment and try again.',
        429
      );
    }

    if (errString.includes('401') || errString.includes('403') || errString.toLowerCase().includes('api key')) {
      throw new AppError(
        'AI_API_ERROR',
        'Authentication failed. Please verify your GEMINI_API_KEY configuration.',
        401
      );
    }

    throw new AppError(
      'AI_API_ERROR',
      'Failed to communicate with AI service. Please check your connection and try again.',
      502
    );
  }

  // Handle empty AI response (Section 7.D)
  if (!rawOutput || rawOutput.trim().length === 0) {
    throw new AppError(
      'AI_PARSE_ERROR',
      "Couldn't understand the AI response. Please try again.",
      502
    );
  }

  // Step 1: Parse JSON (Catch malformed JSON, Section 7.A)
  let parsedJson: unknown;
  try {
    const cleaned = cleanJsonResponse(rawOutput);
    parsedJson = JSON.parse(cleaned);
  } catch (parseErr) {
    console.error('[RecallForge Parse Error]:', parseErr, 'Raw output:', rawOutput);
    throw new AppError(
      'AI_PARSE_ERROR',
      "Couldn't understand the AI response. Please try again.",
      502
    );
  }

  // Step 2: Validate against Zod Schema (Catch wrong JSON shape & missing fields, Section 7.B & 7.C)
  const validationResult = StudySetSchema.safeParse(parsedJson);
  if (!validationResult.success) {
    console.error('[RecallForge Schema Error]:', validationResult.error.format());
    throw new AppError(
      'AI_SCHEMA_ERROR',
      'The generated study set was invalid.',
      502,
      validationResult.error.format()
    );
  }

  return validationResult.data;
};
