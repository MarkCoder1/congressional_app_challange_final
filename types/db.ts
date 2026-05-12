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
  visualData: string;
  assignmentContent: string;
};