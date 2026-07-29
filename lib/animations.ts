"use client";

import { useReducedMotion, type Variants, type Transition } from "framer-motion";

// ── Reduced Motion Hook ──
export function usePrefersReducedMotion() {
  return useReducedMotion();
}

// ── Transition defaults ──
export const fastTransition: Transition = {
  duration: 0.15,
  ease: "easeOut",
};

export const normalTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

export const slowTransition: Transition = {
  duration: 0.3,
  ease: "easeOut",
};

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

export const springLoose: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
};

// ── Page transition variants ──
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

// ── Stagger children variants ──
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
};

// ── Card variants ──
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  hover: {
    y: -2,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1, ease: "easeOut" },
  },
};

// ── Fade in up ──
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

// ── Fade in ──
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

// ── Slide in from left ──
export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
};

// ── Scale in (for badges, checkmarks) ──
export const scaleIn: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 20 },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

// ── Progress bar animation ──
export const progressBar = (value: number) => ({
  initial: { width: "0%" },
  animate: {
    width: `${value}%`,
    transition: { duration: 0.8, ease: "easeOut" },
  },
});

// ── Checkmark circle animation ──
export const checkmarkCircle: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// ── Success glow ──
export const successGlow: Variants = {
  initial: {
    boxShadow: "0 0 0 0 rgba(31, 157, 110, 0)",
  },
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(31, 157, 110, 0)",
      "0 0 0 8px rgba(31, 157, 110, 0.15)",
      "0 0 0 0 rgba(31, 157, 110, 0)",
    ],
    transition: { duration: 1, ease: "easeOut" },
  },
};

// ── Skeleton shimmer ──
export const shimmerVariants: Variants = {
  initial: {
    backgroundPosition: "200% 0",
  },
  animate: {
    backgroundPosition: "-200% 0",
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// ── Tab indicator animation ──
export const tabIndicator: Variants = {
  initial: { scaleX: 0 },
  animate: {
    scaleX: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    scaleX: 0,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};
