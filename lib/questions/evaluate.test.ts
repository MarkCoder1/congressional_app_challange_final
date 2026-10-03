// /lib/questions/evaluate.test.ts
//
// Unit tests for the deterministic question evaluator. Run with the Node built-in
// test runner under type stripping:
//
//    node --test lib/questions/evaluate.test.ts
//
// All `@/...` imports here are type-only, so they are erased at runtime and no
// path alias resolver is required. Relative imports are used for the code under test.

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { evaluateQuestion, scoreQuestion } from "./evaluate.ts";
import { normalizeQuestion } from "./normalize.ts";
import type { Question } from "@/types/question";

const mc: Question = normalizeQuestion({
  id: "q1",
  type: "multiple-choice",
  prompt: "Pick one",
  options: [
    { id: "a", text: "A" },
    { id: "b", text: "B" },
  ],
  correctAnswer: "b",
})!;

const tf: Question = normalizeQuestion({
  id: "q2",
  type: "true-false",
  prompt: "True or false?",
  correctAnswer: "true",
})!;

const ms: Question = normalizeQuestion({
  id: "q3",
  type: "multi-select",
  prompt: "Pick all",
  options: [
    { id: "a", text: "A" },
    { id: "b", text: "B" },
    { id: "c", text: "C" },
  ],
  correctAnswers: ["a", "c"],
})!;

const sa: Question = normalizeQuestion({
  id: "q4",
  type: "short-answer",
  prompt: "Define X",
  acceptedAnswers: ["photosynthesis"],
})!;

const fb: Question = normalizeQuestion({
  id: "q5",
  type: "fill-blank",
  prompt: "Complete the sentence",
  text: "The capital of France is ___.",
  acceptedAnswers: ["paris"],
})!;

const num: Question = normalizeQuestion({
  id: "q6",
  type: "numeric",
  prompt: "How many?",
  correctAnswer: 42,
  tolerance: 0.5,
})!;

const match: Question = normalizeQuestion({
  id: "q7",
  type: "matching",
  prompt: "Match them",
  leftItems: [
    { id: "l1", text: "One" },
    { id: "l2", text: "Two" },
  ],
  rightItems: [
    { id: "r1", text: "I" },
    { id: "r2", text: "II" },
  ],
  correctPairs: [
    { leftId: "l1", rightId: "r1" },
    { leftId: "l2", rightId: "r2" },
  ],
})!;

const order: Question = normalizeQuestion({
  id: "q8",
  type: "ordering",
  prompt: "Order the steps",
  items: [
    { id: "s1", text: "First" },
    { id: "s2", text: "Second" },
    { id: "s3", text: "Third" },
  ],
  correctOrder: ["s1", "s2", "s3"],
})!;

const cat: Question = normalizeQuestion({
  id: "q9",
  type: "categorization",
  prompt: "Categorize",
  categories: [
    { id: "c1", text: "Fruit" },
    { id: "c2", text: "Veg" },
  ],
  items: [
    { id: "i1", text: "Apple" },
    { id: "i2", text: "Carrot" },
  ],
  correctCategories: { i1: "c1", i2: "c2" },
})!;

const dd: Question = normalizeQuestion({
  id: "q10",
  type: "drag-drop",
  prompt: "Drag into zones",
  items: [
    { id: "i1", text: "A" },
    { id: "i2", text: "B" },
  ],
  dropZones: [
    { id: "z1", text: "Zone 1" },
    { id: "z2", text: "Zone 2" },
  ],
  correctPlacements: { i1: "z1", i2: "z2" },
})!;

describe("scoreQuestion / evaluateQuestion", () => {
  it("multiple-choice: correct and incorrect", () => {
    assert.equal(evaluateQuestion(mc, "b").correct, true);
    assert.equal(evaluateQuestion(mc, "a").correct, false);
    assert.equal(scoreQuestion(mc, "b"), 100);
    assert.equal(scoreQuestion(mc, "a"), 0);
  });

  it("true-false: correct and incorrect", () => {
    assert.equal(evaluateQuestion(tf, "true").correct, true);
    assert.equal(evaluateQuestion(tf, "false").correct, false);
  });

  it("multi-select: perfect, partial, and wrong", () => {
    assert.equal(evaluateQuestion(ms, ["a", "c"]).status, "correct");
    assert.equal(scoreQuestion(ms, ["a", "c"]), 100);
    // Partial: only one correct chosen, none wrong => 1/2 = 50%.
    const partial = evaluateQuestion(ms, ["a"]);
    assert.equal(partial.status, "partial");
    assert.equal(partial.score, 50);
    // Wrong selection offsets correct => (1-1)/2 = 0%.
    assert.equal(evaluateQuestion(ms, ["a", "b"]).status, "incorrect");
    // Empty => incorrect.
    assert.equal(evaluateQuestion(ms, []).status, "incorrect");
  });

  it("short-answer: normalization (case/whitespace)", () => {
    assert.equal(evaluateQuestion(sa, "  PHOTOSYNTHESIS  ").correct, true);
    assert.equal(evaluateQuestion(sa, "respiration").correct, false);
    assert.equal(evaluateQuestion(sa, "").correct, false);
  });

  it("fill-blank: normalization (case/whitespace)", () => {
    assert.equal(evaluateQuestion(fb, " Paris ").correct, true);
    assert.equal(evaluateQuestion(fb, "london").correct, false);
  });

  it("numeric: exact, within tolerance, and outside tolerance", () => {
    assert.equal(evaluateQuestion(num, 42).correct, true);
    assert.equal(evaluateQuestion(num, 42.4).correct, true);
    assert.equal(evaluateQuestion(num, 42.6).correct, false);
    assert.equal(evaluateQuestion(num, "42").correct, true);
  });

  it("matching: full, partial, and none", () => {
    assert.equal(evaluateQuestion(match, { l1: "r1", l2: "r2" }).status, "correct");
    const partial = evaluateQuestion(match, { l1: "r1", l2: "r1" });
    assert.equal(partial.status, "partial");
    assert.equal(partial.score, 50);
    assert.match(partial.feedback ?? "", /1 of 2/);
    assert.equal(evaluateQuestion(match, {}).status, "incorrect");
  });

  it("ordering: exact, partial (positions), and empty", () => {
    assert.equal(evaluateQuestion(order, ["s1", "s2", "s3"]).status, "correct");
    // One item in its correct position => 1/3.
    const partial = evaluateQuestion(order, ["s1", "s3", "s2"]);
    assert.equal(partial.status, "partial");
    assert.equal(partial.score, 33);
    assert.match(partial.feedback ?? "", /1 of 3/);
    assert.equal(evaluateQuestion(order, []).status, "incorrect");
  });

  it("categorization: full, partial, and none", () => {
    assert.equal(evaluateQuestion(cat, { i1: "c1", i2: "c2" }).status, "correct");
    const partial = evaluateQuestion(cat, { i1: "c1", i2: "c1" });
    assert.equal(partial.status, "partial");
    assert.equal(partial.score, 50);
    assert.match(partial.feedback ?? "", /1 of 2/);
    assert.equal(evaluateQuestion(cat, {}).status, "incorrect");
  });

  it("drag-drop: full, partial, and none", () => {
    assert.equal(evaluateQuestion(dd, { i1: "z1", i2: "z2" }).status, "correct");
    const partial = evaluateQuestion(dd, { i1: "z1", i2: "z1" });
    assert.equal(partial.status, "partial");
    assert.equal(partial.score, 50);
    assert.equal(evaluateQuestion(dd, {}).status, "incorrect");
  });

  it("undefined/null/empty answers are always incorrect", () => {
    for (const q of [mc, tf, ms, sa, fb, num, match, order, cat, dd]) {
      assert.equal(evaluateQuestion(q, undefined).correct, false, q.type);
      assert.equal(evaluateQuestion(q, null).correct, false, q.type);
    }
  });
});
