// /components/assignment/hooks/useAssignmentWorkspace.ts
import { useState } from "react";
import {
  AssignmentContent,
  Stage,
  ResearchItem,
  ExecutionStep,
  ValidationResult,
  ExternalTool,
} from "../types";

export function useAssignmentWorkspace(assignment: AssignmentContent) {
  // Core workflow state
  const [stage, setStage] = useState<Stage>("overview");
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalOutput, setFinalOutput] = useState(assignment.submission?.text || "");
  const taskId = (assignment as any).taskId ?? (assignment as any).id ?? "";

  // Multi-source submission state
  const [links, setLinks] = useState<string[]>(assignment.submission?.links || []);
  const [newLink, setNewLink] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [externalTools, setExternalTools] = useState<ExternalTool[]>([]);
  const [newToolType, setNewToolType] = useState<ExternalTool["type"]>("canva");
  const [newToolUrl, setNewToolUrl] = useState("");

  // Research Board state
  const [researchItems, setResearchItems] = useState<ResearchItem[]>([]);
  const [newResearchContent, setNewResearchContent] = useState("");
  const [researchType, setResearchType] = useState<ResearchItem["type"]>("text");
  const [summarizingId, setSummarizingId] = useState<string | null>(null);

  // Execution Builder state
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [autoBuilding, setAutoBuilding] = useState(false);

  // Live Quality Validator state
  const [validatorInput, setValidatorInput] = useState("");
  const [validatorResult, setValidatorResult] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [improvedText, setImprovedText] = useState("");

  // Progress calculation
  const totalPlanSteps = assignment.plan.steps.length;
  const totalCheckpoints = assignment.checkpoints.length;
  const stepsDone = Object.values(completedSteps).filter(Boolean).length;
  const checkpointsDone = Object.values(answers).filter(a => a.trim().length > 0).length;

  const hasText = finalOutput.trim().length > 0;
  const hasLinks = links.length > 0;
  const hasFiles = files.length > 0;
  const hasTools = externalTools.length > 0;
  const hasAnySubmission = hasText || hasLinks || hasFiles || hasTools;

  const stepsWeight = 30;
  const checkpointsWeight = 20;
  const submissionWeight = 50;

  const stepsProgress = (stepsDone / totalPlanSteps) * stepsWeight;
  const checkpointsProgress = (checkpointsDone / totalCheckpoints) * checkpointsWeight;
  const submissionProgress = hasAnySubmission ? submissionWeight : 0;
  const progress = Math.min(100, Math.floor(stepsProgress + checkpointsProgress + submissionProgress));

  // Handlers
  const addLink = () => {
    if (newLink.trim()) {
      setLinks([...links, newLink.trim()]);
      setNewLink("");
    }
  };
  const removeLink = (idx: number) => setLinks(links.filter((_, i) => i !== idx));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = Array.from(e.target.files || []);
    const newFiles = uploaded.map(file => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      fileObject: file,
    }));
    setFiles([...files, ...newFiles]);
  };
  const removeFile = (idx: number) => {
    URL.revokeObjectURL(files[idx].url);
    setFiles(files.filter((_, i) => i !== idx));
  };

  const addExternalTool = () => {
    if (newToolUrl.trim()) {
      setExternalTools([...externalTools, { type: newToolType, url: newToolUrl.trim() }]);
      setNewToolUrl("");
    }
  };
  const removeTool = (idx: number) => setExternalTools(externalTools.filter((_, i) => i !== idx));

  const handleAnswerChange = (id: string, value: string) =>
    setAnswers(prev => ({ ...prev, [id]: value }));

  const handleStepToggle = (stepId: string) =>
    setCompletedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));

  // Research Board methods
  const addResearchItem = () => {
    if (!newResearchContent.trim()) return;
    const newItem: ResearchItem = {
      id: crypto.randomUUID(),
      type: researchType,
      content: newResearchContent.trim(),
      tags: [],
    };
    setResearchItems([...researchItems, newItem]);
    setNewResearchContent("");
    summarizeItem(newItem.id, newItem.content, newItem.type);
  };

  const summarizeItem = async (id: string, content: string, type: string) => {
    setSummarizingId(id);
    try {
      const res = await fetch("/api/ai/summarise-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type }),
      });
      const data = await res.json();
      setResearchItems(prev =>
        prev.map(item => (item.id === id ? { ...item, aiSummary: data.summary } : item))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSummarizingId(null);
    }
  };

  const deleteResearchItem = (id: string) => {
    setResearchItems(prev => prev.filter(item => item.id !== id));
  };

  const addTag = (id: string, tag: string) => {
    setResearchItems(prev =>
      prev.map(item => (item.id === id ? { ...item, tags: [...item.tags, tag] } : item))
    );
  };

  // Execution Builder methods
  const addExecutionStep = () => {
    if (!newStepTitle.trim()) return;
    const newStep: ExecutionStep = {
      id: crypto.randomUUID(),
      title: newStepTitle.trim(),
      completed: false,
    };
    // ✅ Use functional update to avoid stale closure
    setExecutionSteps(prev => [...prev, newStep]);
    setNewStepTitle("");
  };

  const toggleExecutionStep = (id: string) => {
    setExecutionSteps(prev =>
      prev.map(step => (step.id === id ? { ...step, completed: !step.completed } : step))
    );
  };

  const deleteExecutionStep = (id: string) => {
    setExecutionSteps(prev => prev.filter(step => step.id !== id));
  };

  const autoBuildPlan = async () => {
    setAutoBuilding(true);
    try {
      const res = await fetch("/api/ai/build-execution-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentGoal: assignment.goal,
          description: assignment.understanding.summary,
        }),
      });
      const data = await res.json();
      const newSteps = data.steps.map((title: string) => ({
        id: crypto.randomUUID(),
        title,
        completed: false,
      }));
      // ✅ Functional update
      setExecutionSteps(prev => [...prev, ...newSteps]);
    } catch (err) {
      console.error(err);
    } finally {
      setAutoBuilding(false);
    }
  };

  // Live Quality Validator methods
  const runValidation = async () => {
    if (!validatorInput.trim()) return;
    setValidating(true);
    try {
      const res = await fetch("/api/ai/validate-quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: validatorInput }),
      });
      const data = await res.json();
      setValidatorResult({ score: data.score, feedback: data.feedback });
    } catch (err) {
      console.error(err);
      setValidatorResult({ score: 0, feedback: ["Validation failed."] });
    } finally {
      setValidating(false);
    }
  };

  const improveText = () => {
    setImprovedText(validatorInput + "\n\n[AI‑improved version would appear here]");
  };

  // Navigation
  const stagesList: { id: Stage; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: null },
    { id: "plan", label: "Plan", icon: null },
    { id: "research", label: "Research", icon: null },
    { id: "execution", label: "Execution", icon: null },
    { id: "checkpoints", label: "Checkpoints", icon: null },
    { id: "quality", label: "Quality", icon: null },
    { id: "validation", label: "Validation", icon: null },
  ];

  const nextStage = () => {
    const idx = stagesList.findIndex(s => s.id === stage);
    if (idx < stagesList.length - 1) setStage(stagesList[idx + 1].id);
  };
  const prevStage = () => {
    const idx = stagesList.findIndex(s => s.id === stage);
    if (idx > 0) setStage(stagesList[idx - 1].id);
  };

  // ✅ Return all state and setters needed by the parent component
  return {
    // State
    stage,
    completedSteps,
    answers,
    finalOutput,
    taskId,
    links,
    newLink,
    files,
    externalTools,
    newToolType,
    newToolUrl,
    researchItems,
    newResearchContent,
    researchType,
    summarizingId,
    executionSteps,
    newStepTitle,
    autoBuilding,
    validatorInput,
    validatorResult,
    validating,
    improvedText,
    progress,
    // Setters (used for loading saved progress)
    setStage,
    setCompletedSteps,
    setAnswers,
    setFinalOutput,
    setLinks,
    setFiles,
    setExternalTools,
    setExecutionSteps,
    setResearchItems,
    setValidatorInput,
    setValidatorResult,
    setImprovedText,
    // Simple input setters
    setNewLink,
    setNewToolType,
    setNewToolUrl,
    setNewResearchContent,
    setResearchType,
    setNewStepTitle,
    // Handlers
    addLink,
    removeLink,
    handleFileUpload,
    removeFile,
    addExternalTool,
    removeTool,
    handleAnswerChange,
    handleStepToggle,
    addResearchItem,
    deleteResearchItem,
    addTag,
    addExecutionStep,
    toggleExecutionStep,
    deleteExecutionStep,
    autoBuildPlan,
    runValidation,
    improveText,
    nextStage,
    prevStage,
    assignment,
    totalPlanSteps,
    totalCheckpoints,
  };
}