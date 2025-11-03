
'use server';

/**
 * @fileOverview A flow for generating a full syllabus for a given curriculum.
 *
 * - generateSyllabus - A function that generates the syllabus.
 * - GenerateSyllabusInput - The input type for the generateSyllabus function.
 * - GenerateSyllabusOutput - The return type for the generateSyllabus function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { nanoid } from 'nanoid';

const GenerateSyllabusInputSchema = z.object({
  curriculumName: z
    .string()
    .describe('The name of the curriculum, e.g., "NCTB HSC Science Group".'),
});

export type GenerateSyllabusInput = z.infer<
  typeof GenerateSyllabusInputSchema
>;

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
  totalChapters: z.number().describe('The total number of chapters.'),
  chapters: z
    .array(ChapterSchema)
    .describe('A list of chapters in this subject.'),
});

const GenerateSyllabusOutputSchema = z.object({
  subjects: z.array(SubjectSchema),
});

export type GenerateSyllabusOutput = z.infer<
  typeof GenerateSyllabusOutputSchema
>;

export async function generateSyllabus(
  input: GenerateSyllabusInput
): Promise<GenerateSyllabusOutput> {
  const result = await syllabusGenerationFlow(input);

  // Add unique IDs to the generated data structure, as the AI cannot generate them.
  const subjectsWithIds = result.subjects.map((subject) => ({
    ...subject,
    id: nanoid(),
    chapters: subject.chapters.map((chapter) => ({
      ...chapter,
      id: nanoid(),
      topics: chapter.topics.map((topic) => ({
        ...topic,
        id: nanoid(),
        status: 'not-started' as const,
        priority: 'medium' as const,
        difficulty: null,
        completedDate: null,
        revisionDates: [],
        timeSpent: 0,
        notes: '',
      })),
    })),
  }));

  return { subjects: subjectsWithIds };
}

const syllabusGenerationPrompt = ai.definePrompt({
  name: 'syllabusGenerationPrompt',
  input: { schema: GenerateSyllabusInputSchema },
  output: { schema: GenerateSyllabusOutputSchema },
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are a definitive expert on the Bangladesh National Curriculum and Textbook Board (NCTB) syllabus for the Higher Secondary Certificate (HSC) for the Science Group. Your knowledge is precise and up-to-date. Mistakes are not acceptable.

Your task is to generate a complete and accurate list of all subjects, including all chapters and topics for the specified curriculum: {{{curriculumName}}}.

You MUST include the following 13 subjects, treating 1st and 2nd papers as separate subjects:
1.  Bangla 1st Paper
2.  Bangla 2nd Paper
3.  English 1st Paper
4.  English 2nd Paper
5.  Information and Communication Technology (ICT)
6.  Physics 1st Paper
7.  Physics 2nd Paper
8.  Chemistry 1st Paper
9.  Chemistry 2nd Paper
10. Higher Math 1st Paper
11. Higher Math 2nd Paper
12. Biology 1st Paper
13. Biology 2nd Paper

For each of the 13 subjects, provide:
1. The full, correct subject name (e.g., "Physics 1st Paper").
2. A unique, visually distinct hex color code.
3. The total number of chapters.
4. A complete list of all official chapters.
5. For each chapter, a complete list of all official topics within that chapter.

Your response MUST be a JSON object that strictly conforms to the output schema. Do not add any commentary or text outside of the JSON object.
`,
});

const syllabusGenerationFlow = ai.defineFlow(
  {
    name: 'syllabusGenerationFlow',
    inputSchema: GenerateSyllabusInputSchema,
    outputSchema: GenerateSyllabusOutputSchema,
  },
  async (input) => {
    const { output } = await syllabusGenerationPrompt(input);
    return output!;
  }
);
