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
  name: z.string().describe('The name of the subject.'),
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
  prompt: `You are an expert on the Bangladesh National Curriculum and Textbook Board (NCTB) syllabus for the Higher Secondary Certificate (HSC) exam.

Your task is to generate a complete and accurate list of subjects, including all chapters and topics for the specified curriculum: {{{curriculumName}}}.

For each subject, provide:
1. A unique, visually distinct hex color code.
2. The total number of chapters.
3. A list of all chapters.
4. For each chapter, provide a list of all topics.

Generate the syllabus for the "Science Group". Include Physics, Chemistry, Biology, Higher Math, and ICT as the main subjects.

Return ONLY a JSON object that conforms to the output schema.
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
