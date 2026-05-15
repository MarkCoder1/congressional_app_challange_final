// /components/assignment/stages/ValidationStage.tsx
"use client";
import { useState } from "react";
import { Trophy, CheckCircle, AlertCircle } from "lucide-react";

interface ValidationStageProps {
  assignment: any;
  progress: number;
  finalOutput: string;
  links: any[];
  files: any[];
  externalTools: any[];
  answers: any;
  taskId: string;
  onPrev: () => void;
  onSubmissionSuccess?: () => Promise<void>;
}

interface AiReview {
  overallScore: number;
  rubric: {
    clarity: number;
    completeness: number;
    structure: number;
  };
  checklist: string[];
  feedback: string;
  strengths?: string[];
  weaknesses?: string[];
  passed?: boolean;
}

export default function ValidationStage({
  assignment,
  progress,
  finalOutput,
  links,
  files,
  externalTools,
  answers,
  taskId,
  onPrev,
  onSubmissionSuccess,
}: ValidationStageProps) {
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState<AiReview | null>(null);
  const [error, setError] = useState("");

  const handleFinalSubmission = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/assignment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          finalOutput,
          links,
          files,
          externalTools,
          answers,
          assignment,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit assignment");
      }

      if (data.review) {
        setReview(data.review);
        if (onSubmissionSuccess) {
          await onSubmissionSuccess();
        }
      } else {
        throw new Error("No review received from server");
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ... rest of your component stays the same (the review UI part)
  if (review) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-3xl font-bold">Assignment Reviewed!</h2>
          <p className="text-5xl font-bold text-accent mt-4">
            {review.overallScore}/100
          </p>
        </div>

        {/* Submission Summary */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">📊 Submission Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>✍️ Written work: <strong>Provided</strong></div>
            <div>🔗 Links added: <strong>{links.length}</strong></div>
            <div>📎 Attachments: <strong>{files.length}</strong></div>
            <div>🛠️ External tools: <strong>{externalTools.length}</strong></div>
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">✅ Checklist</h3>
          <ul className="space-y-2">
            {review.checklist?.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Rubric */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">📐 Rubric</h3>
          <div className="space-y-4">
            {Object.entries(review.rubric || {}).map(([key, score]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="capitalize">{key}</span>
                <span className="font-semibold text-accent">
                  {typeof score === "number" ? score : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-3">Teacher Feedback</h3>
          <p className="leading-relaxed text-muted-foreground">
            {review.feedback}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">📊 Final Validation</h2>
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-sm text-muted-foreground mb-6">
          Review everything one last time before submitting for AI grading.
        </p>

        <button
          onClick={handleFinalSubmission}
          disabled={submitting || !finalOutput?.trim()}
          className="w-full py-4 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {submitting ? "AI is Grading..." : "Submit for Final Review"}
        </button>

        {error && (
          <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </p>
        )}
      </div>

      <button
        onClick={onPrev}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Go Back
      </button>
    </div>
  );
}