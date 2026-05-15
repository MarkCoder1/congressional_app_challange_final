// stores/focusStore.ts
import { create } from 'zustand';

type FocusSession = {
  taskId: string;
  title: string;
  type: 'lesson' | 'assignment';
  progress: number;
  currentStep: string;
  completedSteps: string[];
  timerDuration: number;
  timeLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  focusTimeToday: number;
};

interface FocusStore {
  isActive: boolean;
  session: FocusSession | null;
  startFocus: (task: any) => void;
  endFocus: () => void;
  updateProgress: (newProgress: number) => void;
  completeStep: (step: string) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setDuration: (minutes: number) => void;
  tick: () => void;
}

export const useFocusStore = create<FocusStore>((set, get) => ({
  isActive: false,
  session: null,

  startFocus: (task) => {
    const initialStep = task.type === 'assignment' ? 'overview' : 'learn';
    
    set({
      isActive: true,
      session: {
        taskId: task.id,
        title: task.title,
        type: task.type || 'lesson',
        progress: task.progress || 0,
        currentStep: initialStep,
        completedSteps: [],
        timerDuration: 25 * 60,
        timeLeft: 25 * 60,
        isRunning: false,
        sessionsCompleted: 0,
        focusTimeToday: 0,
      },
    });
  },

  endFocus: () => set({ isActive: false, session: null }),

  updateProgress: (newProgress) => {
    const { session } = get();
    if (!session) return;
    set({
      session: { ...session, progress: Math.min(100, newProgress) }
    });
  },

  completeStep: (step) => {
    const { session } = get();
    if (!session) return;

    const newCompleted = [...session.completedSteps, step];
    const newProgress = Math.min(100, session.progress + 15);

    set({
      session: {
        ...session,
        completedSteps: newCompleted,
        currentStep: getNextStep(session.type, step),
        progress: newProgress,
      }
    });
  },

  startTimer: () => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, isRunning: true } });
  },

  pauseTimer: () => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, isRunning: false } });
  },

  resetTimer: () => {
    const { session } = get();
    if (!session) return;
    set({
      session: { ...session, timeLeft: session.timerDuration, isRunning: false }
    });
  },

  setDuration: (minutes) => {
    const { session } = get();
    if (!session) return;
    const seconds = minutes * 60;
    set({
      session: { ...session, timerDuration: seconds, timeLeft: seconds }
    });
  },

  tick: () => {
    const { session } = get();
    if (!session || !session.isRunning) return;

    if (session.timeLeft <= 1) {
      // Timer complete
      set({
        session: {
          ...session,
          timeLeft: 0,
          isRunning: false,
          sessionsCompleted: session.sessionsCompleted + 1,
          focusTimeToday: session.focusTimeToday + session.timerDuration,
        }
      });
      // You can trigger confetti or notification here
    } else {
      set({ session: { ...session, timeLeft: session.timeLeft - 1 } });
    }
  },
}));

// Helper for next step
const getNextStep = (type: string, current: string) => {
  if (type === 'assignment') {
    const flow = ['overview', 'research', 'execution', 'checkpoints', 'quality', 'validation'];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : 'validation';
  } else {
    const flow = ['learn', 'practice', 'master'];
    const idx = flow.indexOf(current);
    return idx < flow.length - 1 ? flow[idx + 1] : 'master';
  }
};