import React from 'react';
import { ArrowRight, HelpCircle, Info } from 'lucide-react';
import { QuizQuestion } from '../../types/study';
import { QuizOption } from './QuizOption';

interface QuizCardProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  isSubmitted: boolean;
  onSelectOption: (optionIndex: number) => void;
  onNext: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  isSubmitted,
  onSelectOption,
  onNext,
}) => {
  const isLast = currentIndex === totalQuestions - 1;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="card quiz-container">
      {/* Quiz Progress & Question Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <HelpCircle size={15} />
            Question {currentIndex + 1} of {totalQuestions}
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {progressPercent}% Complete
          </span>
        </div>
        <div style={{ height: '4px', width: '100%', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Question Prompt */}
      <h2 style={{ fontSize: '1.2rem', lineHeight: 1.5, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
        {question.question}
      </h2>

      {/* 4 Options */}
      <div className="quiz-options-list">
        {question.options.map((optionText, idx) => (
          <QuizOption
            key={`${question.id}-opt-${idx}`}
            index={idx}
            text={optionText}
            isSelected={selectedAnswer === idx}
            isCorrect={question.correctAnswer === idx}
            isSubmitted={isSubmitted}
            onSelect={() => onSelectOption(idx)}
          />
        ))}
      </div>

      {/* Explanation Box shown immediately after selection */}
      {isSubmitted && (
        <div className="explanation-box">
          <div className="explanation-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Info size={15} color="var(--accent-primary)" />
            Explanation
          </div>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            {question.explanation}
          </p>
        </div>
      )}

      {/* Next Question / View Results CTA */}
      {isSubmitted && (
        <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNext}
            id="quiz-next-btn"
          >
            <span>{isLast ? 'View Quiz Results' : 'Next Question'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
