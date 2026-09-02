import React from 'react';
import { Sparkles, Moon, Sun, BookOpen } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onNewSession?: () => void;
  hasActiveSession?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onNewSession,
  hasActiveSession = false,
}) => {
  return (
    <header className="header">
      <div className="container header-content">
        <div
          className="brand"
          onClick={onNewSession}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onNewSession?.();
            }
          }}
          title="RecallForge Home"
        >
          <div className="brand-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="brand-title">RecallForge</span>
              <span className="brand-badge">AI Assistant</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Turn knowledge into lasting memory.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {hasActiveSession && onNewSession && (
            <button
              onClick={onNewSession}
              className="btn btn-secondary btn-sm"
              title="Start another study session"
            >
              <BookOpen size={15} />
              <span>New Session</span>
            </button>
          )}

          <button
            onClick={onToggleTheme}
            className="theme-toggle-btn"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
