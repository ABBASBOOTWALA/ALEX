export type SectionId =
  | 'headline'
  | 'about'
  | 'experience'
  | 'skills'
  | 'education'
  | 'featured'
  | 'engagement';

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
export type ImpactLevel = 'High' | 'Medium' | 'Low';
export type EffortLevel = 'Quick Win' | '30 min' | '1 hour' | 'Half day';

export interface AuditSection {
  id: SectionId;
  label: string;
  score: number;
  weight: number;
  critique: string;
  issues: string[];
  strengths: string[];
  before?: string;  // filled in phase 2
  after?: string;   // filled in phase 2
}

export interface ActionPlanItem {
  rank: number;
  section: SectionId;
  action: string;
  impact: ImpactLevel;
  effort: EffortLevel;
}

export interface AuditResult {
  overall_score: number;
  grade: Grade;
  grade_label: string;
  percentile: number;
  alex_verdict: string;
  sections: AuditSection[];
  action_plan: ActionPlanItem[];
  target_role_fit: string;
}

export interface AuditRequest {
  profileText: string;
  targetRole?: string;
  jobDescription?: string;
}
