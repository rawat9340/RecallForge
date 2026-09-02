import { QuizQuestion } from '../types/study';

/**
 * Calculates the total number of correctly answered questions.
 * @param questions - The list of quiz questions
 * @param answers - Record mapping question ID to chosen option index (0-3)
 */
export const calculateScore = (
  questions: QuizQuestion[],
  answers: Record<string, number>
): number => {
  if (!questions || questions.length === 0) return 0;

  return questions.reduce((acc, q) => {
    const selected = answers[q.id];
    return selected === q.correctAnswer ? acc + 1 : acc;
  }, 0);
};

/**
 * Identifies and returns the subset of quiz questions that were answered incorrectly.
 * @param questions - The full list of quiz questions
 * @param answers - Record mapping question ID to chosen option index
 */
export const getIncorrectQuestions = (
  questions: QuizQuestion[],
  answers: Record<string, number>
): QuizQuestion[] => {
  if (!questions || questions.length === 0) return [];

  return questions.filter((q) => {
    const selected = answers[q.id];
    return selected === undefined || selected !== q.correctAnswer;
  });
};

/**
 * Calculates percentage score rounded to the nearest integer.
 */
export const formatPercentage = (score: number, total: number): number => {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
};
