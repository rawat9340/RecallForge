import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { HomePage } from './pages/HomePage';
import { StudySessionPage } from './pages/StudySessionPage';
import { useStudySession } from './hooks/useStudySession';

export const App: React.FC = () => {
  // Theme state: dark (default) or light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('recallforge_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const {
    studyData,
    isLoading,
    errorMessage,
    errorCode,
    generate,
    retry,
    resetSession,
  } = useStudySession();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('recallforge_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev: 'dark' | 'light') => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onNewSession={resetSession}
        hasActiveSession={Boolean(studyData)}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {studyData ? (
          <StudySessionPage
            studySet={studyData}
            onRegenerate={retry}
            onNewSession={resetSession}
            isRegenerating={isLoading}
          />
        ) : (
          <HomePage
            onGenerate={generate}
            isLoading={isLoading}
            errorMessage={errorMessage}
            errorCode={errorCode}
            onRetry={retry}
          />
        )}
      </main>

      {/* Clean, minimalist footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '1.25rem 0',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          marginTop: 'auto',
        }}
      >
        <div className="container">
          RecallForge &mdash; Turn knowledge into lasting memory. Built with React, TypeScript & Gemini.
        </div>
      </footer>
    </div>
  );
};

export default App;
