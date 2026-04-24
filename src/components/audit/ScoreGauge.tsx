'use client';

import { useEffect, useRef } from 'react';
import { scoreColor } from '@/lib/score-utils';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = { sm: 64, md: 96, lg: 128 };
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreGauge({ score, size = 'md' }: ScoreGaugeProps) {
  const px = SIZE_MAP[size];
  const strokeRef = useRef<SVGCircleElement>(null);
  const color = scoreColor(score);
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  useEffect(() => {
    if (!strokeRef.current) return;
    strokeRef.current.style.strokeDashoffset = String(CIRCUMFERENCE);
    requestAnimationFrame(() => {
      if (!strokeRef.current) return;
      strokeRef.current.style.transition = 'stroke-dashoffset 1.2s ease-out';
      strokeRef.current.style.strokeDashoffset = String(offset);
    });
  }, [offset]);

  return (
    <div style={{ width: px, height: px }} className="relative flex-shrink-0">
      <svg width={px} height={px} viewBox="0 0 100 100" className="-rotate-90">
        <circle
          cx="50" cy="50" r={RADIUS}
          fill="none"
          stroke="#27272a"
          strokeWidth="8"
        />
        <circle
          ref={strokeRef}
          cx="50" cy="50" r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-black leading-none"
          style={{
            fontSize: size === 'sm' ? 16 : size === 'md' ? 22 : 32,
            color,
          }}
        >
          {score}
        </span>
        {size !== 'sm' && (
          <span className="text-zinc-600 text-xs mt-0.5">/100</span>
        )}
      </div>
    </div>
  );
}
