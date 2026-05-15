"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TaskType } from "@/types/task";
import type { Subject } from "@/lib/types";

const presetSubjects: Subject[] = [
  "Math", "History", "Science", "Physics", "Programming",
  "Biology", "Spanish", "English", "Literature", "Geography",
  "Chemistry", "Economics"
];

export default function CreateTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Subject>("Math");
  const [customSubject, setCustomSubject] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [type, setType] = useState<TaskType>("lesson");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const finalSubject = isCustom ? customSubject.trim() : subject;

  const handleSubmit = async () => {
    if (!title || !finalSubject) {
      alert("Title and subject are required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title,
        subject: finalSubject,
        description,
        type,
        resources: { text: "", urls: [] },
        deadline,                    // ← Add this
      };

      const res = await fetch("/api/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to create task");

      router.push(`/task/${data.id}`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Create New Task</h1>
          <p className="text-sm text-gray-500">Add a lesson or assignment</p>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <input
            placeholder="e.g. Pythagorean Theorem"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black"
            disabled={loading}
          />
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Subject</label>

          <select
            value={isCustom ? "other" : subject}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "other") {
                setIsCustom(true);
              } else {
                setIsCustom(false);
                setSubject(value as Subject);
              }
            }}
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black"
            disabled={loading}
          >
            {presetSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
            <option value="other">Other (Custom)</option>
          </select>

          {/* Custom Subject Input */}
          {isCustom && (
            <input
              type="text"
              placeholder="Enter custom subject (e.g. Psychology, Art History...)"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black mt-2"
              disabled={loading}
            />
          )}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TaskType)}
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black"
            disabled={loading}
          >
            <option value="lesson">Lesson</option>
            <option value="assignment">Assignment</option>
          </select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            placeholder="Brief explanation of the topic..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded-lg p-3 w-full h-28 resize-none focus:outline-none focus:ring-2 focus:ring-black"
            disabled={loading}
          />
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Deadline (Optional)</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black"
            disabled={loading}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !title || !finalSubject}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? "Creating Task..." : "Create Task"}
        </button>
      </div>
    </div>
  );
}