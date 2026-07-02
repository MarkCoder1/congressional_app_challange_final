"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useMemo } from "react";
import { CycleData } from "@/types/visuals";

// Helper: generate a gradient color string from a hex or use default
const getGradient = (color: string) => {
  if (!color) return "from-violet-500 to-fuchsia-500";
  // Convert hex to tailwind-like gradient? We'll just use the color as is.
  return color;
};

export function Cycle({ data }: { data: CycleData }) {
  const { title, stages } = data;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [legendHover, setLegendHover] = useState<number | null>(null);

  // Calculate angles (start from top, clockwise)
  const angles = useMemo(
    () => stages.map((_, i) => (i / stages.length) * Math.PI * 2 - Math.PI / 2),
    [stages.length]
  );

  // Generate a color per stage if not provided
  const stageColors = useMemo(() => {
    const defaultPalette = [
      "#a855f7", // violet
      "#ec4899", // pink
      "#f59e0b", // amber
      "#22d3ee", // cyan
      "#34d399", // emerald
    ];
    return stages.map((stage, idx) => {
      return (stage as any).color || defaultPalette[idx % defaultPalette.length];
    });
  }, [stages]);

  // Dimensions and layout
  const size = 480;
  const center = size / 2;
  const radius = size * 0.33;
  const nodeRadius = 42;
  const activeIndex = hoveredIndex ?? legendHover;

  // Node positions
  const positions = useMemo(
    () =>
      angles.map((angle) => ({
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      })),
    [angles, center, radius]
  );

  // Build curved path between consecutive nodes (clockwise)
  const buildArcPath = (fromIdx: number, toIdx: number) => {
    const from = positions[fromIdx];
    const to = positions[toIdx];
    if (!from || !to) return "";
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    // Control point offset perpendicular to the chord
    const perpX = -dy / dist * 25;
    const perpY = dx / dist * 25;
    return `M ${from.x} ${from.y} Q ${midX + perpX} ${midY + perpY} ${to.x} ${to.y}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Title with subtle gradient */}
      <motion.h3
        className="text-3xl font-bold text-center bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {title}
      </motion.h3>

      <div className="relative flex justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="drop-shadow-2xl"
          role="img"
          aria-label={`Cycle diagram: ${title}`}
        >
          <defs>
            {/* Glow filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Arrowhead marker */}
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="8"
              refX="8"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 10 4, 0 8" fill="#c084fc" />
            </marker>
          </defs>

          {/* Outer glow ring */}
          <circle
            cx={center}
            cy={center}
            r={radius + 32}
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth="2"
            opacity="0.3"
          >
            <animate
              attributeName="stroke-dasharray"
              values="0 1000; 200 1000"
              dur="10s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Animated dashed progress ring */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius + 10}
            fill="none"
            stroke="#6b21a8"
            strokeWidth="2"
            strokeDasharray="8 12"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          {/* Connecting arcs between nodes */}
          {stages.map((_, idx) => {
            const nextIdx = (idx + 1) % stages.length;
            const path = buildArcPath(idx, nextIdx);
            const color = stageColors[idx];
            return (
              <motion.path
                key={`arc-${idx}`}
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ duration: 0.8, delay: idx * 0.1 + 0.3 }}
              />
            );
          })}

          {/* Node circles and content */}
          {stages.map((stage, idx) => {
            const { x, y } = positions[idx];
            const color = stageColors[idx];
            const isHighlighted = activeIndex === null || activeIndex === idx;
            const isDimmed = activeIndex !== null && activeIndex !== idx;

            return (
              <motion.g
                key={stage.id}
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 150 }}
                whileHover={{ scale: 1.1 }}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: "pointer" }}
                filter={isHighlighted ? "url(#glow)" : "none"}
                opacity={isDimmed ? 0.3 : 1}
              >
                {/* Background glow */}
                <circle cx={x} cy={y} r={nodeRadius + 10} fill={color} opacity="0.15" />

                {/* Main circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={nodeRadius}
                  fill="#0f0f17"
                  stroke={color}
                  strokeWidth="3"
                />

                {/* Inner decorative ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={nodeRadius - 8}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  opacity="0.5"
                  strokeDasharray="4 6"
                />

                {/* Stage number */}
                <text
                  x={x}
                  y={y - 6}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#a1a1aa"
                  fontSize="10"
                  fontWeight="500"
                >
                  {String(idx + 1).padStart(2, "0")}
                </text>

                {/* Stage name */}
                <text
                  x={x}
                  y={y + 14}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="14"
                  fontWeight="700"
                  letterSpacing="0.3"
                >
                  {stage.name}
                </text>

                {/* Hover tooltip: show description */}
                <AnimatePresence>
                  {hoveredIndex === idx && (
                    <motion.foreignObject
                      x={x - 90}
                      y={y + nodeRadius + 12}
                      width="180"
                      height="auto"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-zinc-900/90 backdrop-blur-sm border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 shadow-xl pointer-events-none">
                        {stage.description}
                      </div>
                    </motion.foreignObject>
                  )}
                </AnimatePresence>
              </motion.g>
            );
          })}

          {/* Center hub */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          >
            <circle cx={center} cy={center} r={38} fill="#1a1a2e" stroke="#a855f7" strokeWidth="2" />
            <circle cx={center} cy={center} r={30} fill="#0f0f17" stroke="#6b21a8" strokeWidth="1" />
            <text
              x={center}
              y={center - 4}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="12"
              fontWeight="700"
            >
              CYCLE
            </text>
            <text
              x={center}
              y={center + 16}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#a1a1aa"
              fontSize="8"
            >
              {stages.length} steps
            </text>
          </motion.g>
        </svg>
      </div>

      {/* Interactive legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4">
        {stages.map((stage, idx) => {
          const color = stageColors[idx];
          const isHighlighted = activeIndex === null || activeIndex === idx;
          return (
            <motion.div
              key={stage.id}
              className={`flex items-start gap-3 bg-zinc-900/70 border rounded-lg p-3 text-sm transition-all ${
                isHighlighted ? "border-zinc-700" : "border-transparent opacity-40"
              }`}
              style={{ borderColor: isHighlighted ? color : "transparent" }}
              onMouseEnter={() => setLegendHover(idx)}
              onMouseLeave={() => setLegendHover(null)}
              whileHover={{ scale: 1.02 }}
            >
              <div
                className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5"
                style={{ backgroundColor: color }}
              />
              <div>
                <div className="font-semibold text-white">{stage.name}</div>
                <div className="text-zinc-400 text-xs mt-0.5 leading-snug">
                  {stage.description}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}