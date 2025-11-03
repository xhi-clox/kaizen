'use server';

/**
 * @fileOverview A flow for generating an adaptive study routine based on student's syllabus, exam date,
 * available study hours, and subject priorities.
 *
 * - generateAdaptiveRoutine - A function that generates the adaptive study routine.
 * - AdaptiveRoutineInput - The input type for the generateAdaptiveRoutine function.
 * - AdaptiveRoutineOutput - The return type for the generateAdaptiveRoutine function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveRoutineInputSchema = z.object({
  examDate: z.string().describe('The date of the HSC exam (DD/MM/YYYY).'),
  availableStudyHoursPerDay: z
    .number()
    .describe('The number of hours available for study each day.'),
  subjectPriorities: z
    .record(z.string(), z.enum(['high', 'medium', 'low']))
    .describe(
      'A map of subject IDs to their priority (high, medium, or low).  Keys are subject IDs.'
    ),
  syllabus: z.array(
    z.object({
      id: z.string().describe('The subject ID.'),
      name: z.string().describe('The subject name.'),
      totalChapters: z.number().describe('The total number of chapters in the subject.'),
      chapters: z.array(
        z.object({
          id: z.string().describe('The chapter ID.'),
          name: z.string().describe('The chapter name.'),
          topics: z.array(
            z.object({
              id: z.string().describe('The topic ID.'),
              name: z.string().describe('The topic name.'),
              status: z.enum(['not-started', 'in-progress', 'completed', 'revision']).describe('The current status of the topic.'),
            })
          ).describe('The topics in the chapter')
        })
      ).describe('The chapters in the subject.'),
    })
  ).describe('The syllabus data, including subjects, chapters, and topics.'),
});

export type AdaptiveRoutineInput = z.infer<typeof AdaptiveRoutineInputSchema>;

const AdaptiveRoutineOutputSchema = z.object({
  weeklySchedule: z.array(
    z.object({
      day: z.enum([
        'saturday',
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
      ]).describe('The day of the week.'),
      slots: z.array(
        z.object({
          startTime: z.string().describe('The start time of the slot (HH:MM).'),
          endTime: z.string().describe('The end time of the slot (HH:MM).'),
          subjectId: z.string().describe('The subject ID for this slot.'),
          activity: z
            .enum(['study', 'revision', 'practice', 'break', 'prayer'])
            .describe('The activity for this slot.'),
          isFlexible: z.boolean().describe('Whether the slot is flexible.'),
        })
      ).describe('The time slots for the day.'),
    })
  ).describe('The generated weekly study schedule.'),
});

export type AdaptiveRoutineOutput = z.infer<typeof AdaptiveRoutineOutputSchema>;

export async function generateAdaptiveRoutine(
  input: AdaptiveRoutineInput
): Promise<AdaptiveRoutineOutput> {
  return adaptiveRoutineFlow(input);
}

const adaptiveRoutinePrompt = ai.definePrompt({
  name: 'adaptiveRoutinePrompt',
  input: {schema: AdaptiveRoutineInputSchema},
  output: {schema: AdaptiveRoutineOutputSchema},
  prompt: `You are an expert study schedule generator for HSC students.

  Given the following information about the student's exam date, available study hours, subject priorities, and syllabus, generate a personalized study routine.

  Exam Date: {{{examDate}}}
  Available Study Hours Per Day: {{{availableStudyHoursPerDay}}}
  Subject Priorities: {{{subjectPriorities}}}
  Syllabus: {{{syllabus}}}

  Consider the following when generating the routine:

  - The routine should cover all subjects in the syllabus.
  - Subjects with higher priority should be allocated more study time.
  - The routine should be balanced and sustainable.
  - The routine should take into account the exam date and the amount of material that needs to be covered.

  Return a weekly schedule with time slots for each day, including the subject, activity, and whether the slot is flexible.
  The format should be JSON that conforms to the AdaptiveRoutineOutputSchema schema, specifically the weeklySchedule field.
  `,    
});

const adaptiveRoutineFlow = ai.defineFlow(
  {
    name: 'adaptiveRoutineFlow',
    inputSchema: AdaptiveRoutineInputSchema,
    outputSchema: AdaptiveRoutineOutputSchema,
  },
  async input => {
    const {output} = await adaptiveRoutinePrompt(input);
    return output!;
  }
);

