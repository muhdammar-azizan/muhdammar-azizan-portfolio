"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import type { Activity } from "@/lib/site";

// Each sheet in a stack is tilted a little differently so the pile looks hand-placed.
const TILTS = [-2.5, 2, -1.5, 3, -3, 1.5];
const PAPER_TILTS = [-0.6, 0.5, -0.4];
// How far a sheet behind peeks out from under the one in front (px).
const PEEK = 7;
// Only this many sheets are drawn at once; the rest wait underneath.
const VISIBLE = 3;

/**
 * Short list of activities under a journey card. Every activity is its own paper and appears
 * one after another as the page is scrolled. Each paper has a brief description on the left and
 * a stack of photos held by a paper clip on the right.
 */
export default function ActivityTimeline({ activities }: { activities: Activity[] }) {
  return (
    <div>
      <p className="mb-5 font-hand text-xl font-bold text-foreground/70">What I did there</p>

      <ol className="ml-3 flex flex-col gap-9 border-l-2 border-dashed border-foreground/25 pl-6 sm:ml-5 sm:pl-9">
        {activities.map((activity, index) => {
          // Photos sit on the right for the first activity, then on the left, and so on.
          const flipped = index % 2 === 1;
          return (
            <motion.li
              key={activity.title}
              className="relative"
              // The paper unfolds from its left edge to the right, like a folded sheet being opened.
              style={{ transformPerspective: 1100, originX: 0 }}
              initial={{ opacity: 0, rotateY: -88, rotate: PAPER_TILTS[index % PAPER_TILTS.length] }}
              whileInView={{ opacity: 1, rotateY: 0, rotate: PAPER_TILTS[index % PAPER_TILTS.length] }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Dot on the dashed line */}
              <span
                aria-hidden="true"
                className="absolute top-7 -left-[33px] h-3 w-3 rounded-full border-2 border-background bg-accent sm:-left-[45px]"
              />
              <article
                className={`relative grid gap-5 rounded-[3px] bg-[#fdfbf4] p-5 text-[#2a2f3a] shadow-[0_14px_30px_-16px_rgba(40,25,10,0.5)] sm:gap-8 sm:p-6 ${
                  flipped ? "sm:grid-cols-[minmax(0,330px)_minmax(0,1fr)]" : "sm:grid-cols-[minmax(0,1fr)_minmax(0,330px)]"
                }`}
              >
                <span aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply" />
                {/* Light creases, so the sheet looks lightly crumpled */}
                <span aria-hidden="true" className="paper-creases pointer-events-none absolute inset-0 rounded-[3px]" />
                {/* Shade on the folds that fades while the paper opens */}
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[3px] bg-gradient-to-r from-black/30 via-black/10 to-transparent"
                  initial={{ opacity: 1 }}
                  whileInView={{ opacity: 0 }}
                  viewport={{ once: true, margin: "0px 0px -80px 0px" }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
                {/* Small piece of tape */}
                <span
                  aria-hidden="true"
                  className={`absolute -top-2.5 h-5 w-16 bg-[#f3ecd2]/85 shadow-sm ${index % 2 ? "left-6 rotate-[4deg]" : "left-8 -rotate-3"}`}
                />
                <div className="relative">
                  <p className="font-hand text-base font-bold text-[#0f6b64]">{activity.date}</p>
                  <h4 className="mt-0.5 font-clash text-lg font-semibold leading-snug text-[#1f2a44]">{activity.title}</h4>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[#2a2f3a]/80">{activity.detail}</p>
                </div>
                <PaperStack photos={activity.photos} flipped={flipped} />
              </article>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

type Sheet = { id: number; photo: Activity["photos"][number] };

function PaperStack({ photos, flipped }: { photos: Activity["photos"]; flipped: boolean }) {
  // The stack is a queue: the front sheet is pulled out and a copy goes to the back, so it never runs out.
  const nextId = useRef(photos.length);
  const [sheets, setSheets] = useState<Sheet[]>(() => photos.map((photo, id) => ({ id, photo })));
  if (photos.length === 0) return null;
  const canFlip = sheets.length > 1;

  const pullTop = () => {
    setSheets(([front, ...rest]) => [...rest, { id: nextId.current++, photo: front.photo }]);
  };

  return (
    <div className={`relative w-full max-w-[330px] ${flipped ? "sm:order-first sm:justify-self-start" : "sm:justify-self-end"}`}>
      <div className="relative aspect-[4/3.4] w-full">
        <AnimatePresence initial={false}>
          {sheets.slice(0, VISIBLE).map(({ id, photo }, depth) => {
            const tilt = TILTS[id % TILTS.length];
            const top = depth === 0 && canFlip;
            return (
              <motion.button
                key={id}
                type="button"
                disabled={!top}
                aria-label={top ? `Pull out this paper to see the next photo: ${photo.caption}` : undefined}
                onClick={pullTop}
                className={`absolute inset-0 origin-top-right rounded-[3px] bg-[#fdfbf4] p-2 pb-1 text-left shadow-[0_6px_14px_-6px_rgba(40,25,10,0.55)] ring-1 ring-black/10 ${
                  top ? "cursor-pointer" : "pointer-events-none"
                }`}
                style={{ zIndex: VISIBLE - depth }}
                // A sheet that joins the back of the stack fades in there.
                initial={{ x: -depth * PEEK, y: depth * PEEK, rotate: tilt, opacity: 0, scale: 1 }}
                animate={{ x: -depth * PEEK, y: depth * PEEK, rotate: tilt, opacity: 1, scale: 1 }}
                whileHover={top ? { y: 4, rotate: tilt * 0.4 } : undefined}
                // Pulled out of the clip, then down and away.
                exit={{
                  x: [0, -6, -14, -26],
                  y: [0, -16, 60, 170],
                  rotate: [tilt, tilt - 2, tilt - 7, tilt - 12],
                  opacity: [1, 1, 0.85, 0],
                  transition: { duration: 0.95, times: [0, 0.22, 0.6, 1], ease: "easeInOut" },
                }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              >
                <span aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 rounded-[3px] opacity-25 mix-blend-multiply" />
                <span className="relative block h-[calc(100%-1.75rem)] overflow-hidden rounded-[2px] bg-[#e6dfcf]">
                  {photo.src ? (
                    <Image src={photo.src} alt={photo.caption} fill sizes="330px" className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-[#ece5d4] to-[#d8cfb8] text-[#2a2f3a]/45">
                      <ImageIcon aria-hidden="true" className="h-7 w-7" />
                      <span className="text-xs font-medium">Photo goes here</span>
                    </span>
                  )}
                </span>
                <span className="relative mt-0.5 block truncate text-center font-hand text-sm font-bold text-[#2a2f3a]/75">{photo.caption}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* The paper clip holds the whole stack at the top right corner */}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 56"
          className="pointer-events-none absolute -top-3 right-3 h-14 w-6 drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]"
          style={{ zIndex: VISIBLE + 2 }}
        >
          <path
            d="M7 20 V8 a5 5 0 0 1 10 0 V44 a8 8 0 0 1 -16 0 V14"
            transform="translate(3 3)"
            fill="none"
            stroke="#8d9198"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {canFlip && <p className="mt-2 text-center text-xs text-[#2a2f3a]/55">Click the top paper for the next photo</p>}
    </div>
  );
}
