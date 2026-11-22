"use client";

import { MotionConfig, motion } from "framer-motion";

// A gentle hand-drawn wave. It is stretched to fit, so the stroke is kept at a fixed width.
const WAVE = "M0 8 C25 3,50 13,75 8 S125 3,150 8 S200 13,225 8 S275 3,300 8 S350 13,375 8 S395 6,400 8";

const view = { once: true, margin: "0px 0px -40px 0px" } as const;

/**
 * A thin ink line between two sections: two wavy strokes are drawn from the edges towards the
 * middle, and a small star lands where they meet.
 */
export default function SectionDivider() {
  return (
    <MotionConfig reducedMotion="user">
      <div aria-hidden="true" className="mx-auto -my-6 flex max-w-6xl items-center gap-3 px-6">
        <Stroke />
        <motion.svg
          viewBox="0 0 20 20"
          className="h-5 w-5 shrink-0 text-accent"
          initial={{ opacity: 0, scale: 0, rotate: -90 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={view}
          transition={{ type: "spring", stiffness: 220, damping: 14, delay: 1.3 }}
        >
          <path d="M10 1 L12 8 L19 10 L12 12 L10 19 L8 12 L1 10 L8 8 Z" fill="currentColor" />
        </motion.svg>
        <Stroke mirrored />
      </div>
    </MotionConfig>
  );
}

function Stroke({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <svg viewBox="0 0 400 16" preserveAspectRatio="none" className={`h-4 min-w-0 flex-1 ${mirrored ? "-scale-x-100" : ""}`}>
      <motion.path
        d={WAVE}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        className="text-foreground/35"
        style={{ vectorEffect: "non-scaling-stroke" }}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={view}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
    </svg>
  );
}
