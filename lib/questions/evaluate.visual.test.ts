// /lib/questions/evaluate.visual.test.ts
//
// Unit tests for the six visual question evaluators.
// Run with: node --test lib/questions/evaluate.visual.test.ts
// or: npm test

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { evaluateQuestion, scoreQuestion } from "./evaluate.ts";
import { normalizeQuestion } from "./normalize.ts";
import type { Question } from "@/types/question";

const dl: Question = normalizeQuestion({
  id: "v1",
  type: "diagram-label",
  prompt: "Label the cell",
  regions: [
    { id: "r1", label: "Nucleus", x: 10, y: 10, width: 20, height: 20 },
    { id: "r2", label: "Membrane", x: 40, y: 10, width: 20, height: 20 },
    { id: "r3", label: "Cytoplasm", x: 10, y: 40, width: 20, height: 20 },
    { id: "r4", label: "Mitochondria", x: 40, y: 40, width: 20, height: 20 },
  ],
  labels: [
    { id: "l1", text: "Nucleus" },
    { id: "l2", text: "Membrane" },
    { id: "l3", text: "Cytoplasm" },
    { id: "l4", text: "Mitochondria" },
  ],
  correctPlacements: { l1: "r1", l2: "r2", l3: "r3", l4: "r4" },
})!;

const gPoint: Question = normalizeQuestion({
  id: "v2",
  type: "graph",
  prompt: "Which point is on y=x?",
  xMin: -5,
  xMax: 5,
  yMin: -5,
  yMax: 5,
  points: [
    { id: "p1", x: 2, y: 2, label: "A" },
    { id: "p2", x: 2, y: 3, label: "B" },
  ],
  lines: [{ id: "ln1", fromX: -5, fromY: -5, toX: 5, toY: 5 }],
  interaction: "select-point",
  correctAnswer: "p1",
})!;

const gNumeric: Question = normalizeQuestion({
  id: "v3",
  type: "graph",
  prompt: "What is the slope?",
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10,
  points: [{ id: "p1", x: -2, y: -2 }, { id: "p2", x: 2, y: 2 }],
  lines: [{ id: "ln1", fromX: -4, fromY: -4, toX: 4, toY: 4 }],
  interaction: "numeric",
  correctValue: 1,
  tolerance: 0.1,
})!;

const gChoose: Question = normalizeQuestion({
  id: "v4",
  type: "graph",
  prompt: "Which description matches?",
  xMin: -5,
  xMax: 5,
  yMin: -5,
  yMax: 5,
  interaction: "choose-graph",
  options: [
    { id: "a", text: "Positive slope" },
    { id: "b", text: "Negative slope" },
  ],
  correctAnswer: "a",
})!;

const tl: Question = normalizeQuestion({
  id: "v5",
  type: "timeline",
  prompt: "Order chronologically",
  events: [
    { id: "e1", label: "Event A", date: "1900" },
    { id: "e2", label: "Event B", date: "1950" },
    { id: "e3", label: "Event C", date: "2000" },
  ],
  correctOrder: ["e1", "e2", "e3"],
})!;

const fc: Question = normalizeQuestion({
  id: "v6",
  type: "flowchart",
  prompt: "Arrange steps",
  nodes: [
    { id: "n1", text: "Step 1" },
    { id: "n2", text: "Step 2" },
    { id: "n3", text: "Step 3" },
  ],
  correctOrder: ["n1", "n2", "n3"],
})!;

const sc: Question = normalizeQuestion({
  id: "v7",
  type: "scenario",
  prompt: "What should you do?",
  context: "A plant experiment...",
  evidence: [{ id: "ev1", title: "Data", kind: "text", content: "Plants in sun grew taller" }],
  options: [
    { id: "a", text: "No effect" },
    { id: "b", text: "Sun helps" },
  ],
  correctAnswer: "b",
})!;

const ed: Question = normalizeQuestion({
  id: "v8",
  type: "error-detection",
  prompt: "Which step has the error?",
  problem: "Solve 2x+3=11",
  steps: [
    { id: "s1", text: "2x+3=11" },
    { id: "s2", text: "2x=14" },
    { id: "s3", text: "x=7" },
  ],
  errorStepId: "s2",
})!;

describe("visual evaluators", () => {
  it("diagram-label: all correct", () => {
    const ans = { l1: "r1", l2: "r2", l3: "r3", l4: "r4" };
    assert.equal(evaluateQuestion(dl, ans).status, "correct");
    assert.equal(scoreQuestion(dl, ans), 100);
  });

  it("diagram-label: partial (2 of 4)", () => {
    const ans = { l1: "r1", l2: "r2", l3: "r1", l4: "r2" };
    const res = evaluateQuestion(dl, ans);
    assert.equal(res.status, "partial");
    assert.equal(res.score, 50);
    assert.match(res.feedback ?? "", /2 of 4/);
  });

  it("diagram-label: incorrect / empty", () => {
    assert.equal(evaluateQuestion(dl, { l1: "r2", l2: "r1", l3: "r4", l4: "r3" }).status, "incorrect");
    assert.equal(evaluateQuestion(dl, {}).status, "incorrect");
  });

  it("graph select-point: correct and incorrect", () => {
    assert.equal(evaluateQuestion(gPoint, "p1").correct, true);
    assert.equal(evaluateQuestion(gPoint, "p2").correct, false);
    assert.equal(scoreQuestion(gPoint, "p1"), 100);
    assert.equal(scoreQuestion(gPoint, "p2"), 0);
  });

  it("graph choose-graph: correct and incorrect", () => {
    assert.equal(evaluateQuestion(gChoose, "a").correct, true);
    assert.equal(evaluateQuestion(gChoose, "b").correct, false);
  });

  it("graph numeric: correct, within tolerance, outside, string numeric", () => {
    assert.equal(evaluateQuestion(gNumeric, 1).correct, true);
    assert.equal(evaluateQuestion(gNumeric, 1.05).correct, true);
    assert.equal(evaluateQuestion(gNumeric, 1.2).correct, false);
    assert.equal(evaluateQuestion(gNumeric, "1").correct, true);
    assert.equal(evaluateQuestion(gNumeric, "not a number").correct, false);
  });

  it("timeline: correct, incorrect, partial", () => {
    assert.equal(evaluateQuestion(tl, ["e1", "e2", "e3"]).status, "correct");
    const partial = evaluateQuestion(tl, ["e1", "e3", "e2"]);
    assert.equal(partial.status, "partial");
    assert.equal(partial.score, 33);
    assert.match(partial.feedback ?? "", /1 of 3/);
    // fully wrong order (no position matches)
    assert.equal(evaluateQuestion(tl, ["e2", "e3", "e1"]).score, 0);
    assert.equal(evaluateQuestion(tl, []).status, "incorrect");
  });

  it("flowchart: correct, incorrect, partial", () => {
    assert.equal(evaluateQuestion(fc, ["n1", "n2", "n3"]).status, "correct");
    const partial = evaluateQuestion(fc, ["n1", "n3", "n2"]);
    assert.equal(partial.status, "partial");
    assert.equal(partial.score, 33);
    // fully wrong order (no position matches)
    assert.equal(evaluateQuestion(fc, ["n2", "n3", "n1"]).score, 0);
    assert.equal(evaluateQuestion(fc, []).status, "incorrect");
  });

  it("scenario: correct and incorrect", () => {
    assert.equal(evaluateQuestion(sc, "b").correct, true);
    assert.equal(evaluateQuestion(sc, "a").correct, false);
    assert.equal(scoreQuestion(sc, "b"), 100);
    assert.equal(scoreQuestion(sc, "a"), 0);
  });

  it("error-detection: correct and incorrect", () => {
    assert.equal(evaluateQuestion(ed, "s2").correct, true);
    assert.equal(evaluateQuestion(ed, "s1").correct, false);
    assert.equal(evaluateQuestion(ed, "s3").correct, false);
    assert.equal(scoreQuestion(ed, "s2"), 100);
  });

  it("visual undefined/null are incorrect", () => {
    for (const q of [dl, gPoint, gNumeric, tl, fc, sc, ed]) {
      assert.equal(evaluateQuestion(q, undefined).correct, false, q.type);
      assert.equal(evaluateQuestion(q, null).correct, false, q.type);
    }
  });
});
