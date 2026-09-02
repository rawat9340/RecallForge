import { describe, it, expect } from 'vitest';
import { calculateScore, getIncorrectQuestions, formatPercentage } from '../utils/quiz';
import { QuizQuestion } from '../types/study';

describe('Quiz Utilities (Scoring & Retest Isolation)', () => {
  const mockQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      question: 'What is HTTP 200?',
      options: ['Error', 'OK', 'Redirect', 'Not Found'],
      correctAnswer: 1,
      explanation: '200 means OK',
    },
    {
      id: 'q2',
      question: 'What is HTTP 404?',
      options: ['Server Error', 'Bad Request', 'Not Found', 'Unauthorized'],
      correctAnswer: 2,
      explanation: '404 means Not Found',
    },
    {
      id: 'q3',
      question: 'What is HTTP 500?',
      options: ['Internal Server Error', 'OK', 'Forbidden', 'Accepted'],
      correctAnswer: 0,
      explanation: '500 is Internal Server Error',
    },
  ];

  describe('3. Quiz score calculation', () => {
    it('calculates perfect score correctly', () => {
      const answers = { q1: 1, q2: 2, q3: 0 };
      expect(calculateScore(mockQuestions, answers)).toBe(3);
    });

    it('calculates partial score correctly', () => {
      const answers = { q1: 1, q2: 0 /* wrong */, q3: 0 };
      expect(calculateScore(mockQuestions, answers)).toBe(2);
    });

    it('returns 0 when all answers are wrong or empty', () => {
      const answers = { q1: 3, q2: 3, q3: 3 };
      expect(calculateScore(mockQuestions, answers)).toBe(0);
      expect(calculateScore(mockQuestions, {})).toBe(0);
    });

    it('handles empty questions list safely', () => {
      expect(calculateScore([], { q1: 1 })).toBe(0);
    });
  });

  describe('4. Incorrect question extraction', () => {
    it('isolates only the questions answered incorrectly', () => {
      // q1 is correct (1), q2 is incorrect (1 instead of 2), q3 is correct (0)
      const answers = { q1: 1, q2: 1, q3: 0 };
      const incorrect = getIncorrectQuestions(mockQuestions, answers);

      expect(incorrect).toHaveLength(1);
      expect(incorrect[0].id).toBe('q2');
      expect(incorrect[0].question).toBe('What is HTTP 404?');
    });

    it('returns empty array when all questions are answered correctly', () => {
      const answers = { q1: 1, q2: 2, q3: 0 };
      const incorrect = getIncorrectQuestions(mockQuestions, answers);
      expect(incorrect).toEqual([]);
    });

    it('treats unanswered questions as incorrect for retest purposes', () => {
      const partialAnswers = { q1: 1 }; // q2 and q3 are missing
      const incorrect = getIncorrectQuestions(mockQuestions, partialAnswers);
      expect(incorrect).toHaveLength(2);
      expect(incorrect.map((q) => q.id)).toEqual(['q2', 'q3']);
    });
  });

  describe('Percentage formatting', () => {
    it('formats percentages accurately rounded', () => {
      expect(formatPercentage(8, 10)).toBe(80);
      expect(formatPercentage(1, 3)).toBe(33);
      expect(formatPercentage(2, 3)).toBe(67);
      expect(formatPercentage(0, 5)).toBe(0);
    });

    it('safely handles division by zero', () => {
      expect(formatPercentage(0, 0)).toBe(0);
    });
  });
});
