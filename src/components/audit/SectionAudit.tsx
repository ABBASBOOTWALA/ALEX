'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ScoreGauge } from './ScoreGauge';
import { BeforeAfterToggle } from './BeforeAfterToggle';
import type { AuditSection } from '@/types/audit';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface SectionAuditProps {
  section: AuditSection;
  index: number;
  isRewriting?: boolean;
}

export function SectionAudit({ section, index, isRewriting }: SectionAuditProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden !p-0 !gap-0">
        <div
          className="flex items-center gap-4 p-5 cursor-pointer select-none"
          onClick={() => setExpanded((v) => !v)}
        >
          <ScoreGauge score={section.score} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h3 className="font-bold text-white text-base">{section.label}</h3>
              <span className="text-xs text-zinc-600">·&nbsp;weight {section.weight}%</span>
            </div>
            <p className="text-zinc-500 text-sm mt-0.5 line-clamp-1">{section.critique}</p>
          </div>
          <div className="text-zinc-600 ml-2">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {expanded && (
          <div className="px-5 pb-5 border-t border-zinc-800 pt-4 space-y-4">
            <p className="text-zinc-300 text-sm leading-relaxed">{section.critique}</p>

            {section.issues.length > 0 && (
              <div className="space-y-1.5">
                {section.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-400">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            )}

            {section.strengths.length > 0 && (
              <div className="space-y-1.5">
                {section.strengths.map((strength, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-green-400">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            )}

            {section.after ? (
              <BeforeAfterToggle before={section.before ?? ''} after={section.after} />
            ) : isRewriting ? (
              <div className="mt-4 h-10 rounded-lg bg-zinc-800 animate-pulse flex items-center px-3">
                <span className="text-zinc-600 text-xs">Writing rewrite...</span>
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
