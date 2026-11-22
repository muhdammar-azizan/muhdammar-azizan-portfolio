"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowDown } from "lucide-react";
import ShowcaseFile from "./projects/ShowcaseFile";
import ProjectPaper from "./projects/ProjectPaper";
import { shelfItems } from "@/lib/site";

const TOTAL = shelfItems.length;
// How much page scroll (in screen heights) moves the showcase on by one file.
const SCREENS_PER_FILE = 1.5;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Projects as a pinned showcase. While the section passes, the stage stays on screen and the files travel across
 * it with the scroll: each one comes in small and turned from the right, rests large in the middle for a while (that
 * is where its name shows), then turns away and leaves to the left while the next one is already coming in.
 *
 * The movement follows the normal page scroll, softened by a spring, so it can stop anywhere and never jumps.
 * Every file on screen can be clicked to open its paper.
 */
export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [opened, setOpened] = useState<number | null>(null);
  // Screen height and whether the screen is narrow, measured in the browser.
  const [screen, setScreen] = useState({ height: 0, narrow: false });

  useEffect(() => {
    const measure = () => setScreen({ height: window.innerHeight, narrow: window.innerWidth < 640 });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // 0 while the first file is in the middle, TOTAL - 1 at the last one. The spring gives the soft, slightly delayed
  // follow that makes the files glide instead of jumping with every wheel notch.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const rawProgress = useTransform(scrollYProgress, (v) => v * (TOTAL - 1));
  const progress = useSpring(rawProgress, { stiffness: 90, damping: 24, mass: 0.6, restDelta: 0.0005 });

  // The file nearest the middle (for the name, the counter and the short peek). Only re-renders when it changes.
  useMotionValueEvent(progress, "change", (p) => {
    const index = Math.max(0, Math.min(TOTAL - 1, Math.round(p)));
    setCurrent((previous) => (previous === index ? previous : index));
  });

  // The name below the files is shown while a file rests in the middle and fades out while files are moving.
  const nameOpacity = useTransform(progress, (p) => {
    const away = Math.abs(p - Math.round(p));
    return away < 0.12 ? 1 : Math.max(0, 1 - (away - 0.12) / 0.2);
  });
  const nameY = useTransform(nameOpacity, (o) => (1 - o) * 10);

  // Skip: go straight to the section after the projects.
  const skip = () => {
    const node = sectionRef.current;
    if (!node) return;
    const end = node.getBoundingClientRect().bottom + window.scrollY;
    window.scrollTo({ top: end, behavior: "smooth" });
  };

  const close = useCallback(() => setOpened(null), []);
  const item = shelfItems[current];
  const last = current === TOTAL - 1;
  // One screen for the stage, plus the scroll that moves through the files.
  // Before the browser has measured, fall back to CSS screen units.
  const screenHeight = screen.height ? `${screen.height}px` : "100svh";
  const sectionHeight = `calc(${screenHeight} * ${1 + (TOTAL - 1) * SCREENS_PER_FILE})`;

  return (
    <MotionConfig reducedMotion="user">
      <section id="projects" className="scroll-mt-0 border-t border-foreground/15">
        <LayoutGroup id="project-files">
          <div ref={sectionRef} className="relative" style={{ height: sectionHeight }}>
            {/* The stage stays pinned to the screen while the page scrolls through the section */}
            <div className="sticky top-0 overflow-hidden" style={{ height: screenHeight }}>
              <div className="relative mx-auto flex h-full max-w-6xl flex-col px-6 pb-5 pt-20 sm:pt-24">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Project Files<span className="text-accent">.</span>
                  </h2>
                  <p className="mt-2 text-sm text-foreground/60 sm:text-base">
                    <span className="hidden sm:inline">Hover the file to peek inside, click to open it.</span>
                    <span className="sm:hidden">Tap a file to open it.</span>
                  </p>
                </div>

                {/* The files. Their size follows the space left on the screen (container units). */}
                <div className="relative min-h-0 flex-1" style={{ containerType: "size" }}>
                  {/* Soft light behind the file in front, like a spotlight on a desk */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(90vw,780px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent)_13%,transparent),transparent)]"
                  />
                  <div className="absolute inset-0 [--fw:min(62vw,calc(100cqh*0.9/1.32),360px)]">
                    {shelfItems.map((file, index) => (
                      <ShowcaseFile
                        key={file.id}
                        item={file}
                        index={index}
                        progress={progress}
                        front={index === current}
                        open={opened === index}
                        narrow={screen.narrow}
                        onOpen={setOpened}
                      />
                    ))}
                  </div>
                </div>

                {/* Name and summary of the file in front */}
                <div className="relative h-[4.75rem] text-center sm:h-[5.25rem]">
                  <motion.div style={{ opacity: nameOpacity, y: nameY }}>
                    <h3 className="font-clash text-2xl font-semibold tracking-tight sm:text-4xl">{item.title}</h3>
                    <p className="mx-auto mt-1 max-w-xl text-sm text-foreground/60 sm:text-base">{item.summary}</p>
                  </motion.div>
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
                    {last ? "Scroll to continue" : "Scroll to explore the files"}
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
