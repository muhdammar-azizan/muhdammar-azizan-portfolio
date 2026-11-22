"use client";

import { MotionConfig, motion } from "framer-motion";
import Image from "next/image";
import Section from "./Section";
import Reveal from "./Reveal";
import ActivityTimeline from "./journey/ActivityTimeline";
import { journey, journeyIntro, type JourneyEntry } from "@/lib/site";

// Sticker colours and tilts, repeated down the list so no two neighbours look the same.
const TAG_COLORS = ["#fbe27a", "#c5e8a0", "#a6d8f2"];
const TAG_TILTS = [-2, 1.5, -1];
const CARD_TILTS = [-0.5, 0.45, -0.35];

// The vertical line and its dots sit in the same spot on every entry (px from the left edge of the entry).
const RAIL = "left-[30px] lg:left-[232px]";
const NODE_SIZE = 60;
const NODE_TOP = 14;
const NODE_CENTER = NODE_TOP + NODE_SIZE / 2;
// Space between two entries (gap-12 = 3rem = 48px). The line runs on to the centre of the next dot.
const ENTRY_GAP = 48;

/**
 * Career and education as a vertical timeline, newest first. Each entry is a paper card pinned
 * beside a dot on the line. The line is drawn as the page scrolls down.
 */
export default function Journey() {
  return (
    <MotionConfig reducedMotion="user">
      <Section id="journey" title="Journey">
        <Reveal>
          <p className="-mt-4 mb-14 max-w-2xl text-lg text-foreground/70">{journeyIntro}</p>
        </Reveal>

        <ol className="flex flex-col" style={{ gap: ENTRY_GAP }}>
          {journey.map((entry, index) => (
            <Entry key={`${entry.title}-${entry.organisation}`} entry={entry} index={index} last={index === journey.length - 1} />
          ))}
        </ol>
      </Section>
    </MotionConfig>
  );
}

// Bracketed dates are placeholders: they get a dotted underline so they are easy to spot and replace.
function DatePart({ text }: { text: string }) {
  if (!text.startsWith("[")) return <>{text}</>;
  return (
    <span className="underline decoration-foreground/40 decoration-dotted underline-offset-4" title="Placeholder: set the real date in site.ts">
      {text}
    </span>
  );
}

function Entry({ entry, index, last }: { entry: JourneyEntry; index: number; last: boolean }) {
  const current = entry.end === "Present";
  const tilt = CARD_TILTS[index % CARD_TILTS.length];
  const kindLabel = entry.kind === "experience" ? `Experience${entry.type ? ` · ${entry.type}` : ""}` : "Education";
  // Only shrink the trigger area at the top and bottom. A sideways margin would put dots that sit near the
  // left edge of a phone outside the trigger area, so they would never appear.
  const view = { once: true, margin: "-80px 0px -80px 0px" } as const;

  return (
    <li className="relative grid gap-4 pl-[76px] lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-x-16 lg:pl-0">
      {/* The line down to the next dot: a faint track, with the accent colour drawing over it */}
      <span
        aria-hidden="true"
        className={`absolute w-px -translate-x-1/2 bg-foreground/15 ${RAIL}`}
        style={{ top: NODE_CENTER, bottom: last ? 0 : -(ENTRY_GAP + NODE_CENTER) }}
      />
      {/* The wrapper never changes size, so it is always seen by the scroll trigger; only the inner bar grows */}
      <motion.span
        aria-hidden="true"
        className={`absolute w-[2px] -translate-x-1/2 ${RAIL}`}
        style={{ top: NODE_CENTER, bottom: last ? 0 : -(ENTRY_GAP + NODE_CENTER) }}
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: "-25% 0px -25% 0px" }}
      >
        <motion.span
          className="block h-full w-full origin-top bg-accent"
          variants={{ hidden: { scaleY: 0 }, shown: { scaleY: 1 } }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.35 }}
        />
      </motion.span>
      {/* Small ring where the line ends, at the very start of the path */}
      {last && (
        <span
          aria-hidden="true"
          className={`absolute bottom-0 h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-foreground/30 bg-background ${RAIL}`}
        />
      )}

      {/* The logo of the place, on a small sheet of paper nailed to the line; the current one pulses */}
      <motion.span
        className={`absolute z-10 -translate-x-1/2 ${RAIL}`}
        style={{ top: NODE_TOP, width: NODE_SIZE, height: NODE_SIZE }}
        initial="hidden"
        whileInView="shown"
        viewport={view}
      >
        <motion.span
          className="relative block h-full w-full"
          variants={{ hidden: { scale: 0, rotate: -20 }, shown: { scale: 1, rotate: index % 2 ? 4 : -4 } }}
          transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.1 }}
        >
          {/* The current place gets a calm, still accent ring instead of a blinking one */}
          {current && <span aria-hidden="true" className="absolute -inset-1 rounded-md ring-2 ring-accent/50" />}
          <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[3px] bg-[#fdfbf4] p-2 text-[#1f2a44] shadow-[0_6px_10px_-3px_rgba(40,25,10,0.45)] ring-1 ring-black/10">
            <span aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply" />
            {entry.logo ? (
              <Image src={entry.logo} alt={`${entry.organisation} logo`} width={48} height={48} className="relative h-full w-full object-contain" />
            ) : (
              <span aria-hidden="true" className="relative font-clash text-[13px] font-semibold leading-none tracking-tight">
                {entry.mark}
              </span>
            )}
          </span>
          {/* The nail */}
          <span
            aria-hidden="true"
            className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 30%, #ffffffcc 0 15%, #9aa0a8 45%, #4a4f57 100%)",
              boxShadow: "0 2px 3px rgba(0,0,0,0.45)",
            }}
          />
        </motion.span>
      </motion.span>

      {/* Dates and kind of entry (above the card on small screens, to the left of the line on large ones) */}
      <div className="lg:pr-12 lg:pt-[26px] lg:text-right">
        <p className="font-hand text-xl font-bold leading-snug text-foreground">
          <DatePart text={entry.start} /> to <DatePart text={entry.end} />
        </p>
        <p className="mt-0.5 text-sm text-foreground/60">{kindLabel}</p>
        {current && (
          /* A quiet text label with a short rule, no pill, dot or animation. */
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-accent">
            <span aria-hidden="true" className="h-px w-5 bg-accent" />
            Current
          </p>
        )}
      </div>

      {/* The paper card */}
      <motion.article
        className="relative rounded-[3px] bg-[#fdfbf4] p-6 text-[#2a2f3a] shadow-[0_18px_40px_-18px_rgba(40,25,10,0.45)] sm:p-8"
        initial={{ opacity: 0, y: 36, rotate: tilt * 3 }}
        whileInView={{ opacity: 1, y: 0, rotate: tilt }}
        whileHover={{ y: -4, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 22 } }}
        viewport={view}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      >
        {/* Tape, on alternating corners */}
        <span
          aria-hidden="true"
          className={`absolute -top-3 z-10 h-6 w-20 bg-[#f3ecd2]/85 shadow-sm ${
            index % 2 ? "right-8 rotate-[5deg]" : "left-8 -rotate-6"
          }`}
        />
        <span aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 opacity-35 mix-blend-multiply" />

        <h3 className="relative font-clash text-2xl font-semibold leading-tight text-[#1f2a44] sm:text-[1.7rem]">{entry.title}</h3>
        <p className="relative mt-1.5 text-base font-medium text-[#0f6b64]">{entry.organisation}</p>
        <p className="relative mt-4 text-[15.5px] leading-[1.75] text-[#2a2f3a]/85 sm:text-base">{entry.story}</p>

        <ul className="relative mt-5 flex flex-wrap gap-2.5">
          {entry.highlights.map((tag, i) => (
            <motion.li
              key={tag}
              className="paper-grain rounded-[2px] px-3 py-1.5 font-hand text-[15px] font-bold text-[#3a3122] shadow-[0_2px_4px_-1px_rgba(40,25,10,0.35)]"
              style={{ backgroundColor: TAG_COLORS[i % TAG_COLORS.length] }}
              initial={{ opacity: 0, scale: 0.6, rotate: TAG_TILTS[i % TAG_TILTS.length] * 3 }}
              whileInView={{ opacity: 1, scale: 1, rotate: TAG_TILTS[i % TAG_TILTS.length] }}
              viewport={view}
              transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.45 + i * 0.12 }}
            >
              {tag}
            </motion.li>
          ))}
        </ul>

        {entry.activities && entry.activities.length > 0 && <ActivityTimeline activities={entry.activities} />}
      </motion.article>
    </li>
  );
}
