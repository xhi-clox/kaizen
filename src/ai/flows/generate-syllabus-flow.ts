
'use server';

/**
 * @fileOverview A flow for seeding the global HSC syllabus from a manually curated data file.
 * This should be run once by a developer/administrator to populate the database.
 *
 * - generateAndSeedSyllabus - A function that saves the syllabus to Firestore.
 */

import { collection, writeBatch, getFirestore, doc, getDocs } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { NCTB_HSC_SYLLABUS } from '@/lib/syllabus-data';

// This function is intended to be called from a script or an admin panel, not from the main UI.
export async function generateAndSeedSyllabus(): Promise<{ subjectCount: number }> {
  console.log("Starting syllabus seeding from manual data file...");

  // Initialize Firebase app for server-side usage
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(app);

  const subjectsWithIds = NCTB_HSC_SYLLABUS;
  const syllabusRef = collection(firestore, 'syllabus');

  console.log("Deleting existing syllabus...");
  const existingDocs = await getDocs(syllabusRef);
  const deleteBatch = writeBatch(firestore);
  existingDocs.forEach(doc => deleteBatch.delete(doc.ref));
  await deleteBatch.commit();
  console.log("Existing syllabus deleted.");

  console.log("Seeding new syllabus to Firestore...");
  const seedBatch = writeBatch(firestore);
  subjectsWithIds.forEach((subject) => {
    const docRef = doc(syllabusRef, subject.id);
    seedBatch.set(docRef, subject);
  });
  await seedBatch.commit();
  console.log(`Successfully seeded ${subjectsWithIds.length} subjects to Firestore.`);

  return { subjectCount: subjectsWithIds.length };
}
