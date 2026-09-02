import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Building your study set...',
}) => {
  return (
    <div
      className="card"
      style={{
        maxWidth: '560px',
        margin: '2.5rem auto',
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'var(--accent-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          color: 'var(--accent-primary)',
        }}
      >
        <Loader2 size={30} className="animate-spin" />
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        {message}
      </h3>
      <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '380px' }}>
        Synthesizing high-yield interview flashcards and active-recall quiz questions...
      </p>

      {/* Subtle Skeleton Loader Preview */}
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          marginTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            height: '14px',
            borderRadius: '4px',
            background: 'var(--bg-surface-elevated)',
            width: '80%',
            margin: '0 auto',
          }}
          className="animate-pulse"
        />
        <div
          style={{
            height: '14px',
            borderRadius: '4px',
            background: 'var(--bg-surface-elevated)',
            width: '60%',
            margin: '0 auto',
          }}
          className="animate-pulse"
        />
      </div>
    </div>
  );
};
