export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type StudyMode = 'Learn Mode' | 'Revision Mode' | 'Exam Mode';

export interface MCQOptions {
  A: string;
  B: string;
  C: string;
  D: string;
  [key: string]: string;
}

export interface QuizQuestion {
  type: 'mcq' | 'short';
  question: string;
  options?: MCQOptions;
  answer: string;
}

export interface StudyMaterial {
  topic: string;
  difficulty: DifficultyLevel;
  study_mode: StudyMode;
  explanation: string;
  summary: string;
  important_points: string;
  quiz: QuizQuestion[];
  raw?: string;
  timestamp?: string;
}

export interface CompareResult {
  topic_a: string;
  topic_b: string;
  overview: string;
  similarities: string;
  differences: string;
  use_cases: string;
  summary: string;
  raw?: string;
  timestamp?: string;
}

export interface HistoryItem {
  id: string;
  topic: string;
  difficulty: DifficultyLevel;
  study_mode: StudyMode;
  timestamp: string;
}

export interface FavoriteItem {
  id: string;
  topic: string;
  difficulty: DifficultyLevel;
  study_mode: StudyMode;
  timestamp: string;
}

export interface ScheduleSuggestion {
  topic: string;
  reason: string;
}

export interface QuizGradeResult {
  verdict: 'correct' | 'partial' | 'incorrect' | 'empty';
  feedback: string;
  source: 'ai' | 'heuristic';
}

export interface UserProfile {
  username: string;
  streakCount: number;
  lastActiveDate: string;
  theme: 'dark' | 'light';
  notes: Record<string, string>;
}
