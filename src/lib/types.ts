
export type Topic = {
  id: string;
  name: string;
};

export type Chapter = {
  id: string;
  name: string;
  topics: Topic[];
};

export type Subject = {
  id: string;
  name: string;
  color: string;
  totalChapters: number;
  chapters: Chapter[];
};

export type UserProgress = {
  [topicId: string]: {
    status: 'not-started' | 'in-progress' | 'completed' | 'revision';
    priority: 'high' | 'medium' | 'low';
    difficulty: 'easy' | 'medium' | 'hard' | null;
    completedDate: number | null; // timestamp
    revisionDates: number[]; // timestamps
    timeSpent: number; // minutes
    notes: string;
  };
};

export type DailyGoal = {
  date: string; // YYYY-MM-DD
  studyHours: number;
  topicsToComplete: number;
  completed: boolean;
  actualHours: number;
  actualTopics: number;
};

export type WeeklyGoal = {
  weekStart: string; // YYYY-MM-DD
  targets: { subjectId: string; chaptersToComplete: number }[];
  revisionHours: number;
  mockTests: number;
};

export type MonthlyGoal = {
  month: string; // YYYY-MM
  milestones: { subjectId: string; targetCompletion: number }[];
};

export type ExamGoal = {
  targetGPA: number;
  examDate: string; // YYYY-MM-DD
  subjectTargets: { subjectId: string; targetMarks: number }[];
};

export type Goals = {
  daily: DailyGoal[];
  weekly: WeeklyGoal[];
  monthly: MonthlyGoal[];
  exam: ExamGoal;
};

export type StudySession = {
  id: string;
  date: number; // timestamp
  subjectId: string;
  topicId: string;
  duration: number; // minutes
  sessionType: 'study' | 'revision' | 'practice';
  notes: string;
  productive: boolean;
};

export type RoutineSlot = {
  id: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  subjectId: string | 'break' | 'prayer' | 'other';
  activity: 'study' | 'revision' | 'practice' | 'break' | 'prayer' | 'other';
  isFlexible: boolean;
};

export type WeekDay = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export type DailyRoutine = {
  day: WeekDay;
  slots: RoutineSlot[];
};

export type Routine = {
  weekSchedule: DailyRoutine[];
};

export type UserProfile = {
  name: string;
  targetGPA: number;
  examDate: string; // YYYY-MM-DD
};

export type Settings = {
  dailyStudyHoursGoal: number;
  pomodoro: {
    work: number;
    shortBreak: number;
    longBreak: number;
  };
  spacedRepetitionIntervals: number[];
};
