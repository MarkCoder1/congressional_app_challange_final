// /lib/timeline.ts
export function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
}

export function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    'Math': 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300',
    'Science': 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300',
    'History': 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300',
    'English': 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300',
    'Biology': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300',
    'Physics': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-300',
    'Chemistry': 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300',
    'Computer Science': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300',
    'Programming': 'bg-violet-100 text-violet-800 dark:bg-violet-950/30 dark:text-violet-300',
    'General': 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300',
  };
  return colors[subject] || colors['General'];
}