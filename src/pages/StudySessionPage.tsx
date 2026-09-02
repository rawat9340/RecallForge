import React, { useState, useEffect, useCallback } from 'react';
import { StudySet } from '../types/study';
import { StudySessionHeader } from '../components/study/StudySessionHeader';
import { StudyTabs, StudyTab } from '../components/study/StudyTabs';
import { Flashcard } from '../components/flashcards/Flashcard';
import { FlashcardControls } from '../components/flashcards/FlashcardControls';
import { QuizCard } from '../components/quiz/QuizCard';
import { QuizSummary } from '../components/quiz/QuizSummary';
import { useQuiz } from '../hooks/useQuiz';

interface StudySessionPageProps {
  studySet: StudySet;
  onRegenerate: () => void;
  onNewSession: () => void;
  isRegenerating: boolean;
}

export const StudySessionPage: React.FC<StudySessionPageProps> = ({
  studySet,
  onRegenerate,
  onNewSession,
  isRegenerating,
}) => {
  // Navigation tabs: Flashcards (default) vs Quiz (Section 13)
  const [activeTab, setActiveTab] = useState<StudyTab>('flashcards');

  // Flashcard State (Section 8: clearly separated)
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Quiz State (Section 24: managed by useQuiz hook)
  const {
    activeQuestions,
    currentIndex: quizIndex,
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
  } = useQuiz(studySet.quiz);

  // Handlers for flashcard deck
  const handleNextCard = useCallback(() => {
    if (flashcardIndex < studySet.flashcards.length - 1) {
      setFlashcardIndex((prev: number) => prev + 1);
      setIsFlipped(false);
    }
  }, [flashcardIndex, studySet.flashcards.length]);

  const handlePrevCard = useCallback(() => {
    if (flashcardIndex > 0) {
      setFlashcardIndex((prev: number) => prev - 1);
      setIsFlipped(false);
    }
  }, [flashcardIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev: boolean) => !prev);
  }, []);

  const handleResetCards = useCallback(() => {
    setFlashcardIndex(0);
    setIsFlipped(false);
  }, []);

  // Keyboard navigation for flashcards: Space (flip), ArrowRight (next), ArrowLeft (previous) (Section 9)
  useEffect(() => {
    if (activeTab !== 'flashcards') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if focus is in an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, handleFlip, handleNextCard, handlePrevCard]);

  const currentFlashcard = studySet.flashcards[flashcardIndex];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '880px' }}>
      {/* Session Header */}
      <StudySessionHeader
        title={studySet.title}
        summary={studySet.summary}
        difficulty={studySet.difficulty}
        onRegenerate={onRegenerate}
        onNewSession={onNewSession}
        isRegenerating={isRegenerating}
      />

      {/* Tabs */}
      <StudyTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        flashcardCount={studySet.flashcards.length}
        quizCount={studySet.quiz.length}
      />

      {/* Tab 1: Flashcards View */}
      {activeTab === 'flashcards' && currentFlashcard && (
        <div style={{ animation: 'fadeIn 0.2s ease-in' }}>
          <Flashcard
            card={currentFlashcard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            index={flashcardIndex}
            total={studySet.flashcards.length}
          />

          <FlashcardControls
            currentIndex={flashcardIndex}
            totalCards={studySet.flashcards.length}
            onNext={handleNextCard}
            onPrevious={handlePrevCard}
            onReset={handleResetCards}
          />
        </div>
      )}

      {/* Tab 2: Interactive Quiz View */}
      {activeTab === 'quiz' && (
        <div style={{ animation: 'fadeIn 0.2s ease-in' }}>
          {!isComplete && currentQuestion ? (
            <QuizCard
              question={currentQuestion}
              currentIndex={quizIndex}
              totalQuestions={activeQuestions.length}
              selectedAnswer={selectedAnswer}
              isSubmitted={isSubmitted}
              onSelectOption={selectOption}
              onNext={nextQuestion}
            />
          ) : (
            <QuizSummary
              score={score}
              total={activeQuestions.length}
              percentage={percentage}
              incorrectQuestions={incorrectQuestions}
              isRetestMode={isRetestMode}
              onReset={resetQuiz}
              onRetest={startRetest}
            />
          )}
        </div>
      )}
    </div>
  );
};
