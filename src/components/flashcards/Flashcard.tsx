import React from 'react';
import { RotateCw, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Flashcard as FlashcardType } from '../../types/study';

interface FlashcardProps {
  card: FlashcardType;
  isFlipped: boolean;
  onFlip: () => void;
  index: number;
  total: number;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  card,
  isFlipped,
  onFlip,
  index,
  total,
}) => {
  return (
    <div
      className={`flashcard-wrapper ${isFlipped ? 'is-flipped' : ''}`}
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onFlip();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Flashcard ${index + 1} of ${total}. Click or press space to reveal ${isFlipped ? 'question' : 'answer'}`}
      title="Click or press Space to flip"
    >
      <div className="flashcard-inner">
        {/* Front Face - Question */}
        <div className="flashcard-face flashcard-front">
          <div className="flashcard-tag">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <HelpCircle size={14} /> Question
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {index + 1} / {total}
            </span>
          </div>

          <div className="flashcard-content">
            {card.question}
          </div>

          <div className="flashcard-hint">
            <RotateCw size={13} />
            <span>Click card or press <kbd style={{ padding: '0.1rem 0.35rem', background: 'var(--bg-surface-elevated)', borderRadius: '3px', border: '1px solid var(--border-color)', fontSize: '0.7rem' }}>Space</kbd> to flip</span>
          </div>
        </div>

        {/* Back Face - Answer */}
        <div className="flashcard-face flashcard-back">
          <div className="flashcard-tag">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--success)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <CheckCircle2 size={14} /> Answer & Concept
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {index + 1} / {total}
            </span>
          </div>

          <div className="flashcard-content" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            {card.answer}
          </div>

          <div className="flashcard-hint">
            <RotateCw size={13} />
            <span>Click or press <kbd style={{ padding: '0.1rem 0.35rem', background: 'var(--bg-surface-elevated)', borderRadius: '3px', border: '1px solid var(--border-color)', fontSize: '0.7rem' }}>Space</kbd> to return to question</span>
          </div>
        </div>
      </div>
    </div>
  );
};
