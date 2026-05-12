"use client";

import { useMemo, useState } from "react";
import {
  getPresetsForSubject,
  getPresetDataForSubject,
  LearningPreset,
} from "@/lib/learningMapPresets";
import { Subject } from "@/lib/types";
import { VisualRenderer } from "@/components/visuals/VisualRenderer";

interface PresetRendererProps {
  subject: Subject;
  taskTitle: string;
}

export function PresetRenderer({ subject, taskTitle }: PresetRendererProps) {
  const presetOptions = getPresetsForSubject(subject);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    presetOptions[0]?.id ?? "",
  );
  const selectedPreset = useMemo(
    () =>
      selectedPresetId
        ? getPresetDataForSubject(subject, selectedPresetId)
        : null,
    [selectedPresetId, subject],
  );

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{taskTitle}</h2>
        <p className="text-muted-foreground mt-1">Subject: {subject}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {presetOptions.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setSelectedPresetId(preset.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border ${
              selectedPresetId === preset.id
                ? "bg-accent text-white border-accent"
                : "bg-card text-foreground border-border"
            }`}
          >
            {preset.icon} {preset.label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        {selectedPreset ? (
          <VisualRenderer data={toVisualData(selectedPreset) as any} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a learning perspective to view content.
          </p>
        )}
      </div>
    </div>
  );
}

function toVisualData(preset: LearningPreset): unknown {
  switch (preset.type) {
    case "graph":
      return {
        points: preset.data
          .map((point) => ({
            x: Number(point.x),
            y: point.y,
          }))
          .filter((point) => Number.isFinite(point.x)),
        equation: preset.title,
        xLabel: preset.xAxisLabel,
        yLabel: preset.yAxisLabel,
      };
    case "timeline":
      return {
        events: preset.events.map((event) => ({
          date: String(event.year),
          title: event.title,
          description: event.description,
        })),
      };
    case "flow":
      return {
        steps: preset.steps.map((step) => ({
          title: step.title,
          description: step.description,
        })),
      };
    case "process":
      return {
        steps: preset.stages.map((stage) => ({
          title: stage.name,
          description: stage.description,
        })),
      };
    case "node-map":
      return {
        nodes: preset.nodes.map((node) => ({
          id: node.id,
          label: node.label,
          connections: node.children ?? [],
        })),
      };
    case "diagram":
      return {
        parts: preset.elements.map((element) => ({
          label: element.label ?? element.id,
          description: element.type,
          position: element.position,
        })),
      };
    case "comparison":
      return {
        items: preset.items.map((item) => ({
          title: item.label,
          points: Object.entries(item.properties).map(
            ([key, value]) => `${key}: ${String(value)}`,
          ),
        })),
      };
    case "table":
      return {
        columns: preset.columns.map((col) => col.header),
        rows: preset.rows.map((row) =>
          preset.columns.map((column) => row[column.key] ?? ""),
        ),
      };
    case "cards":
      return {
        cards: preset.cards.map((card) => ({
          title: card.title,
          content: card.content,
        })),
      };
    case "list":
      return {
        items: preset.items.map((item) => item.title),
      };
    default:
      return {};
  }
}
