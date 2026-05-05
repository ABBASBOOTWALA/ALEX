'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { QuestionCard } from './QuestionCard';
import type { InterviewKit as InterviewKitType } from '@/types/interview';
import { Brain, Clock, Zap, Code2, Layout, Users } from 'lucide-react';

interface InterviewKitProps {
  kit: InterviewKitType;
}

type TabKey = 'technical' | 'behavioral' | 'coding' | 'systemDesign';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'technical', label: 'Technical', icon: Brain },
  { key: 'behavioral', label: 'Behavioral', icon: Users },
  { key: 'coding', label: 'Coding', icon: Code2 },
  { key: 'systemDesign', label: 'System Design', icon: Layout },
];

export function InterviewKit({ kit }: InterviewKitProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('technical');

  const visibleTabs = TABS.filter((t) => {
    const questions = kit[t.key];
    return questions && questions.length > 0;
  });

  const activeQuestions = kit[activeTab] ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Zap className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Interview Prep Kit</h2>
          <p className="text-zinc-500 text-sm">
            {kit.extracted.seniority} {kit.extracted.domain} · {kit.extracted.roleType}
          </p>
        </div>
      </div>

      {/* Skills extracted */}
      {kit.extracted.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {kit.extracted.skills.map((skill) => (
            <span key={skill} className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-full">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Must Know */}
      {kit.mustKnow.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-amber-400">⚠</span> Must Know Before You Walk In
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {kit.mustKnow.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                <div>
                  <span className="text-zinc-200 text-sm font-medium">{item.topic}</span>
                  {item.why && (
                    <p className="text-zinc-500 text-xs mt-0.5">{item.why}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question tabs */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6">
        {/* Tab bar */}
        <div className="flex border-b border-zinc-800 overflow-x-auto">
          {visibleTabs.map(({ key, label, icon: Icon }) => {
            const count = (kit[key] ?? []).length;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Questions */}
        <div className="p-4 space-y-3">
          {activeQuestions.length > 0 ? (
            activeQuestions.map((q, i) => (
              <QuestionCard key={i} question={q} index={i} />
            ))
          ) : (
            <p className="text-zinc-600 text-sm text-center py-6">No questions for this section</p>
          )}
        </div>
      </div>

      {/* Revision Plan */}
      {kit.revisionPlan.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            30-Minute Revision Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {kit.revisionPlan.map((slot, i) => (
              <div key={i} className="border border-zinc-800 rounded-lg p-3">
                <div className="text-xs font-mono text-blue-400 mb-1">{slot.slot}</div>
                <div className="text-sm font-semibold text-zinc-200 mb-2">{slot.title}</div>
                <ul className="space-y-1">
                  {slot.topics.map((topic, j) => (
                    <li key={j} className="text-xs text-zinc-500 flex items-start gap-1.5">
                      <span className="text-zinc-700 mt-0.5">→</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
