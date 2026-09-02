import { describe, it, expect } from 'vitest';
import {
  StudySetSchema,
  GenerateRequestSchema,
  FlashcardSchema,
  QuizQuestionSchema,
} from '../schemas/studySchema';

describe('Zod Schema Validation for Study Sets', () => {
  const validStudySet = {
    title: 'Operating Systems Fundamentals',
    summary: 'Essential concepts in OS architecture including paging, deadlocks, and scheduling.',
    difficulty: 'intermediate',
    flashcards: [
      {
        id: 'card-1',
        question: 'What is thrashing in virtual memory?',
        answer: 'When the system spends more time servicing page faults than executing instructions.',
      },
    ],
    quiz: [
      {
        id: 'quiz-1',
        question: 'Which condition is NOT one of Coffman’s deadlock conditions?',
        options: [
          'Mutual Exclusion',
          'Hold and Wait',
          'Preemption allowed',
          'Circular Wait',
        ],
        correctAnswer: 2,
        explanation: 'Deadlock requires NO preemption; allowing preemption eliminates deadlocks.',
      },
    ],
  };

  it('1. Valid AI response passes validation', () => {
    const result = StudySetSchema.safeParse(validStudySet);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Operating Systems Fundamentals');
      expect(result.data.flashcards).toHaveLength(1);
      expect(result.data.quiz[0].correctAnswer).toBe(2);
    }
  });

  describe('2. Invalid AI response fails validation', () => {
    it('fails when flashcards is not an array (wrong shape)', () => {
      const invalid = { ...validStudySet, flashcards: 'hello world' };
      const result = StudySetSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('fails when required fields are missing', () => {
      const invalid = { title: 'Operating Systems' };
      const result = StudySetSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('fails when flashcards array is empty', () => {
      const invalid = { ...validStudySet, flashcards: [] };
      const result = StudySetSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('fails when quiz array is empty', () => {
      const invalid = { ...validStudySet, quiz: [] };
      const result = StudySetSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('fails when correctAnswer is outside 0-3 range', () => {
      const invalidQuiz = {
        ...validStudySet,
        quiz: [
          {
            ...validStudySet.quiz[0],
            correctAnswer: 5, // Invalid: must be 0-3
          },
        ],
      };
      const result = StudySetSchema.safeParse(invalidQuiz);
      expect(result.success).toBe(false);
    });

    it('fails when quiz options does not have exactly 4 items', () => {
      const invalidQuiz = {
        ...validStudySet,
        quiz: [
          {
            ...validStudySet.quiz[0],
            options: ['Option 1', 'Option 2', 'Option 3'], // Only 3 options
          },
        ],
      };
      const result = StudySetSchema.safeParse(invalidQuiz);
      expect(result.success).toBe(false);
    });

    it('fails when strings are empty or whitespace only', () => {
      const invalidCard = {
        id: 'card-1',
        question: '   ',
        answer: 'Valid answer',
      };
      const result = FlashcardSchema.safeParse(invalidCard);
      expect(result.success).toBe(false);

      const invalidQuestion = {
        id: 'q-1',
        question: 'What is Paging?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: '   ',
      };
      const qResult = QuizQuestionSchema.safeParse(invalidQuestion);
      expect(qResult.success).toBe(false);
    });
  });

  describe('Generate Request Schema Validation', () => {
    it('passes for valid request parameters', () => {
      const validReq = {
        topic: 'Computer Networks',
        flashcardCount: 10,
        quizCount: 5,
        difficulty: 'advanced',
      };
      const result = GenerateRequestSchema.safeParse(validReq);
      expect(result.success).toBe(true);
    });

    it('rejects invalid flashcard counts (must be 5, 10, or 15)', () => {
      const invalidReq = {
        topic: 'OOP',
        flashcardCount: 7, // Invalid
        quizCount: 5,
        difficulty: 'beginner',
      };
      const result = GenerateRequestSchema.safeParse(invalidReq);
      expect(result.success).toBe(false);
    });

    it('rejects invalid quiz counts (must be 5 or 10)', () => {
      const invalidReq = {
        topic: 'OOP',
        flashcardCount: 5,
        quizCount: 20, // Invalid
        difficulty: 'beginner',
      };
      const result = GenerateRequestSchema.safeParse(invalidReq);
      expect(result.success).toBe(false);
    });

    it('rejects empty topic string', () => {
      const invalidReq = {
        topic: '   ',
        flashcardCount: 5,
        quizCount: 5,
        difficulty: 'beginner',
      };
      const result = GenerateRequestSchema.safeParse(invalidReq);
      expect(result.success).toBe(false);
    });
  });
});
