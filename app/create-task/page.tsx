"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Subject, TaskType } from "@/lib/types";
import { createMockTask } from "@/lib/mockTasks";
import { getTaskTypeLabel } from "@/lib/navigation";

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

const PRIORITY_LEVELS = ["low", "medium", "high"] as const;

interface LearningSource {
  id: string;
  type: "text" | "link" | "file";
  content: string;
}

export default function CreateTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Subject>("Math");
  const [taskType, setTaskType] = useState<TaskType>("concept");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [sources, setSources] = useState<LearningSource[]>([]);
  const [newSourceType, setNewSourceType] = useState<"text" | "link" | "file">(
    "link"
  );
  const [newSourceContent, setNewSourceContent] = useState("");

  // Add a learning source
  const addSource = () => {
    if (!newSourceContent.trim()) return;

    setSources([
      ...sources,
      {
        id: Math.random().toString(),
        type: newSourceType,
        content: newSourceContent,
      },
    ]);
    setNewSourceContent("");
  };

  // Remove a learning source
  const removeSource = (id: string) => {
    setSources(sources.filter((s) => s.id !== id));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    if (!deadline) {
      alert("Please select a deadline");
      return;
    }

    setLoading(true);

    try {
      // Create mock task using factory function
      const newTask = createMockTask(title, subject, taskType);

      // Update with additional fields
      const updatedTask = {
        ...newTask,
        description,
        deadline,
        priority,
        sources: sources.map((s) => ({
          type: s.type,
          content: s.content,
          label: s.content.substring(0, 30),
        })),
      };

      // In a real app, this would save to the database
      // For now, we'll just redirect to the task page
      console.log("Created task:", updatedTask);

      // Use a fixed ID for mock purposes (in real app, would use returned ID)
      const mockId = "task-" + Math.random().toString(36).substr(2, 9);
      router.push(`/task/${mockId}`);
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-secondary rounded-lg transition-all duration-200 active:scale-95"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <BookOpen size={24} className="text-accent" />
              Create New Task
            </h1>
            <p className="text-sm text-muted-foreground">
              Set up a new learning task with your subject and resources
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <section className="card-base rounded-xl p-6 space-y-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center">
                  1
                </span>
                Basic Information
              </h2>
            </div>

            {/* Task Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Task Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Understanding Quadratic Functions"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 text-base transition-all duration-200"
              />
            </div>

            {/* Subject and Type */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Subject <span className="text-red-600">*</span>
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as Subject)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-200"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Task Type <span className="text-red-600">*</span>
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as TaskType)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  {TASK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {getTaskTypeLabel(t)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional: Describe what you need to learn or accomplish..."
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
              />
            </div>
          </section>

          {/* Learning Sources Section */}
          <section className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center">
                  2
                </span>
                Learning Sources (Optional)
              </h2>
            </div>

            {/* Source Input */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <select
                  value={newSourceType}
                  onChange={(e) =>
                    setNewSourceType(e.target.value as "text" | "link" | "file")
                  }
                  className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30 bg-white"
                >
                  <option value="link">Link/URL</option>
                  <option value="text">Text Resource</option>
                  <option value="file">File Reference</option>
                </select>

                <input
                  type="text"
                  value={newSourceContent}
                  onChange={(e) => setNewSourceContent(e.target.value)}
                  placeholder={
                    newSourceType === "link"
                      ? "e.g., https://..."
                      : newSourceType === "text"
                        ? "e.g., Chapter 5, Section 2"
                        : "e.g., chapter5-notes.pdf"
                  }
                  className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30"
                />

                <button
                  type="button"
                  onClick={addSource}
                  disabled={!newSourceContent.trim()}
                  className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add
                </button>
              </div>
            </div>

            {/* Sources List */}
            {sources.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">
                  Added Sources:
                </p>
                <div className="space-y-2">
                  {sources.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between gap-3 p-3 bg-secondary/30 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xs font-semibold text-accent uppercase px-2 py-1 bg-accent/10 rounded">
                          {source.type}
                        </span>
                        <p className="text-sm text-foreground truncate">
                          {source.content}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSource(source.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Deadline & Priority Section */}
          <section className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center">
                  3
                </span>
                Deadline & Priority
              </h2>
            </div>

            {/* Deadline and Priority */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Deadline <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={today}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                {deadline && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(deadline).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Priority
                </label>
                <div className="flex gap-2">
                  {PRIORITY_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPriority(level)}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors capitalize ${
                        priority === level
                          ? "bg-accent text-white"
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      }`}
                    >
                      {level === "low"
                        ? "🟢 Low"
                        : level === "medium"
                          ? "🟡 Medium"
                          : "🔴 High"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link
              href="/"
              className="flex-1 px-6 py-4 border border-border rounded-lg font-semibold hover:bg-secondary transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
