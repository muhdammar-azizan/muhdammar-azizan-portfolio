"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronDown, CodeXml } from "lucide-react";
import Reveal from "./Reveal";
import { projects } from "@/lib/site";

// Time each project stays in the center before the carousel moves on.
const AUTOPLAY_MS = 5000;

// Card width; the stage height follows it (16:10 cards).
const CARD_WIDTH = "min(82vw, 900px)";

// Distance from the active card, wrapped so the carousel loops both ways.
function offsetFrom(index: number, active: number, total: number) {
  let d = index - active;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  return d;
}

// Position of a card for a given distance from the center.
function cardPose(d: number) {
  if (d === 0) return { x: "0%", rotateY: 0, rotateZ: 0, scale: 1, opacity: 1, zIndex: 3 };
  const side = Math.sign(d);
  if (Math.abs(d) === 1) {
    return { x: `${side * 92}%`, rotateY: -side * 18, rotateZ: side * 2, scale: 0.72, opacity: 0.85, zIndex: 2 };
  }
  return { x: `${side * 150}%`, rotateY: -side * 25, rotateZ: side * 3, scale: 0.55, opacity: 0, zIndex: 1 };
}

export default function Projects() {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const total = projects.length;
  const project = projects[active];

  // Auto-rotate, paused while the visitor hovers the cards or reads the details.
  const paused = hovering || detailsOpen || !!reduceMotion;
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, total]);

  const goTo = (index: number) => {
    setActive(index);
    setDetailsOpen(false);
  };

  return (
    // overflow-clip (not hidden) so focusing an off-screen card cannot scroll the section sideways.
    <section id="projects" className="relative scroll-mt-16 overflow-clip py-24 text-white">
      {/* Background: blurred screenshot of the active project, tinted with its color */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#0d0d0d]">
        <AnimatePresence initial={false}>
          <motion.div
            key={project.image}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
          >
            <Image src={project.image} alt="" fill sizes="100vw" className="scale-110 object-cover opacity-50 blur-3xl" />
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse at 50% 35%, ${project.color}99, transparent 70%)` }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/45" />
      </div>

      <div className="relative">
        <Reveal className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-3xl font-bold tracking-tight sm:text-4xl">
            Projects<span style={{ color: project.color }}>.</span>
          </h2>
        </Reveal>

        {/* Carousel stage */}
        <div
          className="relative mx-auto"
          style={{ height: `calc(${CARD_WIDTH} * 0.625)`, perspective: 1600 }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {projects.map((item, index) => {
            const d = offsetFrom(index, active, total);
            const pose = cardPose(d);
            const isCenter = d === 0;
            const hidden = Math.abs(d) > 1;

            const content = (
              <Image
                src={item.image}
                alt={`Screenshot of ${item.title}`}
                fill
                sizes="(min-width: 1100px) 900px, 82vw"
                className="object-cover object-top"
              />
            );

            return (
              <motion.div
                key={item.title}
                className="absolute inset-y-0 left-0 right-0 mx-auto overflow-hidden rounded-xl shadow-2xl shadow-black/50"
                style={{ width: CARD_WIDTH, zIndex: pose.zIndex, pointerEvents: hidden ? "none" : "auto" }}
                initial={false}
                animate={{ x: pose.x, rotateY: pose.rotateY, rotateZ: pose.rotateZ, scale: pose.scale, opacity: pose.opacity }}
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 18 }}
                whileHover={isCenter && !reduceMotion ? { scale: 1.02 } : undefined}
              >
                {isCenter ? (
                  // Center card opens the project website.
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${item.title} website`}
                    className="group block h-full w-full"
                  >
                    {content}
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium opacity-0 backdrop-blur transition group-hover:opacity-100">
                      Visit website <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ) : (
                  // Side cards move to the center when clicked.
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`Show ${item.title}`}
                    tabIndex={hidden ? -1 : 0}
                    className="block h-full w-full cursor-pointer"
                  >
                    {content}
                    <span className="absolute inset-0 bg-black/20" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Dots */}
        <div className="mt-8 flex justify-center gap-2">
          {projects.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to ${item.title}`}
              aria-current={index === active}
              className="h-2 rounded-full bg-white/40 transition-all hover:bg-white/70"
              style={{ width: index === active ? 28 : 8, backgroundColor: index === active ? "#fff" : undefined }}
            />
          ))}
        </div>

        {/* Text for the active project */}
        <div className="mx-auto mt-8 max-w-2xl px-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <h3 className="font-clash text-3xl font-semibold sm:text-4xl">{project.title}</h3>
              <p className="mt-3 text-lg text-white/75">{project.summary}</p>
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setDetailsOpen((open) => !open)}
            aria-expanded={detailsOpen}
            aria-controls="project-details"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium transition hover:border-white hover:bg-white hover:text-black"
          >
            {detailsOpen ? "Hide details" : "View details"}
            <motion.span animate={{ rotate: detailsOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </button>
        </div>

        {/* Details dropdown */}
        <AnimatePresence initial={false}>
          {detailsOpen && (
            <motion.div
              id="project-details"
              key={project.title}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mx-6 mt-8 grid gap-8 rounded-2xl sm:mx-auto sm:max-w-4xl border border-white/15 bg-black/30 p-6 text-left backdrop-blur sm:p-8 md:grid-cols-[2fr_1fr]">
                <div>
                  <p className="leading-relaxed text-white/80">{project.details}</p>
                  <ul className="mt-5 space-y-2">
                    {project.highlights.map((point) => (
                      <li key={point} className="flex gap-3 text-white/80">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-5 text-sm">
                  <div>
                    <p className="uppercase tracking-widest text-white/50">Role</p>
                    <p className="mt-1">{project.role}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-widest text-white/50">Year</p>
                    <p className="mt-1">{project.year}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-widest text-white/50">Tech</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <li key={tag} className="rounded-full border border-white/20 px-3 py-1 text-xs">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition hover:opacity-90"
                    >
                      Live site <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                    {project.repo && (
                      <a
                        href={project.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold transition hover:border-white"
                      >
                        <CodeXml className="h-3.5 w-3.5" /> Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
