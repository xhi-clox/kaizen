'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

import { useAuth, useUser } from './auth/use-user';
import { useCollection, useDoc } from './firestore/use-data';
import {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
} from './provider';

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseFirestore: Firestore | null = null;
let persistencePromise: Promise<void> | null = null;

function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} {
  if (getApps().length) {
    const app = getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    if (!persistencePromise) {
      persistencePromise = setPersistence(auth, browserLocalPersistence);
    }
    return { app, auth, firestore };
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  firebaseApp = app;
  firebaseAuth = auth;
  firebaseFirestore = firestore;

  persistencePromise = setPersistence(auth, browserLocalPersistence);

  return { app, auth, firestore };
}

export {
  initializeFirebase,
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useAuth,
  useUser,
  useCollection,
  useDoc,
};
