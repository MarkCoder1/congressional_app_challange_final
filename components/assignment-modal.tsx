"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Assignment, Question } from "@/lib/types";

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (assignment: Partial<Assignment>) => void;
}

export function AssignmentModal({
  isOpen,
  onClose,
  onSubmit,
}: AssignmentModalProps) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Partial<Question>[]>([
    { id: "1", text: "", hint: "" },
  ]);
  const [resources, setResources] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [enableBreakdown, setEnableBreakdown] = useState(true);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Math.random().toString(),
        text: "",
        hint: "",
      },
    ]);
  };

  const updateQuestion = (idx: number, field: string, value: string) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Please enter an assignment title");
      return;
    }

    const validQuestions = questions.filter((q) => q.text?.trim());
    if (validQuestions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    onSubmit({
      title,
      questions: validQuestions as Question[],
      resources: resources ? resources.split("\n").filter((r) => r.trim()) : [],
      notes: notes || undefined,
      enableBreakdown,
    });

    // Reset form
    setTitle("");
    setQuestions([{ id: "1", text: "", hint: "" }]);
    setResources("");
    setNotes("");
    setEnableBreakdown(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Create Assignment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Assignment Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Quadratic Formula Practice"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold">Questions</label>
              <button
                onClick={addQuestion}
                className="flex items-center gap-1 px-3 py-1 bg-accent text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={idx} className="border border-border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Question {idx + 1}
                    </p>
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(idx)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={q.text || ""}
                    onChange={(e) => updateQuestion(idx, "text", e.target.value)}
                    placeholder="Enter question text..."
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />

                  <input
                    type="text"
                    value={q.hint || ""}
                    onChange={(e) => updateQuestion(idx, "hint", e.target.value)}
                    placeholder="Optional hint..."
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Resources (one per line)
            </label>
            <textarea
              value={resources}
              onChange={(e) => setResources(e.target.value)}
              placeholder="e.g., Textbook Chapter 5&#10;Khan Academy Video&#10;Practice Problem Set"
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional instructions or focus areas..."
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* Breakdown Toggle */}
          <div className="flex items-center gap-3 bg-accent/5 p-4 rounded-lg border border-accent/20">
            <input
              type="checkbox"
              id="breakdown"
              checked={enableBreakdown}
              onChange={(e) => setEnableBreakdown(e.target.checked)}
              className="rounded border-border"
            />
            <label
              htmlFor="breakdown"
              className="text-sm font-medium cursor-pointer flex-1"
            >
              Enable step-by-step breakdown support
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Create Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
