// /components/assignment/AssignmentWorkspace.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useAssignmentWorkspace } from "./hooks/useAssignmentWorkspace";
import { ProgressBar } from "./ProgressBar";
import { WorkspaceStages } from "./WorkspaceStages";
import { OverviewStage } from "./stages/OverviewStage";
import { PlanStage } from "./stages/PlanStage";
import { ResearchStage } from "./stages/ResearchStage";
import { ExecutionStage } from "./stages/ExecutionStage";
import { CheckpointsStage } from "./stages/CheckpointsStage";
import { QualityStage } from "./stages/QualityStage";
import ValidationStage from "./stages/ValidationStage";
import { AssignmentContent } from "./types";
import { AssignmentWorkflowStage } from "@/types/task";

interface AssignmentWorkspaceProps {
  assignment: AssignmentContent;
  taskId: string;
  taskProgress: number;
  onTaskRefresh: () => Promise<void>;
}

export default function AssignmentWorkspace({ assignment, taskId, taskProgress, onTaskRefresh }: AssignmentWorkspaceProps) {
  const {
    // Rename the hook's `assignment` to `fullAssignment` to avoid naming conflict with prop
    assignment: fullAssignment,
    stage, setStage,
    completedSteps, setCompletedSteps,
    answers, setAnswers,
    finalOutput, setFinalOutput,
    links, setLinks,
    files, setFiles,
    externalTools, setExternalTools,
    executionSteps, setExecutionSteps,
    researchItems, setResearchItems,
    validatorInput, setValidatorInput,
    validatorResult, setValidatorResult,
    improvedText, setImprovedText,
    newLink, setNewLink,
    newToolType, setNewToolType,
    newToolUrl, setNewToolUrl,
    newResearchContent, setNewResearchContent,
    researchType, setResearchType,
    newStepTitle, setNewStepTitle,
    autoBuilding,           // ✅ added
    validating,             // ✅ added
    summarizingId,          // ✅ added (use later)
    addLink, removeLink,
    handleFileUpload, removeFile,
    addExternalTool, removeTool,
    handleAnswerChange, handleStepToggle,
    addResearchItem, deleteResearchItem, addTag,
    addExecutionStep, toggleExecutionStep, deleteExecutionStep,
    autoBuildPlan,
    runValidation, improveText,
    nextStage, prevStage,
  } = useAssignmentWorkspace(assignment);

  // ----- Refs for latest state (avoid stale closures in saveProgress) -----
  const completedStepsRef = useRef(completedSteps);
  const answersRef = useRef(answers);
  const finalOutputRef = useRef(finalOutput);
  const linksRef = useRef(links);
  const filesRef = useRef(files);
  const externalToolsRef = useRef(externalTools);
  const executionStepsRef = useRef(executionSteps);
  const researchItemsRef = useRef(researchItems);
  const validatorInputRef = useRef(validatorInput);
  const validatorResultRef = useRef(validatorResult);
  const improvedTextRef = useRef(improvedText);
  const stageRef = useRef(stage);

  useEffect(() => { completedStepsRef.current = completedSteps; }, [completedSteps]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { finalOutputRef.current = finalOutput; }, [finalOutput]);
  useEffect(() => { linksRef.current = links; }, [links]);
  useEffect(() => { filesRef.current = files; }, [files]);
  useEffect(() => { externalToolsRef.current = externalTools; }, [externalTools]);
  useEffect(() => { executionStepsRef.current = executionSteps; }, [executionSteps]);
  useEffect(() => { researchItemsRef.current = researchItems; }, [researchItems]);
  useEffect(() => { validatorInputRef.current = validatorInput; }, [validatorInput]);
  useEffect(() => { validatorResultRef.current = validatorResult; }, [validatorResult]);
  useEffect(() => { improvedTextRef.current = improvedText; }, [improvedText]);
  useEffect(() => { stageRef.current = stage; }, [stage]);

  // ----- Persistence state -----
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ----- Load saved progress on mount -----
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await fetch(`/api/assignment/progress/load?taskId=${taskId}`);
        const data = await res.json();
        if (data.progressData) {
          const saved = data.progressData;
          setCompletedSteps(saved.completedSteps || {});
          setAnswers(saved.answers || {});
          setFinalOutput(saved.finalOutput || "");
          setLinks(saved.links || []);
          setFiles(saved.files || []);
          setExternalTools(saved.externalTools || []);
          setExecutionSteps(saved.executionSteps || []);
          setResearchItems(saved.researchItems || []);
          setValidatorInput(saved.validatorInput || "");
          setValidatorResult(saved.validatorResult || null);
          setImprovedText(saved.improvedText || "");
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProgress();
  }, [taskId]);

  // ----- Auto‑save function (uses refs to get latest state) -----
  const saveProgress = async () => {
    const completedStages: AssignmentWorkflowStage[] = ["overview"];
    const hasAllPlanSteps =
      assignment.plan.steps.length > 0 &&
      assignment.plan.steps.every((step) => completedStepsRef.current[step.id]);
    const hasResearch = researchItemsRef.current.length > 0;
    const hasExecution =
      executionStepsRef.current.some((s) => s.completed) ||
      finalOutputRef.current.trim().length > 0 ||
      linksRef.current.length > 0 ||
      filesRef.current.length > 0 ||
      externalToolsRef.current.length > 0;
    const hasAllCheckpoints =
      assignment.checkpoints.length > 0 &&
      assignment.checkpoints.every((cp) => (answersRef.current[cp.id] || "").trim().length > 0);
    const hasQualityReview =
      !!validatorResultRef.current || improvedTextRef.current.trim().length > 0;
    const hasValidation =
      finalOutputRef.current.trim().length > 0 ||
      linksRef.current.length > 0 ||
      filesRef.current.length > 0 ||
      externalToolsRef.current.length > 0;

    if (hasAllPlanSteps) completedStages.push("planning");
    if (hasResearch) completedStages.push("research");
    if (hasExecution) completedStages.push("execution");
    if (hasAllCheckpoints) completedStages.push("checkpoints");
    if (hasQualityReview) completedStages.push("quality");
    if (hasValidation) completedStages.push("validation");

    const toWorkflowStage = (value: string): AssignmentWorkflowStage => {
      if (value === "plan") return "planning";
      return value as AssignmentWorkflowStage;
    };

    const progressData = {
      completedSteps: completedStepsRef.current,
      answers: answersRef.current,
      finalOutput: finalOutputRef.current,
      links: linksRef.current,
      files: filesRef.current.map((f) => ({ name: f.name, type: f.type })),
      externalTools: externalToolsRef.current,
      executionSteps: executionStepsRef.current,
      researchItems: researchItemsRef.current,
      validatorInput: validatorInputRef.current,
      validatorResult: validatorResultRef.current,
      improvedText: improvedTextRef.current,
    };
    try {
      await fetch("/api/assignment/progress/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          progressData,
          completedStages,
          currentStage: toWorkflowStage(stageRef.current),
        }),
      });
      await onTaskRefresh();
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  };

  const handleSubmissionSuccess = async () => {
    try {
      await onTaskRefresh();
    } catch (err) {
      console.error("Failed to mark assignment submission progress:", err);
    }
  };

  // ----- Debounced save effect -----
  useEffect(() => {
    if (isLoading) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress();
    }, 1000);
  }, [
    completedSteps, answers, finalOutput, links, files, externalTools,
    executionSteps, researchItems, validatorInput, validatorResult, improvedText, isLoading
  ]);

  // ----- Loading indicator -----
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading your saved progress...</div>
      </div>
    );
  }

  // ----- Stage rendering -----
  const renderStage = () => {
    switch (stage) {
      case "overview":
        return <OverviewStage assignment={fullAssignment} onNext={nextStage} />;
      case "plan":
        return (
          <PlanStage
            assignment={fullAssignment}
            completedSteps={completedSteps}
            onToggleStep={handleStepToggle}
            onPrev={prevStage}
            onNext={nextStage}
          />
        );
      case "research":
        return (
          <ResearchStage
            researchItems={researchItems}
            newResearchContent={newResearchContent}
            researchType={researchType}
            summarizingId={summarizingId}   // ✅ use actual value
            onNewContentChange={setNewResearchContent}
            onTypeChange={setResearchType}
            onAddItem={addResearchItem}
            onDeleteItem={deleteResearchItem}
            onAddTag={addTag}
            onPrev={prevStage}
            onNext={nextStage}
          />
        );
      case "execution":
        return (
          <ExecutionStage
            executionSteps={executionSteps}
            newStepTitle={newStepTitle}
            autoBuilding={autoBuilding}
            onNewStepTitleChange={setNewStepTitle}
            onAddStep={addExecutionStep}
            onAutoBuild={autoBuildPlan}
            onToggleStep={toggleExecutionStep}
            onDeleteStep={deleteExecutionStep}
            finalOutput={finalOutput}
            onFinalOutputChange={setFinalOutput}
            links={links}
            newLink={newLink}
            onNewLinkChange={setNewLink}
            onAddLink={addLink}
            onRemoveLink={removeLink}
            files={files}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeFile}
            externalTools={externalTools}
            newToolType={newToolType}
            newToolUrl={newToolUrl}
            onNewToolTypeChange={setNewToolType}
            onNewToolUrlChange={setNewToolUrl}
            onAddTool={addExternalTool}
            onRemoveTool={removeTool}
            onPrev={prevStage}
            onNext={nextStage}
          />
        );
      case "checkpoints":
        return (
          <CheckpointsStage
            assignment={fullAssignment}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onPrev={prevStage}
            onNext={nextStage}
          />
        );
      case "quality":
        return (
          <QualityStage
            validatorInput={validatorInput}
            validatorResult={validatorResult}
            validating={validating}
            improvedText={improvedText}
            onValidatorInputChange={setValidatorInput}
            onValidate={runValidation}
            onImprove={improveText}
            onPrev={prevStage}
            onNext={nextStage}
          />
        );
      case "validation":
        return (
          <ValidationStage
            assignment={fullAssignment}
            progress={taskProgress}
            finalOutput={finalOutput}
            links={links}
            files={files}
            externalTools={externalTools}
            answers={answers}
            taskId={taskId}
            onPrev={prevStage}
            onSubmissionSuccess={handleSubmissionSuccess}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <ProgressBar progress={taskProgress} />
      <WorkspaceStages currentStage={stage} onStageChange={setStage} />
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 min-h-125 transition-all">
        {renderStage()}
      </div>
    </div>
  );
}