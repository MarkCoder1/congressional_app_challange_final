// /components/assignment/components/ResearchItemCard.tsx
import { LinkIcon, FileText, Sparkles, X, Loader2 } from "lucide-react";
import { ResearchItem } from "../types";

interface ResearchItemCardProps {
  item: ResearchItem;
  isSummarizing: boolean;
  onDelete: (id: string) => void;
  onAddTag: (id: string, tag: string) => void;
}

export function ResearchItemCard({ item, isSummarizing, onDelete, onAddTag }: ResearchItemCardProps) {
  return (
    <div className="p-3 rounded-lg bg-secondary/20 border border-border">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {item.type === "link" && <LinkIcon size={14} />}
            {item.type === "text" && <FileText size={14} />}
            {item.type === "note" && <Sparkles size={14} />}
            <span className="text-sm font-mono text-muted-foreground">{item.type}</span>
          </div>
          <p className="text-sm break-words">{item.content}</p>
          {item.aiSummary && (
            <div className="mt-2 p-2 bg-accent/10 rounded text-xs text-accent">
              🤖 {item.aiSummary}
            </div>
          )}
          {isSummarizing && (
            <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 size={12} className="animate-spin" /> AI summarizing...
            </div>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-secondary rounded text-xs">
                {tag}
              </span>
            ))}
            <button
              onClick={() => onAddTag(item.id, "important")}
              className="text-xs text-muted-foreground hover:text-accent"
            >
              +tag
            </button>
          </div>
        </div>
        <button onClick={() => onDelete(item.id)} className="text-muted-foreground hover:text-red-500">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}