"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TaskType } from "@/types/task";
import type { Subject } from "@/lib/types";

const subjects: Subject[] = [
  "Math",
  "History",
  "Science",
  "Physics",
  "Programming",
  "Biology",
  "Spanish",
  "English",
  "Literature",
  "Geography",
  "Chemistry",
  "Economics",
];

export default function CreateTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Subject>("Math");
  const [type, setType] = useState<TaskType>("lesson");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!title || !subject) {
      alert("Title and subject required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          subject,
          description,
          type,
          resources: { text: "", urls: [] },
          learningMaps: [],
          practice: [],
          master: [],
          assignments: [],
        }),
      });

      const data = await res.json();
      router.push(`/task/${data.id}`);
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold">Create New Task</h1>
          <p className="text-sm text-gray-500">
            Add a lesson or assignment to start learning
          </p>
        </div>

        {/* TITLE */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <input
            placeholder="e.g. Quadratic Functions"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black"
            disabled={loading}
          />
        </div>

        {/* SUBJECT */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as Subject)}
            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black"
            disabled={loading}
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* TYPE */}
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

        {/* DESCRIPTION */}
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

        {/* BUTTON with Loader */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating Task...
            </>
          ) : (
            "Create Task"
          )}
        </button>
      </div>
    </div>
  );
}