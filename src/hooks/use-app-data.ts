'use client';

import { useLocalStorage } from './use-local-storage';
import {
  defaultProfile,
  defaultSubjects,
  defaultGoals,
  defaultStudySessions,
  defaultRoutine,
  defaultSettings,
  sampleSubjects,
} from '@/lib/data';
import type {
  UserProfile,
  Subject,
  Goals,
  StudySession,
  Routine,
  Settings,
} from '@/lib/types';
import { useCallback } from 'react';
import { nanoid } from 'nanoid';

export const useProfile = () => useLocalStorage<UserProfile>('hsc-profile', defaultProfile);
export const useSubjects = () => useLocalStorage<Subject[]>('hsc-subjects', defaultSubjects);
export const useGoals = () => useLocalStorage<Goals>('hsc-goals', defaultGoals);
export const useStudySessions = () => useLocalStorage<StudySession[]>('hsc-sessions', defaultStudySessions);
export const useRoutine = () => useLocalStorage<Routine>('hsc-routine', defaultRoutine);
export const useSettings = () => useLocalStorage<Settings>('hsc-settings', defaultSettings);

export function useAppData() {
  const [profile, setProfile] = useProfile();
  const [subjects, setSubjects] = useSubjects();
  const [goals, setGoals] = useGoals();
  const [sessions, setSessions] = useStudySessions();
  const [routine, setRoutine] = useRoutine();
  const [settings, setSettings] = useSettings();

  const setupQuickStart = useCallback((name: string, examDate: string) => {
    setProfile({ name, examDate, targetGPA: 5.0 });
    const subjectsWithIds = sampleSubjects.map(s => ({...s, id: nanoid()}));
    setSubjects(subjectsWithIds);
    setGoals(prev => ({
        ...prev,
        exam: {
            ...prev.exam,
            examDate: examDate,
            targetGPA: 5.0,
            subjectTargets: subjectsWithIds.map(s => ({ subjectId: s.id, targetMarks: 85 }))
        }
    }));
  }, [setProfile, setSubjects, setGoals]);

  const setupFreshStart = useCallback((name: string, examDate: string) => {
    setProfile({ name, examDate, targetGPA: 5.0 });
    setSubjects(defaultSubjects);
     setGoals(prev => ({
        ...prev,
        exam: {
            ...prev.exam,
            examDate: examDate,
            targetGPA: 5.0,
            subjectTargets: []
        }
    }));
  }, [setProfile, setSubjects, setGoals]);

  const resetData = useCallback(() => {
    setProfile(defaultProfile);
    setSubjects(defaultSubjects);
    setGoals(defaultGoals);
    setSessions(defaultStudySessions);
    setRoutine(defaultRoutine);
    setSettings(defaultSettings);
  }, [setProfile, setSubjects, setGoals, setSessions, setRoutine, setSettings]);

  return {
    profile,
    subjects,
    goals,
    sessions,
    routine,
    settings,
    setProfile,
    setSubjects,
    setGoals,
    setSessions,
    setRoutine,
    setSettings,
    setupQuickStart,
    setupFreshStart,
    resetData,
  };
}
