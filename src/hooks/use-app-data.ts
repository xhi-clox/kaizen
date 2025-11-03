
'use client';

import { useUser } from '@/firebase/auth/use-user';
import { useCollection, useDoc } from '@/firebase/firestore/use-data';
import {
  defaultProfile,
  defaultGoals,
  defaultStudySessions,
  defaultRoutine,
  defaultSettings,
} from '@/lib/data';
import type {
  UserProfile,
  Subject,
  Goals,
  StudySession,
  Routine,
  Settings,
  UserProgress,
} from '@/lib/types';
import { doc, collection } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import { useMemo } from 'react';

export const useProfile = () => {
    const { user, loading: userLoading } = useUser();
    const { firestore } = useFirebase();
    const userDocRef = useMemo(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
    const { data: profile, loading: profileLoading, set } = useDoc<UserProfile>(userDocRef);
    return [profile ?? defaultProfile, set, userLoading || profileLoading] as const;
}

export const useSubjects = () => {
    const { firestore } = useFirebase();
    const subjectsColRef = useMemo(() => collection(firestore, 'syllabus'), [firestore]);
    const { data, loading, add, update, remove } = useCollection<Subject>(subjectsColRef);
    return [data, { add, update, remove }, loading] as const;
}

export const useProgress = () => {
    const { user } = useUser();
    const { firestore } = useFirebase();
    const progressDocRef = useMemo(() => user ? doc(firestore, `users/${user.uid}/data/progress`) : null, [user, firestore]);
    const { data, loading, set } = useDoc<UserProgress>(progressDocRef);
    return [data ?? {}, set, loading] as const;
};

export const useGoals = () => {
    const { user } = useUser();
    const { firestore } = useFirebase();
    const goalsDocRef = useMemo(() => user ? doc(firestore, 'users', user.uid, 'data', 'goals') : null, [user, firestore]);
    const { data, loading, set } = useDoc<Goals>(goalsDocRef);
    return [data ?? defaultGoals, set, loading] as const;
}

export const useStudySessions = () => {
    const { user } = useUser();
    const { firestore } = useFirebase();
    const sessionsColRef = useMemo(() => user ? collection(firestore, `users/${user.uid}/sessions`) : null, [user, firestore]);
    const { data, loading, add } = useCollection<StudySession>(sessionsColRef);
    return [data, add, loading] as const;
}

export const useRoutine = () => {
    const { user } = useUser();
    const { firestore } = useFirebase();
    const routineDocRef = useMemo(() => user ? doc(firestore, 'users', user.uid, 'data', 'routine') : null, [user, firestore]);
    const { data, loading, set } = useDoc<Routine>(routineDocRef);
    return [data ?? defaultRoutine, set, loading] as const;
}

export const useSettings = () => {
    const { user } = useUser();
    const { firestore } = useFirebase();
    const settingsDocRef = useMemo(() => user ? doc(firestore, 'users', user.uid, 'data', 'settings') : null, [user, firestore]);
    const { data, loading, set } = useDoc<Settings>(settingsDocRef);
    return [data ?? defaultSettings, set, loading] as const;
}
