'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Target, FileText } from 'lucide-react';

const features = [
  { icon: Shield, label: '7-section deep audit' },
  { icon: Zap, label: 'Instant rewrites' },
  { icon: Target, label: 'Recruiter-tested criteria' },
  { icon: FileText, label: 'Shareable score card' },
];

export function FeaturePills() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="flex flex-wrap justify-center gap-3 mb-8"
    >
      {features.map(({ icon: Icon, label }, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-zinc-800/60 border border-zinc-700/50 rounded-full px-3 py-1.5 text-sm text-zinc-400"
        >
          <Icon className="w-3.5 h-3.5 text-zinc-500" />
          {label}
        </div>
      ))}
    </motion.div>
  );
}
