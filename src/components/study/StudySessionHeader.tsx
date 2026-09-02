import React from 'react';
import { RefreshCw, PlusCircle, Bookmark } from 'lucide-react';
import { Difficulty } from '../../types/study';

interface StudySessionHeaderProps {
  title: string;
  summary: string;
  difficulty: Difficulty;
  onRegenerate: () => void;
  onNewSession: () => void;
  isRegenerating: boolean;
}

export const StudySessionHeader: React.FC<StudySessionHeaderProps> = ({
  title,
  summary,
  difficulty,
  onRegenerate,
  onNewSession,
  isRegenerating,
}) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge badge-${difficulty}`}>
              <Bookmark size={12} />
              {difficulty}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Active Revision Session
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {title}
          </h1>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onRegenerate}
            disabled={isRegenerating}
            title="Regenerate this study set with fresh questions"
          >
            <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
            <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onNewSession}
            title="Start another study session"
          >
            <PlusCircle size={14} />
            <span>New Topic</span>
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '750px', lineHeight: 1.6 }}>
        {summary}
      </p>
    </div>
  );
};
