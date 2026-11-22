"use client";

import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import type { ShelfItem } from "@/lib/site";

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

// Files near the left or right edge of the screen lean back, like files at the end of a drawer.
const EDGE_LEAN = 32; // degrees at the very edge
const EDGE_DIM = 0.3; // how much darker at the very edge

// Files that are not peeked get darker, and the peeked one a little lighter. This is done with a dark and a light
// layer that only change their opacity, using a CSS transition. The browser runs that by itself, with no work on
// the page's main thread for each frame. (Animating a CSS filter on 15 files with JavaScript springs made hovering,
// sliding and opening a file stutter.)
const DIM = 0.28; // how much darker the other files get while one is peeked
const BRIGHTEN = 0.08; // how much lighter the peeked file gets

// Entrance of the files: each one sweeps in from the right, turned away in 3D, and settles into its place.
// They come one after another from the left; files far along the shelf share the last start time.
const ENTER_STAGGER = 0.12;
const ENTER_STAGGER_MAX = 7;
const ENTER_DURATION = 0.85;

// One easing for everything that moves by CSS transition: quick start, long soft landing, like the springs before.
const SETTLE = "cubic-bezier(0.22, 1, 0.36, 1)";

// Outline of a file (the body and its tab), so the dark and light layers have the same shape as the file.
const silhouette = (tabLeft: string) =>
  `polygon(0 6%, ${tabLeft} 6%, ${tabLeft} 0, calc(${tabLeft} + 30%) 0, calc(${tabLeft} + 30%) 6%, 100% 6%, 100% 100%, 0 100%)`;

export const paperLayoutId = (item: ShelfItem) => `shelf-paper-${item.id}`;

type ProjectFolderProps = {
  item: ShelfItem;
  index: number;
  total: number;
  // Which file the pointer is on (-1 for none). A motion value, so hovering never re-renders the whole shelf:
  // each file listens for itself and only the two files involved update.
  peeked: MotionValue<number>;
  // Index of the file whose paper is open, or null.
  opened: number | null;
  // Position of the sliding shelf and the width of the visible window, for the edge lean.
  trackX: MotionValue<number>;
  viewWidth: MotionValue<number>;
  registerButton: (index: number, el: HTMLButtonElement | null) => void;
  onPeekStart: (index: number) => void;
  onPeekEnd: (index: number) => void;
  onActivate: (index: number, pointerType: string) => void;
  onFocusFile: (index: number) => void;
  // True while the shelf is on screen: the files are in their places. False: waiting off to the right.
  entered: boolean;
};

/**
 * A manila file standing upright. The paper inside and the sticky note
 * slide up a little on hover; the paper leaves the file when it is opened.
 * Reserved files hold a single handwritten invitation instead of a screenshot.
 */
function ProjectFolder({
  item,
  index,
  total,
  peeked,
  opened,
  trackX,
  viewWidth,
  registerButton,
  onPeekStart,
  onPeekEnd,
  onActivate,
  onFocusFile,
  entered,
}: ProjectFolderProps) {
  const open = opened === index;
  // -1 moves left, 1 moves right, 0 stays (while another file is open, the rest make room).
  const shift = opened === null || opened === index ? 0 : index < opened ? -1 : 1;

  // Is the pointer on this file? Only this file re-renders when that changes.
  const [peekedHere, setPeekedHere] = useState(() => peeked.get() === index);
  useMotionValueEvent(peeked, "change", (value) => setPeekedHere(value === index));
  const hovered = peekedHere && opened === null;

  // Darker when another file is peeked or open, lighter (with a deeper shadow) when this one is peeked.
  // The opacity is written straight onto the layers; their CSS transition does the fading. No React render needed.
  const dimRef = useRef<HTMLSpanElement>(null);
  const brightRef = useRef<HTMLSpanElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const update = () => {
      const current = peeked.get();
      const other = (current !== -1 && current !== index) || (opened !== null && opened !== index);
      const here = current === index && opened === null;
      if (dimRef.current) dimRef.current.style.opacity = other ? String(DIM) : "0";
      if (brightRef.current) brightRef.current.style.opacity = here ? String(BRIGHTEN) : "0";
      if (shadowRef.current) shadowRef.current.style.opacity = here ? "1" : "0";
    };
    update();
    return peeked.on("change", update);
  }, [peeked, opened, index]);

  // Remember whether the last press was mouse, pen, touch or keyboard (touch needs a tap to peek first).
  const lastPointer = useRef("mouse");
  const slotRef = useRef<HTMLDivElement>(null);
  const setButtonRef = useCallback((el: HTMLButtonElement | null) => registerButton(index, el), [registerButton, index]);

  // Edge lean: -1 (leaving on the left) .. 0 (comfortably inside) .. 1 (leaving on the right).
  const edge = useMotionValue(0);
  const hoveredRef = useRef(hovered);
  // Where this file sits on the shelf. Measured once (and when sizes change), so sliding does no layout reads.
  const geometry = useRef({ left: 0, width: 1 });
  const edgeFor = useCallback(() => {
    const { left: base, width } = geometry.current;
    const left = base + trackX.get();
    const right = left + width;
    const zone = width * 0.9;
    const view = viewWidth.get();
    if (left < zone) return -Math.min(1, (zone - left) / (zone + width));
    if (right > view - zone) return Math.min(1, (right - (view - zone)) / (zone + width));
    return 0;
  }, [trackX, viewWidth]);

  // Follow the shelf while it slides. A peeked file stands up straight instead.
  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const update = () => {
      if (hoveredRef.current) return;
      const next = edgeFor();
      if (Math.abs(next - edge.get()) > 0.0005) edge.set(next);
    };
    const measure = () => {
      geometry.current = { left: slot.offsetLeft, width: slot.offsetWidth };
      update();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(slot);
    const offTrack = trackX.on("change", update);
    const offView = viewWidth.on("change", measure);
    return () => {
      observer.disconnect();
      offTrack();
      offView();
    };
  }, [edge, edgeFor, trackX, viewWidth]);

  useEffect(() => {
    hoveredRef.current = hovered;
    const controls = animate(edge, hovered ? 0 : edgeFor(), { type: "spring", stiffness: 220, damping: 26 });
    return () => controls.stop();
  }, [hovered, edge, edgeFor]);

  // Turn around the edge that faces the middle, so the outer edge falls back into the screen.
  const leanRotate = useTransform(edge, (v) => v * EDGE_LEAN);
  const leanOrigin = useTransform(edge, (v) => (v < 0 ? 1 : 0));
  // Files near the edge of the screen are also darker. A second dark layer on top of the first multiplies with it,
  // exactly like the two dimmings together would.
  const edgeDarkness = useTransform(edge, (v) => Math.abs(v) * EDGE_DIM);

  const tabLeft = TAB_POSITIONS[index % TAB_POSITIONS.length];
  const clip = silhouette(tabLeft);

  const label = item.reserved
    ? `Reserved spot ${index + 1}: open to see how to start a project together`
    : `Open the ${item.title} project file`;

  return (
    <div
      ref={slotRef}
      data-shelf-slot
      className="relative shrink-0"
      style={{
        width: "var(--fw)",
        height: "calc(var(--fw) * 1.32)",
        marginLeft: index === 0 ? 0 : "calc(var(--fw) * var(--overlap))",
        // Left files sit in front; the peeked file comes to the very front.
        zIndex: hovered ? total + 10 : total - index,
        // Lifting a file, and the others making room when one opens, are CSS transitions: the browser moves the
        // file on its own layer without running any JavaScript per frame.
        transform: `translate3d(${shift * SPREAD}px, ${hovered ? -14 : 0}px, 0)`,
        transition: `transform 0.5s ${SETTLE}`,
        willChange: "transform",
      }}
    >
      {/* Entrance: the file waits off to the right, turned away. When the shelf comes into view it sweeps left
          into its place and turns to face front, one file after another. Leaving the shelf resets it, so it
          plays again the next time. */}
      <motion.div
        className="absolute inset-0"
        style={{ transformPerspective: 900, originX: 0 }}
        initial={false}
        animate={entered ? { opacity: 1, x: 0, rotateY: 0, rotateZ: 0 } : { opacity: 0, x: "55vw", rotateY: -55, rotateZ: 5 }}
        transition={
          entered
            ? {
                duration: ENTER_DURATION,
                delay: Math.min(index, ENTER_STAGGER_MAX) * ENTER_STAGGER,
                ease: [0.22, 1, 0.36, 1],
                opacity: { duration: 0.3, delay: Math.min(index, ENTER_STAGGER_MAX) * ENTER_STAGGER },
              }
            : { duration: 0 }
        }
      >
      <motion.div
        className="absolute inset-0"
        style={{ rotateY: leanRotate, originX: leanOrigin, transformPerspective: 900, willChange: "transform" }}
      >
        <button
          ref={setButtonRef}
          type="button"
          aria-label={label}
          aria-expanded={open}
          className="absolute inset-0 cursor-pointer rounded-[3px] outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
          onPointerDown={(event) => {
            lastPointer.current = event.pointerType;
          }}
          onKeyDown={() => {
            lastPointer.current = "keyboard";
          }}
          onPointerEnter={(event) => event.pointerType === "mouse" && onPeekStart(index)}
          onPointerLeave={(event) => event.pointerType === "mouse" && onPeekEnd(index)}
          onFocus={(event) => {
            onFocusFile(index);
            if (event.currentTarget.matches(":focus-visible")) onPeekStart(index);
          }}
          onBlur={() => onPeekEnd(index)}
          onClick={() => onActivate(index, lastPointer.current)}
        >
          {/* Shadow under the file. The resting one is painted once; the deeper shadow of a lifted file fades in on top. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 top-[6%] rounded-[3px] shadow-[0_10px_12px_-4px_rgba(40,25,10,0.3)]"
          />
          <span
            ref={shadowRef}
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 top-[6%] rounded-[3px] opacity-0 shadow-[0_24px_22px_-8px_rgba(40,25,10,0.36)]"
            style={{ transition: `opacity 0.35s ${SETTLE}` }}
          />

          {/* Back panel with its tab */}
          <span
            className="kraft-back paper-grain absolute inset-x-0 bottom-0 top-[6%] rounded-[3px]"
            style={{ backgroundColor: BACK_TONES[index % BACK_TONES.length] }}
          />
          <span
            className="kraft-back paper-grain absolute top-0 h-[8%] w-[30%] rounded-t-[4px]"
            style={{ left: tabLeft, backgroundColor: BACK_TONES[index % BACK_TONES.length] }}
          />

          {/* A second sheet behind the main paper, so a project file looks full. Reserved files are nearly empty. */}
          {!item.reserved && <span className="absolute left-[10%] right-[5%] top-[20%] bottom-[5%] rounded-[2px] bg-[#efe8d6]" />}

          {/* Main paper; it peeks out on hover */}
          {!open && (
            <motion.span
              layoutId={paperLayoutId(item)}
              className="absolute left-[7%] right-[8%] top-[18%] bottom-[5%] block overflow-hidden rounded-[2px] bg-[#fdfbf4] shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
              // Its own layer only while it moves, so 15 idle files do not each carry extra layers.
              style={{ willChange: hovered ? "transform" : "auto" }}
              initial={false}
              animate={{ y: hovered ? "-24%" : "0%" }}
              transition={{
                y: { type: "spring", stiffness: 220, damping: 24 },
                // Used when the paper flies back into the file after closing.
                layout: { duration: 0.7, ease: PAPER_EASE },
              }}
            >
              {item.cover ? (
                <span className="relative mx-[7%] mt-[8%] block aspect-[16/10] overflow-hidden border border-black/10">
                  <Image src={item.cover} alt="" fill sizes="230px" className="object-cover object-top" />
                </span>
              ) : (
                // Reserved files: a short handwritten invitation on a blank sheet.
                <span className="block px-[9%] pt-[9%] font-hand text-[length:clamp(10px,calc(var(--fw)*0.07),15px)] leading-snug text-[#2a2f3a]/80">
                  Your idea + my code = ?
                </span>
              )}
            </motion.span>
          )}

          {/* Sticky note tucked into the file with the name */}
          <motion.span
            className="paper-grain absolute top-[11%] flex h-[15%] w-[52%] items-center justify-center rounded-[1px] px-1 shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
            style={{
              left: NOTE_POSITIONS[index % NOTE_POSITIONS.length],
              backgroundColor: item.noteColor,
              rotate: NOTE_TILTS[index % NOTE_TILTS.length],
              willChange: hovered ? "transform" : "auto",
            }}
            initial={false}
            animate={{ y: hovered ? "-48%" : "0%" }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            {/* Slightly darker glue strip along the top, like a real sticky note */}
            <span className="absolute inset-x-0 top-0 h-[28%] bg-black/[0.06]" />
            <span className="relative truncate font-hand text-[length:clamp(10px,calc(var(--fw)*0.062),15px)] font-bold text-[#3a3122]">
              {item.title}
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
            {item.reserved && (
              <span className="absolute right-[8%] top-[12%] w-[70%] text-right font-hand text-[length:clamp(10px,calc(var(--fw)*0.06),14px)] leading-snug text-[rgba(60,38,12,0.55)]">
                Space reserved
                <br />
                for our collab
              </span>
            )}
            {/* Small handwritten file number, on the right so the file in front never covers it */}
            <span className="absolute bottom-[16%] right-[8%] font-hand text-[length:clamp(10px,calc(var(--fw)*0.06),13px)] text-[rgba(60,38,12,0.5)]">
              No. {String(index + 1).padStart(2, "0")}
            </span>
          </span>

          {/* Dark and light layers, cut to the shape of the file. Only their opacity changes. */}
          <span
            ref={dimRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-black opacity-0"
            style={{ clipPath: clip, transition: `opacity 0.35s ${SETTLE}` }}
          />
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-black"
            style={{ clipPath: clip, opacity: edgeDarkness }}
          />
          <span
            ref={brightRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-white opacity-0"
            style={{ clipPath: clip, transition: `opacity 0.35s ${SETTLE}` }}
          />
        </button>
      </motion.div>
      </motion.div>
    </div>
  );
}

// The shelf hands every file the same stable props, so a file only re-renders when something about it changes.
export default memo(ProjectFolder);
