"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Circle,
  FolderKanban,
  Plus,
  Trash2,
} from "lucide-react";
import { FloatingNotebook } from "@/components/floating-notebook";
import { Button } from "@/components/ui/button";
import type { ProjectContent, Task } from "@/types/task";

const STORAGE_KEY = "studyflow-project-workspaces";

type ProjectStageKey = "plan" | "research" | "design" | "build" | "test" | "improve" | "finalize";

type ChecklistItem = { id: string; title: string; completed: boolean };
type ResearchQuestion = { id: string; text: string };
type ResearchSource = { id: string; title: string; reference: string };
type Improvement = { id: string; problem: string; change: string; completed: boolean };

type ProjectWorkspaceData = {
  activeStage: ProjectStageKey;
  completedStages: ProjectStageKey[];
  plan: { goal: string; deliverable: string; requirements: string; successCriteria: string };
  research: { questions: ResearchQuestion[]; notes: string; sources: ResearchSource[] };
  design: { outline: string; approach: string; components: ChecklistItem[] };
  build: { items: ChecklistItem[] };
  test: { requirements: ChecklistItem[]; issues: ChecklistItem[] };
  improve: { notes: string; improvements: Improvement[] };
  finalize: { items: ChecklistItem[] };
};

type StageDefinition = { key: ProjectStageKey; label: string; description: string };

const DEFAULT_STAGES: StageDefinition[] = [
  { key: "plan", label: "Plan", description: "Define the goal and the finished result." },
  { key: "research", label: "Research", description: "Gather questions, notes, and useful sources." },
  { key: "design", label: "Design", description: "Shape the approach before you build." },
  { key: "build", label: "Build", description: "Turn the plan into a working project." },
  { key: "test", label: "Test", description: "Check the project against its requirements." },
  { key: "improve", label: "Improve", description: "Use what you learned to refine the result." },
  { key: "finalize", label: "Finalize", description: "Complete the final review and prepare to share." },
];

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptyWorkspace(): ProjectWorkspaceData {
  return {
    activeStage: "plan",
    completedStages: [],
    plan: { goal: "", deliverable: "", requirements: "", successCriteria: "" },
    research: { questions: [], notes: "", sources: [] },
    design: { outline: "", approach: "", components: [] },
    build: { items: [] },
    test: { requirements: [], issues: [] },
    improve: { notes: "", improvements: [] },
    finalize: { items: [] },
  };
}

function readWorkspaces(): Record<string, ProjectWorkspaceData> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed as Record<string, ProjectWorkspaceData> : {};
  } catch {
    return {};
  }
}

function getStages(projectContent?: ProjectContent): StageDefinition[] {
  if (!projectContent?.stages?.length) return DEFAULT_STAGES;
  return projectContent.stages.map((stage) => ({
    key: stage.key as ProjectStageKey,
    label: stage.label,
    description: stage.description,
  }));
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="textarea-base min-h-28 resize-y"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="input-base"
        />
      )}
    </label>
  );
}

function AddTextItem({
  placeholder,
  buttonLabel,
  onAdd,
}: {
  placeholder: string;
  buttonLabel: string;
  onAdd: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const add = () => {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && add()}
        placeholder={placeholder}
        className="input-base flex-1"
        aria-label={placeholder}
      />
      <Button type="button" variant="secondary" size="sm" onClick={add} className="shrink-0">
        <Plus size={14} />
        {buttonLabel}
      </Button>
    </div>
  );
}

function Checklist({
  items,
  onToggle,
  onEdit,
  onDelete,
}: {
  items: ChecklistItem[];
  onToggle: (id: string) => void;
  onEdit?: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No items added yet.</p>;
  }
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <button
            type="button"
            onClick={() => onToggle(item.id)}
            className="shrink-0 rounded text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={item.completed ? `Mark ${item.title} incomplete` : `Mark ${item.title} complete`}
            aria-pressed={item.completed}
          >
            {item.completed ? <CheckSquareIcon /> : <SquareIcon />}
          </button>
          <input
            value={item.title}
            onChange={(event) => onEdit?.(item.id, event.target.value)}
            className={`min-w-0 flex-1 bg-transparent text-sm outline-none ${item.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
            aria-label={`Edit ${item.title}`}
          />
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="rounded p-1 text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Delete ${item.title}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function SquareIcon() {
  return <Circle size={17} />;
}

function CheckSquareIcon() {
  return <CheckCircle2 size={17} />;
}

export function ProjectWorkspace({ task }: { task: Task }) {
  const stages = getStages(task.projectContent);
  const [workspace, setWorkspace] = useState<ProjectWorkspaceData>(createEmptyWorkspace);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving...">("Saved");

  useEffect(() => {
    const hydrationId = window.setTimeout(() => {
      const stored = readWorkspaces()[task.id];
      setWorkspace(stored ?? createEmptyWorkspace());
      setHasLoaded(true);
    }, 0);
    return () => window.clearTimeout(hydrationId);
  }, [task.id]);

  useEffect(() => {
    if (!hasLoaded) return;
    const saveId = window.setTimeout(() => {
      const workspaces = readWorkspaces();
      workspaces[task.id] = workspace;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
      setSaveStatus("Saved");
    }, 180);
    return () => window.clearTimeout(saveId);
  }, [hasLoaded, task.id, workspace]);

  useEffect(() => {
    if (!hasLoaded) return;
    const flushStorage = () => {
      const workspaces = readWorkspaces();
      workspaces[task.id] = workspace;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
    };
    window.addEventListener("pagehide", flushStorage);
    return () => window.removeEventListener("pagehide", flushStorage);
  }, [hasLoaded, task.id, workspace]);

  const updateWorkspace = (update: (current: ProjectWorkspaceData) => ProjectWorkspaceData) => {
    setSaveStatus("Saving...");
    setWorkspace(update);
  };

  const selectedStage = stages.find((stage) => stage.key === workspace.activeStage) ?? stages[0];
  const completedCount = workspace.completedStages.length;
  const progress = Math.round((completedCount / stages.length) * 100);
  const nextStage = stages.find((stage) => !workspace.completedStages.includes(stage.key));
  const markStageComplete = () => {
    if (!selectedStage) return;
    updateWorkspace((current) => ({
      ...current,
      completedStages: current.completedStages.includes(selectedStage.key)
        ? current.completedStages.filter((key) => key !== selectedStage.key)
        : [...current.completedStages, selectedStage.key],
    }));
  };

  const updateListItem = (
    list: ChecklistItem[],
    id: string,
    update: Partial<ChecklistItem>,
  ) => list.map((item) => item.id === id ? { ...item, ...update } : item);

  const renderPlan = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <TextField label="Project Goal" value={workspace.plan.goal} onChange={(goal) => updateWorkspace((current) => ({ ...current, plan: { ...current.plan, goal } }))} placeholder="What should this project accomplish?" multiline />
      <TextField label="Final Deliverable" value={workspace.plan.deliverable} onChange={(deliverable) => updateWorkspace((current) => ({ ...current, plan: { ...current.plan, deliverable } }))} placeholder="What will you finish or present?" multiline />
      <TextField label="Requirements" value={workspace.plan.requirements} onChange={(requirements) => updateWorkspace((current) => ({ ...current, plan: { ...current.plan, requirements } }))} placeholder="What must the project include?" multiline />
      <TextField label="Success Criteria" value={workspace.plan.successCriteria} onChange={(successCriteria) => updateWorkspace((current) => ({ ...current, plan: { ...current.plan, successCriteria } }))} placeholder="How will you know it worked?" multiline />
    </div>
  );

  const renderResearch = () => (
    <div className="space-y-6">
      <section className="space-y-3">
        <div><h3 className="text-sm font-semibold text-foreground">Research Questions</h3><p className="caption">Capture what you need to find out.</p></div>
        <AddTextItem placeholder="Add a research question" buttonLabel="Add Question" onAdd={(text) => updateWorkspace((current) => ({ ...current, research: { ...current.research, questions: [...current.research.questions, { id: makeId("question"), text }] } }))} />
        <div className="space-y-2">{workspace.research.questions.map((question) => <div key={question.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"><input value={question.text} onChange={(event) => updateWorkspace((current) => ({ ...current, research: { ...current.research, questions: current.research.questions.map((item) => item.id === question.id ? { ...item, text: event.target.value } : item) } }))} className="min-w-0 flex-1 bg-transparent outline-none" aria-label={`Edit ${question.text}`} /><button type="button" onClick={() => updateWorkspace((current) => ({ ...current, research: { ...current.research, questions: current.research.questions.filter((item) => item.id !== question.id) } }))} className="text-muted-foreground hover:text-destructive" aria-label={`Delete ${question.text}`}><Trash2 size={14} /></button></div>)}</div>
      </section>
      <TextField label="Research Notes" value={workspace.research.notes} onChange={(notes) => updateWorkspace((current) => ({ ...current, research: { ...current.research, notes } }))} placeholder="Write down findings, observations, or useful ideas..." multiline />
      <section className="space-y-3">
        <div><h3 className="text-sm font-semibold text-foreground">Sources / Resources</h3><p className="caption">Save a title and URL or reference text.</p></div>
        <div className="grid gap-2 sm:grid-cols-2" id="project-source-fields"><input id="project-source-title" placeholder="Source title" className="input-base" aria-label="Source title" /><input id="project-source-reference" placeholder="URL or reference" className="input-base" aria-label="Source URL or reference" /></div>
        <Button type="button" variant="secondary" size="sm" onClick={() => { const titleInput = document.getElementById("project-source-title") as HTMLInputElement | null; const referenceInput = document.getElementById("project-source-reference") as HTMLInputElement | null; if (!titleInput?.value.trim() || !referenceInput?.value.trim()) return; updateWorkspace((current) => ({ ...current, research: { ...current.research, sources: [...current.research.sources, { id: makeId("source"), title: titleInput.value.trim(), reference: referenceInput.value.trim() }] } })); titleInput.value = ""; referenceInput.value = ""; }}><Plus size={14} /> Add Source</Button>
        <div className="space-y-2">{workspace.research.sources.map((source) => <div key={source.id} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1.3fr_auto] sm:items-center"><input value={source.title} onChange={(event) => updateWorkspace((current) => ({ ...current, research: { ...current.research, sources: current.research.sources.map((item) => item.id === source.id ? { ...item, title: event.target.value } : item) } }))} className="input-base" aria-label={`Edit source title ${source.title}`} /><input value={source.reference} onChange={(event) => updateWorkspace((current) => ({ ...current, research: { ...current.research, sources: current.research.sources.map((item) => item.id === source.id ? { ...item, reference: event.target.value } : item) } }))} className="input-base" aria-label={`Edit source reference ${source.title}`} /><button type="button" onClick={() => updateWorkspace((current) => ({ ...current, research: { ...current.research, sources: current.research.sources.filter((item) => item.id !== source.id) } }))} className="text-muted-foreground hover:text-destructive" aria-label={`Delete ${source.title}`}><Trash2 size={14} /></button></div>)}</div>
      </section>
    </div>
  );

  const renderDesign = () => (
    <div className="space-y-4">
      <TextField label="Project Outline" value={workspace.design.outline} onChange={(outline) => updateWorkspace((current) => ({ ...current, design: { ...current.design, outline } }))} placeholder="Describe the structure of the finished project..." multiline />
      <TextField label="Ideas / Approach" value={workspace.design.approach} onChange={(approach) => updateWorkspace((current) => ({ ...current, design: { ...current.design, approach } }))} placeholder="How will you create it?" multiline />
      <section className="space-y-3">
        <div><h3 className="text-sm font-semibold">Key Components</h3><p className="caption">List the main parts you expect to create.</p></div>
        <AddTextItem placeholder="Add a component" buttonLabel="Add Component" onAdd={(title) => updateWorkspace((current) => ({ ...current, design: { ...current.design, components: [...current.design.components, { id: makeId("component"), title, completed: false }] } }))} />
        <Checklist
          items={workspace.design.components}
          onToggle={(id) => updateWorkspace((current) => ({ ...current, design: { ...current.design, components: updateListItem(current.design.components, id, { completed: !current.design.components.find((item) => item.id === id)?.completed }) } }))}
          onEdit={(id, title) => updateWorkspace((current) => ({ ...current, design: { ...current.design, components: updateListItem(current.design.components, id, { title }) } }))}
          onDelete={(id) => updateWorkspace((current) => ({ ...current, design: { ...current.design, components: current.design.components.filter((item) => item.id !== id) } }))}
        />
      </section>
    </div>
  );

  const renderBuild = () => {
    const completedItems = workspace.build.items.filter((item) => item.completed).length;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h3 className="text-sm font-semibold">Build Checklist</h3><p className="caption">Track the work needed to create the project.</p></div>
          <span className="text-sm font-medium text-primary">{completedItems} / {workspace.build.items.length} completed</span>
        </div>
        <AddTextItem placeholder="Add a build item" buttonLabel="Add Item" onAdd={(title) => updateWorkspace((current) => ({ ...current, build: { items: [...current.build.items, { id: makeId("build"), title, completed: false }] } }))} />
        <Checklist
          items={workspace.build.items}
          onToggle={(id) => updateWorkspace((current) => ({ ...current, build: { items: updateListItem(current.build.items, id, { completed: !current.build.items.find((item) => item.id === id)?.completed }) } }))}
          onEdit={(id, title) => updateWorkspace((current) => ({ ...current, build: { items: updateListItem(current.build.items, id, { title }) } }))}
          onDelete={(id) => updateWorkspace((current) => ({ ...current, build: { items: current.build.items.filter((item) => item.id !== id) } }))}
        />
      </div>
    );
  };

  const renderTest = () => <div className="space-y-6"><section className="space-y-3"><div><h3 className="text-sm font-semibold">Requirements Checklist</h3><p className="caption">Verify each requirement before you finalize.</p></div><AddTextItem placeholder="Add a requirement" buttonLabel="Add Requirement" onAdd={(title) => updateWorkspace((current) => ({ ...current, test: { ...current.test, requirements: [...current.test.requirements, { id: makeId("requirement"), title, completed: false }] } }))} /><Checklist items={workspace.test.requirements} onToggle={(id) => updateWorkspace((current) => ({ ...current, test: { ...current.test, requirements: updateListItem(current.test.requirements, id, { completed: !current.test.requirements.find((item) => item.id === id)?.completed }) } }))} onDelete={(id) => updateWorkspace((current) => ({ ...current, test: { ...current.test, requirements: current.test.requirements.filter((item) => item.id !== id) } }))} /></section><section className="space-y-3"><div><h3 className="text-sm font-semibold">Issues Found</h3><p className="caption">Record issues and mark them resolved.</p></div><AddTextItem placeholder="Add an issue" buttonLabel="Add Issue" onAdd={(title) => updateWorkspace((current) => ({ ...current, test: { ...current.test, issues: [...current.test.issues, { id: makeId("issue"), title, completed: false }] } }))} /><Checklist items={workspace.test.issues} onToggle={(id) => updateWorkspace((current) => ({ ...current, test: { ...current.test, issues: updateListItem(current.test.issues, id, { completed: !current.test.issues.find((item) => item.id === id)?.completed }) } }))} onDelete={(id) => updateWorkspace((current) => ({ ...current, test: { ...current.test, issues: current.test.issues.filter((item) => item.id !== id) } }))} /></section></div>;

  const renderImprove = () => <div className="space-y-4"><TextField label="What could be improved?" value={workspace.improve.notes} onChange={(notes) => updateWorkspace((current) => ({ ...current, improve: { ...current.improve, notes } }))} placeholder="Write down what you would refine and why..." multiline /><section className="space-y-3"><div><h3 className="text-sm font-semibold">Improvements</h3><p className="caption">Track each change from problem to solution.</p></div><div className="grid gap-2 md:grid-cols-2"><input id="project-improvement-problem" placeholder="Problem" className="input-base" aria-label="Improvement problem" /><input id="project-improvement-change" placeholder="Change made" className="input-base" aria-label="Improvement change" /></div><Button type="button" variant="secondary" size="sm" onClick={() => { const problemInput = document.getElementById("project-improvement-problem") as HTMLInputElement | null; const changeInput = document.getElementById("project-improvement-change") as HTMLInputElement | null; if (!problemInput?.value.trim() || !changeInput?.value.trim()) return; updateWorkspace((current) => ({ ...current, improve: { ...current.improve, improvements: [...current.improve.improvements, { id: makeId("improvement"), problem: problemInput.value.trim(), change: changeInput.value.trim(), completed: false }] } })); problemInput.value = ""; changeInput.value = ""; }}><Plus size={14} /> Add Improvement</Button><div className="space-y-2">{workspace.improve.improvements.map((improvement) => <div key={improvement.id} className="rounded-lg border border-border p-3"><div className="flex items-start gap-2"><button type="button" onClick={() => updateWorkspace((current) => ({ ...current, improve: { ...current.improve, improvements: current.improve.improvements.map((item) => item.id === improvement.id ? { ...item, completed: !item.completed } : item) } }))} aria-label={`Mark improvement ${improvement.completed ? "incomplete" : "complete"}`} className="mt-0.5 text-primary">{improvement.completed ? <CheckCircle2 size={17} /> : <Circle size={17} />}</button><div className="min-w-0 flex-1"><p className="text-xs uppercase-label">Problem</p><p className="text-sm">{improvement.problem}</p><p className="mt-2 text-xs uppercase-label">Change made</p><p className="text-sm text-muted-foreground">{improvement.change}</p></div><button type="button" onClick={() => updateWorkspace((current) => ({ ...current, improve: { ...current.improve, improvements: current.improve.improvements.filter((item) => item.id !== improvement.id) } }))} className="text-muted-foreground hover:text-destructive" aria-label="Delete improvement"><Trash2 size={14} /></button></div></div>)}</div></section></div>;

  const renderFinalize = () => {
    const allComplete = workspace.finalize.items.length > 0 && workspace.finalize.items.every((item) => item.completed);
    return (
      <div className="space-y-4">
        <div><h3 className="text-sm font-semibold">Final Checklist</h3><p className="caption">Confirm the project is ready to share.</p></div>
        <AddTextItem placeholder="Add a final checklist item" buttonLabel="Add Item" onAdd={(title) => updateWorkspace((current) => ({ ...current, finalize: { items: [...current.finalize.items, { id: makeId("final"), title, completed: false }] } }))} />
        <Checklist
          items={workspace.finalize.items}
          onToggle={(id) => updateWorkspace((current) => ({ ...current, finalize: { items: updateListItem(current.finalize.items, id, { completed: !current.finalize.items.find((item) => item.id === id)?.completed }) } }))}
          onEdit={(id, title) => updateWorkspace((current) => ({ ...current, finalize: { items: updateListItem(current.finalize.items, id, { title }) } }))}
          onDelete={(id) => updateWorkspace((current) => ({ ...current, finalize: { items: current.finalize.items.filter((item) => item.id !== id) } }))}
        />
        {allComplete && !workspace.completedStages.includes("finalize") && <div className="rounded-lg border border-success/30 bg-success-tint p-4"><div className="flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 size={17} /> Final checklist complete</div><p className="mt-1 text-xs text-success">Mark the stage complete when your project is ready.</p></div>}
      </div>
    );
  };

  const renderStage = () => {
    switch (workspace.activeStage) {
      case "plan": return renderPlan();
      case "research": return renderResearch();
      case "design": return renderDesign();
      case "build": return renderBuild();
      case "test": return renderTest();
      case "improve": return renderImprove();
      case "finalize": return renderFinalize();
      default: return renderPlan();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="card-base p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary"><FolderKanban size={20} /></div>
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="truncate text-xl font-bold text-foreground sm:text-2xl">{task.title}</h1><span className="badge-accent rounded-md px-2 py-1">Project</span></div><p className="caption mt-1">{task.subject}{task.deadline ? ` · Due ${task.deadline}` : ""}</p></div>
            </div>
            <div className="min-w-40 lg:text-right"><div className="flex items-center gap-2 lg:justify-end"><p className="caption">Project Progress</p><span className="text-[11px] text-muted-foreground" aria-live="polite">{saveStatus}</span></div><p className="text-lg font-semibold text-primary">{progress}%</p><div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div></div>
          </div>

          <nav className="mt-6 overflow-x-auto border-b border-border" aria-label="Project stages"><div className="flex min-w-max gap-1 pb-px">{stages.map((stage) => { const completed = workspace.completedStages.includes(stage.key); const active = workspace.activeStage === stage.key; return <button key={stage.key} type="button" onClick={() => updateWorkspace((current) => ({ ...current, activeStage: stage.key }))} className={`flex items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`} aria-current={active ? "step" : undefined}>{completed ? <Check size={14} /> : <span className="text-xs">○</span>}{stage.label}</button>; })}</div></nav>

          <div className="mt-6 rounded-lg border border-primary/20 bg-primary-tint/40 p-4"><div className="flex items-start justify-between gap-3"><div><p className="uppercase-label text-primary">{nextStage ? "Next Step" : "Project Ready"}</p><p className="mt-1 text-sm font-semibold text-foreground">{nextStage ? `Continue with: ${nextStage.label}` : "All project stages are complete."}</p></div>{nextStage && <Button type="button" variant="secondary" size="sm" onClick={() => updateWorkspace((current) => ({ ...current, activeStage: nextStage.key }))}>Open {nextStage.label}</Button>}</div>{!nextStage && <p className="mt-1 text-xs text-muted-foreground">Your project workflow is complete.</p>}</div>

          {selectedStage && <section className="mt-6"><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="uppercase-label text-primary">Current stage</p><h2 className="mt-1 text-xl font-semibold text-foreground">{selectedStage.label}</h2><p className="caption mt-1">{selectedStage.description}</p></div><Button type="button" variant={workspace.completedStages.includes(selectedStage.key) ? "secondary" : "default"} size="sm" onClick={markStageComplete}>{workspace.completedStages.includes(selectedStage.key) ? <><CheckCircle2 size={15} /> Stage Complete</> : "Mark Stage Complete"}</Button></div><div className="min-w-0">{renderStage()}</div></section>}

          {!nextStage && <div className="mt-6 rounded-lg border border-success/30 bg-success-tint p-4"><div className="flex items-center gap-2 text-sm font-semibold text-success"><CheckCircle2 size={17} /> Project Ready</div><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{stages.map((stage) => <div key={stage.key} className="flex items-center gap-2 text-xs text-success"><CheckCircle2 size={14} /> {stage.label}</div>)}</div></div>}
        </div>
      </div>
      <FloatingNotebook taskId={task.id} taskTitle={task.title} />
    </div>
  );
}
