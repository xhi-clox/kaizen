'use client';

import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  type DocumentReference,
  type DocumentData,
  type CollectionReference,
} from 'firebase/firestore';
import { useState, useEffect, useContext, useMemo } from 'react';
import { FirebaseContext } from '../provider';

// NOTE: This is a placeholder for a real error handling solution.
// In a real app, you'd want to use a proper error reporting service.
const handleError = (error: any, context: string) => {
  console.error(`Firestore error in ${context}:`, error);
  // Here you could add a toast notification to the user, for example.
  // import { toast } from '@/hooks/use-toast';
  // toast({ variant: "destructive", title: "Database Error", description: error.message });
}

export function useCollection<T extends { id: string }>(collectionRef: CollectionReference | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collectionRef) {
        setLoading(false);
        setData([]);
        return;
    };

    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const result: T[] = [];
      snapshot.forEach((doc) => {
        result.push({ id: doc.id, ...doc.data() } as T);
      });
      setData(result);
      setLoading(false);
    }, (error) => {
        handleError(error, `useCollection (${collectionRef.path})`);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionRef]);

  const add = async (item: Omit<T, 'id'>) => {
    if (!collectionRef) return;
    try {
      return await addDoc(collectionRef, item as DocumentData);
    } catch (error) {
      handleError(error, `add to ${collectionRef.path}`);
    }
  };

  const update = async (id: string, item: Partial<T>) => {
    if (!collectionRef) return;
    const docRef = doc(collectionRef, id);
    try {
      return await updateDoc(docRef, item as DocumentData);
    } catch (error) {
      handleError(error, `update in ${collectionRef.path}`);
    }
  }

  const remove = async (id: string) => {
    if (!collectionRef) return;
    const docRef = doc(collectionRef, id);
    try {
      return await deleteDoc(docRef);
    } catch (error) {
      handleError(error, `remove from ${collectionRef.path}`);
    }
  }

  return { data, loading, add, update, remove };
}

export function useDoc<T>(ref: DocumentReference | null) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ref) {
            setData(null);
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(ref, (doc) => {
            if (doc.exists()) {
                setData(doc.data() as T);
            } else {
                setData(null);
            }
            setLoading(false);
        }, (error) => {
            handleError(error, `useDoc (${ref.path})`);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [ref]);
    
    const set = async (item: T) => {
        if (!ref) return;
        try {
          return await setDoc(ref, item, { merge: true });
        } catch (error) {
          handleError(error, `set for ${ref.path}`);
        }
    }

    return { data, loading, set };
}
