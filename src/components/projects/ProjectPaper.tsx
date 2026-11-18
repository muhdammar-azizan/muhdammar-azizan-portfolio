"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, CodeXml, Mail, X } from "lucide-react";
import { siteConfig, type ProjectPage, type ShelfItem } from "@/lib/site";
import { paperLayoutId } from "./ProjectFolder";

const EASE = [0.32, 0.72, 0, 1] as const;
// Slower, softer curve for the paper leaving and entering the file.
const LIFT_EASE = [0.45, 0, 0.2, 1] as const;

// Turning a page: going forward lifts the top sheet off to the left,
// going back lays the previous sheet down again from the left.
const sheetVariants: Variants = {
  enter: (dir: number) =>
    dir > 0
      ? { x: 0, rotate: 0, scale: 0.98, opacity: 0.5, zIndex: 1 }
      : { x: "-70%", y: -10, rotate: -7, opacity: 0, zIndex: 3 },
  center: { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 2 },
  exit: (dir: number) =>
    dir > 0
      ? { x: "-70%", y: -10, rotate: -7, opacity: 0, zIndex: 3 }
      : { scale: 0.98, opacity: 0, zIndex: 1 },
};

type ProjectPaperProps = {
  project: ShelfItem;
  onClose: () => void;
};

/**
 * The paper taken out of a file on the shelf, shown in the middle of the screen.
 * Pages are turned with the arrows, by clicking the paper edges, or with the arrow keys.
 */
export default function ProjectPaper({ project, onClose }: ProjectPaperProps) {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const total = project.pages.length;

  const turn = useCallback(
    (step: number) =>
      setPage((current) => {
        const next = current[0] + step;
        return next < 0 || next >= total ? current : [next, step];
      }),
    [total],
  );

  // Keyboard: Esc closes, arrow keys turn pages.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") turn(1);
      if (event.key === "ArrowLeft") turn(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, turn]);

  // Stop the page behind from scrolling while the paper is open.
  useEffect(() => {
    const html = document.documentElement;
    const scrollbar = window.innerWidth - html.clientWidth;
    const previous = { overflow: html.style.overflow, padding: document.body.style.paddingRight };
    html.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      html.style.overflow = previous.overflow;
      document.body.style.paddingRight = previous.padding;
    };
  }, []);

  const hasPrev = page > 0;
  const hasNext = page < total - 1;
  const sheetsBelow = total - page - 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={project.reserved ? "Reserved file: contact details" : `${project.title} project file`}
    >
      {/* Dim backdrop; clicking it puts the paper back */}
      <motion.div
        className="absolute inset-0 bg-black/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={onClose}
      />

      {/* Width is limited by both the screen width and height, so the paper and controls always fit */}
      <div className="relative w-[min(92vw,calc((100dvh_-_190px)*0.75))] sm:w-[min(92vw,960px,calc((100dvh_-_170px)*1.3))]">
        {/* The paper itself. It grows out of the file thanks to the shared layoutId. */}
        <motion.div
          layoutId={paperLayoutId(project)}
          className="relative aspect-[3/4] sm:aspect-[13/10]"
          transition={{ duration: 0.7, ease: LIFT_EASE }}
        >
          {/* Edges of the remaining sheets underneath */}
          {sheetsBelow > 1 && (
            <div className="notebook absolute inset-0 translate-x-[10px] translate-y-[9px] rotate-[0.8deg] rounded-[2px] shadow-md" />
          )}
          {sheetsBelow > 0 && (
            <div className="notebook absolute inset-0 translate-x-[5px] translate-y-[5px] -rotate-[0.4deg] rounded-[2px] shadow-md" />
          )}

          <AnimatePresence initial={false} custom={direction}>
            <motion.article
              key={page}
              custom={direction}
              variants={sheetVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: EASE }}
              className="notebook absolute inset-0 overflow-hidden rounded-[2px] shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
            >
              {/* Content fades in after the paper has grown, so it does not stretch */}
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <PageContent page={project.pages[page]} />
              </motion.div>

              {/* Punched holes along the margin */}
              {["top-[14%]", "top-1/2 -translate-y-1/2", "bottom-[14%]"].map((position) => (
                <span
                  key={position}
                  aria-hidden="true"
                  className={`absolute left-[calc(var(--margin)/2_-_8px)] h-4 w-4 rounded-full bg-black/45 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] ${position}`}
                />
              ))}

              <span aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 opacity-35 mix-blend-multiply" />

              {/* Handwritten page number, centered so it never meets the folded corner */}
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-hand text-sm text-[#2a2f3a]/60">
                {page + 1} / {total}
              </span>
            </motion.article>
          </AnimatePresence>

          {/* Click the left or right edge of the paper to turn pages */}
          {hasPrev && (
            <button
              type="button"
              onClick={() => turn(-1)}
              aria-label="Previous page"
              className="group absolute inset-y-0 left-0 z-10 flex w-[12%] items-center justify-start pl-2 outline-none"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-[#2a2f3a] opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                <ChevronLeft className="h-5 w-5" />
              </span>
            </button>
          )}
          {hasNext && (
            <button
              type="button"
              onClick={() => turn(1)}
              aria-label="Next page"
              className="group absolute inset-y-0 right-0 z-10 flex w-[12%] items-center justify-end pr-2 outline-none"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-[#2a2f3a] opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                <ChevronRight className="h-5 w-5" />
              </span>
              {/* Folded page corner, a hint that the page can be turned */}
              <span
                aria-hidden="true"
                className="absolute bottom-0 right-0 h-7 w-7 origin-bottom-right bg-[linear-gradient(315deg,transparent_50%,#e7dfca_50%)] shadow-[-2px_-2px_4px_rgba(0,0,0,0.12)] transition-transform duration-300 group-hover:scale-150"
              />
            </button>
          )}

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close and put the paper back"
            className="absolute -right-3 -top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg transition hover:scale-105 focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Controls under the paper */}
        <motion.div
          className="mt-6 flex flex-wrap items-center justify-between gap-4 text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="h-6 w-6 shrink-0 -rotate-3 rounded-[1px] shadow"
              style={{ backgroundColor: project.noteColor }}
            />
            <div className="min-w-0">
              <p className="font-hand text-2xl font-bold leading-tight">{project.title}</p>
              <p className="hidden truncate text-sm text-white/70 sm:block">{project.summary}</p>
            </div>
          </div>

          <div className={`flex items-center gap-2 ${total < 2 ? "invisible" : ""}`}>
            <button
              type="button"
              onClick={() => turn(-1)}
              disabled={!hasPrev}
              aria-label="Previous page"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 transition hover:border-white disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-14 text-center font-hand text-lg">
              {page + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => turn(1)}
              disabled={!hasNext}
              aria-label="Next page"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 transition hover:border-white disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Visit website <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
            {project.reserved && (
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
              >
                <Mail className="h-4 w-4" /> Email me
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold transition hover:border-white"
              >
                <CodeXml className="h-4 w-4" /> Code
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// What is written or printed on one sheet.
function PageContent({ page }: { page: ProjectPage }) {
  if (page.kind === "screenshot") {
    return (
      <div className="absolute inset-0 flex flex-col justify-center gap-4 py-[var(--top)] pl-[calc(var(--margin)_+_16px)] pr-5 sm:pr-10">
        <div className="relative">
          {/* Two pieces of tape holding the printed screenshot */}
          <span aria-hidden="true" className="absolute -top-3 left-6 z-10 h-6 w-20 -rotate-6 bg-[#f3ecd2]/80 shadow-sm" />
          <span aria-hidden="true" className="absolute -top-3 right-6 z-10 h-6 w-20 rotate-[5deg] bg-[#f3ecd2]/80 shadow-sm" />
          <div className="relative aspect-[16/10] w-full overflow-hidden border border-black/10 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
            <Image src={page.src} alt={page.caption} fill sizes="(min-width: 1024px) 860px, 85vw" className="object-cover object-top" />
          </div>
        </div>
        <p className="font-hand text-[length:calc(var(--line)*0.62)] leading-[var(--line)] text-[#2a2f3a]">{page.caption}</p>
      </div>
    );
  }

  if (page.kind === "contact") {
    return <ContactNote page={page} />;
  }

  return (
    // Its own lined background so the lines move with the text when long notes scroll.
    <div className="notebook absolute inset-0 overflow-y-auto pb-[var(--line)] pl-[calc(var(--margin)_+_16px)] pr-5 pt-[var(--top)] font-hand sm:pr-10">
      <h3 className="mb-[var(--line)] text-[length:calc(var(--line)*0.85)] font-bold leading-[var(--line)] text-[#1f2a44]">
        {page.heading}
      </h3>
      {page.paragraphs?.map((text) => (
        <p key={text} className="mb-[var(--line)] text-[length:calc(var(--line)*0.62)] leading-[var(--line)]">
          {text}
        </p>
      ))}
      {page.points && (
        <ul className="text-[length:calc(var(--line)*0.62)] leading-[var(--line)]">
          {page.points.map((point) => (
            <li key={point} className="flex gap-2">
              <span aria-hidden="true">–</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Every way to reach me, written as a handwritten list. Values come from siteConfig.contact.
const contactLines = () => {
  const { email, whatsapp, linkedin, instagram } = siteConfig.contact;
  const phone = `+${whatsapp}`;
  return [
    { label: "Email", value: email, href: `mailto:${email}` },
    { label: "WhatsApp", value: phone, href: `https://wa.me/${whatsapp}`, external: true },
    { label: "Phone", value: phone, href: `tel:${phone}` },
    { label: "LinkedIn", value: linkedin.replace(/^https?:\/\/(www\.)?/, ""), href: linkedin, external: true },
    { label: "Instagram", value: instagram.replace(/^https?:\/\/(www\.)?/, ""), href: instagram, external: true },
  ];
};

// Invitation written on the paper inside a reserved file.
function ContactNote({ page }: { page: Extract<ProjectPage, { kind: "contact" }> }) {
  return (
    <div className="notebook absolute inset-0 overflow-y-auto pb-[var(--line)] pl-[calc(var(--margin)_+_16px)] pr-5 pt-[var(--top)] font-hand sm:pr-10">
      <h3 className="mb-[var(--line)] text-[length:calc(var(--line)*0.85)] font-bold leading-[var(--line)] text-[#1f2a44]">
        {page.heading}
      </h3>
      {page.paragraphs?.map((text) => (
        <p key={text} className="mb-[var(--line)] text-[length:calc(var(--line)*0.62)] leading-[var(--line)]">
          {text}
        </p>
      ))}
      <ul className="text-[length:calc(var(--line)*0.62)] leading-[var(--line)]">
        {contactLines().map((line) => (
          <li key={line.label} className="flex flex-wrap gap-x-2">
            <span className="w-24 shrink-0 text-[#2a2f3a]/60 sm:w-28">{line.label}</span>
            <a
              href={line.href}
              target={line.external ? "_blank" : undefined}
              rel={line.external ? "noopener noreferrer" : undefined}
              className="min-w-0 break-all font-bold text-[#1f4fb8] underline decoration-[#1f4fb8]/40 decoration-wavy underline-offset-4 transition hover:decoration-[#1f4fb8]"
            >
              {line.value}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-[var(--line)] text-[length:calc(var(--line)*0.62)] leading-[var(--line)] text-[#2a2f3a]/70">
        – {siteConfig.name.split(" ")[1]}
      </p>
    </div>
  );
}
