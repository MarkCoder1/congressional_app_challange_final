"use client";

// /components/questions/option-button.tsx
//
// Shared selectable option button used by multiple-choice, multi-select, and
// true/false renderers. Consistent StudyFlow look, keyboard accessible, with a
// visible focus and selected state (the selected state is also conveyed via a
// filled dot / check, not color alone).

interface OptionButtonProps {
  id: string;
  text: string;
  selected: boolean;
  onSelect: (id: string) => void;
  kind?: "single" | "multi" | "tf";
}

export function OptionButton({
  id,
  text,
  selected,
  onSelect,
  kind = "single",
}: OptionButtonProps) {
  return (
    <button
      type="button"
      role={kind === "multi" ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={() => onSelect(id)}
      className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        selected
          ? kind === "tf"
            ? "border-primary bg-accent/10 text-primary"
            : "border-primary bg-accent/10"
          : "border-border hover:border-primary/50 hover:bg-secondary/40"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors ${
          kind === "multi" ? "rounded-md" : "rounded-full"
        } ${selected ? "border-primary bg-primary" : "border-muted-foreground/40"}`}
      >
        {selected &&
          (kind === "multi" ? (
            <CheckMark />
          ) : (
            <span className="h-2 w-2 rounded-full bg-white" />
          ))}
      </span>
      <span className="min-w-0 text-sm font-medium text-foreground">{text}</span>
    </button>
  );
}

function CheckMark() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
