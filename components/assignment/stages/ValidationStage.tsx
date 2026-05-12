// /components/assignment/stages/ValidationStage.tsx
import { useState } from "react";
import { ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";
import { AssignmentContent, ExternalTool } from "../types";

interface ValidationStageProps {
  assignment: AssignmentContent;
  progress: number;
  finalOutput: string;
  links: string[];
  files: any[];
  externalTools: ExternalTool[];
  answers: Record<string, string>;
  taskId: string;
  onPrev: () => void;
}

export function ValidationStage({
  assignment,
  progress,
  finalOutput,
  links,
  files,
  externalTools,
  answers,
  taskId,
  onPrev,
}: ValidationStageProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      const res = await fetch("/api/assignment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          finalOutput,
          links,
          files: files.map(f => ({ name: f.name, type: f.type, url: f.url })),
          externalTools,
          answers,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitMessage("✅ Assignment submitted successfully! Your work has been recorded.");
      } else {
        setSubmitMessage("❌ " + data.message);
      }
    } catch (err) {
      setSubmitMessage("❌ Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">📊 Final Validation</h2>
      <div className="bg-card rounded-xl p-6 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Overall progress</span>
          <span className="text-2xl font-bold text-accent">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
          <h3 className="font-semibold mb-2">Submission summary</h3>
          <ul className="space-y-1 text-sm">
            <li>✍️ Written work: {finalOutput.trim().length > 0 ? "Provided" : "Missing"}</li>
            <li>🔗 Links added: {links.length}</li>
            <li>📎 Attachments: {files.length}</li>
            <li>🛠️ External tools: {externalTools.length}</li>
          </ul>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <h3 className="font-semibold mb-2">✅ Checklist</h3>
            <ul className="space-y-1">
              {assignment.validation.checklist.map((item, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">📐 Rubric</h3>
            <div className="space-y-1 text-sm">
              <div>Clarity: {assignment.validation.rubric.clarity}%</div>
              <div>Completeness: {assignment.validation.rubric.completeness}%</div>
              <div>Structure: {assignment.validation.rubric.structure}%</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-3 pt-4">
          <button onClick={onPrev} className="btn-secondary flex items-center gap-1">
            <ChevronLeft size={16} /> Back
          </button>
          <button
            onClick={handleFinalSubmit}
            disabled={submitting}
            className="btn-primary flex items-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
            {submitting ? "Submitting..." : "Final Submission"}
          </button>
        </div>
        {submitMessage && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 text-green-800 dark:text-green-400 text-sm">
            {submitMessage}
          </div>
        )}
      </div>
    </div>
  );
}