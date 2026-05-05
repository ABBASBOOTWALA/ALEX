'use client';

import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface StreamingLoaderProps {
  progress: number;
  statusMessage: string;
  sectionsFound: number;
  phase?: number;
}

const PHASE_LABELS = ['Scoring profile', 'Writing rewrites', 'Building interview kit'];
const PHASE_EMOJIS = ['🔍', '✍️', '🎯'];

export function StreamingLoader({ progress, statusMessage, sectionsFound, phase = 1 }: StreamingLoaderProps) {
  const phaseIdx = phase - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 mx-auto mb-5 text-4xl select-none"
        >
          {PHASE_EMOJIS[phaseIdx] ?? '🔍'}
        </motion.div>

        <h3 className="text-white font-bold text-lg mb-1">ALEX is on it</h3>
        <p className="text-zinc-400 text-sm mb-5 min-h-[20px]">{statusMessage}</p>

        {/* Phase indicators */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {PHASE_LABELS.map((label, i) => (
            <div key={i} className={`flex items-center gap-1.5 text-xs transition-colors ${i + 1 === phase ? 'text-blue-400' : i + 1 < phase ? 'text-green-500' : 'text-zinc-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${i + 1 === phase ? 'bg-blue-400 animate-pulse' : i + 1 < phase ? 'bg-green-500' : 'bg-zinc-700'}`} />
              {label}
              {i < 2 && <span className="text-zinc-700 ml-1">→</span>}
            </div>
          ))}
        </div>

        <Progress value={progress} className="mb-3" />

        <div className="flex items-center justify-between text-xs text-zinc-600">
          <span>{Math.round(progress)}%</span>
          {sectionsFound > 0 && (
            <span className="text-zinc-400">{sectionsFound} of 7 sections analyzed</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
