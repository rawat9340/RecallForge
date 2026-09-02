import React from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface FlashcardControlsProps {
  currentIndex: number;
  totalCards: number;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
}

export const FlashcardControls: React.FC<FlashcardControlsProps> = ({
  currentIndex,
  totalCards,
  onNext,
  onPrevious,
  onReset,
}) => {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalCards - 1;
  const progressPercent = Math.round(((currentIndex + 1) / totalCards) * 100);

  return (
    <div style={{ maxWidth: '640px', margin: '1.5rem auto 0 auto' }}>
      {/* Progress Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          <span>Progress</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{progressPercent}%</span>
        </div>
        <div style={{ height: '6px', width: '100%', background: 'var(--bg-surface-elevated)', borderRadius: '999px', overflow: 'hidden' }}>
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

      {/* Main Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onPrevious}
          disabled={isFirst}
          title="Previous Flashcard (ArrowLeft)"
        >
          <ArrowLeft size={16} />
          <span>Previous</span>
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            Card {currentIndex + 1} of {totalCards}
          </div>
          {isLast && (
            <button
              onClick={onReset}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '0.25rem', color: 'var(--accent-primary)' }}
              title="Restart Deck"
            >
              <RotateCcw size={13} />
              <span>Start Over</span>
            </button>
          )}
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onNext}
          disabled={isLast}
          title="Next Flashcard (ArrowRight)"
        >
          <span>Next</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1.25rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
        }}
      >
        <span>
          <kbd style={{ padding: '0.15rem 0.4rem', background: 'var(--bg-surface-elevated)', borderRadius: '3px', border: '1px solid var(--border-color)' }}>Space</kbd> Flip
        </span>
        <span>
          <kbd style={{ padding: '0.15rem 0.4rem', background: 'var(--bg-surface-elevated)', borderRadius: '3px', border: '1px solid var(--border-color)' }}>←</kbd> Prev
        </span>
        <span>
          <kbd style={{ padding: '0.15rem 0.4rem', background: 'var(--bg-surface-elevated)', borderRadius: '3px', border: '1px solid var(--border-color)' }}>→</kbd> Next
        </span>
      </div>
    </div>
  );
};
