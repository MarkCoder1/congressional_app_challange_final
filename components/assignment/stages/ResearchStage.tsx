// /components/assignment/stages/ResearchStage.tsx
import { ChevronLeft } from "lucide-react";
import { ResearchItemCard } from "../components/ResearchItemCard";
import { ResearchItem } from "../types";

interface ResearchStageProps {
  researchItems: ResearchItem[];
  newResearchContent: string;
  researchType: "link" | "note" | "text";
  summarizingId: string | null;
  onNewContentChange: (value: string) => void;
  onTypeChange: (value: "link" | "note" | "text") => void;
  onAddItem: () => void;
  onDeleteItem: (id: string) => void;
  onAddTag: (id: string, tag: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function ResearchStage({
  researchItems,
  newResearchContent,
  researchType,
  summarizingId,
  onNewContentChange,
  onTypeChange,
  onAddItem,
  onDeleteItem,
  onAddTag,
  onPrev,
  onNext,
}: ResearchStageProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">🔍 Research Board</h2>
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex gap-2 mb-4">
          <select
            value={researchType}
            onChange={(e) => onTypeChange(e.target.value as any)}
            className="px-2 py-1 rounded-md border border-border bg-background"
          >
            <option value="text">Text note</option>
            <option value="link">Link</option>
            <option value="note">Quick note</option>
          </select>
          <input
            type="text"
            value={newResearchContent}
            onChange={(e) => onNewContentChange(e.target.value)}
            placeholder={researchType === "link" ? "Paste URL..." : "Write your note..."}
            className="flex-1 p-2 rounded-md border border-border bg-background"
          />
          <button onClick={onAddItem} className="btn-secondary px-3 py-1">
            Add
          </button>
        </div>
        {researchItems.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            No research items yet. Add notes, links, or text snippets.
          </p>
        )}
        <div className="space-y-3">
          {researchItems.map(item => (
            <ResearchItemCard
              key={item.id}
              item={item}
              isSummarizing={summarizingId === item.id}
              onDelete={onDeleteItem}
              onAddTag={onAddTag}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between gap-3">
        <button onClick={onPrev} className="btn-secondary flex items-center gap-1">
          <ChevronLeft size={16} /> Back
        </button>
        <button onClick={onNext} className="btn-primary flex items-center gap-2">
          Continue to Execution →
        </button>
      </div>
    </div>
  );
}