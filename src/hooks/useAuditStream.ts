'use client';

import { useState, useCallback } from 'react';
import type { AuditSection, AuditResult, SectionId } from '@/types/audit';
import type { InterviewKit } from '@/types/interview';

export type StreamStatus = 'idle' | 'connecting' | 'scoring' | 'rewriting' | 'interviewing' | 'done' | 'error';

export function useAuditStream() {
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [sections, setSections] = useState<AuditSection[]>([]);
  const [summary, setSummary] = useState<Omit<AuditResult, 'sections'> | null>(null);
  const [interviewKit, setInterviewKit] = useState<InterviewKit | null>(null);
  const [interviewError, setInterviewError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setSections([]);
    setSummary(null);
    setInterviewKit(null);
    setInterviewError(null);
    setProgress(0);
    setStatusMessage('');
    setError(null);
  }, []);

  const fetchInterviewKit = useCallback(async (jobDescription: string, targetRole?: string) => {
    setInterviewError(null);
    setStatus('interviewing');
    setProgress(78);
    setStatusMessage('Building your interview prep kit...');

    try {
      await streamEndpoint(
        '/api/interview',
        { jobDescription, targetRole },
        (msg) => {
          switch (msg.type) {
            case 'status':
              setStatusMessage(String(msg.message));
              break;
            case 'progress':
              setProgress(78 + Math.min(18, ((msg.chars as number) / 4000) * 18));
              break;
            case 'interview_kit':
              setInterviewKit(msg.data as InterviewKit);
              setProgress(98);
              break;
          }
        }
      );
      setProgress(100);
      setStatus('done');
    } catch (err) {
      console.error('[interview]', err);
      setInterviewError(String(err));
      setStatus('done'); // audit is still valid — don't block it
    }
  }, []);

  const startAudit = useCallback(
    async (profileText: string, targetRole?: string, jobDescription?: string) => {
      setStatus('connecting');
      setSections([]);
      setSummary(null);
      setInterviewKit(null);
      setInterviewError(null);
      setProgress(0);
      setError(null);

      const hasJD = !!jobDescription && jobDescription.trim().length > 50;

      try {
        // ── PHASE 1 + 2: Profile audit ───────────────────────────
        await streamEndpoint(
          '/api/audit',
          { profileText, targetRole, jobDescription },
          (msg) => {
            switch (msg.type) {
              case 'status':
                setStatusMessage(String(msg.message));
                break;
              case 'progress': {
                const phase = msg.phase as number;
                const chars = msg.chars as number;
                if (phase === 1) setProgress(Math.min(40, (chars / 2500) * 40));
                else setProgress(45 + Math.min(30, (chars / 3000) * 30));
                break;
              }
              case 'section':
                setSections((prev) => [...prev, msg.data as AuditSection]);
                setStatus('scoring');
                break;
              case 'summary':
                setSummary(msg.data as Omit<AuditResult, 'sections'>);
                setProgress(45);
                setStatus('rewriting');
                break;
              case 'rewrite': {
                const rw = msg.data as { id: string; before: string; after: string };
                setSections((prev) =>
                  prev.map((s) =>
                    s.id === (rw.id as SectionId) ? { ...s, before: rw.before, after: rw.after } : s
                  )
                );
                setProgress((prev) => Math.min(75, prev + 4));
                break;
              }
            }
          }
        );

        if (!hasJD) {
          setProgress(100);
          setStatus('done');
          return;
        }

        // ── PHASE 3: Interview kit (separate call) ────────────────
        await fetchInterviewKit(jobDescription!, targetRole);
      } catch (err) {
        console.error('[audit]', err);
        setError(String(err));
        setStatus('error');
      }
    },
    [fetchInterviewKit]
  );

  return {
    status, sections, summary, interviewKit, interviewError,
    progress, statusMessage, error, startAudit, reset, fetchInterviewKit,
  };
}

async function streamEndpoint(
  url: string,
  body: object,
  onMessage: (msg: { type: string; [key: string]: unknown }) => void
): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`${url} → HTTP ${response.status}: ${text.slice(0, 200)}`);
  }
  if (!response.body) throw new Error(`${url} → no response body`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const processLine = (line: string) => {
    if (!line.trim()) return;
    let msg: { type: string; [key: string]: unknown };
    try { msg = JSON.parse(line); } catch { return; }
    if (msg.type === 'error') throw new Error(String(msg.message));
    if (msg.type !== 'done') onMessage(msg);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      if (buffer.trim()) processLine(buffer);
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) processLine(line);
  }
}
