import { useState, useCallback, useRef } from 'react';
import { GenerateStudySetParams, StudySet } from '../types/study';
import { generateStudySet, ApiError } from '../services/api';

export interface UseStudySessionReturn {
  studyData: StudySet | null;
  isLoading: boolean;
  errorMessage: string | null;
  errorCode: string | null;
  generate: (params: GenerateStudySetParams) => Promise<void>;
  retry: () => Promise<void>;
  resetSession: () => void;
}

/**
 * Custom hook to manage study session generation lifecycle.
 * Manages loading state, error reporting, retry cache, and study set data.
 */
export const useStudySession = (): UseStudySessionReturn => {
  const [studyData, setStudyData] = useState<StudySet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Keep a reference to the last submitted parameters to support one-click retries
  const lastParamsRef = useRef<GenerateStudySetParams | null>(null);

  const generate = useCallback(async (params: GenerateStudySetParams) => {
    lastParamsRef.current = params;
    setIsLoading(true);
    setErrorMessage(null);
    setErrorCode(null);

    try {
      const data = await generateStudySet(params);
      setStudyData(data);
    } catch (err: any) {
      // If request was aborted because the user initiated a newer request, ignore quietly
      if (err instanceof ApiError && err.isAborted) {
        return;
      }

      const code = err instanceof ApiError ? err.code : 'UNKNOWN_ERROR';
      const msg =
        err instanceof ApiError
          ? err.message
          : "Couldn't understand the AI response. Please try again.";

      setErrorCode(code);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const retry = useCallback(async () => {
    if (lastParamsRef.current) {
      await generate(lastParamsRef.current);
    }
  }, [generate]);

  const resetSession = useCallback(() => {
    setStudyData(null);
    setErrorMessage(null);
    setErrorCode(null);
    setIsLoading(false);
    lastParamsRef.current = null;
  }, []);

  return {
    studyData,
    isLoading,
    errorMessage,
    errorCode,
    generate,
    retry,
    resetSession,
  };
};
