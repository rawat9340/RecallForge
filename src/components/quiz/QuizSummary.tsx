import React from 'react';
import { Award, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { QuizQuestion } from '../../types/study';
import { RetestBanner } from './RetestBanner';

interface QuizSummaryProps {
  score: number;
  total: number;
  percentage: number;
  incorrectQuestions: QuizQuestion[];
  isRetestMode: boolean;
  onReset: () => void;
  onRetest: () => void;
}

export const QuizSummary: React.FC<QuizSummaryProps> = ({
  score,
  total,
  percentage,
  incorrectQuestions,
  isRetestMode,
  onReset,
  onRetest,
}) => {
  const isMastered = percentage >= 80;

  return (
    <div className="card quiz-container" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
      {/* Trophy / Status Icon */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: isMastered ? 'var(--success-bg)' : 'var(--accent-glow)',
          color: isMastered ? 'var(--success)' : 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          border: `1px solid ${isMastered ? 'var(--success-border)' : 'var(--border-color)'}`,
        }}
      >
        <Award size={36} />
      </div>

      <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
        {isRetestMode ? 'Retest Complete!' : 'Quiz Complete!'}
      </h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        {isMastered
          ? 'Outstanding mastery of this material! Ready for technical interviews.'
          : 'Great effort! Review the missed concepts below to lock them into memory.'}
      </p>

      {/* Score Card */}
      <div
        style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          maxWidth: '360px',
          margin: '0 auto 1.5rem auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
        }}
      >
        <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Score
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {score} / {total}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Percentage
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: isMastered ? 'var(--success)' : 'var(--accent-primary)',
              marginTop: '0.25rem',
            }}
          >
            {percentage}%
          </div>
        </div>
      </div>

      {/* Retest Banner for wrong answers (Section 11) */}
      <RetestBanner count={incorrectQuestions.length} onRetest={onRetest} />

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-secondary" onClick={onReset}>
          <RotateCcw size={16} />
          <span>Restart Full Quiz</span>
        </button>
      </div>

      {/* Breakdown Checklist */}
      <div style={{ marginTop: '2.5rem', textAlign: 'left' }}>
        <h3 style={{ fontSize: '1.0625rem', marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          Question Breakdown
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {incorrectQuestions.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.9rem' }}>
              <CheckCircle2 size={18} />
              <span>All questions answered correctly on this attempt!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontSize: '0.875rem' }}>
              <AlertTriangle size={18} />
              <span>{incorrectQuestions.length} question(s) need review. Practice them with the retest button above.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
