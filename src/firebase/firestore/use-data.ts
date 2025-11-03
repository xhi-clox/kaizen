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
  type CollectionReference,
  type DocumentData,
} from 'firebase/firestore';
import { useState, useEffect, useContext, useMemo } from 'react';
import { FirebaseContext } from '../provider';
import { useUser } from '../auth/use-user';


export function useCollection<T>(path: string, uid?: string | null) {
  const { firestore } = useContext(FirebaseContext);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const collectionRef = useMemo(() => {
      if (!firestore || !uid) return null;
      return collection(firestore, 'users', uid, path);
  }, [firestore, path, uid]);

  useEffect(() => {
    if (!collectionRef) {
        setLoading(false);
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
        console.error(`Error fetching collection ${path}:`, error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionRef, path]);

  const add = async (item: Omit<T, 'id'>) => {
    if (!collectionRef) return;
    return await addDoc(collectionRef, item as DocumentData);
  };

  const update = async (id: string, item: Partial<T>) => {
    if (!collectionRef) return;
    const docRef = doc(collectionRef, id);
    return await updateDoc(docRef, item as DocumentData);
  }

  const remove = async (id: string) => {
    if (!collectionRef) return;
    const docRef = doc(collectionRef, id);
    return await deleteDoc(docRef);
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
            console.error(`Error fetching doc ${ref.path}:`, error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [ref]);

    const update = async (item: Partial<T>) => {
        if (!ref) return;
        return await updateDoc(ref, item as DocumentData);
    }
    
    const set = async (item: T) => {
        if (!ref) return;
        return await setDoc(ref, item as DocumentData);
    }

    return { data, loading, update, set };
}
