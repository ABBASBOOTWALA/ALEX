'use client';

import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <div className="text-center mb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-1.5 text-xs text-zinc-400 mb-6"
      >
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        2,000,000+ profiles audited · Free · No login required
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight"
      >
        ALEX destroyed{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
          2 million
        </span>{' '}
        LinkedIn profiles.
        <br />
        <span className="text-zinc-400">Yours might survive.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-zinc-400 text-lg max-w-2xl mx-auto"
      >
        Get a ruthlessly honest score before a recruiter does. Section-by-section
        breakdown with exact rewrites — copy, paste, done.
      </motion.p>
    </div>
  );
}
