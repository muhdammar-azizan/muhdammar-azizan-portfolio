"use client";

import { motion } from "framer-motion";
import { Scissors } from "lucide-react";

const view = { once: true, margin: "0px 0px -40px 0px" } as const;
const draw = { duration: 1.8, ease: "easeInOut" } as const;

/**
 * A full-width dashed "cut here" line between two sections. When it scrolls into view the line is
 * cut from left to right: a pair of scissors travels along it and stops at the far end.
 */
export default function SectionDivider() {
  return (
    <div aria-hidden="true" className="relative -my-4 mx-4 h-7 sm:mx-8">
      {/* The dashed line grows to the right; the dashes keep their size because only the clip widens */}
      <motion.div
        className="absolute inset-y-0 left-0 overflow-hidden"
        initial={{ width: "0%" }}
        whileInView={{ width: "100%" }}
        viewport={view}
        transition={draw}
      >
        <div className="absolute top-1/2 left-0 h-0 w-[calc(100vw-2rem)] border-t-2 border-dashed border-foreground/35 sm:w-[calc(100vw-4rem)]" />
      </motion.div>

      {/* Scissors ride on the front of the line, tips pointing right, and rest at the very end */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2"
        initial={{ left: "0%" }}
        whileInView={{ left: "100%" }}
        viewport={view}
        transition={draw}
        style={{ x: "-100%" }}
      >
        <Scissors className="h-6 w-6 text-foreground/60" />
      </motion.div>
    </div>
  );
}
