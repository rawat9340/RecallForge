import { GenerateStudySetParams, StudySet, ApiErrorResponse } from '../types/study';

/**
 * Module-level AbortController instance.
 * WHY THIS EXISTS:
 * When a user triggers multiple generation requests in rapid succession (e.g. clicking "Generate",
 * then immediately changing their mind, modifying options, and clicking "Generate" again), network
 * latency variability could cause the older request (Request A) to resolve AFTER the newer request (Request B).
 * Without request cancellation, Request A would overwrite Request B's fresh state, displaying stale data.
 *
 * By maintaining an active AbortController reference, every new request cancels the in-flight one before
 * initiating, guaranteeing that only the latest initiated request can update application state.
 */
let activeAbortController: AbortController | null = null;

export class ApiError extends Error {
  public readonly code: string;
  public readonly isAborted: boolean;

  constructor(message: string, code: string = 'NETWORK_ERROR', isAborted = false) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.isAborted = isAborted;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Generates a study set by sending request parameters to the backend proxy.
 * Automatically manages request cancellation and maps controlled backend error responses.
 */
export const generateStudySet = async (
  params: GenerateStudySetParams
): Promise<StudySet> => {
  // Step 1: Cancel any existing in-flight request to eliminate race conditions
  if (activeAbortController) {
    activeAbortController.abort('Stale request cancelled in favor of newer request.');
  }

  // Step 2: Create a new AbortController for this current generation attempt
  activeAbortController = new AbortController();
  const currentSignal = activeAbortController.signal;

  try {
    const response = await fetch('/api/study/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal: currentSignal,
    });

    // If request was aborted during transit, immediately reject
    if (currentSignal.aborted) {
      throw new ApiError('Request was superseded by a newer request.', 'REQUEST_ABORTED', true);
    }

    // Handle non-200 responses cleanly using the standardized error schema
    if (!response.ok) {
      let errorPayload: ApiErrorResponse | null = null;
      try {
        errorPayload = (await response.json()) as ApiErrorResponse;
      } catch {
        // Fall back if response body is not JSON
      }

      const errorCode = errorPayload?.error?.code || 'NETWORK_ERROR';
      const errorMessage =
        errorPayload?.error?.message ||
        (response.status === 429
          ? 'Rate limit exceeded. Please wait a moment.'
          : response.status >= 500
          ? 'AI generation service temporarily unavailable. Please try again.'
          : 'Failed to generate study set. Please try again.');

      throw new ApiError(errorMessage, errorCode);
    }

    const data = (await response.json()) as StudySet;
    return data;
  } catch (error: any) {
    // If this error was caused by aborting the request, flag it cleanly
    if (error.name === 'AbortError' || currentSignal.aborted) {
      throw new ApiError('Request was superseded by a newer request.', 'REQUEST_ABORTED', true);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    // Generic network connectivity failure
    throw new ApiError(
      'Unable to connect to study generation service. Please check your network connection.',
      'NETWORK_ERROR'
    );
  } finally {
    // If this finished controller was still the active one, clear reference
    if (activeAbortController?.signal === currentSignal) {
      activeAbortController = null;
    }
  }
};
