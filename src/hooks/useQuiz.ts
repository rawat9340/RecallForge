import { useState, useCallback, useMemo } from 'react';
import { QuizQuestion } from '../types/study';
import { calculateScore, getIncorrectQuestions, formatPercentage } from '../utils/quiz';

export interface UseQuizReturn {
  activeQuestions: QuizQuestion[];
  currentIndex: number;
  currentQuestion: QuizQuestion | null;
  selectedAnswer: number | null;
  isSubmitted: boolean;
  score: number;
  percentage: number;
  isComplete: boolean;
  isRetestMode: boolean;
  incorrectQuestions: QuizQuestion[];
  selectOption: (optionIndex: number) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
  startRetest: () => void;
}

/**
 * Custom hook managing interactive quiz state, question answering, scoring,
 * and zero-network-call retesting of incorrect questions.
 */
export const useQuiz = (initialQuestions: QuizQuestion[]): UseQuizReturn => {
  // The active pool of questions (either full set or retest subset)
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // Store answers as map: { [questionId]: optionIndex }
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  // Whether the current question is answered and locked
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  // Whether the current quiz session has completed all questions
  const [isComplete, setIsComplete] = useState<boolean>(false);
  // Track if we are in a retest mode session
  const [isRetestMode, setIsRetestMode] = useState<boolean>(false);

  const currentQuestion = activeQuestions[currentIndex] || null;
  const currentAnswer = currentQuestion ? userAnswers[currentQuestion.id] : undefined;
  const selectedAnswer = currentAnswer !== undefined ? currentAnswer : null;

  // Derive score and incorrect questions using pure utils
  const score = useMemo(() => calculateScore(activeQuestions, userAnswers), [activeQuestions, userAnswers]);
  const percentage = useMemo(() => formatPercentage(score, activeQuestions.length), [score, activeQuestions.length]);
  const incorrectQuestions = useMemo(
    () => getIncorrectQuestions(activeQuestions, userAnswers),
    [activeQuestions, userAnswers]
  );

  /**
   * Submits an answer for the current question and locks it immediately
   */
  const selectOption = useCallback(
    (optionIndex: number) => {
      if (isSubmitted || !currentQuestion) return;

      setUserAnswers((prev: Record<string, number>) => ({
        ...prev,
        [currentQuestion.id]: optionIndex,
      }));
      setIsSubmitted(true);
    },
    [isSubmitted, currentQuestion]
  );

  /**
   * Advances to the next question or completes the quiz
   */
  const nextQuestion = useCallback(() => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev: number) => prev + 1);
      setIsSubmitted(false);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, activeQuestions.length]);

  /**
   * Resets the quiz to start fresh with the full initial questions
   */
  const resetQuiz = useCallback(() => {
    setActiveQuestions(initialQuestions);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setIsComplete(false);
    setIsRetestMode(false);
  }, [initialQuestions]);

  /**
   * Retest wrong answers (Section 11 requirement):
   * Creates a new session containing ONLY previously incorrect questions.
   * Does NOT call the AI again, reusing existing question objects.
   */
  const startRetest = useCallback(() => {
    const failedQuestions = getIncorrectQuestions(activeQuestions, userAnswers);
    if (failedQuestions.length === 0) return;

    setActiveQuestions(failedQuestions);
    setCurrentIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setIsComplete(false);
    setIsRetestMode(true);
  }, [activeQuestions, userAnswers]);

  return {
    activeQuestions,
    currentIndex,
    currentQuestion,
    selectedAnswer,
    isSubmitted,
    score,
    percentage,
    isComplete,
    isRetestMode,
    incorrectQuestions,
    selectOption,
    nextQuestion,
    resetQuiz,
    startRetest,
  };
};
