"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useAnimate, useTransform, type MotionValue } from "framer-motion";
import type { ShelfItem } from "@/lib/site";

// Folder tabs and sticky notes sit at different spots on each file, like a real drawer.
const TAB_POSITIONS = ["58%", "38%", "64%"];
const NOTE_POSITIONS = ["38%", "30%", "34%"];
const NOTE_TILTS = [-3, 2.5, -1.5, 3.5];
// Real kraft folders are never exactly the same shade.
const FRONT_TONES = ["#c9a473", "#c39d6b", "#cda97a", "#c6a070"];
const BACK_TONES = ["#b38b5d", "#ad8556", "#b69062", "#b08859"];

// Same easing as the opened paper, so the paper leaves and returns smoothly.
const PAPER_EASE = [0.45, 0, 0.2, 1] as const;

export const paperLayoutId = (item: ShelfItem) => `shelf-paper-${item.id}`;

// Around the middle of the screen a file barely moves for a while: that is where a project is highlighted.
// (Distance, in files, over which the movement slowly picks up again on each side.)
const HOLD = 0.32;

/**
 * Turns "how many files away from the middle" (d) into a travel amount with a soft pause around zero.
 * Close to the middle the file hardly moves; further out it moves at full speed. The change is smooth, so there is
 * no visible jolt when a file starts or stops resting.
 */
function travel(d: number) {
  const a = Math.abs(d);
  if (a >= HOLD) return d;
  const t = a / HOLD;
  return d * t * t * (3 - 2 * t);
}

type ShowcaseFileProps = {
  item: ShelfItem;
  index: number;
  // Which file is in the middle, as a smooth number (1.5 means halfway between the second and third file).
  progress: MotionValue<number>;
  // True for the file nearest the middle: it gets a short peek of its paper when it arrives.
  front: boolean;
  open: boolean;
  narrow: boolean;
  onOpen: (index: number) => void;
};

/**
 * One large manila file of the projects showcase. Its place follows the page scroll continuously: it comes in small
 * and turned from the right, rests large and straight in the middle, then turns the other way and leaves to the left.
 * Every file on screen can be hovered and clicked.
 */
export default function ShowcaseFile({ item, index, progress, front, open, narrow, onOpen }: ShowcaseFileProps) {
  const [hover, setHover] = useState(false);
  const lifted = hover && !open;
  const tabLeft = TAB_POSITIONS[index % TAB_POSITIONS.length];
  const spread = narrow ? 64 : 40; // how far (vw) one file step travels sideways

  // Everything below is computed from the scroll position without re-rendering React.
  const e = useTransform(progress, (p) => travel(index - p));
  const distance = useTransform(e, (v) => Math.abs(v));
  const x = useTransform(e, (v) => `${v * spread}vw`);
  const y = useTransform(distance, (a) => `${-Math.min(a, 2) * 3}%`);
  const z = useTransform(distance, (a) => -Math.min(a, 2) * 260);
  const rotateY = useTransform(e, (v) => -Math.max(-1.4, Math.min(1.4, v)) * 40);
  const rotateZ = useTransform(e, (v) => Math.max(-2, Math.min(2, v)) * 3);
  const scale = useTransform(distance, (a) => 1 - Math.min(a, 2) * 0.1);
  // Fully visible near the middle, fading out as it reaches the edge of the screen.
  const opacity = useTransform(distance, (a) => (a <= 1.2 ? 1 : Math.max(0, 1 - (a - 1.2) / 0.6)));
  // The file nearest the middle is drawn on top.
  const zIndex = useTransform(distance, (a) => 100 - Math.round(a * 10));
  // Only files that can be seen take clicks.
  const pointerEvents = useTransform(distance, (a) => (a < 1.65 ? "auto" : "none"));
  // Files away from the middle are a little darker.
  const shade = useTransform(distance, (a) => Math.min(a, 1) * 0.18);

  // When a file reaches the middle, its paper and sticky note rise for a moment: a glimpse of the project.
  const [contents, animateContents] = useAnimate<HTMLSpanElement>();
  useEffect(() => {
    if (!front || !contents.current) return;
    const controls = animateContents(contents.current, { y: ["0%", "-12%", "0%"] }, { duration: 1.2, delay: 0.25, ease: "easeInOut" });
    return () => controls.stop();
  }, [front, contents, animateContents]);

  const label = item.reserved ? "Open the reserved file to see how to start a project together" : `Open the ${item.title} project file`;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        width: "var(--fw)",
        height: "calc(var(--fw) * 1.32)",
        marginLeft: "calc(var(--fw) / -2)",
        marginTop: "calc(var(--fw) * -0.66)",
        x,
        y,
        z,
        rotateY,
        rotateZ,
        scale,
        opacity,
        zIndex,
        pointerEvents,
        transformPerspective: 1200,
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
      }}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        className="absolute inset-0 cursor-pointer rounded-[3px] outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
        onPointerEnter={(event) => event.pointerType === "mouse" && setHover(true)}
        onPointerLeave={() => setHover(false)}
        onClick={() => onOpen(index)}
      >
        {/* Shadow under the file */}
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 top-[6%] rounded-[3px] shadow-[0_24px_40px_-14px_rgba(40,25,10,0.45)]" />

        {/* Back panel with its tab */}
        <span
          className="kraft-back paper-grain absolute inset-x-0 bottom-0 top-[6%] rounded-[3px]"
          style={{ backgroundColor: BACK_TONES[index % BACK_TONES.length] }}
        />
        <span
          className="kraft-back paper-grain absolute top-0 h-[8%] w-[30%] rounded-t-[4px]"
          style={{ left: tabLeft, backgroundColor: BACK_TONES[index % BACK_TONES.length] }}
        />

        {/* A second sheet behind the main paper, so a project file looks full */}
        {!item.reserved && <span className="absolute left-[10%] right-[5%] top-[20%] bottom-[5%] rounded-[2px] bg-[#efe8d6]" />}

        {/* Paper and sticky note sit in one layer, so they can rise together when the file reaches the middle */}
        <span ref={contents} className="absolute inset-0" style={{ willChange: "transform" }}>
          {/* Main paper; it rises out of the file on hover and grows into the opened paper on click */}
          {!open && (
            <motion.span
              layoutId={paperLayoutId(item)}
              className="absolute left-[7%] right-[8%] top-[18%] bottom-[5%] block overflow-hidden rounded-[2px] bg-[#fdfbf4] shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
              initial={false}
              animate={{ y: lifted ? "-24%" : "0%" }}
              transition={{ y: { type: "spring", stiffness: 220, damping: 24 }, layout: { duration: 0.7, ease: PAPER_EASE } }}
            >
              {item.cover ? (
                <span className="relative mx-[7%] mt-[8%] block aspect-[16/10] overflow-hidden border border-black/10">
                  <Image src={item.cover} alt="" fill sizes="360px" loading="eager" className="object-cover object-top" />
                </span>
              ) : (
                <span className="block px-[9%] pt-[9%] font-hand text-[length:calc(var(--fw)*0.075)] leading-snug text-[#2a2f3a]/80">
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
            animate={{ y: lifted ? "-48%" : "0%" }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <span className="absolute inset-x-0 top-0 h-[28%] bg-black/[0.06]" />
            <span className="relative truncate font-hand text-[length:calc(var(--fw)*0.068)] font-bold text-[#3a3122]">{item.title}</span>
          </motion.span>
        </span>

        {/* Front panel */}
        <span
          className="kraft-front paper-grain absolute inset-x-0 bottom-0 top-[24%] rounded-[3px]"
          style={{ backgroundColor: FRONT_TONES[index % FRONT_TONES.length] }}
        >
          <span className="absolute inset-x-0 bottom-[9%] h-px bg-[rgba(90,60,25,0.2)]" />
          <span className="absolute inset-x-0 bottom-[11.5%] h-px bg-[rgba(90,60,25,0.14)]" />
          {item.reserved && (
            <span className="absolute right-[8%] top-[12%] w-[70%] text-right font-hand text-[length:calc(var(--fw)*0.06)] leading-snug text-[rgba(60,38,12,0.55)]">
              Space reserved
              <br />
              for our collab
            </span>
          )}
          <span className="absolute bottom-[16%] right-[8%] font-hand text-[length:calc(var(--fw)*0.055)] text-[rgba(60,38,12,0.5)]">
            No. {String(index + 1).padStart(2, "0")}
          </span>
        </span>

        {/* Files away from the middle are a little darker */}
        <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[3px] bg-black" style={{ opacity: shade }} />
      </button>
    </motion.div>
  );
}
