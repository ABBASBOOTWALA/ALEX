'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import type { ActionPlanItem } from '@/types/audit';

const IMPACT_COLORS = {
  High: 'bg-red-500/20 text-red-400 border-red-500/30',
  Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const EFFORT_COLORS = {
  'Quick Win': 'bg-green-500/10 text-green-500',
  '30 min': 'bg-blue-500/10 text-blue-400',
  '1 hour': 'bg-purple-500/10 text-purple-400',
  'Half day': 'bg-orange-500/10 text-orange-400',
};

interface ActionPlanProps {
  items: ActionPlanItem[];
}

export function ActionPlan({ items }: ActionPlanProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-8"
    >
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">⚡</span> Your Action Plan
      </h2>
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <div className="divide-y divide-zinc-800">
          {items.map((item, i) => (
            <motion.div
              key={item.rank}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="flex items-start gap-4 p-4"
            >
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-400 flex-shrink-0 mt-0.5">
                {item.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-zinc-200 text-sm">{item.action}</p>
                <p className="text-zinc-600 text-xs mt-1 capitalize">{item.section}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${IMPACT_COLORS[item.impact]}`}
                >
                  {item.impact}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${EFFORT_COLORS[item.effort]}`}
                >
                  {item.effort}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
