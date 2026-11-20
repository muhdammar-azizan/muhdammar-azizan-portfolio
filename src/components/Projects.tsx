"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "./Reveal";
import ProjectFolder from "./projects/ProjectFolder";
import ProjectPaper from "./projects/ProjectPaper";
import { SHELF_SIZE, shelfItems } from "@/lib/site";

const SLIDE_SPRING = { type: "spring", stiffness: 140, damping: 24, mass: 0.9 } as const;

/**
 * Projects shown as a row of manila files that slides left and right.
 * Hover (or first tap on phones) peeks inside a file; clicking opens its paper in the middle.
 * Empty spots hold "Reserved for you" files with contact details.
 */
export default function Projects() {
  // Which file the pointer is on (-1 for none). A motion value rather than state: hovering would otherwise
  // re-render the whole shelf. Each file listens to it for itself.
  const peeked = useMotionValue(-1);
  const [opened, setOpened] = useState<number | null>(null);
  const openedRef = useRef<number | null>(null);
  const folderButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    openedRef.current = opened;
  }, [opened]);

  // ---------- Sliding shelf ----------
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const trackX = useMotionValue(0);
  // Width of the visible window; the files use it to work out which ones are near the edge.
  const viewWidth = useMotionValue(0);
  const [metrics, setMetrics] = useState({ step: 1, maxShift: 0, visible: 1 });
  const [start, setStart] = useState(0);
  // Set while the shelf is being dragged, so letting go does not also open a file.
  const dragged = useRef(false);

  // Measure how far apart the files are and how far the shelf can slide.
  useEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const slots = track?.querySelectorAll<HTMLElement>("[data-shelf-slot]");
      if (!viewport || !track || !slots?.length) return;
      const first = slots[0];
      const step = slots[1] ? slots[1].offsetLeft - first.offsetLeft : first.offsetWidth;
      const maxShift = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const visible = Math.max(1, Math.floor((viewport.clientWidth - first.offsetLeft) / step));
      viewWidth.set(viewport.clientWidth);
      setMetrics({ step, maxShift, visible });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (viewportRef.current) observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [viewWidth]);

  const maxStart = Math.ceil(metrics.maxShift / metrics.step);
  const clampStart = useCallback((value: number) => Math.min(Math.max(value, 0), maxStart), [maxStart]);
  const offsetFor = useCallback(
    (index: number) => -Math.min(index * metrics.step, metrics.maxShift),
    [metrics.step, metrics.maxShift],
  );

  // Glide the shelf whenever the first visible file changes (or the layout is measured again).
  useEffect(() => {
    const controls = animate(trackX, offsetFor(clampStart(start)), reduceMotion ? { duration: 0 } : SLIDE_SPRING);
    return () => controls.stop();
  }, [start, clampStart, offsetFor, trackX, reduceMotion]);

  const slide = (direction: number) => {
    peeked.set(-1);
    setStart((current) => clampStart(current + direction * Math.max(1, metrics.visible - 1)));
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    // Snap to the nearest file, carrying a little of the throw.
    const projected = -(trackX.get() + info.velocity.x * 0.2);
    const next = clampStart(Math.round(projected / metrics.step));
    setStart(next);
    // If the start index did not change, the effect above will not run, so glide back here too.
    animate(trackX, offsetFor(next), reduceMotion ? { duration: 0 } : SLIDE_SPRING);
    window.setTimeout(() => (dragged.current = false), 50);
  };

  // Keyboard users tabbing to a hidden file bring it into view.
  const ensureVisible = (index: number) => {
    if (index < start) setStart(clampStart(index));
    else if (index >= start + metrics.visible) setStart(clampStart(index - metrics.visible + 1));
  };

  // ---------- Peek and open ----------
  // These handlers are handed to every file and never change, so the files do not re-render for them.
  const ensureVisibleRef = useRef(ensureVisible);
  useEffect(() => {
    ensureVisibleRef.current = ensureVisible;
  });
  const onFocusFile = useCallback((index: number) => ensureVisibleRef.current(index), []);
  const registerButton = useCallback((index: number, el: HTMLButtonElement | null) => {
    folderButtons.current[index] = el;
  }, []);
  const onPeekStart = useCallback(
    (index: number) => {
      if (openedRef.current === null && !dragged.current) peeked.set(index);
    },
    [peeked],
  );
  const onPeekEnd = useCallback(
    (index: number) => {
      // Letting go is delayed by one frame. Moving straight from one file to the next would otherwise pass through
      // "no file" for an instant, which sends all the other files lighter and darker again for no reason.
      requestAnimationFrame(() => {
        if (peeked.get() === index) peeked.set(-1);
      });
    },
    [peeked],
  );
  const activate = useCallback(
    (index: number, pointerType: string) => {
      if (dragged.current) return;
      // On touch screens the first tap only peeks, the second tap opens.
      if (pointerType === "touch" && peeked.get() !== index) {
        peeked.set(index);
        return;
      }
      peeked.set(-1);
      setOpened(index);
    },
    [peeked],
  );

  const close = () => {
    const index = opened;
    setOpened(null);
    // Give keyboard focus back to the file that was opened.
    if (index !== null) requestAnimationFrame(() => folderButtons.current[index]?.focus({ preventScroll: true }));
  };

  const atStart = start <= 0;
  const atEnd = start >= maxStart;
  // Counter follows where the shelf actually stops (the last slide can be shorter than a full step).
  const firstShown = Math.min(Math.round(-offsetFor(clampStart(start)) / metrics.step) + 1, SHELF_SIZE);
  const lastShown = Math.min(firstShown + metrics.visible - 1, SHELF_SIZE);

  return (
    <MotionConfig reducedMotion="user">
      {/* Straight line along the top; the ruler closes the section at the bottom */}
      <section id="projects" className="scroll-mt-16 overflow-x-clip border-t border-foreground/15 pt-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Project Files<span className="text-accent">.</span>
            </h2>
            <p className="mt-3 text-foreground/60">
              <span className="hidden sm:inline">Hover a file to peek inside, click to open it. Slide the shelf for more.</span>
              <span className="sm:hidden">Tap a file to peek inside, tap again to open it. Swipe for more.</span>
            </p>
          </Reveal>
        </div>

        <LayoutGroup id="project-files">
          <Reveal delay={0.1}>
            <div className="relative">
              {/* Visible window of the shelf. Clips sideways only, so peeking papers can rise above it. */}
              <div ref={viewportRef} className="overflow-x-clip pb-8 pt-20">
                <motion.div
                  ref={trackRef}
                  className="flex w-max cursor-grab items-end active:cursor-grabbing [--fw:min(44vw,190px)] [--overlap:-0.1] sm:[--fw:clamp(180px,19vw,250px)] sm:[--overlap:-0.2]"
                  // Line the first file up with the page content; leave the same room after the last one.
                  style={{
                    x: trackX,
                    touchAction: "pan-y",
                    paddingLeft: "max(1.5rem, calc((100vw - 72rem) / 2 + 1.5rem))",
                    paddingRight: "max(1.5rem, calc((100vw - 72rem) / 2 + 1.5rem))",
                    // The whole shelf moves as one layer, so sliding does not repaint the files.
                    willChange: "transform",
                  }}
                  drag={opened === null ? "x" : false}
                  dragConstraints={{ left: -metrics.maxShift, right: 0 }}
                  dragElastic={0.12}
                  dragMomentum={false}
                  onDragStart={() => {
                    dragged.current = true;
                    peeked.set(-1);
                  }}
                  onDragEnd={onDragEnd}
                >
                  <Bookend side="start" />
                  {shelfItems.map((item, index) => (
                    <ProjectFolder
                      key={item.id}
                      item={item}
                      index={index}
                      total={shelfItems.length}
                      peeked={peeked}
                      opened={opened}
                      trackX={trackX}
                      viewWidth={viewWidth}
                      registerButton={registerButton}
                      onPeekStart={onPeekStart}
                      onPeekEnd={onPeekEnd}
                      onActivate={activate}
                      onFocusFile={onFocusFile}
                    />
                  ))}
                  <Bookend side="end" />
                </motion.div>
              </div>

              {/* Slide buttons */}
              <ShelfArrow side="left" disabled={atStart} onClick={() => slide(-1)} />
              <ShelfArrow side="right" disabled={atEnd} onClick={() => slide(1)} />
            </div>
          </Reveal>

          {/* Handwritten counter of the files in view */}
          <p className="mt-2 text-center font-hand text-lg text-foreground/60" aria-live="polite">
            {String(firstShown).padStart(2, "0")}–{String(lastShown).padStart(2, "0")} / {SHELF_SIZE}
          </p>

          <AnimatePresence>
            {opened !== null && (
              <ProjectPaper key={shelfItems[opened].id} project={shelfItems[opened]} onClose={close} />
            )}
          </AnimatePresence>
        </LayoutGroup>

        {/* Ruler along the bottom edge of the section */}
        <Ruler />
      </section>
    </MotionConfig>
  );
}

// Round glass button on the side of the shelf.
function ShelfArrow({ side, disabled, onClick }: { side: "left" | "right"; disabled: boolean; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Show previous files" : "Show next files"}
      className={`nav-glass absolute top-[55%] z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-foreground transition hover:scale-105 disabled:pointer-events-none disabled:opacity-0 ${
        side === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6"
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

// L-shaped metal bookend that holds the row of files at each end of the shelf.
function Bookend({ side }: { side: "start" | "end" }) {
  const start = side === "start";
  return (
    <div
      aria-hidden="true"
      className={`relative shrink-0 self-end ${start ? "mr-2" : "ml-2"}`}
      style={{ width: "calc(var(--fw) * 0.24)", height: "calc(var(--fw) * 0.75)", zIndex: start ? 40 : 0 }}
    >
      {/* Upright plate, leaning on the files */}
      <span className={`metal-plate absolute bottom-0 top-0 block w-[18%] rounded-t-[3px] ${start ? "right-0" : "left-0"}`} />
      {/* Base plate that slides under the files */}
      <span className={`metal-plate absolute -bottom-px block h-[5%] rounded-[1px] ${start ? "left-0 right-0" : "left-0 -right-0"}`} />
    </div>
  );
}

// Number of centimetre marks on the ruler; enough to cover very wide screens.
const RULER_CM = 70;

// Slim full-width ruler with centimetre marks along the top edge, numbered on one side.
function Ruler() {
  return (
    <div aria-hidden="true" className="ruler relative mt-20 h-10 w-full select-none overflow-hidden border-y border-foreground/25">
      {Array.from({ length: RULER_CM }, (_, cm) => (
        <span
          key={cm}
          className="absolute top-[14px] -translate-x-1/2 font-mono text-[10px] font-medium leading-none text-foreground/55"
          style={{ left: `calc(var(--ruler-start) + var(--cm) * ${cm})` }}
        >
          {cm}
        </span>
      ))}
      {/* Unit name in the gap between 0 and 1 */}
      <span
        className="absolute top-[14px] -translate-x-1/2 font-mono text-[8px] leading-[10px] text-foreground/40"
        style={{ left: "calc(var(--ruler-start) + var(--cm) * 0.5)" }}
      >
        cm
      </span>
      {/* Small printed text, like on a shop-bought ruler */}
      <span className="absolute bottom-[3px] right-6 hidden font-mono text-[8px] uppercase tracking-[0.25em] text-foreground/30 sm:block">
        No. 3020 · Shatterproof · MA Studio
      </span>
    </div>
  );
}
