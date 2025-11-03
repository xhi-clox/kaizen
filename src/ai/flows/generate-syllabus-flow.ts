
'use server';

/**
 * @fileOverview A flow for generating the global HSC syllabus.
 * This should be run once by a developer to seed the database.
 *
 * - generateAndSeedSyllabus - A function that generates and saves the syllabus to Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { nanoid } from 'nanoid';
import { collection, writeBatch, getFirestore, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const TopicSchema = z.object({
  name: z.string().describe('The name of the topic.'),
});

const ChapterSchema = z.object({
  name: z.string().describe('The name of the chapter.'),
  topics: z.array(TopicSchema).describe('A list of topics in this chapter.'),
});

const SubjectSchema = z.object({
  name: z.string().describe('The name of the subject, including paper if applicable (e.g., "Physics 1st Paper").'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .describe('A unique hex color code for the subject.'),
});

const GenerateSyllabusOutputSchema = z.object({
  subjects: z.array(SubjectSchema.extend({
    chapters: z.array(ChapterSchema).describe('A list of chapters in this subject.'),
  })),
});

export type GenerateSyllabusOutput = z.infer<typeof GenerateSyllabusOutputSchema>;

// This function is intended to be called from a script or admin panel, not from the UI directly.
export async function generateAndSeedSyllabus(): Promise<{ subjectCount: number }> {
  console.log("Starting syllabus generation...");
  const result = await syllabusGenerationFlow({ curriculumName: 'NCTB HSC Science Group' });
  console.log(`AI returned ${result.subjects.length} subjects. Processing...`);

  // Add unique IDs to the generated data structure
  const subjectsWithIds = result.subjects.map((subject, index) => ({
    ...subject,
    id: nanoid(),
    order: index, // Add order for consistent sorting
    totalChapters: subject.chapters.length,
    chapters: subject.chapters.map((chapter) => ({
      ...chapter,
      id: nanoid(),
      topics: chapter.topics.map((topic) => ({
        ...topic,
        id: nanoid(),
      })),
    })),
  }));

  // Initialize Firebase Admin (or client for script-based execution)
  const { firestore } = initializeFirebase();
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

const syllabusGenerationPrompt = ai.definePrompt({
  name: 'syllabusGenerationPrompt',
  input: { schema: z.object({ curriculumName: z.string() }) },
  output: { schema: GenerateSyllabusOutputSchema },
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are a definitive expert on the Bangladesh National Curriculum and Textbook Board (NCTB) syllabus for the Higher Secondary Certificate (HSC) for the Science Group. Your knowledge is precise and up-to-date for the latest curriculum. Mistakes are not acceptable.

Your task is to generate a complete and accurate list of all subjects, including all chapters and topics for the specified curriculum: {{{curriculumName}}}.

You MUST provide the subjects in this exact order:
1.  Bangla 1st Paper
2.  Bangla 2nd Paper
3.  English 1st Paper
4.  English 2nd Paper
5.  Information and Communication Technology (ICT)
6.  Physics 1st Paper
7.  Physics 2nd Paper
8.  Chemistry 1st Paper
9.  Chemistry 2nd Paper
10. Biology 1st Paper
11. Biology 2nd Paper
12. Higher Math 1st Paper
13. Higher Math 2nd Paper

For each of the 13 subjects, provide:
1. The full, correct subject name (e.g., "Physics 1st Paper").
2. A unique, visually distinct hex color code.
3. A complete list of all official chapters.
4. For each chapter, a complete list of all official topics within that chapter.

Your response MUST be a JSON object that strictly conforms to the output schema. Do not add any commentary or text outside of the JSON object.
`,
});

const syllabusGenerationFlow = ai.defineFlow(
  {
    name: 'syllabusGenerationFlow',
    inputSchema: z.object({ curriculumName: z.string() }),
    outputSchema: GenerateSyllabusOutputSchema,
  },
  async (input) => {
    const { output } = await syllabusGenerationPrompt(input);
    return output!;
  }
);
