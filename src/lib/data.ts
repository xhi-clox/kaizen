import { nanoid } from 'nanoid';
import { addDays, format, startOfWeek } from 'date-fns';
import type { UserProfile, Settings, Goals, Subject, Routine } from './types';
import { NCTB_SUBJECTS, WEEK_DAYS } from './constants';

const tomorrow = addDays(new Date(), 1);

export const defaultProfile: UserProfile = {
  name: 'Loading...',
  targetGPA: 5.0,
  examDate: format(addDays(new Date(), 180), 'yyyy-MM-dd'),
};

export const defaultSettings: Settings = {
  dailyStudyHoursGoal: 6,
  pomodoro: {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
  },
  spacedRepetitionIntervals: [1, 3, 7, 15, 30],
};

const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 6 }); // Saturday

export const defaultGoals: Goals = {
  daily: [],
  weekly: [
    {
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        targets: [],
        revisionHours: 5,
        mockTests: 1,
    }
  ],
  monthly: [],
  exam: {
    targetGPA: 5.0,
    examDate: format(addDays(today, 180), 'yyyy-MM-dd'),
    subjectTargets: [],
  },
};

export const sampleSubjects: Subject[] = NCTB_SUBJECTS.slice(0, 3).map(
  (subject) => ({
    ...subject,
    id: nanoid(),
  })
);

export const defaultSubjects: Subject[] = [];

export const defaultStudySessions: any[] = [];

export const defaultRoutine: Routine = {
    weekSchedule: WEEK_DAYS.map(day => ({ day, slots: [] }))
}
