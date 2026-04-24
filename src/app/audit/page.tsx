'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuditStream } from '@/hooks/useAuditStream';
import { StreamingLoader } from '@/components/audit/StreamingLoader';
import { OverallGrade } from '@/components/audit/OverallGrade';
import { SectionAudit } from '@/components/audit/SectionAudit';
import { ActionPlan } from '@/components/audit/ActionPlan';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, ArrowLeft } from 'lucide-react';
import type { AuditResult } from '@/types/audit';

export default function AuditPage() {
  const router = useRouter();
  const { status, sections, summary, progress, statusMessage, error, startAudit, reset } =
    useAuditStream();
  const [targetRole, setTargetRole] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const text = sessionStorage.getItem('profileText');
    const role = sessionStorage.getItem('targetRole') ?? '';
    const jd = sessionStorage.getItem('jobDescription') ?? '';
    setTargetRole(role);
    if (!text) { router.replace('/'); return; }
    startAudit(text, role || undefined, jd || undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReaudit = () => {
    reset();
    const text = sessionStorage.getItem('profileText');
    const role = sessionStorage.getItem('targetRole') ?? '';
    const jd = sessionStorage.getItem('jobDescription') ?? '';
    if (text) startAudit(text, role || undefined, jd || undefined);
  };

  const handleDownloadPDF = async () => {
    if (!summary || sections.length === 0) return;
    setDownloading(true);
    try {
      const { generateAuditPDF } = await import('@/lib/generate-pdf');
      const fullResult: AuditResult = { ...summary, sections };
      await generateAuditPDF(fullResult, targetRole || undefined);
    } finally {
      setDownloading(false);
    }
  };

  const isActive = status === 'connecting' || status === 'scoring' || status === 'rewriting';
  const isDone = status === 'done';

  const loaderMessage =
    status === 'scoring'
      ? statusMessage || 'ALEX is scoring your profile...'
      : status === 'rewriting'
      ? statusMessage || 'Writing your copy-paste rewrites...'
      : statusMessage || 'Connecting...';

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: '#09090b' }}>
      <AnimatePresence>
        {isActive && (
          <StreamingLoader
            progress={progress}
            statusMessage={loaderMessage}
            sectionsFound={sections.length}
          />
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto">
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          {(isDone || sections.length > 0) && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleReaudit} className="text-zinc-400 hover:text-zinc-200">
                <RefreshCw className="w-4 h-4 mr-1.5" /> Re-audit
              </Button>
              {isDone && summary && (
                <Button size="sm" onClick={handleDownloadPDF} disabled={downloading} className="bg-blue-600 hover:bg-blue-500 text-white">
                  <Download className="w-4 h-4 mr-1.5" />
                  {downloading ? 'Generating...' : 'Download PDF'}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {status === 'error' && (
          <div className="py-12">
            <p className="text-red-400 text-sm font-mono bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4 break-all">{error}</p>
            <Button onClick={() => router.push('/')} variant="outline">Try Again</Button>
          </div>
        )}

        {/* Overall grade — appears after phase 1 */}
        <AnimatePresence>
          {summary && (
            <OverallGrade
              grade={summary.grade}
              gradeLabel={summary.grade_label}
              score={summary.overall_score}
              percentile={summary.percentile}
              alexVerdict={summary.alex_verdict}
              targetRoleFit={summary.target_role_fit}
            />
          )}
        </AnimatePresence>

        {/* Rewriting banner — shows during phase 2 */}
        <AnimatePresence>
          {status === 'rewriting' && sections.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-xs text-zinc-500 mb-4 px-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              ALEX is writing your rewrites — they&apos;ll appear in each section below
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {sections.map((section, i) => (
              <SectionAudit key={section.id} section={section} index={i} isRewriting={status === 'rewriting' && !section.after} />
            ))}
          </AnimatePresence>
        </div>

        {/* Action plan */}
        <AnimatePresence>
          {(isDone || status === 'rewriting') && summary && <ActionPlan items={summary.action_plan} />}
        </AnimatePresence>

        {/* Download CTA */}
        {isDone && summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 text-center border border-zinc-800 rounded-2xl p-8 bg-zinc-900"
          >
            <h3 className="text-white font-bold text-xl mb-2">Download Your Full Audit</h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
              Multi-page PDF with scores, critiques, and copy-paste rewrites for every section.
            </p>
            <Button
              onClick={handleDownloadPDF}
              disabled={downloading}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold"
            >
              <Download className="w-5 h-5 mr-2" />
              {downloading ? 'Generating PDF...' : 'Download Audit PDF'}
            </Button>
            <p className="text-zinc-600 text-xs mt-4">Multi-page PDF · All rewrites included</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
