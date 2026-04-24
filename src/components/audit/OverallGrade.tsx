'use client';

import { motion } from 'framer-motion';
import { gradeColor } from '@/lib/score-utils';
import type { Grade } from '@/types/audit';

interface OverallGradeProps {
  grade: Grade;
  gradeLabel: string;
  score: number;
  percentile: number;
  alexVerdict: string;
  targetRoleFit: string;
}

export function OverallGrade({
  grade,
  gradeLabel,
  score,
  percentile,
  alexVerdict,
  targetRoleFit,
}: OverallGradeProps) {
  const color = gradeColor(grade);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring', bounce: 0.4 }}
            className="font-black leading-none select-none"
            style={{ fontSize: 96, color, lineHeight: 1 }}
          >
            {grade}
          </motion.div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{Math.round(score)}</span>
              <span className="text-zinc-500 text-lg">/100</span>
            </div>
            <div
              className="text-sm font-semibold mt-0.5"
              style={{ color }}
            >
              {gradeLabel}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Beats {percentile}% of LinkedIn profiles
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3 border-l border-zinc-800 pl-6 md:pl-8">
          <p className="text-zinc-300 text-sm leading-relaxed italic">
            &ldquo;{alexVerdict}&rdquo;
          </p>
          <p className="text-zinc-500 text-xs">
            <span className="text-zinc-400 font-medium">Role fit: </span>
            {targetRoleFit}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
