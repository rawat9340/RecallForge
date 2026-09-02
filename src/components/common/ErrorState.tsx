import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  errorCode?: string | null;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  errorCode,
}) => {
  return (
    <div
      className="card"
      style={{
        maxWidth: '560px',
        margin: '2rem auto',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        borderColor: 'var(--error-border)',
        background: 'var(--bg-surface)',
      }}
      role="alert"
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--error-bg)',
          color: 'var(--error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          border: '1px solid var(--error-border)',
        }}
      >
        <AlertCircle size={28} />
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {message}
      </p>

      {errorCode && (
        <div
          style={{
            display: 'inline-block',
            marginBottom: '1.5rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '4px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}
        >
          Code: {errorCode}
        </div>
      )}

      {onRetry && (
        <div>
          <button onClick={onRetry} className="btn btn-primary" type="button">
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      )}
    </div>
  );
};
