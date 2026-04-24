'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface BeforeAfterToggleProps {
  before: string;
  after: string;
}

export function BeforeAfterToggle({ before, after }: BeforeAfterToggleProps) {
  const [view, setView] = useState<'before' | 'after'>('before');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(after);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setView('before')}
          className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
            view === 'before'
              ? 'bg-zinc-700 text-zinc-200'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          BEFORE
        </button>
        <button
          onClick={() => setView('after')}
          className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
            view === 'after'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          AFTER ✦
        </button>
        {view === 'after' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="ml-auto h-7 px-2 text-xs text-zinc-400 hover:text-zinc-200"
          >
            {copied ? (
              <><Check className="w-3 h-3 mr-1 text-green-400" /> Copied</>
            ) : (
              <><Copy className="w-3 h-3 mr-1" /> Copy</>
            )}
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className={`rounded-lg p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed ${
            view === 'before'
              ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              : 'bg-green-950/30 text-green-300 border border-green-800/40'
          }`}
        >
          {view === 'before' ? (before || 'Not provided') : after}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
