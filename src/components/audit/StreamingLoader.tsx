'use client';

import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface StreamingLoaderProps {
  progress: number;
  statusMessage: string;
  sectionsFound: number;
}

export function StreamingLoader({ progress, statusMessage, sectionsFound }: StreamingLoaderProps) {
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
          className="w-16 h-16 mx-auto mb-6 text-4xl select-none"
        >
          🔍
        </motion.div>

        <h3 className="text-white font-bold text-lg mb-1">ALEX is on it</h3>
        <p className="text-zinc-400 text-sm mb-6 min-h-[20px]">{statusMessage}</p>

        <Progress value={progress} className="mb-3 h-2 bg-zinc-800" />

        <div className="flex items-center justify-between text-xs text-zinc-600">
          <span>{Math.round(progress)}%</span>
          {sectionsFound > 0 && (
            <span className="text-zinc-400">
              {sectionsFound} of 7 sections analyzed
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
