"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  PenLine,
  BookOpen,
  Clock,
  Calendar,
  Sparkles,
  Briefcase,
  Target,
  ScrollText,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type { TaskType, TaskDifficulty } from "@/types/task";
import { SubjectPicker } from "./SubjectPicker";
import type { Subject } from "@/lib/types";
import { TASK_WORKFLOWS } from "@/lib/workflows";
import type { WorkflowStage } from "@/lib/workflows";

const TYPE_OPTIONS: {
  value: string;
  label: string;
  icon: typeof BookOpen;
  description: string;
  mapTo: TaskType;
}[] = [
  { value: "lesson", label: "Lesson", icon: BookOpen, description: "Learn new concepts and skills", mapTo: "lesson" },
  { value: "assignment", label: "Assignment", icon: ScrollText, description: "Complete a graded task", mapTo: "assignment" },
  { value: "project", label: "Project", icon: Briefcase, description: "Build something hands-on", mapTo: "assignment" },
  { value: "exam", label: "Exam Preparation", icon: Target, description: "Study and review for a test", mapTo: "lesson" },
];

const DIFFICULTY_OPTIONS: {
  value: TaskDifficulty;
  label: string;
  description: string;
}[] = [
  { value: "easy", label: "Easy", description: "Review basic concepts" },
  { value: "medium", label: "Medium", description: "Apply understanding" },
  { value: "hard", label: "Hard", description: "Deep analysis and synthesis" },
];

const TIME_OPTIONS: { label: string; value: number | null }[] = [
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2+ hours", value: 120 },
  { label: "Custom", value: null },
];

const DEADLINE_OPTIONS: { label: string; value: string }[] = [
  { label: "No deadline", value: "none" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This week", value: "this-week" },
  { label: "Custom date", value: "custom" },
];

const STEPS = [
  { title: "What are you learning?", subtitle: "Give your learning plan a title" },
  { title: "Choose the subject", subtitle: "Select or enter your subject area" },
  { title: "What type of learning is this?", subtitle: "Choose the format that fits best" },
  { title: "Tell us more", subtitle: "Add details about what you want to learn" },
  { title: "How challenging is this?", subtitle: "Set the difficulty level" },
  { title: "How much time do you need?", subtitle: "Estimate your study time" },
  { title: "When is it due?", subtitle: "Set a deadline or leave it open" },
  { title: "Review your learning plan", subtitle: "Confirm everything looks right" },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

function getTomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function getThisWeekFridayISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day <= 5 ? 5 - day : 6;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function CreateTaskWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Subject | "">("");
  const [customSubject, setCustomSubject] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [type, setType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<TaskDifficulty | "">("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);
  const [customMinutes, setCustomMinutes] = useState("");
  const [deadlineOption, setDeadlineOption] = useState("none");
  const [customDate, setCustomDate] = useState("");

  const goTo = useCallback((next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setErrors({});
  }, [step]);

  const validateStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 0:
        if (!title.trim()) newErrors.title = "Enter a title for your learning plan";
        break;
      case 1:
        if (!subject && !customSubject.trim()) newErrors.subject = "Select or enter a subject";
        break;
      case 2:
        if (!type) newErrors.type = "Select a learning type";
        break;
      case 4:
        if (!difficulty) newErrors.difficulty = "Select a difficulty level";
        break;
      case 5:
        if (estimatedMinutes === null) newErrors.time = "Select or enter an estimated time";
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [step, title, subject, customSubject, type, difficulty, estimatedMinutes]);

  const handleNext = useCallback(() => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) goTo(step + 1);
  }, [step, validateStep, goTo]);

  const handleBack = useCallback(() => {
    if (step > 0) goTo(step - 1);
  }, [step, goTo]);

  const finalSubject = isCustom ? customSubject.trim() : (subject || "");

  const handleSubmit = async () => {
    if (!title || !finalSubject || !type || !difficulty) return;
    setLoading(true);
    try {
      const typeOption = TYPE_OPTIONS.find((o) => o.value === type || o.label === type);
      const mappedType: TaskType = typeOption?.mapTo || "lesson";

      let deadline = "";
      if (deadlineOption === "tomorrow") deadline = getTomorrowISO();
      else if (deadlineOption === "this-week") deadline = getThisWeekFridayISO();
      else if (deadlineOption === "custom") deadline = customDate;
      else deadline = "";

      const payload = {
        title: title.trim(),
        subject: finalSubject,
        description,
        type: mappedType,
        resources: { text: "", urls: [] },
        deadline,
        difficulty,
        estimatedMinutes: estimatedMinutes || 30,
      };

      const res = await fetch("/api/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create task");
      router.push(`/task/${data.id}`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-1.5 mb-8 justify-center">
        {STEPS.map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <button
              onClick={() => i < step && goTo(i)}
              disabled={i >= step}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "bg-primary w-6"
                  : i < step
                    ? "bg-primary/40 cursor-pointer hover:bg-primary/60"
                    : "bg-border"
              }`}
              aria-label={`Step ${i + 1}`}
            />
          </div>
        ))}
      </div>

      {/* Step indicator */}
      <p className="text-center text-xs text-muted-foreground font-medium mb-6">
        Step {step + 1} of {STEPS.length}
      </p>

      {/* Step content */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {/* Step header */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-1.5">
                {STEPS[step].title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {STEPS[step].subtitle}
              </p>
            </div>

            {/* Step body */}
            <div className="space-y-4">
              {step === 0 && (
                <div className="space-y-2">
                  <div className="relative">
                    <PenLine size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      autoFocus
                      placeholder='e.g. "Events Leading to World War I"'
                      value={title}
                      onChange={(e) => { setTitle(e.target.value); setErrors({}); }}
                      className="input-base pl-10"
                      disabled={loading}
                      onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    />
                  </div>
                  {errors.title && (
                    <p className="text-xs text-error ml-1">{errors.title}</p>
                  )}
                </div>
              )}

              {step === 1 && (
                <SubjectPicker
                  selected={typeof subject === "string" ? subject : ""}
                  isCustom={isCustom}
                  customValue={customSubject}
                  onSelect={(s) => { setSubject(s as Subject); setIsCustom(false); setErrors({}); }}
                  onCustomToggle={() => { setIsCustom(!isCustom); setErrors({}); }}
                  onCustomChange={(v) => { setCustomSubject(v); setErrors({}); }}
                  onNext={handleNext}
                  error={errors.subject}
                  disabled={loading}
                />
              )}

              {step === 2 && (
                <div className="space-y-3">
                  {TYPE_OPTIONS.map(({ value, label, icon: Icon, description: desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setType(value); setErrors({}); }}
                      disabled={loading}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                        type === value
                          ? "border-primary bg-primary-tint ring-1 ring-primary"
                          : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 ${
                          type === value ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                        }`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{label}</span>
                            {type === value && <Check size={14} className="text-primary" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {errors.type && (
                    <p className="text-xs text-error ml-1">{errors.type}</p>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <textarea
                    autoFocus
                    placeholder="Brief description of the topic you want to learn..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="textarea-base min-h-[100px]"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: Add any details that will help personalize your learning plan.
                  </p>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-3">
                  {DIFFICULTY_OPTIONS.map(({ value, label, description: desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setDifficulty(value); setErrors({}); }}
                      disabled={loading}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                        difficulty === value
                          ? "border-primary bg-primary-tint ring-1 ring-primary"
                          : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold ${
                          difficulty === value ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                        }`}>
                          {value === "easy" ? "1" : value === "medium" ? "2" : "3"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{label}</span>
                            {difficulty === value && <Check size={14} className="text-primary" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {errors.difficulty && (
                    <p className="text-xs text-error ml-1">{errors.difficulty}</p>
                  )}
                </div>
              )}

              {step === 5 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {TIME_OPTIONS.map(({ label, value }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          if (value !== null) {
                            setEstimatedMinutes(value);
                            setCustomMinutes("");
                          } else {
                            setEstimatedMinutes(null);
                          }
                          setErrors({});
                        }}
                        disabled={loading}
                        className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                          estimatedMinutes === value
                            ? "border-primary bg-primary-tint ring-1 ring-primary"
                            : value === null && estimatedMinutes === null
                              ? "border-primary bg-primary-tint ring-1 ring-primary"
                              : "border-border bg-card hover:border-muted-foreground/30"
                        }`}
                      >
                        <Clock size={18} className={`mx-auto mb-1.5 ${
                          estimatedMinutes === value || (value === null && estimatedMinutes === null)
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`} />
                        <span className="text-sm font-medium text-foreground">{label}</span>
                      </button>
                    ))}
                  </div>
                  {estimatedMinutes === null && (
                    <div className="space-y-2">
                      <input
                        autoFocus
                        type="number"
                        min={1}
                        max={999}
                        placeholder="Enter minutes..."
                        value={customMinutes}
                        onChange={(e) => { setCustomMinutes(e.target.value); setEstimatedMinutes(Number(e.target.value)); setErrors({}); }}
                        className="input-base"
                        disabled={loading}
                        onKeyDown={(e) => e.key === "Enter" && handleNext()}
                      />
                    </div>
                  )}
                  {errors.time && (
                    <p className="text-xs text-error ml-1">{errors.time}</p>
                  )}
                </div>
              )}

              {step === 6 && (
                <div className="space-y-3">
                  {DEADLINE_OPTIONS.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setDeadlineOption(value); setErrors({}); }}
                      disabled={loading}
                      className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                        deadlineOption === value
                          ? "border-primary bg-primary-tint ring-1 ring-primary"
                          : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          deadlineOption === value ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                        }`}>
                          <Calendar size={18} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{label}</span>
                          {deadlineOption === value && <Check size={14} className="text-primary" />}
                        </div>
                      </div>
                    </button>
                  ))}
                  {deadlineOption === "custom" && (
                    <input
                      autoFocus
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="input-base"
                      disabled={loading}
                    />
                  )}
                </div>
              )}

              {step === 7 && (
                <div className="space-y-5">
                  {/* Summary card */}
                  <div className="card-base p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Learning Plan Summary</h3>
                    <div className="space-y-2.5">
                      <SummaryRow label="Title" value={title} />
                      <SummaryRow label="Subject" value={finalSubject} />
                      <SummaryRow label="Type" value={TYPE_OPTIONS.find((o) => o.value === type)?.label || type} />
                      <SummaryRow label="Difficulty" value={difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : ""} />
                      <SummaryRow label="Estimated time" value={
                        estimatedMinutes ? (estimatedMinutes < 60 ? `${estimatedMinutes} min` : `${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60 || ""}`) : ""
                      } />
                      <SummaryRow label="Deadline" value={
                        deadlineOption === "none" ? "No deadline" :
                        deadlineOption === "tomorrow" ? "Tomorrow" :
                        deadlineOption === "this-week" ? "This week" :
                        deadlineOption === "custom" && customDate ? new Date(customDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""
                      } />
                    </div>
                  </div>

                  {/* Journey preview */}
                  <div className="card-base p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Your learning journey</h3>
                    {(() => {
                      const stages = TASK_WORKFLOWS[type] || TASK_WORKFLOWS.lesson;
                      const isLong = stages.length >= 5;

                      if (isLong) {
                        return (
                          <div className="space-y-2">
                            {stages.map((stage, idx) => (
                              <div key={stage.key}>
                                {idx > 0 && (
                                  <div className="flex justify-center py-1">
                                    <ChevronDown size={14} className="text-muted-foreground" />
                                  </div>
                                )}
                                <JourneyStage stage={stage} vertical />
                              </div>
                            ))}
                          </div>
                        );
                      }

                      return (
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {stages.map((stage, idx) => (
                            <div key={stage.key} className="flex items-center gap-2">
                              {idx > 0 && <ChevronRight size={16} className="text-muted-foreground shrink-0" />}
                              <JourneyStage stage={stage} />
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Create button */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !title || !finalSubject || !type || !difficulty}
                    className="btn-primary w-full h-12 text-base hover:cursor-pointer"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating Learning Plan...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles size={18} />
                        Create Learning Plan
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {step < STEPS.length - 1 && (
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="btn-ghost"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button onClick={handleNext} className="btn-primary">
            Next
            <ArrowRight size={16} />
          </button>
        </div>
      )}
      {step === STEPS.length - 1 && (
        <div className="flex items-center justify-start mt-8">
          <button
            onClick={handleBack}
            className="btn-ghost"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function JourneyStage({ stage, vertical }: { stage: WorkflowStage; vertical?: boolean }) {
  const Icon = stage.icon;

  if (vertical) {
    return (
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${stage.color} flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon size={15} className="text-white" />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-medium text-foreground">{stage.label}</span>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{stage.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-xl ${stage.color} flex items-center justify-center`}>
        <Icon size={16} className="text-white" />
      </div>
      <span className="text-xs font-medium text-foreground text-center">{stage.label}</span>
    </div>
  );
}
