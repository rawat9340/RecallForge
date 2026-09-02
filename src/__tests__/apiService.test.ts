import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateStudySet, ApiError } from '../services/api';
import { GenerateStudySetParams } from '../types/study';

describe('API Service & Request Race Condition Handling', () => {
  const mockParams: GenerateStudySetParams = {
    topic: 'TypeScript Generics',
    difficulty: 'intermediate',
    flashcardCount: 5,
    quizCount: 5,
  };

  const mockSuccessfulResponse = {
    title: 'TypeScript Generics',
    summary: 'Mastering generics in TypeScript.',
    difficulty: 'intermediate',
    flashcards: [{ id: 'fc-1', question: 'What is a generic?', answer: 'A type variable' }],
    quiz: [
      {
        id: 'qz-1',
        question: 'Which syntax denotes a generic type parameter?',
        options: ['<T>', '(T)', '[T]', '{T}'],
        correctAnswer: 0,
        explanation: '<T> is standard syntax',
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('5. Successfully generates study set on valid API response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSuccessfulResponse,
    } as Response);

    const result = await generateStudySet(mockParams);
    expect(result.title).toBe('TypeScript Generics');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/study/generate',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('Cancels previous in-flight request when a new request starts (AbortController)', async () => {
    let capturedSignals: AbortSignal[] = [];

    global.fetch = vi.fn().mockImplementation((_url, options) => {
      capturedSignals.push(options.signal);
      return new Promise((resolve, reject) => {
        if (options.signal?.aborted) {
          const err = new Error('The user aborted a request.');
          err.name = 'AbortError';
          return reject(err);
        }

        options.signal?.addEventListener('abort', () => {
          const err = new Error('The user aborted a request.');
          err.name = 'AbortError';
          reject(err);
        });

        setTimeout(() => {
          resolve({
            ok: true,
            json: async () => mockSuccessfulResponse,
          });
        }, 80);
      });
    });

    // Start request 1 (slow)
    const request1Promise = generateStudySet(mockParams);

    // Immediately start request 2 before request 1 finishes
    const request2Promise = generateStudySet({
      ...mockParams,
      topic: 'JavaScript Closures',
    });

    // Request 1's signal should now be aborted
    expect(capturedSignals[0].aborted).toBe(true);

    // Request 1 should throw an ApiError with isAborted = true
    await expect(request1Promise).rejects.toThrow(ApiError);
    await expect(request1Promise).rejects.toMatchObject({
      isAborted: true,
      code: 'REQUEST_ABORTED',
    });

    // Request 2 completes cleanly
    const res2 = await request2Promise;
    expect(res2).toBeDefined();
  });

  it('Converts backend controlled errors into typed ApiError instances', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        error: {
          code: 'RATE_LIMIT_ERROR',
          message: 'Gemini rate limit exceeded.',
        },
      }),
    } as Response);

    await expect(generateStudySet(mockParams)).rejects.toMatchObject({
      code: 'RATE_LIMIT_ERROR',
      message: 'Gemini rate limit exceeded.',
    });
  });

  it('Handles network failure gracefully with user-friendly message', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    await expect(generateStudySet(mockParams)).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      message: expect.stringContaining('network connection'),
    });
  });
});
