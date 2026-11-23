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

// The orbit the files travel on, seen from the front: a wide ring that goes back into the screen.
const ORBIT_DEPTH = 640; // px from the front of the ring to its middle
const ANGLE_PER_FILE = 62; // degrees around the ring between two neighbouring files

/**
 * Place on the ring for a file that is `e` files away from the middle (positive: still to come).
 * Files to come start far behind the middle, swing out to the right and curve forward into the front.
 * Files that have been seen carry on round to the left, staying near the front, and leave the screen.
 */
function orbit(e: number, narrow: boolean) {
  const radiusX = narrow ? 62 : 40; // vw
  const angle = (Math.max(-1.6, Math.min(2.9, e)) * ANGLE_PER_FILE * Math.PI) / 180;
  const x = Math.sin(angle) * radiusX;
  // Leaving files stay close to the front so they slide out to the side rather than going back round.
  const depth = e >= 0 ? (1 - Math.cos(angle)) * ORBIT_DEPTH : (1 - Math.cos(angle)) * ORBIT_DEPTH * 0.25;
  return { x, z: -depth, angle: (angle * 180) / Math.PI };
}

type ShowcaseFileProps = {
  item: ShelfItem;
  index: number;
  // How fast and which way the files are moving, from -1 to 1. Bends the file like soft paper in the wind.
  bend: MotionValue<number>;
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
export default function ShowcaseFile({ item, index, progress, bend, front, open, narrow, onOpen }: ShowcaseFileProps) {
  const [hover, setHover] = useState(false);
  const lifted = hover && !open;
  const tabLeft = TAB_POSITIONS[index % TAB_POSITIONS.length];
  // Everything below is computed from the scroll position without re-rendering React.
  const e = useTransform(progress, (p) => travel(index - p));
  const place = useTransform(e, (v) => orbit(v, narrow));
  const x = useTransform(place, (o) => `${o.x}vw`);
  const z = useTransform(place, (o) => o.z);
  // Turned to follow the ring, but never so far that the file is seen edge-on.
  const rotateY = useTransform(place, (o) => -Math.max(-50, Math.min(50, o.angle * 0.75)));
  const rotateZ = useTransform(e, (v) => Math.max(-1.5, Math.min(1.5, v)) * 2.5);
  const y = useTransform(place, (o) => `${(o.z / ORBIT_DEPTH) * 6}%`);
  // Fades in while it is still far behind (where it is hard to notice) and out as it leaves on the left.
  const opacity = useTransform(e, (v) => {
    if (v > 0) return v <= 1.9 ? 1 : Math.max(0, 1 - (v - 1.9) / 0.8);
    return v >= -1.05 ? 1 : Math.max(0, 1 - (-v - 1.05) / 0.45);
  });
  // Nearer files are drawn on top of further ones.
  const zIndex = useTransform(place, (o) => Math.round(1000 + o.z));
  // Every file that can really be seen takes clicks.
  const pointerEvents = useTransform(opacity, (o) => (o > 0.35 ? "auto" : "none"));
  // Files further back are a little darker, like they are out of the light.
  const shade = useTransform(place, (o) => Math.min(0.38, (-o.z / ORBIT_DEPTH) * 0.22 + Math.abs(o.x) / 400));

  // Soft paper: while the files move, each one leans back from its leading edge, shears a little and catches a band
  // of light, as if the air pushed it. At rest it is flat again.
  const bendY = useTransform(bend, (v) => v * 16);
  const bendSkew = useTransform(bend, (v) => v * -3.5);
  const bendSquash = useTransform(bend, (v) => 1 - Math.abs(v) * 0.04);
  const bendOrigin = useTransform(bend, (v) => (v >= 0 ? 0 : 1));
  const sheenOpacity = useTransform(bend, (v) => Math.min(1, Math.abs(v)) * 0.55);
  const sheenPosition = useTransform(bend, (v) => `${50 - v * 45}% 0`);

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
        opacity,
        zIndex,
        pointerEvents,
        transformPerspective: 1200,
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
      }}
    >
      {/* The bend layer: soft paper leaning in the air while it moves */}
      <motion.div
        className="absolute inset-0"
        style={{ rotateY: bendY, skewY: bendSkew, scaleX: bendSquash, originX: bendOrigin, transformPerspective: 900 }}
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
              // Only measure for the shared "grow into the opened paper" move when the file opens or closes. Otherwise the
              // paper would try to fly between the positions the file had while travelling round the ring.
              layoutDependency={open}
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

          {/* Light and shadow that slide across the file while it bends, so the surface looks curved */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[3px] mix-blend-soft-light"
            style={{
              opacity: sheenOpacity,
              backgroundImage:
                "linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.85) 42%, rgba(255,255,255,0.2) 50%, rgba(0,0,0,0.45) 62%, transparent 80%)",
              backgroundSize: "220% 100%",
              backgroundPosition: sheenPosition,
            }}
          />
        </button>
      </motion.div>
    </motion.div>
  );
}
