export type Difficulty = 'easy' | 'medium' | 'hard';
export type RoleType = 'technical' | 'non-technical';

export interface PrepQuestion {
  q: string;
  difficulty: Difficulty;
  framework: string;
  sampleAnswer: string;
  topic: string;
}

export interface MustKnowItem {
  topic: string;
  why: string;
}

export interface RevisionSlot {
  slot: string;
  title: string;
  topics: string[];
}

export interface ExtractedRole {
  skills: string[];
  domain: string;
  seniority: string;
  roleType: RoleType;
  responsibilities: string[];
}

export interface InterviewKit {
  extracted: ExtractedRole;
  mustKnow: MustKnowItem[];
  technical: PrepQuestion[];
  behavioral: PrepQuestion[];
  coding: PrepQuestion[];
  systemDesign: PrepQuestion[];
  revisionPlan: RevisionSlot[];
}
