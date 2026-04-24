'use client';

import { useState, useCallback } from 'react';

export type PdfStatus = 'idle' | 'uploading' | 'done' | 'error';

export function usePdfUpload() {
  const [status, setStatus] = useState<PdfStatus>('idle');
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const uploadPdf = useCallback(async (file: File) => {
    setStatus('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to parse PDF');
      }

      const data = await response.json();
      setExtractedText(data.rawText);
      setStatus('done');
      return data.rawText as string;
    } catch (err) {
      setError(String(err));
      setStatus('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setExtractedText('');
    setError(null);
  }, []);

  return { status, extractedText, error, uploadPdf, reset };
}
