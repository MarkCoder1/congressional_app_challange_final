"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Task, Subject, TaskType } from "@/lib/types";
import { getTaskTypeLabel } from "@/lib/navigation";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
}

const SUBJECTS: Subject[] = [
  "Math",
  "History",
  "Science",
  "Physics",
  "Programming",
  "Biology",
  "Spanish",
];

const TASK_TYPES: TaskType[] = ["concept", "lesson", "assignment", "mixed"];

export function TaskModal({ isOpen, onClose, onSubmit }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Subject>("Math");
  const [taskType, setTaskType] = useState<TaskType>("concept");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    if (!deadline) {
      alert("Please select a deadline");
      return;
    }

    onSubmit({
      title,
      subject,
      taskType,
      deadline,
      priority,
    });

    // Reset form
    setTitle("");
    setSubject("Math");
    setTaskType("concept");
    setDeadline("");
    setPriority("medium");
    onClose();
  };

  if (!isOpen) return null;

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-card rounded-xl max-w-lg w-full shadow-xl border border-border">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Quick Add Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-all duration-200 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Task Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to learn?"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-200"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Subject <span className="text-red-600">*</span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-200"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Type <span className="text-red-600">*</span>
            </label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as TaskType)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {TASK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {getTaskTypeLabel(t)}
                </option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Deadline <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={today}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-200"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold mb-2">Priority</label>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPriority(level)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize active:scale-95 ${
                    priority === level
                      ? "bg-accent text-white"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {level === "low"
                    ? "🟢"
                    : level === "medium"
                      ? "🟡"
                      : "🔴"}
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-card border-t border-border px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-lg font-medium hover:bg-secondary transition-all duration-200 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
