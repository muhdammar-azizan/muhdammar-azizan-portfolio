"use client";

import { Fragment, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Section from "./Section";
import Reveal from "./Reveal";
import { siteConfig } from "@/lib/site";

// Tilt of each sticky note, and how far each one sits sideways on large screens, so they look stuck on by hand.
const NOTE_TILTS = [-3, 2.4, -1.6];
const NOTE_SHIFTS = ["lg:ml-0", "lg:ml-10", "lg:ml-3"];

// Splits "plain **marked** plain" into pieces. Marked pieces are drawn with the highlighter pen.
function splitMarked(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, index) => ({ part, marked: index % 2 === 1 }));
}

/**
 * The About text written on a sheet of lined notebook paper, with a few phrases
 * drawn over with a highlighter and short sticky notes stuck beside it.
 */
export default function About() {
  const paperRef = useRef<HTMLDivElement>(null);
  // The highlighter swipes start once the paper is on screen.
  const seen = useInView(paperRef, { once: true, margin: "0px 0px -20% 0px" });
  let markerIndex = 0;

  return (
    <Section id="about" title="About">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-0">
        {/* The paper */}
        <Reveal className="relative z-10">
          <div
            ref={paperRef}
            data-seen={seen}
            className="notebook relative -rotate-[0.6deg] rounded-[2px] pb-[var(--line)] pl-[calc(var(--margin)_+_18px)] pr-6 pt-[var(--top)] font-hand shadow-[0_22px_50px_-18px_rgba(40,25,10,0.45)] sm:pr-12"
          >
            {/* Tape holding the paper to the page */}
            <span aria-hidden="true" className="absolute -top-3 left-8 z-10 h-6 w-24 -rotate-6 bg-[#f3ecd2]/85 shadow-sm" />
            <span aria-hidden="true" className="absolute -top-3 right-10 z-10 h-6 w-20 rotate-[5deg] bg-[#f3ecd2]/85 shadow-sm" />

            {/* Punched holes along the margin */}
            {["top-[8%]", "top-1/2 -translate-y-1/2", "bottom-[8%]"].map((position) => (
              <span
                key={position}
                aria-hidden="true"
                className={`absolute left-[calc(var(--margin)/2_-_8px)] h-4 w-4 rounded-full bg-black/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] ${position}`}
              />
            ))}

            {/* Every line of text is exactly one ruled line tall, so it sits on the lines of the paper */}
            {siteConfig.bio.map((paragraph, index) => (
              <p
                key={index}
                className="mb-[var(--line)] text-[length:calc(var(--line)*0.64)] leading-[var(--line)] text-[#2a2f3a] last:mb-0"
              >
                {splitMarked(paragraph).map(({ part, marked }, i) => {
                  if (!marked) return <Fragment key={i}>{part}</Fragment>;
                  const order = markerIndex++;
                  return (
                    <mark key={i} className="marker" style={{ transitionDelay: `${0.45 + order * 0.4}s` }}>
                      {part}
                    </mark>
                  );
                })}
              </p>
            ))}

            <span aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 opacity-35 mix-blend-multiply" />
          </div>
        </Reveal>

        {/* Sticky notes stuck beside the paper (below it on small screens) */}
        <ul className="grid gap-5 sm:grid-cols-3 lg:z-20 lg:-ml-8 lg:mt-14 lg:grid-cols-1 lg:gap-7">
          {siteConfig.aboutNotes.map((note, index) => (
            <motion.li
              key={note.label}
              className={`paper-grain relative max-w-[17rem] rounded-[1px] px-5 pb-5 pt-6 shadow-[0_8px_16px_-6px_rgba(40,25,10,0.4)] ${NOTE_SHIFTS[index % NOTE_SHIFTS.length]}`}
              style={{ backgroundColor: note.color }}
              initial={{ opacity: 0, y: -26, rotate: NOTE_TILTS[index % NOTE_TILTS.length] * 3, scale: 1.08 }}
              whileInView={{ opacity: 1, y: 0, rotate: NOTE_TILTS[index % NOTE_TILTS.length], scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 160, damping: 13, delay: 0.5 + index * 0.18 }}
            >
              {/* Darker glue strip along the top, like a real sticky note */}
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-3 bg-black/[0.06]" />
              <p className="font-hand text-sm font-bold uppercase tracking-[0.18em] text-[#3a3122]/60">{note.label}</p>
              <p className="mt-1 font-hand text-xl leading-snug text-[#3a3122]">{note.text}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
