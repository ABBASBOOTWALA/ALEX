import { anthropic } from '@/lib/anthropic';
import { ALEX_SYSTEM_PROMPT, ALEX_REWRITE_PROMPT } from '@/lib/alex-prompt';
import { INTERVIEW_SYSTEM_PROMPT } from '@/lib/interview-prompt';
import { AuditResultSchema, RewriteResponseSchema } from '@/lib/audit-schema';
import { InterviewKitSchema } from '@/lib/interview-schema';

export const maxDuration = 60;

export async function POST(request: Request) {
  const { profileText, targetRole, jobDescription } = await request.json();

  if (!profileText || typeof profileText !== 'string') {
    return Response.json({ error: 'Profile text is required' }, { status: 400 });
  }

  const hasJD = typeof jobDescription === 'string' && jobDescription.trim().length > 50;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
      };

      try {
        // ── PHASE 1: Scores + critiques ──────────────────────────
        send({ type: 'status', message: 'ALEX is scoring your profile...' });

        const phase1Text = await streamClaude(
          ALEX_SYSTEM_PROMPT,
          buildPhase1Prompt(profileText, targetRole, jobDescription),
          (chars) => send({ type: 'progress', chars, phase: 1 })
        );

        const phase1Json = extractJson(phase1Text);
        if (!phase1Json) throw new Error(`Phase 1: no JSON found. Got: ${phase1Text.slice(0, 300)}`);

        const parsed = AuditResultSchema.parse(JSON.parse(phase1Json));

        for (const section of parsed.sections) {
          send({ type: 'section', data: section });
        }
        send({
          type: 'summary',
          data: {
            overall_score: parsed.overall_score,
            grade: parsed.grade,
            grade_label: parsed.grade_label,
            percentile: parsed.percentile,
            alex_verdict: parsed.alex_verdict,
            action_plan: parsed.action_plan,
            target_role_fit: parsed.target_role_fit,
          },
        });

        // ── PHASE 2: Rewrites ────────────────────────────────────
        send({ type: 'status', message: 'ALEX is writing your rewrites...' });

        const phase2Text = await streamClaude(
          ALEX_REWRITE_PROMPT,
          buildPhase2Prompt(profileText, parsed.sections),
          (chars) => send({ type: 'progress', chars, phase: 2 })
        );

        const phase2Json = extractJson(phase2Text);
        if (!phase2Json) throw new Error(`Phase 2: no JSON found. Got: ${phase2Text.slice(0, 300)}`);

        const rewrites = RewriteResponseSchema.parse(JSON.parse(phase2Json));
        for (const rewrite of rewrites.rewrites) {
          send({ type: 'rewrite', data: rewrite });
        }

        // ── PHASE 3: Interview Kit (only if JD provided) ─────────
        if (hasJD) {
          send({ type: 'status', message: 'Generating your interview prep kit...' });

          const phase3Text = await streamClaude(
            INTERVIEW_SYSTEM_PROMPT,
            buildPhase3Prompt(jobDescription, targetRole),
            (chars) => send({ type: 'progress', chars, phase: 3 })
          );

          const phase3Json = extractJson(phase3Text);
          if (!phase3Json) throw new Error(`Phase 3: no JSON found. Got: ${phase3Text.slice(0, 300)}`);

          const kit = InterviewKitSchema.parse(JSON.parse(phase3Json));
          send({ type: 'interview_kit', data: kit });
        }

        send({ type: 'done' });
      } catch (error) {
        send({ type: 'error', message: String(error) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

async function streamClaude(
  systemPrompt: string,
  userMessage: string,
  onProgress: (chars: number) => void
): Promise<string> {
  let fullText = '';
  const claudeStream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cache_control: { type: 'ephemeral' } as any,
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
  });

  for await (const chunk of claudeStream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      fullText += chunk.delta.text;
      onProgress(fullText.length);
    }
  }
  return fullText;
}

function extractJson(text: string): string | null {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

function buildPhase1Prompt(profileText: string, targetRole?: string, jobDescription?: string): string {
  return `Audit this LinkedIn profile. Return ONLY the JSON as specified. No prose, no markdown.

TARGET ROLE: ${targetRole || 'Not specified'}

${jobDescription ? `TARGET JOB DESCRIPTION:\n---\n${jobDescription.slice(0, 3000)}\n---\n` : ''}
PROFILE:
---
${profileText.slice(0, 8000)}
---`;
}

function buildPhase2Prompt(profileText: string, sections: { id: string; label: string }[]): string {
  return `Write the BEFORE and AFTER rewrites for each of these sections from the LinkedIn profile below.

Sections to rewrite:
${sections.map((s) => `- ${s.id} (${s.label})`).join('\n')}

PROFILE:
---
${profileText.slice(0, 8000)}
---

Return ONLY the JSON as specified. No prose, no markdown.`;
}

function buildPhase3Prompt(jobDescription: string, targetRole?: string): string {
  return `Generate a complete interview prep kit for this job.

${targetRole ? `ROLE: ${targetRole}` : ''}

JOB DESCRIPTION:
---
${jobDescription.slice(0, 4000)}
---

Return ONLY the JSON as specified. No prose, no markdown.`;
}
