'use server';

/**
 * @fileOverview This file implements the personalized revision plan flow.
 *
 * The flow generates a revision plan based on the user's progress, difficulty levels,
 * and the spaced repetition method.
 *
 * - generateRevisionPlan - The main function to generate the revision plan.
 * - RevisionPlanInput - The input type for the generateRevisionPlan function.
 * - RevisionPlanOutput - The output type for the generateRevisionPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RevisionTopicSchema = z.object({
  topicId: z.string().describe('The ID of the topic.'),
  topicName: z.string().describe('The name of the topic.'),
  subjectId: z.string().describe('The ID of the subject the topic belongs to.'),
  subjectName: z.string().describe('The name of the subject the topic belongs to.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).nullable().describe('The difficulty level of the topic for the student.'),
  status: z.enum(['not-started', 'in-progress', 'completed', 'revision']).describe('The current status of the topic.'),
  lastRevisedDate: z.string().nullable().describe('The date the topic was last revised, in ISO format.'),
  timesRevised: z.number().describe('The number of times the topic has been revised.'),
  priority: z.enum(['high', 'medium', 'low']).describe('The priority of the topic for revision.'),
});

export type RevisionTopic = z.infer<typeof RevisionTopicSchema>;

const RevisionPlanInputSchema = z.object({
  topics: z.array(RevisionTopicSchema).describe('An array of topics with their details.'),
  spacedRepetitionIntervals: z.object({
    easy: z.number().describe('The interval (in days) for topics marked as easy.'),
    medium: z.number().describe('The interval (in days) for topics marked as medium.'),
    hard: z.number().describe('The interval (in days) for topics marked as hard.'),
  }).describe('The spaced repetition intervals for each difficulty level.'),
  currentDate: z.string().describe('The current date in ISO format.'),
});

export type RevisionPlanInput = z.infer<typeof RevisionPlanInputSchema>;

const RevisionPlanOutputSchema = z.object({
  revisionQueue: z.array(RevisionTopicSchema).describe('An array of topics sorted by revision priority.'),
});

export type RevisionPlanOutput = z.infer<typeof RevisionPlanOutputSchema>;

export async function generateRevisionPlan(input: RevisionPlanInput): Promise<RevisionPlanOutput> {
  return revisionPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'revisionPlanPrompt',
  input: {schema: RevisionPlanInputSchema},
  output: {schema: RevisionPlanOutputSchema},
  prompt: `You are an expert HSC exam preparation assistant. Your task is to generate a personalized revision plan for a student based on their progress, the difficulty levels of topics, and the principles of spaced repetition.

        The student has provided the following information about their topics:
        {{#each topics}}
        - Topic: {{topicName}} (Subject: {{subjectName}}, Difficulty: {{difficulty}}, Status: {{status}}, Last Revised: {{lastRevisedDate}}, Times Revised: {{timesRevised}}, Priority: {{priority}})
        {{/each}}

        The spaced repetition intervals are as follows:
        - Easy: {{spacedRepetitionIntervals.easy}} days
        - Medium: {{spacedRepetitionIntervals.medium}} days
        - Hard: {{spacedRepetitionIntervals.hard}} days

        Today's date is {{currentDate}}.

        Consider the following factors when generating the revision queue:
        1.  **Spaced Repetition:** Prioritize topics that are due for revision based on their last revised date and the spaced repetition intervals.
        2.  **Difficulty Level:** Give higher priority to topics marked as "hard".
        3.  **Priority:** Respect the student's priority settings (high, medium, low).
        4.  **Status:** Include topics with "in-progress" or "revision" status.
        5.  **Completeness:** Include completed topics that meet the spaced repetition criteria.

        The revision queue should be an array of topics sorted by revision priority, with the most important topics to revise first.
        Return ONLY a JSON object that contains an array named 'revisionQueue'.
`,
});

const revisionPlanFlow = ai.defineFlow(
  {
    name: 'revisionPlanFlow',
    inputSchema: RevisionPlanInputSchema,
    outputSchema: RevisionPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
