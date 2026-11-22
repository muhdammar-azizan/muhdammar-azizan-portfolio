"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon, RotateCcw } from "lucide-react";
import type { Activity } from "@/lib/site";

// Each sheet in a stack is tilted a little differently so the pile looks hand-placed.
const TILTS = [-2.5, 2, -1.5, 3, -3, 1.5];
// How far a sheet behind peeks out from under the one in front (px).
const PEEK = 7;
// Only this many sheets are drawn at once; the rest wait underneath.
const VISIBLE = 3;

/**
 * Short list of activities under a journey card. Each row has a brief description on the left
 * and, on the right, a stack of photo papers held by a paper clip. Click the top paper to pull it
 * out of the clip; it slides down and fades away, and the next one is revealed.
 */
export default function ActivityTimeline({ activities }: { activities: Activity[] }) {
  return (
    <div className="relative mt-8 border-t border-dashed border-[#2a2f3a]/25 pt-5">
      <p className="relative font-hand text-lg font-bold text-[#2a2f3a]/70">What I did there</p>

      <ol className="relative mt-4 ml-1.5 flex flex-col gap-10 border-l-2 border-[#2a2f3a]/15 pl-6 sm:pl-8">
        {activities.map((activity) => (
          <motion.li
            key={activity.title}
            className="relative grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,250px)] sm:gap-8"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -60px 0px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Small dot on the sub-timeline line */}
            <span
              aria-hidden="true"
              className="absolute top-1.5 -left-[33px] h-3 w-3 rounded-full border-2 border-[#fdfbf4] bg-[#0f6b64] sm:-left-[41px]"
            />
            <div>
              <p className="font-hand text-base font-bold text-[#0f6b64]">{activity.date}</p>
              <h4 className="mt-0.5 font-clash text-lg font-semibold leading-snug text-[#1f2a44]">{activity.title}</h4>
              <p className="mt-1.5 text-[15px] leading-relaxed text-[#2a2f3a]/80">{activity.detail}</p>
            </div>
            <PaperStack photos={activity.photos} />
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

function PaperStack({ photos }: { photos: Activity["photos"] }) {
  // How many papers have been pulled away from the top of the stack.
  const [pulled, setPulled] = useState(0);
  const left = photos.length - pulled;
  if (photos.length === 0) return null;

  return (
    <div className="w-full max-w-[250px] sm:justify-self-end">
      <div className="relative aspect-[4/3.4] w-full">
        {/* Empty state: the stack is gone, so offer to put it back */}
        {left === 0 && (
          <button
            type="button"
            onClick={() => setPulled(0)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-sm border-2 border-dashed border-[#2a2f3a]/25 font-hand text-base font-bold text-[#2a2f3a]/60 transition hover:border-[#0f6b64]/60 hover:text-[#0f6b64]"
          >
            <RotateCcw aria-hidden="true" className="h-5 w-5" />
            Put the papers back
          </button>
        )}

        <AnimatePresence initial={false}>
          {photos.map((photo, index) => {
            if (index < pulled) return null;
            const depth = index - pulled;
            if (depth >= VISIBLE) return null;
            const tilt = TILTS[index % TILTS.length];
            const top = depth === 0;
            return (
              <motion.button
                key={`${photo.caption}-${index}`}
                type="button"
                disabled={!top}
                aria-label={top ? `Pull out the paper: ${photo.caption}` : undefined}
                onClick={() => setPulled(index + 1)}
                className={`absolute inset-0 origin-top-right rounded-[3px] bg-[#fdfbf4] p-2 pb-1 text-left shadow-[0_6px_14px_-6px_rgba(40,25,10,0.55)] ring-1 ring-black/10 ${
                  top ? "cursor-pointer" : "pointer-events-none"
                }`}
                style={{ zIndex: VISIBLE - depth }}
                initial={false}
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
                    <Image src={photo.src} alt={photo.caption} fill sizes="250px" className="object-cover" />
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
          className="pointer-events-none absolute -top-3 right-3 z-10 h-14 w-6 drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]"
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

      <p className="mt-2 text-center text-xs text-[#2a2f3a]/55">
        {left > 0 ? `${left} of ${photos.length} · click the top paper to pull it out` : "All pulled out"}
      </p>
    </div>
  );
}
