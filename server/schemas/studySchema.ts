import { z } from 'zod';

/**
 * Zod Schema for Flashcard
 * Requires non-empty id, question, and answer.
 */
export const FlashcardSchema = z.object({
  id: z.string().min(1, 'Flashcard id is required'),
  question: z.string().trim().min(1, 'Question must not be empty'),
  answer: z.string().trim().min(1, 'Answer must not be empty'),
});

/**
 * Zod Schema for Quiz Question
 * Requirements:
 * - correctAnswer must be an integer from 0 to 3
 * - Exactly 4 options per quiz question (strings must not be empty)
 * - question and explanation must not be empty
 */
export const QuizQuestionSchema = z.object({
  id: z.string().min(1, 'Quiz question id is required'),
  question: z.string().trim().min(1, 'Question must not be empty'),
  options: z
    .array(z.string().trim().min(1, 'Option must not be empty'))
    .length(4, 'Quiz question must have exactly 4 options') as unknown as z.ZodType<
    [string, string, string, string]
  >,
  correctAnswer: z
    .number()
    .int('Correct answer must be an integer')
    .min(0, 'Correct answer index must be between 0 and 3')
    .max(3, 'Correct answer index must be between 0 and 3'),
  explanation: z.string().trim().min(1, 'Explanation must not be empty'),
});

/**
 * Difficulty Enum Schema
 */
export const DifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);

/**
 * Complete AI Response Study Set Schema
 * Requirements:
 * - flashcards and quiz must contain at least one item
 * - Strings must not be empty
 */
export const StudySetSchema = z.object({
  title: z.string().trim().min(1, 'Title must not be empty'),
  summary: z.string().trim().min(1, 'Summary must not be empty'),
  difficulty: DifficultySchema,
  flashcards: z.array(FlashcardSchema).min(1, 'Flashcards must contain at least one item'),
  quiz: z.array(QuizQuestionSchema).min(1, 'Quiz must contain at least one item'),
});

/**
 * Client Request Schema for Generating Study Sets
 */
export const GenerateRequestSchema = z.object({
  topic: z.string().trim().min(1, 'Topic or study notes must not be empty'),
  flashcardCount: z.number().int().refine((val) => [5, 10, 15].includes(val), {
    message: 'Flashcard count must be 5, 10, or 15',
  }),
  quizCount: z.number().int().refine((val) => [5, 10].includes(val), {
    message: 'Quiz count must be 5 or 10',
  }),
  difficulty: DifficultySchema,
});

// Infer TypeScript types directly from Zod schemas to ensure single source of truth
export type Flashcard = z.infer<typeof FlashcardSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type Difficulty = z.infer<typeof DifficultySchema>;
export type StudySet = z.infer<typeof StudySetSchema>;
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
