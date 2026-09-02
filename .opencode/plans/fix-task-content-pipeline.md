# Fix Plan: Task Content Generation Pipeline

## Root cause (confirmed empirically)

Every AI call requests Groq model `llama-3.3-70b-versatile`, which **no longer exists on the
account's Groq plan** (deprecated/removed server-side by Groq — not caused by any code change).
A direct API test returns:

```
{"error":{"message":"The model `llama-3.3-70b-versatile` does not exist or you do not have access to it.","code":"model_not_found"}}
```

Available chat models on this key: `openai/gpt-oss-120b` (verified working with
`response_format: json_object`, returns clean task-specific JSON), `openai/gpt-oss-20b`,
`qwen/qwen3.6-27b`, `groq/compound(-mini)`.

Each generation therefore throws → silent `catch` blocks substitute generic fallback content →
that fallback is persisted as if it were real generated content.

## Verified data flow

1. Wizard submits correct data → `/api/tasks/create` ✔
2. `generateTaskContent()` + `generateVisualData()` fail (`model_not_found`) → return fallbacks ✘
3. Fallbacks attached to Task and stored in SQLite ✔ (verified row in `data/app.db`)
4. `/task/[id]` reads back exactly what was stored ✔
5. Workspace passes `task.practice/master/learningContent` to components correctly ✔

Storage, retrieval, and rendering are innocent. Corruption happens only at step 2.
"Master = Practice" symptom: fallback pools are tiny (2 unique history questions cycled into both sets).

Non-issues: `mockLearningData.ts` only computes stats from real answers; `mockQuestionsData.ts`
is dead code (imported nowhere); demo seeding disabled.

## Changes (user approved: shared constant + regenerate stale DB task)

1. **Create `lib/ai/model.ts`** exporting `ACTIVE_MODEL = "openai/gpt-oss-120b"`.
2. **Replace dead model string** in 8 files (~10 occurrences):
   - `lib/ai/generateTaskContent.ts` (lines 566, 573, 681)
   - `lib/ai/generateVisualData.ts` (line 200)
   - `app/api/ai/build-execution-steps/route.ts` (line 22)
   - `app/api/ai/summarise-research/route.ts` (line 21)
   - `app/api/ai/feedback/route.ts` (line 98)
   - `app/api/ai/validate-submission/route.ts` (line 168)
   - `app/api/ai/validate-quality/route.ts` (line 21)
   - `app/api/assignment/submit/route.ts` (line 57)
3. **Failure visibility**: log clear `[AI] request failed → fallback (task: title)` warnings so
   future failures are not silent.
4. **Fallback quality (req #10)**: pass task `title` into `generateSmartFallbackQuestions`;
   de-duplicate master questions against practice pool so Master ≠ Practice verbatim when a true
   fallback occurs. Fallback stays last-resort only.
5. **Regenerate stale DB task** ("Events leading to World War 2", id `82a138bd-…`): one-off dev
   script that re-runs generation and updates the existing row (preserving progress/status).
6. No architecture changes; storage/retrieval/workspace untouched.

## Verification

- `npx tsc --noEmit` clean; `next build` passes.
- Live test matrix via running dev server: create History lesson ("Events Leading to World War II"),
  Science lesson ("Newton's Laws of Motion"), English assignment ("Character Development"),
  Engineering assignment ("Design a Simple Bridge") → assert each has task-specific overview,
  key points, examples, steps, pro tip, visual map, ≥3 distinct practice questions, distinct
  master set; verify Learn/Practice/Master render from task data; then remove test tasks.
- Confirm stale WW2 task now shows WWII-specific content after regeneration.
- Remove temp scripts afterward.
