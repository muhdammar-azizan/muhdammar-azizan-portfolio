"use client";

import { useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig } from "framer-motion";
import Reveal from "./Reveal";
import ProjectFolder from "./projects/ProjectFolder";
import ProjectPaper from "./projects/ProjectPaper";
import { projects } from "@/lib/site";

/**
 * Projects shown as a row of manila files.
 * Hover (or first tap on phones) peeks inside a file; clicking opens its paper in the middle.
 */
export default function Projects() {
  const [peeked, setPeeked] = useState<number | null>(null);
  const [opened, setOpened] = useState<number | null>(null);
  const folderButtons = useRef<(HTMLButtonElement | null)[]>([]);

  const activate = (index: number, pointerType: string) => {
    // On touch screens the first tap only peeks, the second tap opens.
    if (pointerType === "touch" && peeked !== index) {
      setPeeked(index);
      return;
    }
    setPeeked(null);
    setOpened(index);
  };

  const close = () => {
    const index = opened;
    setOpened(null);
    // Give keyboard focus back to the file that was opened.
    if (index !== null) requestAnimationFrame(() => folderButtons.current[index]?.focus({ preventScroll: true }));
  };

  return (
    <MotionConfig reducedMotion="user">
      <section id="projects" className="scroll-mt-16 overflow-x-clip py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Projects<span className="text-accent">.</span>
            </h2>
            <p className="mt-3 text-foreground/60">
              <span className="hidden sm:inline">Hover a file to peek inside, click to open it.</span>
              <span className="sm:hidden">Tap a file to peek inside, tap again to open it.</span>
            </p>
          </Reveal>
        </div>

        <LayoutGroup id="project-files">
          <Reveal delay={0.1}>
            {/* Scrolls sideways on phones only. On larger screens nothing clips the files,
                so the paper stays visible while it flies back in. Top padding leaves room for peeking papers. */}
            <div className="overflow-x-auto pb-8 pt-20 [scrollbar-width:none] sm:overflow-visible [&::-webkit-scrollbar]:hidden">
              <div className="mx-auto flex w-max items-end px-6 [--fw:min(44vw,190px)] [--overlap:-0.1] sm:[--fw:clamp(180px,19vw,250px)] sm:[--overlap:-0.2]">
                {projects.map((project, index) => (
                  <ProjectFolder
                    key={project.title}
                    project={project}
                    index={index}
                    total={projects.length}
                    hovered={peeked === index && opened === null}
                    dimmed={(peeked !== null && peeked !== index) || (opened !== null && opened !== index)}
                    shift={opened === null || opened === index ? 0 : index < opened ? -1 : 1}
                    open={opened === index}
                    buttonRef={(el) => {
                      folderButtons.current[index] = el;
                    }}
                    onPeekStart={() => opened === null && setPeeked(index)}
                    onPeekEnd={() => setPeeked((current) => (current === index ? null : current))}
                    onActivate={(pointerType) => activate(index, pointerType)}
                  />
                ))}
              </div>
            </div>
          </Reveal>

          <AnimatePresence>
            {opened !== null && <ProjectPaper key={projects[opened].title} project={projects[opened]} onClose={close} />}
          </AnimatePresence>
        </LayoutGroup>
      </section>
    </MotionConfig>
  );
}
