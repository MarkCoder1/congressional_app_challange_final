import seedLearningRecords from "@/data/learning-records.json";
import type {
  AssignmentEvaluationHistoryEntry,
  AssignmentEvaluationPayload,
  AssignmentSubmissionHistoryEntry,
  AssignmentSubmissionPayload,
  CreateLearningRecordInput,
  LearningCompletionStatus,
  LearningHistoryEntry,
  LearningHistoryEntryBase,
  LearningItemBase,
  LearningItemType,
  LearningProgressSnapshot,
  LearningRecord,
  LearningRecordSummary,
  MasterTestAttemptHistoryEntry,
  MasterTestAttemptPayload,
  PracticeAttemptHistoryEntry,
  PracticeAttemptPayload,
  ReviewHistoryEntry,
  ReviewPayload,
  StudySessionHistoryEntry,
  StudySessionPayload,
} from "@/types/learning";

const LEARNING_RECORDS_STORAGE_KEY = "learning_records_v1";

let memoryRecords: LearningRecord[] = normalizeRecords(
  seedLearningRecords as LearningRecord[],
);

function createId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function now(): string {
  return new Date().toISOString();
}

function normalizeCompletionStatus(
  status?: LearningCompletionStatus,
): LearningCompletionStatus {
  return status ?? "not_started";
}

function normalizeProgress(
  progress?: Partial<LearningProgressSnapshot>,
  fallbackTime = now(),
): LearningProgressSnapshot {
  const percent = typeof progress?.percent === "number" ? progress.percent : 0;

  return {
    percent: Math.min(100, Math.max(0, Math.round(percent))),
    status: normalizeCompletionStatus(progress?.status),
    updatedAt: progress?.updatedAt ?? fallbackTime,
    score: progress?.score,
    completedAt: progress?.completedAt,
    stage: progress?.stage,
    note: progress?.note,
  };
}

function normalizeHistoryEntry(
  entry: LearningHistoryEntry,
): LearningHistoryEntry {
  return {
    ...entry,
    metadata: entry.metadata ?? {},
  };
}

function normalizeRecord(record: LearningRecord): LearningRecord {
  const timestamp = record.updatedAt || record.createdAt || now();

  return {
    ...record,
    createdAt: record.createdAt || timestamp,
    updatedAt: record.updatedAt || timestamp,
    lifecycleStatus: record.lifecycleStatus ?? "not_started",
    metadata: record.metadata ?? {},
    data: record.data ?? {},
    progress: normalizeProgress(record.progress, timestamp),
    history: Array.isArray(record.history)
      ? [...record.history]
          .map(normalizeHistoryEntry)
          .sort((left, right) =>
            left.occurredAt.localeCompare(right.occurredAt),
          )
      : [],
  } as LearningRecord;
}

function normalizeRecords(records: LearningRecord[]): LearningRecord[] {
  return records.map((record) => normalizeRecord(record));
}

function readStoredRecords(): LearningRecord[] {
  if (!isBrowser()) {
    return normalizeRecords(memoryRecords);
  }

  const raw = window.localStorage.getItem(LEARNING_RECORDS_STORAGE_KEY);
  if (!raw) {
    const normalizedSeeds = normalizeRecords(memoryRecords);
    window.localStorage.setItem(
      LEARNING_RECORDS_STORAGE_KEY,
      JSON.stringify(normalizedSeeds),
    );
    return [...normalizedSeeds];
  }

  try {
    const parsed = JSON.parse(raw) as LearningRecord[];
    return Array.isArray(parsed) ? normalizeRecords(parsed) : [];
  } catch {
    return [];
  }
}

function writeStoredRecords(records: LearningRecord[]): void {
  memoryRecords = normalizeRecords(records);
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    LEARNING_RECORDS_STORAGE_KEY,
    JSON.stringify(memoryRecords),
  );
}

function mergeRecordData(
  current: LearningRecord,
  incoming: LearningRecord,
): LearningRecord {
  return {
    ...current,
    ...incoming,
    createdAt: current.createdAt,
    updatedAt: incoming.updatedAt || now(),
    history: current.history,
  };
}

function buildSummary(record: LearningRecord): LearningRecordSummary {
  const historyCount = record.history.length;
  const latestActivityAt =
    record.history.at(-1)?.occurredAt ?? record.updatedAt ?? record.createdAt;

  return {
    id: record.id,
    kind: record.kind,
    title: record.title,
    subject: record.subject,
    lifecycleStatus: record.lifecycleStatus,
    latestActivityAt,
    historyCount,
    practiceAttemptCount: record.history.filter(
      (entry) => entry.kind === "practice_attempt",
    ).length,
    masterTestAttemptCount: record.history.filter(
      (entry) => entry.kind === "master_test_attempt",
    ).length,
    assignmentSubmissionCount: record.history.filter(
      (entry) => entry.kind === "assignment_submission",
    ).length,
    studySessionCount: record.history.filter(
      (entry) => entry.kind === "study_session",
    ).length,
    overallProgress: record.progress,
  };
}

function appendHistoryEntry<TEntry extends LearningHistoryEntry>(
  recordId: string,
  entry: TEntry,
): LearningRecord | undefined {
  const records = readStoredRecords();
  const index = records.findIndex((record) => record.id === recordId);
  if (index === -1) return undefined;

  const current = records[index];
  const nextRecord: LearningRecord = normalizeRecord({
    ...current,
    updatedAt: now(),
    history: [...current.history, normalizeHistoryEntry(entry)],
  });

  const nextRecords = [...records];
  nextRecords[index] = nextRecord;
  writeStoredRecords(nextRecords);
  return nextRecord;
}

export function getLearningRecords(): LearningRecord[] {
  return readStoredRecords();
}

export function getLearningRecordById(id: string): LearningRecord | undefined {
  return getLearningRecords().find((record) => record.id === id);
}

export function getLearningRecordSummary(
  id: string,
): LearningRecordSummary | undefined {
  const record = getLearningRecordById(id);
  return record ? buildSummary(record) : undefined;
}

export function getLearningRecordSummaries(): LearningRecordSummary[] {
  return getLearningRecords().map(buildSummary);
}

export function saveLearningRecord(record: LearningRecord): LearningRecord {
  const records = readStoredRecords();
  const nextRecord = normalizeRecord(record);
  const index = records.findIndex((item) => item.id === nextRecord.id);

  if (index === -1) {
    const nextRecords = [...records, nextRecord];
    writeStoredRecords(nextRecords);
    return nextRecord;
  }

  const mergedRecord = mergeRecordData(records[index], nextRecord);
  const nextRecords = [...records];
  nextRecords[index] = normalizeRecord(mergedRecord);
  writeStoredRecords(nextRecords);
  return nextRecords[index];
}

export function createLearningRecord(
  input: CreateLearningRecordInput,
): LearningRecord {
  const createdAt = input.createdAt ?? now();
  const record = normalizeRecord({
    id: createId(),
    kind: input.kind,
    title: input.title,
    subject: input.subject,
    sourceTaskId: input.sourceTaskId,
    createdAt,
    updatedAt: createdAt,
    lifecycleStatus: input.lifecycleStatus ?? "not_started",
    progress: normalizeProgress(input.progress, createdAt),
    metadata: input.metadata ?? {},
    data: input.data ?? {},
    history: input.history ?? [],
  });

  saveLearningRecord(record);
  return record;
}

export function setLearningRecordProgress(
  recordId: string,
  progress: Partial<LearningProgressSnapshot>,
): LearningRecord | undefined {
  const records = readStoredRecords();
  const index = records.findIndex((record) => record.id === recordId);
  if (index === -1) return undefined;

  const current = records[index];
  const nowStamp = now();
  const nextRecord = normalizeRecord({
    ...current,
    updatedAt: nowStamp,
    progress: normalizeProgress(
      {
        ...current.progress,
        ...progress,
        updatedAt: nowStamp,
      },
      nowStamp,
    ),
  });

  const nextRecords = [...records];
  nextRecords[index] = nextRecord;
  writeStoredRecords(nextRecords);
  return nextRecord;
}

export function updateLearningRecordMetadata(
  recordId: string,
  metadata: Record<string, unknown>,
): LearningRecord | undefined {
  const records = readStoredRecords();
  const index = records.findIndex((record) => record.id === recordId);
  if (index === -1) return undefined;

  const current = records[index];
  const nextRecord = normalizeRecord({
    ...current,
    updatedAt: now(),
    metadata: {
      ...current.metadata,
      ...metadata,
    },
  });

  const nextRecords = [...records];
  nextRecords[index] = nextRecord;
  writeStoredRecords(nextRecords);
  return nextRecord;
}

export function appendLearningHistoryEntry<TEntry extends LearningHistoryEntry>(
  recordId: string,
  entry: TEntry,
): LearningRecord | undefined {
  return appendHistoryEntry(recordId, entry);
}

export function recordPracticeAttempt(
  recordId: string,
  payload: PracticeAttemptPayload,
  metadata: Record<string, unknown> = {},
): PracticeAttemptHistoryEntry | undefined {
  const entry: PracticeAttemptHistoryEntry = {
    id: createId(),
    kind: "practice_attempt",
    recordId,
    occurredAt: now(),
    attemptNumber: payload.attemptNumber,
    completionStatus: payload.completionStatus,
    payload,
    metadata,
  };

  return appendHistoryEntry(recordId, entry) ? entry : undefined;
}

export function recordMasterTestAttempt(
  recordId: string,
  payload: MasterTestAttemptPayload,
  metadata: Record<string, unknown> = {},
): MasterTestAttemptHistoryEntry | undefined {
  const entry: MasterTestAttemptHistoryEntry = {
    id: createId(),
    kind: "master_test_attempt",
    recordId,
    occurredAt: now(),
    attemptNumber: payload.attemptNumber,
    completionStatus: "completed",
    payload,
    metadata,
  };

  return appendHistoryEntry(recordId, entry) ? entry : undefined;
}

export function recordAssignmentSubmission(
  recordId: string,
  payload: AssignmentSubmissionPayload,
  metadata: Record<string, unknown> = {},
): AssignmentSubmissionHistoryEntry | undefined {
  const entry: AssignmentSubmissionHistoryEntry = {
    id: createId(),
    kind: "assignment_submission",
    recordId,
    occurredAt: payload.submissionTimestamp,
    revisionNumber: payload.revisionNumber,
    completionStatus: payload.completionStatus,
    payload,
    metadata,
  };

  return appendHistoryEntry(recordId, entry) ? entry : undefined;
}

export function recordAssignmentEvaluation(
  recordId: string,
  payload: AssignmentEvaluationPayload,
  metadata: Record<string, unknown> = {},
): AssignmentEvaluationHistoryEntry | undefined {
  const entry: AssignmentEvaluationHistoryEntry = {
    id: createId(),
    kind: "assignment_evaluation",
    recordId,
    occurredAt: payload.evaluatedAt,
    completionStatus: "completed",
    payload,
    metadata,
  };

  return appendHistoryEntry(recordId, entry) ? entry : undefined;
}

export function recordStudySession(
  recordId: string,
  payload: StudySessionPayload,
  metadata: Record<string, unknown> = {},
): StudySessionHistoryEntry | undefined {
  const entry: StudySessionHistoryEntry = {
    id: createId(),
    kind: "study_session",
    recordId,
    occurredAt: payload.startTime,
    completionStatus: payload.completionStatus,
    payload,
    metadata,
  };

  return appendHistoryEntry(recordId, entry) ? entry : undefined;
}

export function recordReview(
  recordId: string,
  payload: ReviewPayload,
  metadata: Record<string, unknown> = {},
): ReviewHistoryEntry | undefined {
  const entry: ReviewHistoryEntry = {
    id: createId(),
    kind: "review",
    recordId,
    occurredAt: payload.reviewAt,
    completionStatus: "completed",
    payload,
    metadata,
  };

  return appendHistoryEntry(recordId, entry) ? entry : undefined;
}

export function getLearningRecordHistory(
  recordId: string,
): LearningHistoryEntry[] {
  return getLearningRecordById(recordId)?.history ?? [];
}
