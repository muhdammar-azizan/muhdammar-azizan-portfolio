"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import ShowcaseFile from "./projects/ShowcaseFile";
import ProjectPaper from "./projects/ProjectPaper";
import { shelfItems } from "@/lib/site";

const TOTAL = shelfItems.length;
// After one step, further wheel events are ignored for this long (ms), so a single flick moves one file only.
const STEP_LOCK = 750;
// A touch swipe shorter than this (px) does not change the file.
const SWIPE = 40;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Projects as a pinned showcase. When the section reaches the top of the screen it stays there, and each scroll
 * (wheel step or swipe) brings the next file to the front: the current one leaves to the left and the next one
 * swings in from the right. After the last file, scrolling carries on to the next section.
 *
 * The section is as tall as one screen per file, and the file in front always follows the page position, so the
 * scrollbar, the keyboard and the navbar links keep working. A wheel step or swipe only jumps the page straight to
 * the next file's position.
 */
export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const [opened, setOpened] = useState<number | null>(null);
  const openedRef = useRef<number | null>(null);
  // Height of one step (the screen height) and whether the screen is narrow, measured in the browser.
  const [screen, setScreen] = useState({ height: 0, narrow: false });

  useEffect(() => {
    openedRef.current = opened;
  }, [opened]);

  const topOfSection = useCallback(() => {
    const node = sectionRef.current;
    return node ? node.getBoundingClientRect().top + window.scrollY : 0;
  }, []);

  // Jump the page to the spot where file `index` is in front. The stage is pinned, so only the files move.
  const goTo = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(TOTAL - 1, index));
      window.scrollTo({ top: topOfSection() + target * window.innerHeight, behavior: "instant" });
    },
    [topOfSection],
  );

  // Screen size, and the file in front from the page position.
  useEffect(() => {
    const measure = () => setScreen({ height: window.innerHeight, narrow: window.innerWidth < 640 });
    const follow = () => {
      const progress = (window.scrollY - topOfSection()) / window.innerHeight;
      const index = Math.max(0, Math.min(TOTAL - 1, Math.round(progress)));
      if (index !== currentRef.current) {
        currentRef.current = index;
        setCurrent(index);
      }
    };
    measure();
    follow();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", follow, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", follow);
    };
  }, [topOfSection]);

  // One wheel step or one swipe = one file, while the stage is pinned. At the first and last file the page scrolls
  // on normally, so the visitor can always leave the section.
  useEffect(() => {
    let lockedUntil = 0;
    const pinned = () => {
      const top = topOfSection();
      const y = window.scrollY;
      return y >= top - 4 && y <= top + (TOTAL - 1) * window.innerHeight + 4;
    };
    const nextFor = (direction: number) => {
      const next = currentRef.current + direction;
      return next >= 0 && next < TOTAL ? next : null;
    };

    const onWheel = (event: WheelEvent) => {
      if (openedRef.current !== null || Math.abs(event.deltaY) < 2 || !pinned()) return;
      const next = nextFor(event.deltaY > 0 ? 1 : -1);
      if (next === null) return;
      event.preventDefault();
      const now = performance.now();
      // A trackpad keeps sending events after a flick; keep ignoring them until they stop.
      if (now < lockedUntil) {
        lockedUntil = Math.max(lockedUntil, now + 160);
        return;
      }
      lockedUntil = now + STEP_LOCK;
      goTo(next);
    };

    let startY: number | null = null;
    const onTouchStart = (event: TouchEvent) => {
      startY = openedRef.current === null && pinned() ? event.touches[0].clientY : null;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (startY === null) return;
      const direction = startY - event.touches[0].clientY > 0 ? 1 : -1;
      // Hold the page still while swiping between files; let it move when the swipe leaves the section.
      if (nextFor(direction) !== null) event.preventDefault();
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (startY === null) return;
      const distance = startY - event.changedTouches[0].clientY;
      startY = null;
      if (Math.abs(distance) < SWIPE) return;
      const next = nextFor(distance > 0 ? 1 : -1);
      if (next !== null) goTo(next);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [goTo, topOfSection]);

  // Skip: go straight to the section after the projects.
  const skip = () => {
    const end = topOfSection() + (sectionRef.current?.offsetHeight ?? 0);
    window.scrollTo({ top: end, behavior: "smooth" });
  };

  const close = useCallback(() => setOpened(null), []);
  const item = shelfItems[current];
  const last = current === TOTAL - 1;
  // One screen per file. Before the browser has measured, fall back to CSS screen units.
  const stepHeight = screen.height ? `${screen.height}px` : "100svh";

  return (
    <MotionConfig reducedMotion="user">
      <section id="projects" className="scroll-mt-0 border-t border-foreground/15">
        <LayoutGroup id="project-files">
          <div ref={sectionRef} className="relative" style={{ height: `calc(${stepHeight} * ${TOTAL})` }}>
            {/* The stage stays pinned to the screen while the page scrolls through the section */}
            <div className="sticky top-0 overflow-hidden" style={{ height: stepHeight }}>
              <div className="relative mx-auto flex h-full max-w-6xl flex-col px-6 pb-5 pt-20 sm:pt-24">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Project Files<span className="text-accent">.</span>
                  </h2>
                  <p className="mt-2 text-sm text-foreground/60 sm:text-base">
                    <span className="hidden sm:inline">Hover the file to peek inside, click to open it.</span>
                    <span className="sm:hidden">Tap the file to open it.</span>
                  </p>
                </div>

                {/* The files. Their size follows the space left on the screen (container units). */}
                <div className="relative min-h-0 flex-1" style={{ containerType: "size" }}>
                  <div className="absolute inset-0 [--fw:min(62vw,calc(100cqh*0.9/1.32),360px)]">
                    {shelfItems.map((file, index) => (
                      <ShowcaseFile
                        key={file.id}
                        item={file}
                        index={index}
                        offset={index - current}
                        open={opened === index}
                        narrow={screen.narrow}
                        onOpen={setOpened}
                        onSelect={goTo}
                      />
                    ))}
                  </div>
                </div>

                {/* Name and summary of the file in front */}
                <div className="relative h-[4.75rem] text-center sm:h-[5.25rem]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <h3 className="font-clash text-2xl font-semibold tracking-tight sm:text-4xl">{item.title}</h3>
                      <p className="mx-auto mt-1 max-w-xl text-sm text-foreground/60 sm:text-base">{item.summary}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Bottom bar: file counter on the left, scroll hint in the middle, skip on the right */}
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm text-foreground/60">
                  <div className="flex items-center gap-3 font-mono" aria-live="polite">
                    <span className="text-foreground">{pad(current + 1)}</span>
                    <span aria-hidden="true" className="relative h-px w-12 bg-foreground/20 sm:w-20">
                      <span
                        className="absolute inset-y-0 left-0 bg-foreground transition-[width] duration-500"
                        style={{ width: `${((current + 1) / TOTAL) * 100}%` }}
                      />
                    </span>
                    <span>{pad(TOTAL)}</span>
                    <span className="sr-only">
                      File {current + 1} of {TOTAL}
                    </span>
                  </div>
                  <p className="hidden items-center gap-2 font-mono text-xs sm:flex">
                    {last ? "Scroll to continue" : "Scroll for the next file"}
                    <ArrowDown aria-hidden="true" className="h-4 w-4 animate-bounce motion-reduce:animate-none" />
                  </p>
                  <button
                    type="button"
                    onClick={skip}
                    className="justify-self-end rounded-full border border-foreground/20 px-3.5 py-1.5 text-xs font-medium transition hover:border-foreground/50 hover:text-foreground sm:text-sm"
                  >
                    Skip projects
                  </button>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {opened !== null && <ProjectPaper key={shelfItems[opened].id} project={shelfItems[opened]} onClose={close} />}
          </AnimatePresence>
        </LayoutGroup>

        {/* Ruler along the bottom edge of the section */}
        <Ruler />
      </section>
    </MotionConfig>
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
