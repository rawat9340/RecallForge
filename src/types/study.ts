export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0, 1, 2, or 3
  explanation: string;
}

export interface StudySet {
  title: string;
  summary: string;
  difficulty: Difficulty;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface GenerateStudySetParams {
  topic: string;
  flashcardCount: 5 | 10 | 15;
  quizCount: 5 | 10;
  difficulty: Difficulty;
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'AI_PARSE_ERROR'
  | 'AI_SCHEMA_ERROR'
  | 'AI_API_ERROR'
  | 'NETWORK_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'INTERNAL_ERROR';

export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    message: string;
  };
}
