export function formatRelativeTime(dateStr: string | undefined | null): string {
  if (!dateStr) return "No deadline";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 3600 * 24));

  if (diffDays < 0) {
    const abs = Math.abs(diffDays);
    if (abs === 1) return "Overdue by 1 day";
    return `Overdue by ${abs} days`;
  }
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  if (diffDays <= 30) return `Due in ${Math.floor(diffDays / 7)} weeks`;
  return `Due ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export function formatShortDate(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
