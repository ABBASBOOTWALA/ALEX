import { z } from 'zod';

const PrepQuestionSchema = z.object({
  q: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']).catch('medium'),
  framework: z.string().default(''),
  sampleAnswer: z.string().default(''),
  topic: z.string().default(''),
});

export const InterviewKitSchema = z.object({
  extracted: z.object({
    skills: z.array(z.string()).default([]),
    domain: z.string().default(''),
    seniority: z.string().default(''),
    roleType: z.enum(['technical', 'non-technical']).catch('technical'),
    responsibilities: z.array(z.string()).default([]),
  }),
  mustKnow: z.array(z.object({
    topic: z.string(),
    why: z.string().default(''),
  })).default([]),
  technical: z.array(PrepQuestionSchema).default([]),
  behavioral: z.array(PrepQuestionSchema).default([]),
  coding: z.array(PrepQuestionSchema).default([]),
  systemDesign: z.array(PrepQuestionSchema).default([]),
  revisionPlan: z.array(z.object({
    slot: z.string(),
    title: z.string(),
    topics: z.array(z.string()).default([]),
  })).default([]),
});
