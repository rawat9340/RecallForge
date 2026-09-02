import React from 'react';
import { Check, X } from 'lucide-react';

interface QuizOptionProps {
  index: number;
  text: string;
  isSelected: boolean;
  isCorrect: boolean;
  isSubmitted: boolean;
  onSelect: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const QuizOption: React.FC<QuizOptionProps> = ({
  index,
  text,
  isSelected,
  isCorrect,
  isSubmitted,
  onSelect,
}) => {
  const letter = OPTION_LETTERS[index] || String(index + 1);

  let stateClass = '';
  if (isSubmitted) {
    if (isCorrect) {
      stateClass = 'is-correct';
    } else if (isSelected) {
      stateClass = 'is-incorrect';
    }
  }

  return (
    <button
      type="button"
      className={`quiz-option ${stateClass}`}
      onClick={onSelect}
      disabled={isSubmitted}
      aria-label={`Option ${letter}: ${text}`}
    >
      <span className="quiz-option-letter">
        {isSubmitted && isCorrect ? (
          <Check size={14} />
        ) : isSubmitted && isSelected && !isCorrect ? (
          <X size={14} />
        ) : (
          letter
        )}
      </span>
      <span style={{ flex: 1, paddingTop: '0.15rem' }}>{text}</span>
    </button>
  );
};
