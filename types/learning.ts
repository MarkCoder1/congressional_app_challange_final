export type LearningItemType =
  | "lesson"
  | "assignment"
  | "practice"
  | "master_test"
  | "review"
  | "study_session"
  | "custom";

export type LearningLifecycleStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "needs_review"
  | "archived";

export type LearningCompletionStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "abandoned";

export type LearningHistoryKind =
  | "practice_attempt"
  | "master_test_attempt"
  | "assignment_submission"
  | "assignment_evaluation"
  | "study_session"
  | "review"
  | "note"
  | "milestone";

export interface LearningProgressSnapshot {
  percent: number;
  status: LearningCompletionStatus;
  updatedAt: string;
  score?: number;
  completedAt?: string;
  stage?: string;
  note?: string;
}

export interface LearningItemBase<
  TType extends LearningItemType = LearningItemType,
  TData extends object = Record<string, never>,
> {
  id: string;
  kind: TType;
  title: string;
  subject: string;
  sourceTaskId?: string;
  createdAt: string;
  updatedAt: string;
  lifecycleStatus: LearningLifecycleStatus;
  progress: LearningProgressSnapshot;
  metadata: Record<string, unknown>;
  data: TData;
  history: LearningHistoryEntry[];
}

export interface LessonLearningData {
  lessonId?: string;
  unitId?: string;
  courseId?: string;
  prerequisiteConcepts?: string[];
  targetConcepts?: string[];
}

export interface AssignmentLearningData {
  assignmentId?: string;
  rubricId?: string;
  dueAt?: string;
  submissionPolicy?: string;
  evaluationModel?: string;
}

export interface PracticeLearningData {
  practiceId?: string;
  questionBankId?: string;
  conceptTargets?: string[];
}

export interface MasterTestLearningData {
  testId?: string;
  conceptTargets?: string[];
  passingScore?: number;
}

export interface ReviewLearningData {
  reviewId?: string;
  conceptTargets?: string[];
  sourceRecordIds?: string[];
}

export interface StudySessionLearningData {
  sessionId?: string;
  relatedRecordId?: string;
  relatedRecordKind?: LearningItemType;
  focusArea?: string;
}

export interface CustomLearningData {
  label?: string;
  description?: string;
}

export type LessonLearningRecord = LearningItemBase<
  "lesson",
  LessonLearningData
>;
export type AssignmentLearningRecord = LearningItemBase<
  "assignment",
  AssignmentLearningData
>;
export type PracticeLearningRecord = LearningItemBase<
  "practice",
  PracticeLearningData
>;
export type MasterTestLearningRecord = LearningItemBase<
  "master_test",
  MasterTestLearningData
>;
export type ReviewLearningRecord = LearningItemBase<
  "review",
  ReviewLearningData
>;
export type StudySessionLearningRecord = LearningItemBase<
  "study_session",
  StudySessionLearningData
>;
export type CustomLearningRecord = LearningItemBase<
  "custom",
  CustomLearningData
>;

export type LearningRecord =
  | LessonLearningRecord
  | AssignmentLearningRecord
  | PracticeLearningRecord
  | MasterTestLearningRecord
  | ReviewLearningRecord
  | StudySessionLearningRecord
  | CustomLearningRecord;

export interface LearningHistoryEntryBase<
  TKind extends LearningHistoryKind = LearningHistoryKind,
  TPayload extends object = Record<string, never>,
> {
  id: string;
  kind: TKind;
  recordId: string;
  occurredAt: string;
  attemptNumber?: number;
  revisionNumber?: number;
  completionStatus: LearningCompletionStatus;
  payload: TPayload;
  metadata: Record<string, unknown>;
}

export interface PracticeAttemptPayload {
  attemptNumber: number;
  score: number;
  timeSpentSeconds: number;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  conceptsMissed: string[];
  hintsUsed: number;
  completionStatus: LearningCompletionStatus;
}

export interface MasterTestAttemptPayload {
  attemptNumber: number;
  score: number;
  completionTimeSeconds: number;
  totalQuestions: number;
  incorrectConcepts: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface RubricCriterionScore {
  criterion: string;
  score: number;
  maxScore?: number;
  weight?: number;
  note?: string;
}

export interface AssignmentSubmissionPayload {
  submissionTimestamp: string;
  evaluationScore?: number;
  rubricBreakdown?: RubricCriterionScore[];
  feedback?: string;
  revisionNumber: number;
  completionStatus: LearningCompletionStatus;
}

export interface AssignmentEvaluationPayload {
  evaluatedAt: string;
  evaluationScore: number;
  rubricBreakdown: RubricCriterionScore[];
  feedback: string;
  evaluator?: string;
}

export interface StudySessionPayload {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  relatedRecordId?: string;
  relatedRecordKind?: LearningItemType;
  completedWork: string[];
  interruptions?: string[];
  completionStatus: LearningCompletionStatus;
}

export interface ReviewPayload {
  reviewAt: string;
  conceptIds: string[];
  notes?: string;
}

export interface NotePayload {
  message: string;
}

export interface MilestonePayload {
  label: string;
  description?: string;
}

export type PracticeAttemptHistoryEntry = LearningHistoryEntryBase<
  "practice_attempt",
  PracticeAttemptPayload
>;
export type MasterTestAttemptHistoryEntry = LearningHistoryEntryBase<
  "master_test_attempt",
  MasterTestAttemptPayload
>;
export type AssignmentSubmissionHistoryEntry = LearningHistoryEntryBase<
  "assignment_submission",
  AssignmentSubmissionPayload
>;
export type AssignmentEvaluationHistoryEntry = LearningHistoryEntryBase<
  "assignment_evaluation",
  AssignmentEvaluationPayload
>;
export type StudySessionHistoryEntry = LearningHistoryEntryBase<
  "study_session",
  StudySessionPayload
>;
export type ReviewHistoryEntry = LearningHistoryEntryBase<
  "review",
  ReviewPayload
>;
export type NoteHistoryEntry = LearningHistoryEntryBase<"note", NotePayload>;
export type MilestoneHistoryEntry = LearningHistoryEntryBase<
  "milestone",
  MilestonePayload
>;

export type LearningHistoryEntry =
  | PracticeAttemptHistoryEntry
  | MasterTestAttemptHistoryEntry
  | AssignmentSubmissionHistoryEntry
  | AssignmentEvaluationHistoryEntry
  | StudySessionHistoryEntry
  | ReviewHistoryEntry
  | NoteHistoryEntry
  | MilestoneHistoryEntry;

export interface CreateLearningRecordInput<
  TType extends LearningItemType = LearningItemType,
  TData extends object = Record<string, never>,
> {
  kind: TType;
  title: string;
  subject: string;
  sourceTaskId?: string;
  data?: TData;
  metadata?: Record<string, unknown>;
  progress?: Partial<LearningProgressSnapshot>;
  lifecycleStatus?: LearningLifecycleStatus;
  history?: LearningHistoryEntry[];
  createdAt?: string;
}

export interface LearningRecordSummary {
  id: string;
  kind: LearningItemType;
  title: string;
  subject: string;
  lifecycleStatus: LearningLifecycleStatus;
  latestActivityAt: string;
  historyCount: number;
  practiceAttemptCount: number;
  masterTestAttemptCount: number;
  assignmentSubmissionCount: number;
  studySessionCount: number;
  overallProgress: LearningProgressSnapshot;
}
