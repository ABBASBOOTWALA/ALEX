import type { Grade, SectionId } from '@/types/audit';

export function letterGrade(score: number): Grade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function gradeColor(grade: Grade): string {
  const map: Record<Grade, string> = {
    A: '#22c55e',
    B: '#84cc16',
    C: '#eab308',
    D: '#f97316',
    F: '#ef4444',
  };
  return map[grade];
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 40) return '#eab308';
  return '#ef4444';
}

export function scoreToGaugeOffset(score: number, circumference = 264): number {
  return circumference - (score / 100) * circumference;
}

export const SECTION_WEIGHTS: Record<SectionId, number> = {
  headline: 20,
  about: 25,
  experience: 30,
  skills: 10,
  education: 5,
  featured: 5,
  engagement: 5,
};
