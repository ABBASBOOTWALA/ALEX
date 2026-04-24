'use client';

import { forwardRef } from 'react';
import { gradeColor, scoreColor } from '@/lib/score-utils';
import type { AuditSection, Grade } from '@/types/audit';

interface ShareableCardProps {
  grade: Grade;
  score: number;
  percentile: number;
  gradeLabel: string;
  sections: Pick<AuditSection, 'label' | 'score'>[];
  targetRole?: string;
}

export const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
  ({ grade, score, percentile, gradeLabel, sections, targetRole }, ref) => {
    const color = gradeColor(grade);

    return (
      <div
        ref={ref}
        style={{
          position: 'absolute',
          left: -9999,
          top: 0,
          width: 1200,
          height: 630,
          backgroundColor: '#09090b',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: 56,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <div style={{ color: '#71717a', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
              LinkedIn Profile Audit by ALEX
            </div>
            <div style={{ color: '#ffffff', fontSize: 28, fontWeight: 900 }}>
              {targetRole || 'LinkedIn Profile Score'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color, fontSize: 100, fontWeight: 900, lineHeight: 1 }}>{grade}</div>
            <div style={{ color: '#a1a1aa', fontSize: 16, marginTop: 4 }}>{gradeLabel}</div>
          </div>
        </div>

        {/* Score + percentile */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 36 }}>
          <span style={{ color: '#ffffff', fontSize: 56, fontWeight: 900 }}>{Math.round(score)}</span>
          <span style={{ color: '#52525b', fontSize: 28 }}>/100</span>
          <span style={{ color: '#71717a', fontSize: 18, marginLeft: 8 }}>
            · Beats {percentile}% of profiles
          </span>
        </div>

        {/* Section bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {sections.map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 140, color: '#a1a1aa', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                {s.label}
              </div>
              <div style={{ flex: 1, height: 10, backgroundColor: '#27272a', borderRadius: 5, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${s.score}%`,
                    height: '100%',
                    backgroundColor: scoreColor(s.score),
                    borderRadius: 5,
                  }}
                />
              </div>
              <div style={{ width: 36, textAlign: 'right', color: scoreColor(s.score), fontSize: 14, fontWeight: 700 }}>
                {s.score}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid #27272a' }}>
          <div style={{ color: '#3f3f46', fontSize: 13 }}>
            Get your score at linkedin-auditor.vercel.app
          </div>
          <div style={{ color: '#52525b', fontSize: 12, letterSpacing: 1 }}>
            AUDITED BY ALEX™
          </div>
        </div>
      </div>
    );
  }
);

ShareableCard.displayName = 'ShareableCard';
