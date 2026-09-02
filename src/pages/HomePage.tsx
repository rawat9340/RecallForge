import React, { useState } from 'react';
import { Sparkles, BrainCircuit, BookMarked, Layers, HelpCircle, ArrowRight } from 'lucide-react';
import { Difficulty, GenerateStudySetParams } from '../types/study';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

interface HomePageProps {
  onGenerate: (params: GenerateStudySetParams) => void;
  isLoading: boolean;
  errorMessage: string | null;
  errorCode: string | null;
  onRetry: () => void;
}

const EXAMPLE_TOPICS = [
  'Operating Systems',
  'DBMS',
  'Computer Networks',
  'OOP',
  'Data Structures',
  'JavaScript',
  'System Design',
];

export const HomePage: React.FC<HomePageProps> = ({
  onGenerate,
  isLoading,
  errorMessage,
  errorCode,
  onRetry,
}) => {
  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [flashcardCount, setFlashcardCount] = useState<5 | 10 | 15>(10);
  const [quizCount, setQuizCount] = useState<5 | 10>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    onGenerate({
      topic: topic.trim(),
      difficulty,
      flashcardCount,
      quizCount,
    });
  };

  const handleSelectTopic = (sampleTopic: string) => {
    setTopic(sampleTopic);
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '840px' }}>
      {/* Hero Intro */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            background: 'var(--accent-glow)',
            border: '1px solid var(--border-color)',
            color: 'var(--accent-primary)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '1rem',
          }}
        >
          <BrainCircuit size={16} />
          Active Recall & Spaced Repetition Engine
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
          Turn knowledge into lasting memory.
        </h1>
        <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: '620px', margin: '0 auto' }}>
          Paste raw lecture notes, interview topics, or concept summaries. RecallForge validates and synthesizes them into structured interactive flashcards and scored quizzes.
        </p>
      </div>

      {/* Main Study Generation Form */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label htmlFor="study-topic-input" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookMarked size={18} color="var(--accent-primary)" />
                What do you want to learn?
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Free-form notes, concepts, or questions
              </span>
            </div>
            <textarea
              id="study-topic-input"
              className="form-textarea"
              placeholder="Paste your notes or enter a topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              required
              rows={5}
            />
          </div>

          {/* Configuration Grid */}
          <div className="controls-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="difficulty-select" className="form-label">
                Difficulty
              </label>
              <select
                id="difficulty-select"
                className="select-control"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                disabled={isLoading}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="flashcards-select" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Layers size={15} />
                Flashcards
              </label>
              <select
                id="flashcards-select"
                className="select-control"
                value={flashcardCount}
                onChange={(e) => setFlashcardCount(Number(e.target.value) as 5 | 10 | 15)}
                disabled={isLoading}
              >
                <option value={5}>5 Flashcards</option>
                <option value={10}>10 Flashcards</option>
                <option value={15}>15 Flashcards</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="quiz-select" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <HelpCircle size={15} />
                Quiz Questions
              </label>
              <select
                id="quiz-select"
                className="select-control"
                value={quizCount}
                onChange={(e) => setQuizCount(Number(e.target.value) as 5 | 10)}
                disabled={isLoading}
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>
          </div>

          {/* Primary CTA */}
          <div style={{ marginTop: '1.75rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.875rem' }}
              disabled={isLoading || !topic.trim()}
              id="generate-study-btn"
            >
              <Sparkles size={18} />
              <span>{isLoading ? 'Generating Study Set...' : 'Generate Study Set'}</span>
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </div>
        </form>

        {/* Quick Example Topics */}
        <div className="topic-pills-container">
          <div className="topic-pills-label">Example Topics</div>
          <div className="topic-pills">
            {EXAMPLE_TOPICS.map((item) => (
              <button
                key={item}
                type="button"
                className="topic-pill-btn"
                onClick={() => handleSelectTopic(item)}
                disabled={isLoading}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State Overlay / Feedback */}
      {isLoading && <LoadingState message="Building your study set..." />}

      {/* Error State with Retry Button */}
      {errorMessage && !isLoading && (
        <ErrorState
          title="Generation Error"
          message={errorMessage}
          errorCode={errorCode}
          onRetry={onRetry}
        />
      )}
    </div>
  );
};
