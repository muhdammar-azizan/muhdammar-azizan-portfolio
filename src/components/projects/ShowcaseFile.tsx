"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, type TargetAndTransition } from "framer-motion";
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
// Every move between files uses this: quick start, long soft landing.
const MOVE = { duration: 0.85, ease: [0.22, 1, 0.36, 1] } as const;

export const paperLayoutId = (item: ShelfItem) => `shelf-paper-${item.id}`;

/**
 * Where a file stands, by its distance from the file in front (offset 0).
 * The next files wait on the right, turned away in 3D; files already seen leave to the left.
 */
function placeFor(offset: number, narrow: boolean): TargetAndTransition {
  if (offset === 0) return { x: "0vw", rotateY: 0, rotateZ: 0, scale: 1, opacity: 1 };
  if (offset < 0) return { x: "-80vw", rotateY: 35, rotateZ: -4, scale: 0.85, opacity: 0 };
  if (offset === 1) return { x: narrow ? "58vw" : "34vw", rotateY: -38, rotateZ: 2, scale: 0.72, opacity: 1 };
  if (offset === 2) return { x: narrow ? "72vw" : "43vw", rotateY: -44, rotateZ: 3, scale: 0.6, opacity: 0.85 };
  return { x: "60vw", rotateY: -50, rotateZ: 4, scale: 0.5, opacity: 0 };
}

type ShowcaseFileProps = {
  item: ShelfItem;
  index: number;
  // Distance from the file in front: 0 is in front, 1 is next, -1 has just left.
  offset: number;
  open: boolean;
  narrow: boolean;
  onOpen: (index: number) => void;
  onSelect: (index: number) => void;
};

/**
 * One large manila file of the projects showcase. The file in front can be hovered (its paper and sticky note
 * rise) and clicked to open its paper. Clicking the next file on the right brings it to the front.
 */
export default function ShowcaseFile({ item, index, offset, open, narrow, onOpen, onSelect }: ShowcaseFileProps) {
  const [hover, setHover] = useState(false);
  const front = offset === 0;
  const lifted = front && hover && !open;
  const reachable = offset === 0 || offset === 1;
  const tabLeft = TAB_POSITIONS[index % TAB_POSITIONS.length];
  const label = front
    ? item.reserved
      ? "Open the reserved file to see how to start a project together"
      : `Open the ${item.title} project file`
    : `Show the next file: ${item.title}`;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        width: "var(--fw)",
        height: "calc(var(--fw) * 1.32)",
        marginLeft: "calc(var(--fw) / -2)",
        marginTop: "calc(var(--fw) * -0.66)",
        // The file in front is on top; the waiting ones stack behind it in order.
        zIndex: offset < 0 ? 5 : 30 - offset,
        transformPerspective: 1200,
        pointerEvents: reachable ? "auto" : "none",
        willChange: "transform, opacity",
      }}
      initial={false}
      animate={placeFor(offset, narrow)}
      transition={MOVE}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={front ? open : undefined}
        tabIndex={reachable ? 0 : -1}
        className="absolute inset-0 cursor-pointer rounded-[3px] outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
        onPointerEnter={(event) => event.pointerType === "mouse" && setHover(true)}
        onPointerLeave={() => setHover(false)}
        onClick={() => (front ? onOpen(index) : onSelect(index))}
      >
        {/* Shadow under the file */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 top-[6%] rounded-[3px] shadow-[0_24px_40px_-14px_rgba(40,25,10,0.45)]"
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

        {/* A second sheet behind the main paper, so a project file looks full */}
        {!item.reserved && <span className="absolute left-[10%] right-[5%] top-[20%] bottom-[5%] rounded-[2px] bg-[#efe8d6]" />}

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
                <Image src={item.cover} alt="" fill sizes="360px" className="object-cover object-top" />
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

        {/* Files waiting on the side are a little darker than the one in front */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[3px] bg-black transition-opacity duration-700"
          style={{ opacity: front ? 0 : 0.18 }}
        />
      </button>
    </motion.div>
  );
}
