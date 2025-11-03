import type { Subject, WeekDay } from './types';
import { nanoid } from 'nanoid';

const generateTopics = (count: number, prefix: string) =>
  Array.from({ length: count }, (_, i) => ({
    id: nanoid(),
    name: `${prefix} Topic ${i + 1}`,
    status: 'not-started' as const,
    priority: 'medium' as const,
    difficulty: null,
    completedDate: null,
    revisionDates: [],
    timeSpent: 0,
    notes: '',
  }));

const generateChapters = (chapterNames: string[], topicPrefix: string) =>
  chapterNames.map((name) => ({
    id: nanoid(),
    name,
    topics: generateTopics(5, name), // 5 dummy topics per chapter
  }));

export const NCTB_SUBJECTS: Omit<Subject, 'id'>[] = [
  {
    name: 'Physics',
    color: '#3498db',
    totalChapters: 12,
    chapters: generateChapters(
      [...Array(12).keys()].map((i) => `Physics Chapter ${i + 1}`),
      'Physics'
    ),
  },
  {
    name: 'Chemistry',
    color: '#e74c3c',
    totalChapters: 11,
    chapters: generateChapters(
      [...Array(11).keys()].map((i) => `Chemistry Chapter ${i + 1}`),
      'Chemistry'
    ),
  },
  {
    name: 'Biology',
    color: '#2ecc71',
    totalChapters: 12,
    chapters: generateChapters(
      [...Array(12).keys()].map((i) => `Biology Chapter ${i + 1}`),
      'Biology'
    ),
  },
  {
    name: 'Higher Math',
    color: '#9b59b6',
    totalChapters: 11,
    chapters: generateChapters(
      [...Array(11).keys()].map((i) => `Higher Math Chapter ${i + 1}`),
      'Higher Math'
    ),
  },
  {
    name: 'ICT',
    color: '#f1c40f',
    totalChapters: 6,
    chapters: generateChapters(
      [...Array(6).keys()].map((i) => `ICT Chapter ${i + 1}`),
      'ICT'
    ),
  },
];

export const WEEK_DAYS: WeekDay[] = [
    'saturday',
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
];
