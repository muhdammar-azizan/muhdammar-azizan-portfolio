"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { ArrowUp } from "lucide-react";

// Show the button after scrolling this far (px).
const SHOW_AFTER = 600;
// Size of the progress ring (px).
const SIZE = 48;
const STROKE = 2.5;
const RADIUS = (SIZE - STROKE) / 2;

/**
 * Small floating button in the bottom-right corner that scrolls back to the top.
 * The ring around it fills up as the visitor scrolls down the page.
 */
export default function BackToTop() {
  const { scrollY, scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (y) => setVisible(y > SHOW_AFTER));

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="nav-glass group fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full text-foreground sm:bottom-8 sm:right-8"
          style={{ width: SIZE, height: SIZE }}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={reduceMotion ? undefined : { scale: 1.1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Scroll progress ring */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 -rotate-90"
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.12}
              strokeWidth={STROKE}
            />
            <motion.circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              style={{ pathLength: scrollYProgress }}
            />
          </svg>
          <ArrowUp className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
