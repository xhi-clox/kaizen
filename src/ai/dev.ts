'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/adaptive-routine-generation.ts';
import '@/ai/flows/personalized-revision-plan.ts';
import '@/ai/flows/generate-syllabus-flow.ts';
