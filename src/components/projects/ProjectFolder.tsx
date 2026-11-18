"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion } from "framer-motion";
import type { Project } from "@/lib/site";

// Folder tabs and sticky notes sit at different spots on each file, like a real drawer.
// They stay on the right part of the file, which is not covered by the file in front.
const TAB_POSITIONS = ["58%", "38%", "64%"];
const NOTE_POSITIONS = ["38%", "44%", "32%"];
const NOTE_TILTS = [-3, 2.5, -1.5, 3.5];
// Real kraft folders are never exactly the same shade.
const FRONT_TONES = ["#c9a473", "#c39d6b", "#cda97a", "#c6a070"];
const BACK_TONES = ["#b38b5d", "#ad8556", "#b69062", "#b08859"];

// Same easing as the opened paper, so the paper leaves and returns smoothly.
const PAPER_EASE = [0.45, 0, 0.2, 1] as const;

// How far (px) the other files slide away when one is opened.
const SPREAD = 110;

export const paperLayoutId = (project: Project) => `project-paper-${project.title}`;

type ProjectFolderProps = {
  project: Project;
  index: number;
  total: number;
  hovered: boolean;
  dimmed: boolean;
  // -1 moves left, 1 moves right, 0 stays (used while another file is open).
  shift: number;
  open: boolean;
  buttonRef: (el: HTMLButtonElement | null) => void;
  onPeekStart: () => void;
  onPeekEnd: () => void;
  onActivate: (pointerType: string) => void;
};

/**
 * A manila file standing upright. The paper inside and the sticky note
 * slide up a little on hover; the paper leaves the file when it is opened.
 */
export default function ProjectFolder({
  project,
  index,
  total,
  hovered,
  dimmed,
  shift,
  open,
  buttonRef,
  onPeekStart,
  onPeekEnd,
  onActivate,
}: ProjectFolderProps) {
  const shadow = hovered ? "drop-shadow(0 18px 16px rgba(40,25,10,0.28))" : "drop-shadow(0 8px 10px rgba(40,25,10,0.18))";
  const brightness = dimmed ? 0.72 : hovered ? 1.06 : 1;

  // Remember whether the last press was mouse, pen or touch (touch needs a tap to peek first).
  const lastPointer = useRef("mouse");

  return (
    <motion.div
      className="relative shrink-0"
      style={{
        width: "var(--fw)",
        height: "calc(var(--fw) * 1.32)",
        marginLeft: index === 0 ? 0 : "calc(var(--fw) * var(--overlap))",
        // Left files sit in front; the peeked file comes to the very front.
        zIndex: hovered ? total + 10 : total - index,
      }}
      initial={false}
      animate={{
        y: hovered ? -14 : 0,
        x: shift * SPREAD,
        filter: `brightness(${brightness}) ${shadow}`,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Open the ${project.title} project file`}
        aria-expanded={open}
        className="absolute inset-0 cursor-pointer rounded-[3px] outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
        onPointerDown={(event) => {
          lastPointer.current = event.pointerType;
        }}
        onPointerEnter={(event) => event.pointerType === "mouse" && onPeekStart()}
        onPointerLeave={(event) => event.pointerType === "mouse" && onPeekEnd()}
        onFocus={(event) => event.currentTarget.matches(":focus-visible") && onPeekStart()}
        onBlur={onPeekEnd}
        onClick={() => onActivate(lastPointer.current)}
      >
        {/* Back panel with its tab */}
        <span
          className="kraft-back paper-grain absolute inset-x-0 bottom-0 top-[6%] rounded-[3px]"
          style={{ backgroundColor: BACK_TONES[index % BACK_TONES.length] }}
        />
        <span
          className="kraft-back paper-grain absolute top-0 h-[8%] w-[30%] rounded-t-[4px]"
          style={{ left: TAB_POSITIONS[index % TAB_POSITIONS.length], backgroundColor: BACK_TONES[index % BACK_TONES.length] }}
        />

        {/* A second sheet behind the main paper, so the file looks full */}
        <span className="absolute left-[10%] right-[5%] top-[20%] bottom-[5%] rounded-[2px] bg-[#efe8d6]" />

        {/* Main paper with the screenshot; it peeks out on hover */}
        {!open && (
          <motion.span
            layoutId={paperLayoutId(project)}
            className="absolute left-[7%] right-[8%] top-[18%] bottom-[5%] block overflow-hidden rounded-[2px] bg-[#fdfbf4] shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
            initial={false}
            animate={{ y: hovered ? "-24%" : "0%" }}
            transition={{
              y: { type: "spring", stiffness: 220, damping: 24 },
              // Used when the paper flies back into the file after closing.
              layout: { duration: 0.7, ease: PAPER_EASE },
            }}
          >
            <span className="relative mx-[7%] mt-[8%] block aspect-[16/10] overflow-hidden border border-black/10">
              <Image src={project.cover} alt="" fill sizes="230px" className="object-cover object-top" />
            </span>
          </motion.span>
        )}

        {/* Sticky note tucked into the file with the project name */}
        <motion.span
          className="paper-grain absolute top-[11%] flex h-[15%] w-[52%] items-center justify-center rounded-[1px] px-1 shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
          style={{
            left: NOTE_POSITIONS[index % NOTE_POSITIONS.length],
            backgroundColor: project.noteColor,
            rotate: NOTE_TILTS[index % NOTE_TILTS.length],
          }}
          initial={false}
          animate={{ y: hovered ? "-48%" : "0%" }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          {/* Slightly darker glue strip along the top, like a real sticky note */}
          <span className="absolute inset-x-0 top-0 h-[28%] bg-black/[0.06]" />
          <span className="relative truncate font-hand text-[length:clamp(11px,calc(var(--fw)*0.068),16px)] font-bold text-[#3a3122]">
            {project.title}
          </span>
        </motion.span>

        {/* Front panel */}
        <span
          className="kraft-front paper-grain absolute inset-x-0 bottom-0 top-[24%] rounded-[3px]"
          style={{ backgroundColor: FRONT_TONES[index % FRONT_TONES.length] }}
        >
          {/* Score lines near the bottom fold */}
          <span className="absolute inset-x-0 bottom-[9%] h-px bg-[rgba(90,60,25,0.2)]" />
          <span className="absolute inset-x-0 bottom-[11.5%] h-px bg-[rgba(90,60,25,0.14)]" />
          {/* Small handwritten file number, on the right so the file in front never covers it */}
          <span className="absolute bottom-[16%] right-[8%] font-hand text-[length:clamp(10px,calc(var(--fw)*0.06),13px)] text-[rgba(60,38,12,0.5)]">
            No. {String(index + 1).padStart(2, "0")}
          </span>
        </span>
      </button>
    </motion.div>
  );
}
