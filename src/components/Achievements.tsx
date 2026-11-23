"use client";

import { useEffect, useRef } from "react";
import { MotionConfig, animate, motion, useInView } from "framer-motion";
import { Award, BadgeCheck, Rocket, Trophy, type LucideIcon } from "lucide-react";
import Section from "./Section";
import Reveal from "./Reveal";
import { achievements, achievementsIntro, type Achievement } from "@/lib/site";

const KIND_ICONS: Record<Achievement["kind"], LucideIcon> = {
  Competition: Trophy,
  Award: Award,
  Certificate: BadgeCheck,
  Programme: Rocket,
};

// Ink colour of the round rubber stamp for each tier.
const STAMP_INK: Record<Achievement["tier"], string> = {
  gold: "#a8740a",
  silver: "#55616b",
  bronze: "#9a4a22",
  merit: "#0f766e",
};

// Pin colours and card tilts repeat down the board so no two neighbours look the same.
const PIN_COLORS = ["#d94b4b", "#3f7fd9", "#e0a526", "#3aa66b"];
const TILTS = [-1.6, 1.2, -0.8, 1.8, -1.2, 0.9];

/**
 * Achievements as certificates pinned to a cork board. Each card drops in, then a rubber stamp
 * thumps onto it. A row of counters above the board counts up when it scrolls into view.
 */
export default function Achievements() {
  const competitions = achievements.filter((a) => a.kind === "Competition").length;
  const stats = [
    { label: "Achievements", value: achievements.length },
    { label: "Competitions", value: competitions },
    { label: "Awards and certificates", value: achievements.length - competitions },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <Section id="achievements" title="Achievements">
        <Reveal>
          <p className="-mt-4 mb-10 max-w-2xl text-lg text-foreground/70">{achievementsIntro}</p>
        </Reveal>

        <div className="mb-8 grid grid-cols-3 gap-3 sm:gap-6">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <Counter {...stat} />
            </Reveal>
          ))}
        </div>

        <div className="cork-frame">
          <div className="cork overflow-x-clip p-6 pt-10 sm:p-10 sm:pt-12">
            <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((item, index) => (
                <Card key={item.title} item={item} index={index} />
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </MotionConfig>
  );
}

// A number that counts up from zero the first time it is seen. It writes straight to the DOM, so nothing re-renders.
function Counter({ label, value }: { label: string; value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  useEffect(() => {
    const node = ref.current;
    if (!seen || !node) return;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => {
        node.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [seen, value]);

  return (
    <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] px-3 py-4 text-center sm:py-5">
      <span ref={ref} className="block font-clash text-4xl font-semibold text-accent sm:text-5xl">
        {value}
      </span>
      <span className="mt-1 block text-xs font-medium uppercase tracking-wider text-foreground/60 sm:text-sm">{label}</span>
    </div>
  );
}

function Card({ item, index }: { item: Achievement; index: number }) {
  const Icon = KIND_ICONS[item.kind];
  const tilt = TILTS[index % TILTS.length];
  const pin = PIN_COLORS[index % PIN_COLORS.length];
  const ink = STAMP_INK[item.tier];
  // Cards in the same row drop one after another.
  const delay = (index % 3) * 0.1;

  return (
    <motion.li
      className="relative"
      initial={{ opacity: 0, y: -36, rotate: tilt * 3 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.55, delay, ease: [0.34, 1.4, 0.64, 1] }}
    >
      <article
        className="pinned-card relative flex h-full flex-col rounded-sm bg-[#fdfbf4] p-5 pt-7 text-[#2a2f3a]"
        style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
      >
        <span aria-hidden="true" className="paper-grain pointer-events-none absolute inset-0 rounded-sm opacity-20" />

        {/* Push pin */}
        <span
          aria-hidden="true"
          className="absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, #ffffff99 0 12%, ${pin} 45%, #00000055 100%)`,
            boxShadow: "0 3px 4px rgba(0,0,0,0.4)",
          }}
        />

        <p className="relative flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#2a2f3a]/60">
          <Icon aria-hidden="true" className="h-4 w-4" />
          {item.kind}
          <span aria-hidden="true">·</span>
          {item.year}
        </p>

        <h3 className="relative mt-3 pr-16 font-hand text-xl font-bold leading-snug sm:text-2xl">{item.title}</h3>
        <p className="relative mt-1 text-sm font-medium text-[#2a2f3a]/70">{item.event}</p>
        <p className="relative mt-3 text-sm leading-relaxed text-[#2a2f3a]/85">{item.story}</p>

        {/* Rubber stamp: thumps down a moment after the card lands */}
        <motion.span
          aria-label={item.result}
          className="absolute -right-3 top-8 flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-double text-center font-hand text-sm font-bold uppercase leading-tight mix-blend-multiply"
          style={{ color: ink, borderColor: ink, rotate: -14 }}
          initial={{ opacity: 0, scale: 2.2 }}
          whileInView={{ opacity: 0.88, scale: 1 }}
          viewport={{ once: true, margin: "0px 0px -60px 0px" }}
          transition={{ duration: 0.25, delay: delay + 0.45, ease: [0.5, 0, 0.75, 0] }}
        >
          <span className="px-1.5">{item.result}</span>
        </motion.span>
      </article>
    </motion.li>
  );
}
