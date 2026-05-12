"use client";

import { motion } from "framer-motion";
import React from "react";
import { CycleData } from "@/types/visuals";   // ← Keep the original import

// Match the exact prop signature expected by VisualRenderer
export function Cycle({ data }: { data: CycleData }) {
    const { title, stages } = data;   // Extract from CycleData

    const size = 420;
    const center = size / 2;
    const radius = size * 0.36;
    const stageRadius = 38;

    // Calculate angles (starting from top, clockwise)
    const angles = stages.map((_, i) => (i / stages.length) * Math.PI * 2 - Math.PI / 2);

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                {title}
            </h3>

            <div className="relative flex justify-center">
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="drop-shadow-xl"
                >
                    {/* Outer glow circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius + 28}
                        fill="none"
                        stroke="hsl(262 80% 60% / 0.1)"
                        strokeWidth="24"
                    />

                    {/* Main background circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius + 12}
                        fill="none"
                        stroke="#1f1f2e"
                        strokeWidth="28"
                    />

                    {/* Dashed progress circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="#6b21a8"
                        strokeWidth="3"
                        strokeDasharray="6 8"
                        opacity={0.6}
                    />

                    {/* Solid accent ring */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2"
                    />

                    {/* Flow direction arrow */}
                    <defs>
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

                    <path
                        d={`M ${center + radius - 25} ${center - 8} 
                    A ${radius - 25} ${radius - 25} 0 0 1 
                    ${center + 8} ${center + radius - 25}`}
                        fill="none"
                        stroke="#c084fc"
                        strokeWidth="3"
                        strokeLinecap="round"
                        markerEnd="url(#arrowhead)"
                    />

                    {/* Connecting lines */}
                    {stages.map((_, idx) => {
                        const angle = angles[idx];
                        const x1 = center;
                        const y1 = center;
                        const x2 = center + (radius - stageRadius - 8) * Math.cos(angle);
                        const y2 = center + (radius - stageRadius - 8) * Math.sin(angle);

                        return (
                            <line
                                key={`line-${idx}`}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="#4c1d95"
                                strokeWidth="1.5"
                                strokeDasharray="3 3"
                                opacity={0.6}
                            />
                        );
                    })}

                    {/* Stage nodes */}
                    {stages.map((stage, idx) => {
                        const angle = angles[idx];
                        const x = center + radius * Math.cos(angle);
                        const y = center + radius * Math.sin(angle);
                        const stageColor = (stage as any).color || "#a855f7"; // safe fallback

                        return (
                            <motion.g
                                key={stage.id}
                                initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ delay: idx * 0.08, type: "spring", stiffness: 120 }}
                                whileHover={{ scale: 1.08 }}
                            >
                                {/* Glow */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={stageRadius + 8}
                                    fill={stageColor}
                                    opacity="0.15"
                                />

                                {/* Main circle */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={stageRadius}
                                    fill="#0f0f17"
                                    stroke={stageColor}
                                    strokeWidth="3"
                                />

                                {/* Inner ring */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={stageRadius - 8}
                                    fill="none"
                                    stroke={stageColor}
                                    strokeWidth="2"
                                    opacity="0.4"
                                />

                                {/* Name */}
                                <text
                                    x={x}
                                    y={y - 4}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="white"
                                    fontSize="13"
                                    fontWeight="700"
                                    letterSpacing="0.5"
                                >
                                    {stage.name}
                                </text>

                                {/* Description */}
                                <text
                                    x={x}
                                    y={y + 22}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="#a1a1aa"
                                    fontSize="9.5"
                                    fontWeight="500"
                                >
                                    {stage.description.length > 38
                                        ? stage.description.substring(0, 35) + "..."
                                        : stage.description}
                                </text>
                            </motion.g>
                        );
                    })}
                </svg>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-1 gap-3 px-4">
                {stages.map((stage) => (
                    <div
                        key={stage.id}
                        className="flex items-start gap-3 bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 text-sm"
                    >
                        <div
                            className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: (stage as any).color || "#a855f7" }}
                        />
                        <div>
                            <div className="font-semibold text-white">{stage.name}</div>
                            <div className="text-zinc-400 text-xs mt-0.5 leading-snug">
                                {stage.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}