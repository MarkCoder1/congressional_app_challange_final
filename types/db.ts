// /types/db.ts
export type TaskRow = {
  id: string;
  title: string;
  subject: string;
  description: string;
  type: string;
  resources: string;
  learningMaps: string;
  practice: string;
  master: string;
  assignments: string;
  progress: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string | null;
  progress_meta: string | null;
  visualData: string;
  assignmentContent: string;
  difficulty: string | null;
  estimated_minutes: number | null;
};
