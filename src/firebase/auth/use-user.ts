'use client';

import { useState, useEffect, useContext } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { FirebaseContext } from '../provider';
import type { UserProfile } from '@/lib/types';
import { useDoc } from '../firestore/use-data';

export function useUser() {
  const { auth, firestore } = useContext(FirebaseContext);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const userDocRef = user ? doc(firestore, 'users', user.uid) : null;
  const { data: userProfile, setData: setUserProfile } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  return { user, profile: userProfile, loading, setProfile: setUserProfile };
}


export function useAuth() {
    const { auth, firestore } = useContext(FirebaseContext);

    const signUp = async (email: string, password: string, name: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });

        const userProfile: UserProfile = {
            name,
            targetGPA: 5.0,
            examDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]
        };
        
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, userProfile);

        return userCredential;
    };

    const signIn = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logOut = () => {
        return signOut(auth);
    };

    return { signUp, signIn, logOut };
}
