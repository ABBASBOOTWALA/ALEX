import { z } from 'zod';

const SectionSchema = z.object({
  id: z.enum(['headline', 'about', 'experience', 'skills', 'education', 'featured', 'engagement']),
  label: z.string(),
  score: z.number().min(0).max(100),
  weight: z.number(),
  critique: z.string(),
  issues: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
});

const ActionPlanItemSchema = z.object({
  rank: z.number(),
  section: z.string(),
  action: z.string(),
  impact: z.enum(['High', 'Medium', 'Low']).catch('Medium'),
  effort: z.enum(['Quick Win', '30 min', '1 hour', 'Half day']).catch('30 min'),
});

export const AuditResultSchema = z.object({
  overall_score: z.number().min(0).max(100),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']).catch('C'),
  grade_label: z.string().default('Profile Reviewed'),
  percentile: z.number().min(0).max(100).catch(50),
  alex_verdict: z.string(),
  sections: z.array(SectionSchema),
  action_plan: z.array(ActionPlanItemSchema).default([]),
  target_role_fit: z.string().default('No target role specified.'),
});

export const RewriteResponseSchema = z.object({
  rewrites: z.array(
    z.object({
      id: z.string(),
      before: z.string().default('Not provided'),
      after: z.string(),
    })
  ),
});
