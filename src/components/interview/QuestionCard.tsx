'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import type { PrepQuestion } from '@/types/interview';

const DIFFICULTY_STYLES = {
  easy: 'bg-green-500/10 text-green-400 border-green-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  hard: 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface QuestionCardProps {
  question: PrepQuestion;
  index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(question.sampleAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="border border-zinc-800 rounded-xl overflow-hidden"
    >
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-zinc-800/40 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-zinc-600 text-sm font-mono mt-0.5 w-5 flex-shrink-0">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-zinc-200 text-sm font-medium leading-relaxed">{question.q}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLES[question.difficulty]}`}>
              {question.difficulty}
            </span>
            {question.topic && (
              <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
                {question.topic}
              </span>
            )}
          </div>
        </div>
        <div className="text-zinc-600 flex-shrink-0 mt-0.5">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-zinc-800 pt-3">
              {question.framework && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">Framework</p>
                  <p className="text-zinc-400 text-sm leading-relaxed bg-zinc-800/50 rounded-lg p-3">
                    {question.framework}
                  </p>
                </div>
              )}
              {question.sampleAnswer && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-green-500 uppercase tracking-wide">Sample Answer</p>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {copied ? <><Check className="w-3 h-3 text-green-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <div className="text-zinc-300 text-sm leading-relaxed bg-green-950/20 border border-green-900/30 rounded-lg p-3 whitespace-pre-wrap font-mono text-xs">
                    {question.sampleAnswer}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
