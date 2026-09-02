import React from 'react';
import { Layers, ArrowUp } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No study set yet.',
  description = 'Enter a topic above to generate your first study session.',
}) => {
  return (
    <div
      className="card"
      style={{
        maxWidth: '560px',
        margin: '2rem auto',
        padding: '3rem 2rem',
        textAlign: 'center',
        borderStyle: 'dashed',
        borderColor: 'var(--border-color)',
        background: 'transparent',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--bg-surface-elevated)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          border: '1px solid var(--border-color)',
        }}
      >
        <Layers size={24} />
      </div>

      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
        <ArrowUp size={16} />
        {description}
      </p>
    </div>
  );
};
