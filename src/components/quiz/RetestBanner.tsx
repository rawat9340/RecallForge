import React from 'react';
import { RefreshCw, Target } from 'lucide-react';

interface RetestBannerProps {
  count: number;
  onRetest: () => void;
}

export const RetestBanner: React.FC<RetestBannerProps> = ({ count, onRetest }) => {
  if (count === 0) return null;

  return (
    <div
      style={{
        background: 'var(--warning-bg)',
        border: '1px solid var(--warning-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        margin: '1.5rem 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--warning)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Target size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
            Focus on Improvement
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Reinforce difficult concepts by practicing the questions you missed.
          </div>
        </div>
      </div>

      <button
        type="button"
        className="btn"
        style={{
          background: 'var(--warning)',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
        }}
        onClick={onRetest}
        id="retest-incorrect-btn"
      >
        <RefreshCw size={15} />
        <span>Retest {count} Incorrect {count === 1 ? 'Question' : 'Questions'}</span>
      </button>
    </div>
  );
};
