"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  AlertCircle,
  Calendar,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { getTaskById } from "@/lib/storage";
import { EmptyState } from "@/components/EmptyState";

// --------------------- Type Definitions ---------------------
interface BreakdownStep {
  number: number;
  title: string;
  explanation: string;
  example?: string;
  keyPoint?: string;
}

interface Question {
  id: string;
  category: string;
  text: string;
  expectedAnswer: string;
  hint?: string;
  breakdownSteps?: BreakdownStep[];
}

interface Assignment {
  title: string;
  questions: Question[];
}

interface Task {
  id: string;
  subject: string;
  deadline: string;
  assignments: Assignment[];
}

// --------------------- Subcomponents ---------------------
function VisualSupport({ subject }: { subject: string }) {
  if (subject === "Math") {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Lightbulb size={16} />
          Quick Reference: Quadratic Forms
        </h4>
        <div className="space-y-2 text-sm text-blue-800 font-mono">
          <div>
            Standard: <span className="text-blue-600 font-bold">ax² + bx + c = 0</span>
          </div>
          <div>
            Vertex: <span className="text-blue-600 font-bold">a(x - h)² + k = 0</span>
          </div>
          <div>
            Factored: <span className="text-blue-600 font-bold">a(x - r₁)(x - r₂) = 0</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// --------------------- Main Component ---------------------
export default function AssignmentWorkspace({ params }: { params: { id: string } }) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());

  // Cast the result of getTaskById to Task | undefined
  const task = useMemo(() => getTaskById(params.id) as Task | undefined, [params.id]);
  const assignment = task?.assignments?.[0];

  // Early return if no assignment or no questions
  if (!assignment || assignment.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-sm">
          <EmptyState
            icon={<BookOpen size={32} />}
            title="No task found"
            description="No task found"
            actionLabel="Back to Dashboard"
            actionHref="/"
          />
        </div>
      </div>
    );
  }

  const currentQuestion = assignment.questions[currentQuestionIdx];
  const totalQuestions = assignment.questions.length;
  const progress = Math.round(((currentQuestionIdx + 1) / totalQuestions) * 100);

  // Guard against missing currentQuestion (should not happen if idx is valid)
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-sm">
          <p className="text-center text-muted-foreground">Question not found</p>
        </div>
      </div>
    );
  }

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((n) => n !== stepNumber) : [...prev, stepNumber]
    );
  };

  const handleNext = () => {
    if (currentQuestionIdx < totalQuestions - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setExpandedSteps([]);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
      setExpandedSteps([]);
    }
  };

  const handleSubmit = () => {
    const answer = userAnswers[currentQuestion.id] || "";
    if (answer.trim()) {
      const newCompleted = new Set(completedQuestions);
      newCompleted.add(currentQuestion.id);
      setCompletedQuestions(newCompleted);

      if (currentQuestionIdx < totalQuestions - 1) {
        setTimeout(() => handleNext(), 500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* LEFT PANEL - Assignment Overview */}
      <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border bg-card p-6 flex flex-col gap-6">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
          ← Back
        </Link>

        <div>
          <h1 className="text-2xl font-bold mb-3 text-foreground">{assignment.title}</h1>
          <div className="inline-block mb-4">
            <span className="px-3 py-1.5 bg-accent/10 text-accent font-semibold text-sm rounded-lg">
              {task?.subject ?? "Math"}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={16} />
              <span>Due: {task?.deadline ?? "TBD"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen size={16} />
              <span>{totalQuestions} Questions</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-semibold text-accent">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {completedQuestions.size} of {totalQuestions} completed
          </p>
        </div>

        {/* Question Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Questions</h3>
          <div className="space-y-1">
            {assignment.questions.map((q: Question, idx: number) => (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentQuestionIdx(idx);
                  setExpandedSteps([]);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:-translate-y-0.5 ${
                  currentQuestionIdx === idx
                    ? "bg-accent text-white font-medium"
                    : completedQuestions.has(q.id)
                    ? "bg-green-100 text-green-900"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Q{idx + 1}</span>
                  {completedQuestions.has(q.id) && <span className="text-xs">✓</span>}
                </div>
                <div className="text-xs opacity-75 truncate">{q.category}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Main Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Question {currentQuestionIdx + 1} of {totalQuestions}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIdx === 0}
                className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                disabled={currentQuestionIdx === totalQuestions - 1}
                className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6 fade-in-panel">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Question Area */}
              <div className="lg:col-span-2 space-y-6">
                <div className="card-base rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">
                    {currentQuestion.category}
                  </h3>

                  <div className="bg-secondary/30 rounded-lg p-6 mb-6">
                    <p className="text-lg font-mono font-semibold text-foreground">
                      {currentQuestion.text}
                    </p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Your Answer</label>
                    <input
                      type="text"
                      value={userAnswers[currentQuestion.id] || ""}
                      onChange={(e) =>
                        setUserAnswers({
                          ...userAnswers,
                          [currentQuestion.id]: e.target.value,
                        })
                      }
                      placeholder="Enter your answer..."
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-200"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <button onClick={handleSubmit} className="w-full btn-primary">
                      Submit Answer
                    </button>
                    {currentQuestion.hint && (
                      <button className="w-full btn-secondary flex items-center justify-center gap-2">
                        <Lightbulb size={18} />
                        Show Hint
                      </button>
                    )}
                  </div>
                </div>

                {currentQuestion.breakdownSteps && (
                  <div className="card-base rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">
                      Step-by-Step Guidance
                    </h3>
                    <div className="space-y-2">
                      {currentQuestion.breakdownSteps.map((step: BreakdownStep) => (
                        <div key={step.number} className="border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleStep(step.number)}
                            className="w-full px-4 py-4 text-left font-medium hover:bg-secondary/30 transition-all duration-200 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                                {step.number}
                              </div>
                              <span className="text-foreground">{step.title}</span>
                            </div>
                            <ChevronDown
                              size={20}
                              className={`transition-transform ${
                                expandedSteps.includes(step.number) ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {expandedSteps.includes(step.number) && (
                            <div className="px-4 py-4 border-t border-border bg-secondary/10 space-y-4">
                              <div>
                                <p className="text-sm text-foreground leading-relaxed">
                                  {step.explanation}
                                </p>
                              </div>
                              {step.example && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 font-mono text-sm">
                                  <p className="text-xs font-semibold text-blue-900 mb-2">
                                    Example:
                                  </p>
                                  <p className="text-blue-800">{step.example}</p>
                                </div>
                              )}
                              {step.keyPoint && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
                                  <Lightbulb
                                    size={16}
                                    className="text-yellow-600 flex-shrink-0 mt-0.5"
                                  />
                                  <div>
                                    <p className="text-xs font-semibold text-yellow-900 mb-1">
                                      Key Point
                                    </p>
                                    <p className="text-sm text-yellow-800">{step.keyPoint}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side Panel - Visual Support */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-4">
                  <VisualSupport subject={task?.subject ?? "Math"} />

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
                    <div className="flex gap-3">
                      <AlertCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-green-900 mb-2">
                          Expected Answer
                        </p>
                        <p className="text-sm text-green-800 font-mono">
                          {currentQuestion.expectedAnswer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}