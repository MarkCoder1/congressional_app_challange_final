"use client";

import { useEffect, useMemo, useState, use } from "react";
import {
  Play,
  BookOpen,
  Zap,
  Trophy,
  Clock,
  Calendar,
} from "lucide-react";
import { PracticeMode } from "@/components/practice-mode";
import { MasterMode } from "@/components/master-mode";
import { EmptyState } from "@/components/EmptyState";
import {
  getTaskById,
  getLearningMaps,
  getPracticeQuestions,
  getMasterQuestions,
} from "@/lib/mockTasks";
import {
  subjectPresets,
  PresetType,
} from "@/lib/learningMapPresets";
import { Subject } from "@/lib/types";
import { VisualRenderer } from "@/components/visuals/VisualRenderer";

const tabs = ["Learn", "Practice", "Master"] as const;
type TabType = (typeof tabs)[number];

const tabIcons = {
  Learn: BookOpen,
  Practice: Zap,
  Master: Trophy,
};

export default function TaskWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const task = useMemo(() => getTaskById(id), [id]);
  const taskMaps = task ? getLearningMaps(task) : [];

  const [activeTab, setActiveTab] = useState<TabType>("Learn");
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [openLearnSections, setOpenLearnSections] = useState<Record<string, boolean>>({
    overview: true,
    keyPoints: true,
    example: false,
    steps: true,
  });
  const [mockProgress, setMockProgress] = useState(task?.progress ?? 0);

  useEffect(() => {
    if (!selectedPresetId && taskMaps[0]?.presetId) {
      setSelectedPresetId(taskMaps[0].presetId);
    }
  }, [selectedPresetId, taskMaps]);

  if (!task || (task.taskType && task.taskType.toLowerCase() === "assignment")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-sm">
          <EmptyState
            icon={<BookOpen size={32} />}
            title="Task not found"
            description="The task you're looking for doesn't exist or is an assignment."
            actionLabel="Back to Dashboard"
            actionHref="/"
          />
        </div>
      </div>
    );
  }

  const taskData = {
    id: task.id,
    title: task.title,
    subject: (task.subject || "General") as Subject,
    deadline: task.deadline || "TBD",
    progress: task.progress ?? 0,
    description: task.description || "",
  };
  const practiceQuestions = getPracticeQuestions(task);
  const masterQuestions = getMasterQuestions(task);
  const subjectPresetOptions = subjectPresets[task.subject as Subject] ?? [];
  const mapOptions = subjectPresetOptions.filter((presetOption) =>
    taskMaps.some((taskMap) => taskMap.presetId === presetOption.id),
  );
  const selectedMap = taskMaps.find((map) => map.presetId === selectedPresetId) ?? taskMaps[0];
  const selectedMapOption = mapOptions.find((mapOption) => mapOption.id === selectedMap?.presetId);
  const selectedVisualType = (selectedMap?.type ?? selectedMapOption?.type) as
    | PresetType
    | undefined;
  const hasLearningMaps = taskMaps.length > 0;
  const hasPracticeQuestions = practiceQuestions.length > 0;
  const hasMasterQuestions = masterQuestions.length > 0;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setMockProgress((current) => Math.min(100, current + 10));
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-background">
      {/* LEFT PANEL - Task Overview */}
      <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border bg-card p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-3 text-foreground">
            {taskData.title}
          </h1>
          <div className="inline-block mb-4">
            <span className="px-3 py-1.5 bg-accent/10 text-accent font-semibold text-sm rounded-lg">
              {taskData.subject}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={16} />
              <span>Due: {taskData.deadline}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={16} />
              <span>Estimated: 2 hours</span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-semibold text-accent">
              {mockProgress}%
            </span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${mockProgress}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {taskData.description}
        </p>

        <button className="btn-primary w-full flex items-center justify-center gap-2 mt-auto">
          <Play size={18} />
          Start Focus Mode
        </button>
      </div>

      {/* RIGHT PANEL - Main Learning Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-card">
          <div className="flex overflow-x-auto p-6 gap-2">
            {tabs.map((tab) => {
              const IconComponent = tabIcons[tab];
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`tab-button flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "active bg-accent text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <IconComponent size={18} />
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {/* LEARN TAB */}
          {activeTab === "Learn" && (
            <div className="p-6 space-y-6 fade-in-panel">
              {!hasLearningMaps ? (
                <div className="bg-card border border-border rounded-xl shadow-sm">
                  <EmptyState
                    icon={<BookOpen size={32} />}
                    title="No data available for this section"
                    description="This task does not include learning maps yet."
                  />
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-lg font-semibold mb-4 text-foreground">
                      Learn: {taskData.subject}
                    </h2>
                    {/* Top explanation section */}
                    <div className="card-base rounded-xl p-6 mb-6 space-y-3">
                      <h3 className="text-base font-semibold text-foreground">
                        Structured Explanation
                      </h3>
                      {task.learningContent ? (
                        <>
                          <AccordionSection
                            label="Overview"
                            open={openLearnSections.overview}
                            onToggle={() =>
                              setOpenLearnSections((prev) => ({
                                ...prev,
                                overview: !prev.overview,
                              }))
                            }
                          >
                            <p className="text-sm text-muted-foreground">
                              {task.learningContent.overview}
                            </p>
                          </AccordionSection>
                          <AccordionSection
                            label="Key Points"
                            open={openLearnSections.keyPoints}
                            onToggle={() =>
                              setOpenLearnSections((prev) => ({
                                ...prev,
                                keyPoints: !prev.keyPoints,
                              }))
                            }
                          >
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                              {task.learningContent.keyPoints.map((point) => (
                                <li key={point}>{point}</li>
                              ))}
                            </ul>
                          </AccordionSection>
                          <AccordionSection
                            label="Example"
                            open={openLearnSections.example}
                            onToggle={() =>
                              setOpenLearnSections((prev) => ({
                                ...prev,
                                example: !prev.example,
                              }))
                            }
                          >
                            <p className="text-sm text-muted-foreground">
                              {task.learningContent.example}
                            </p>
                          </AccordionSection>
                          <AccordionSection
                            label="Step-by-Step"
                            open={openLearnSections.steps}
                            onToggle={() =>
                              setOpenLearnSections((prev) => ({
                                ...prev,
                                steps: !prev.steps,
                              }))
                            }
                          >
                            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                              {task.learningContent.steps.map((step) => (
                                <li key={step}>{step}</li>
                              ))}
                            </ol>
                          </AccordionSection>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No structured explanation is available for this task yet.
                        </p>
                      )}
                    </div>

                    {/* Bottom map visual section */}
                    <div className="card-base rounded-xl p-6">
                      <h3 className="text-base font-semibold mb-4 text-foreground">
                        Visual Learning Maps
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        {mapOptions.map((mapOption) => (
                          <button
                            key={mapOption.id}
                            onClick={() => setSelectedPresetId(mapOption.id)}
                            className={`p-3 rounded-lg border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                              selectedPresetId === mapOption.id
                                ? "border-accent bg-accent/10"
                                : "border-border bg-card"
                            }`}
                          >
                            <div className="text-xl mb-1">{mapOption.icon}</div>
                            <div className="text-xs font-semibold text-foreground">
                              {mapOption.label}
                            </div>
                          </button>
                        ))}
                      </div>

                      {selectedMap && selectedVisualType ? (
                        <VisualRenderer type={selectedVisualType} data={selectedMap.data} />
                      ) : (
                        <div className="w-full text-left rounded-lg border border-border p-4 text-sm text-muted-foreground">
                          No preset data available for this task map.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* PRACTICE TAB */}
          {activeTab === "Practice" && (
            <div className="p-6 fade-in-panel">
              {!hasPracticeQuestions ? (
                <div className="bg-card border border-border rounded-xl shadow-sm">
                  <EmptyState
                    icon={<Zap size={32} />}
                    title="No data available for this section"
                    description="This task does not include practice questions yet."
                  />
                </div>
              ) : (
                <PracticeMode
                  questions={practiceQuestions}
                  subject={taskData.subject}
                  onComplete={(score) => {
                    console.log(`Practice completed with score: ${score}%`);
                    setMockProgress(Math.min(100, mockProgress + 30));
                  }}
                />
              )}
            </div>
          )}

          {/* MASTER TAB */}
          {activeTab === "Master" && (
            <div className="p-6 fade-in-panel">
              {!hasMasterQuestions ? (
                <div className="bg-card border border-border rounded-xl shadow-sm">
                  <EmptyState
                    icon={<Trophy size={32} />}
                    title="No data available for this section"
                    description="This task does not include master questions yet."
                  />
                </div>
              ) : (
                <MasterMode
                  questions={masterQuestions}
                  subject={taskData.subject}
                  timeLimit={30}
                  onComplete={(score) => {
                    console.log(`Master test completed with score: ${score}%`);
                    setMockProgress(100);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AccordionSection({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-lg">
      <button
        className="w-full flex items-center justify-between p-3 text-sm font-medium"
        onClick={onToggle}
      >
        <span>{label}</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      {open ? <div className="px-3 pb-3">{children}</div> : null}
    </div>
  );
}
