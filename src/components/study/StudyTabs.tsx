import React from 'react';
import { Layers, HelpCircle } from 'lucide-react';

export type StudyTab = 'flashcards' | 'quiz';

interface StudyTabsProps {
  activeTab: StudyTab;
  onTabChange: (tab: StudyTab) => void;
  flashcardCount: number;
  quizCount: number;
}

export const StudyTabs: React.FC<StudyTabsProps> = ({
  activeTab,
  onTabChange,
  flashcardCount,
  quizCount,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2rem',
        gap: '0.5rem',
      }}
      role="tablist"
      aria-label="Study modes"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'flashcards'}
        onClick={() => onTabChange('flashcards')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          fontSize: '0.9375rem',
          fontWeight: 600,
          background: 'none',
          border: 'none',
          borderBottom: `2px solid ${
            activeTab === 'flashcards' ? 'var(--accent-primary)' : 'transparent'
          }`,
          color: activeTab === 'flashcards' ? 'var(--accent-primary)' : 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        <Layers size={18} />
        <span>Flashcards</span>
        <span
          style={{
            fontSize: '0.75rem',
            padding: '0.15rem 0.45rem',
            borderRadius: '999px',
            background:
              activeTab === 'flashcards' ? 'var(--accent-glow)' : 'var(--bg-surface-elevated)',
            color: activeTab === 'flashcards' ? 'var(--accent-primary)' : 'var(--text-muted)',
          }}
        >
          {flashcardCount}
        </span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'quiz'}
        onClick={() => onTabChange('quiz')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          fontSize: '0.9375rem',
          fontWeight: 600,
          background: 'none',
          border: 'none',
          borderBottom: `2px solid ${
            activeTab === 'quiz' ? 'var(--accent-primary)' : 'transparent'
          }`,
          color: activeTab === 'quiz' ? 'var(--accent-primary)' : 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
        }}
      >
        <HelpCircle size={18} />
        <span>Interactive Quiz</span>
        <span
          style={{
            fontSize: '0.75rem',
            padding: '0.15rem 0.45rem',
            borderRadius: '999px',
            background: activeTab === 'quiz' ? 'var(--accent-glow)' : 'var(--bg-surface-elevated)',
            color: activeTab === 'quiz' ? 'var(--accent-primary)' : 'var(--text-muted)',
          }}
        >
          {quizCount}
        </span>
      </button>
    </div>
  );
};
