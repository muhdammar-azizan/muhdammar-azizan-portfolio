"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, type RefObject } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
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

export const paperLayoutId = (item: ShelfItem) => `shelf-paper-${item.id}`;

type ProjectFolderProps = {
  item: ShelfItem;
  index: number;
  total: number;
  hovered: boolean;
  dimmed: boolean;
  // -1 moves left, 1 moves right, 0 stays (used while another file is open).
  shift: number;
  open: boolean;
  // Horizontal position of the sliding shelf and the visible window, for the edge lean.
  trackX: MotionValue<number>;
  viewportRef: RefObject<HTMLDivElement | null>;
  buttonRef: (el: HTMLButtonElement | null) => void;
  onPeekStart: () => void;
  onPeekEnd: () => void;
  onActivate: (pointerType: string) => void;
  onFocusFile: () => void;
};

/**
 * A manila file standing upright. The paper inside and the sticky note
 * slide up a little on hover; the paper leaves the file when it is opened.
 * Reserved files hold a single handwritten invitation instead of a screenshot.
 */
export default function ProjectFolder({
  item,
  index,
  total,
  hovered,
  dimmed,
  shift,
  open,
  trackX,
  viewportRef,
  buttonRef,
  onPeekStart,
  onPeekEnd,
  onActivate,
  onFocusFile,
}: ProjectFolderProps) {
  const shadow = hovered ? "drop-shadow(0 18px 16px rgba(40,25,10,0.28))" : "drop-shadow(0 8px 10px rgba(40,25,10,0.18))";
  const brightness = dimmed ? 0.72 : hovered ? 1.06 : 1;

  // Remember whether the last press was mouse, pen, touch or keyboard (touch needs a tap to peek first).
  const lastPointer = useRef("mouse");
  const slotRef = useRef<HTMLDivElement>(null);

  // Edge lean: -1 (leaving on the left) .. 0 (comfortably inside) .. 1 (leaving on the right).
  const edge = useMotionValue(0);
  const hoveredRef = useRef(hovered);
  const edgeFor = useCallback(() => {
    const slot = slotRef.current;
    const viewport = viewportRef.current;
    if (!slot || !viewport) return 0;
    const width = slot.offsetWidth;
    const left = slot.offsetLeft + trackX.get();
    const right = left + width;
    const zone = width * 0.9;
    const view = viewport.clientWidth;
    if (left < zone) return -Math.min(1, (zone - left) / (zone + width));
    if (right > view - zone) return Math.min(1, (right - (view - zone)) / (zone + width));
    return 0;
  }, [trackX, viewportRef]);

  // Follow the shelf while it slides. A peeked file stands up straight instead.
  useEffect(() => {
    const update = () => {
      if (!hoveredRef.current) edge.set(edgeFor());
    };
    update();
    const unsubscribe = trackX.on("change", update);
    window.addEventListener("resize", update);
    return () => {
      unsubscribe();
      window.removeEventListener("resize", update);
    };
  }, [edge, edgeFor, trackX]);

  useEffect(() => {
    hoveredRef.current = hovered;
    const controls = animate(edge, hovered ? 0 : edgeFor(), { type: "spring", stiffness: 220, damping: 26 });
    return () => controls.stop();
  }, [hovered, edge, edgeFor]);

  // Turn around the edge that faces the middle, so the outer edge falls back into the screen.
  const leanRotate = useTransform(edge, (v) => v * EDGE_LEAN);
  const leanOrigin = useTransform(edge, (v) => (v < 0 ? 1 : 0));
  const leanFilter = useTransform(edge, (v) => `brightness(${1 - Math.abs(v) * EDGE_DIM})`);

  const label = item.reserved
    ? `Reserved spot ${index + 1}: open to see how to start a project together`
    : `Open the ${item.title} project file`;

  return (
    <motion.div
      ref={slotRef}
      data-shelf-slot
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
      <motion.div
        className="absolute inset-0"
        style={{ rotateY: leanRotate, originX: leanOrigin, transformPerspective: 900, filter: leanFilter }}
      >
        <button
          ref={buttonRef}
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
          onPointerEnter={(event) => event.pointerType === "mouse" && onPeekStart()}
          onPointerLeave={(event) => event.pointerType === "mouse" && onPeekEnd()}
          onFocus={(event) => {
            onFocusFile();
            if (event.currentTarget.matches(":focus-visible")) onPeekStart();
          }}
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

          {/* A second sheet behind the main paper, so a project file looks full. Reserved files are nearly empty. */}
          {!item.reserved && <span className="absolute left-[10%] right-[5%] top-[20%] bottom-[5%] rounded-[2px] bg-[#efe8d6]" />}

          {/* Main paper; it peeks out on hover */}
          {!open && (
            <motion.span
              layoutId={paperLayoutId(item)}
              className="absolute left-[7%] right-[8%] top-[18%] bottom-[5%] block overflow-hidden rounded-[2px] bg-[#fdfbf4] shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
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
        </button>
      </motion.div>
    </motion.div>
  );
}
