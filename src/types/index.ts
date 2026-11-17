export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectPayload {
  name: string;
  code: string;
  description?: string;
}

export interface Exam {
  _id: string;
  title: string;
  subjectId: Subject | string;
  userId: string;
  examDate: string;
  venue: string;
  duration: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamPayload {
  title: string;
  subjectId: string;
  examDate: string;
  venue?: string;
  duration?: number;
  notes?: string;
}

export interface Note {
  _id: string;
  title: string;
  subjectId: Subject | string;
  userId: string;
  fileName: string;
  filePath: string;
  extractedText: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyTask {
  topic: string;
  duration: string;
  notes: string;
}

export interface DayPlan {
  day: number;
  date: string;
  tasks: StudyTask[];
}

export interface StudyPlan {
  _id: string;
  subjectId: Subject | string;
  userId: string;
  examDate: string;
  dailyStudyHours: number;
  topics: string[];
  rawPlan: string;
  schedule: DayPlan[];
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlanPayload {
  subjectId: string;
  examDate: string;
  dailyStudyHours: number;
  topics: string[];
}

export interface Question {
  type: 'mcq' | 'structured' | 'essay';
  question: string;
  options: string[];
  answer: string;
  marks: number;
}

export interface GeneratedPaper {
  _id: string;
  title: string;
  subjectId: Subject | string;
  userId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  duration: number;
  questions: Question[];
  rawResponse: string;
  pdfPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratePaperPayload {
  subjectId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  duration?: number;
  questionTypes?: string[];
}

export interface AnswerItem {
  questionIndex: number;
  question: string;
  questionType: 'mcq' | 'structured' | 'essay';
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  marksAwarded: number;
  maxMarks: number;
  aiFeedback: string;
}

export interface AIAnalysis {
  strongAreas: string[];
  weakAreas: string[];
  summary: string;
}

export interface ExamResult {
  _id: string;
  paperId: GeneratedPaper | string;
  subjectId: Subject | string;
  userId: string;
  answers: AnswerItem[];
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  aiAnalysis: AIAnalysis;
  timeTaken: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitAnswerItem {
  questionIndex: number;
  studentAnswer: string;
}

export interface SubmitExamPayload {
  paperId: string;
  answers: SubmitAnswerItem[];
  timeTaken: number;
}

export interface DashboardStats {
  totalSubjects: number;
  upcomingExamsCount: number;
  completedPapers: number;
  averageScore: number;
  totalNotes: number;
  studyProgress: number;
  daysUntilNextExam: number | null;
}

export interface SubjectWiseScore {
  subjectName: string;
  averageScore: number;
  attempts: number;
}

export interface WeeklyPerformance {
  day: string;
  averageScore: number;
  attempts: number;
}

export interface RecentResult {
  _id: string;
  paperTitle: string;
  subjectName: string;
  percentage: number;
  submittedAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  upcomingExams: Exam[];
  recentResults: RecentResult[];
  charts: {
    subjectWiseScores: SubjectWiseScore[];
    weeklyPerformance: WeeklyPerformance[];
  };
}

export interface SubjectAnalytics {
  subject: Subject;
  stats: {
    totalNotes: number;
    totalPapers: number;
    totalAttempts: number;
    averageScore: number;
    bestScore: number;
  };
  upcomingExam: Exam | null;
  hasStudyPlan: boolean;
  notes: Note[];
  scoreProgression: { attempt: number; score: number; date: string }[];
  weakAreas: string[];
  strongAreas: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
