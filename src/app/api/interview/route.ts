import { anthropic } from '@/lib/anthropic';
import { INTERVIEW_SYSTEM_PROMPT } from '@/lib/interview-prompt';
import { InterviewKitSchema } from '@/lib/interview-schema';

export const maxDuration = 60;

export async function POST(request: Request) {
  const { jobDescription, targetRole } = await request.json();

  if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 50) {
    return Response.json({ error: 'Job description is required (min 50 chars)' }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
      };

      try {
        send({ type: 'status', message: 'Building your interview prep kit...' });

        let fullText = '';
        const claudeStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 8000,
          system: [
            {
              type: 'text',
              text: INTERVIEW_SYSTEM_PROMPT,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cache_control: { type: 'ephemeral' } as any,
            },
          ],
          messages: [
            {
              role: 'user',
              content: `Generate a complete interview prep kit for this job. Return ONLY the JSON as specified. No prose, no markdown.

${targetRole ? `ROLE: ${targetRole}` : ''}

JOB DESCRIPTION:
---
${jobDescription.slice(0, 4000)}
---`,
            },
          ],
        });

        for await (const chunk of claudeStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            fullText += chunk.delta.text;
            send({ type: 'progress', chars: fullText.length });
          }
        }

        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error(`No JSON found. Got: ${fullText.slice(0, 300)}`);

        const kit = InterviewKitSchema.parse(JSON.parse(jsonMatch[0]));
        send({ type: 'interview_kit', data: kit });
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
