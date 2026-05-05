'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuditStream } from '@/hooks/useAuditStream';
import { StreamingLoader } from '@/components/audit/StreamingLoader';
import { OverallGrade } from '@/components/audit/OverallGrade';
import { SectionAudit } from '@/components/audit/SectionAudit';
import { ActionPlan } from '@/components/audit/ActionPlan';
import { InterviewKit } from '@/components/interview/InterviewKit';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, ArrowLeft, Zap } from 'lucide-react';
import type { AuditResult } from '@/types/audit';

export default function AuditPage() {
  const router = useRouter();
  const { status, sections, summary, interviewKit, interviewError, progress, statusMessage, error, startAudit, reset, fetchInterviewKit } =
    useAuditStream();
  const [targetRole, setTargetRole] = useState('');
  const [hasJD, setHasJD] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const text = sessionStorage.getItem('profileText');
    const role = sessionStorage.getItem('targetRole') ?? '';
    const jd = sessionStorage.getItem('jobDescription') ?? '';
    setTargetRole(role);
    setHasJD(jd.trim().length > 50);
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
      await generateAuditPDF(fullResult, interviewKit ?? undefined, targetRole || undefined);
    } finally {
      setDownloading(false);
    }
  };

  const isActive = ['connecting', 'scoring', 'rewriting', 'interviewing'].includes(status);
  const isDone = status === 'done';

  const loaderMessage =
    status === 'scoring' ? statusMessage || 'ALEX is scoring your profile...'
    : status === 'rewriting' ? statusMessage || 'Writing your copy-paste rewrites...'
    : status === 'interviewing' ? statusMessage || 'Building your interview prep kit...'
    : statusMessage || 'Connecting...';

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: '#09090b' }}>
      <AnimatePresence>
        {isActive && (
          <StreamingLoader
            progress={progress}
            statusMessage={loaderMessage}
            sectionsFound={sections.length}
            phase={status === 'interviewing' ? 3 : status === 'rewriting' ? 2 : 1}
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
            <ArrowLeft className="w-4 h-4" /> Back
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

        {/* Overall grade */}
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

        {/* Rewriting banner */}
        <AnimatePresence>
          {status === 'rewriting' && sections.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-xs text-zinc-500 mb-4 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Writing your copy-paste rewrites...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interview kit generating banner */}
        <AnimatePresence>
          {status === 'interviewing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-xs text-blue-400 mb-4 px-1 bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              Building your interview prep kit from the job description...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {sections.map((section, i) => (
              <SectionAudit key={section.id} section={section} index={i}
                isRewriting={status === 'rewriting' && !section.after} />
            ))}
          </AnimatePresence>
        </div>

        {/* Action plan */}
        <AnimatePresence>
          {(isDone || ['rewriting', 'interviewing'].includes(status)) && summary && (
            <ActionPlan items={summary.action_plan} />
          )}
        </AnimatePresence>

        {/* Interview error + retry */}
        {interviewError && !interviewKit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-8 border border-red-900/40 bg-red-950/20 rounded-xl p-5">
            <p className="text-red-400 font-semibold text-sm mb-1">Interview kit failed to generate</p>
            <p className="text-zinc-500 text-xs mb-4 font-mono break-all">{interviewError}</p>
            <Button size="sm" onClick={() => {
              const jd = sessionStorage.getItem('jobDescription') ?? '';
              const role = sessionStorage.getItem('targetRole') ?? '';
              if (jd) fetchInterviewKit(jd, role || undefined);
            }} className="bg-blue-600 hover:bg-blue-500 text-white">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry Interview Kit
            </Button>
          </motion.div>
        )}

        {/* No JD teaser */}
        {isDone && !hasJD && !interviewKit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-8 border border-dashed border-zinc-700 rounded-2xl p-6 text-center">
            <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-white font-semibold mb-1">Unlock Your Interview Prep Kit</p>
            <p className="text-zinc-500 text-sm mb-4">
              Go back and paste the job description to get technical questions, behavioral questions,
              coding problems and a 30-min revision plan — tailored to that exact role.
            </p>
            <Button onClick={() => router.push('/')} variant="outline" size="sm">
              Add Job Description
            </Button>
          </motion.div>
        )}

        {/* Interview kit */}
        <AnimatePresence>
          {interviewKit && <InterviewKit kit={interviewKit} />}
        </AnimatePresence>

        {/* Download CTA */}
        {isDone && summary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-10 text-center border border-zinc-800 rounded-2xl p-8 bg-zinc-900">
            <h3 className="text-white font-bold text-xl mb-2">Download Your Full Report</h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
              {interviewKit
                ? 'Profile audit + copy-paste rewrites + full interview prep kit — all in one PDF.'
                : 'Profile audit with scores, critiques, and copy-paste rewrites for every section.'}
            </p>
            <Button onClick={handleDownloadPDF} disabled={downloading} size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold">
              <Download className="w-5 h-5 mr-2" />
              {downloading ? 'Generating PDF...' : 'Download Full Report PDF'}
            </Button>
            <p className="text-zinc-600 text-xs mt-4">
              {interviewKit ? 'Includes interview questions + sample answers' : 'Multi-page PDF · All rewrites included'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
