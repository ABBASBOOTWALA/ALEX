'use client';

import { useState, useCallback } from 'react';
import type { AuditSection, AuditResult, SectionId } from '@/types/audit';

export type StreamStatus = 'idle' | 'connecting' | 'scoring' | 'rewriting' | 'done' | 'error';

export function useAuditStream() {
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [sections, setSections] = useState<AuditSection[]>([]);
  const [summary, setSummary] = useState<Omit<AuditResult, 'sections'> | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setSections([]);
    setSummary(null);
    setProgress(0);
    setStatusMessage('');
    setError(null);
  }, []);

  const startAudit = useCallback(
    async (profileText: string, targetRole?: string, jobDescription?: string) => {
      setStatus('connecting');
      setSections([]);
      setSummary(null);
      setProgress(0);
      setError(null);

      try {
        const response = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileText, targetRole, jobDescription }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!response.body) throw new Error('No response body');

        setStatus('scoring');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const processLine = (line: string) => {
          if (!line.trim()) return;
          let msg: { type: string; [key: string]: unknown };
          try { msg = JSON.parse(line); } catch { return; }

          if (msg.type === 'error') throw new Error(String(msg.message));

          switch (msg.type) {
            case 'status':
              setStatusMessage(String(msg.message));
              break;
            case 'progress': {
              const phase = msg.phase as number;
              const chars = msg.chars as number;
              if (phase === 1) setProgress(Math.min(45, (chars / 2500) * 45));
              else setProgress(55 + Math.min(35, (chars / 3000) * 35));
              break;
            }
            case 'section':
              setSections((prev) => [...prev, msg.data as AuditSection]);
              setProgress((prev) => Math.min(50, prev + 1));
              break;
            case 'summary':
              setSummary(msg.data as Omit<AuditResult, 'sections'>);
              setProgress(55);
              setStatus('rewriting');
              break;
            case 'rewrite': {
              const rw = msg.data as { id: string; before: string; after: string };
              setSections((prev) =>
                prev.map((s) => s.id === (rw.id as SectionId) ? { ...s, before: rw.before, after: rw.after } : s)
              );
              setProgress((prev) => Math.min(95, prev + 6));
              break;
            }
            case 'done':
              setProgress(100);
              setStatus('done');
              break;
          }
        };

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // flush any remaining buffered line
            if (buffer.trim()) processLine(buffer);
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) processLine(line);
        }

        // Fallback: if stream closed without a 'done' message, mark done anyway
        setStatus((s) => (s === 'rewriting' || s === 'scoring' ? 'done' : s));
        setProgress(100);
      } catch (err) {
        setError(String(err));
        setStatus('error');
      }
    },
    []
  );

  return { status, sections, summary, progress, statusMessage, error, startAudit, reset };
}
