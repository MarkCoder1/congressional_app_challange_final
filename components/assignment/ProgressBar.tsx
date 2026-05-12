// /components/assignment/ProgressBar.tsx
interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>Assignment progress</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}