"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { Database, Network, Sparkles, type LucideIcon } from "lucide-react";
import Reveal from "./Reveal";
import { skills } from "@/lib/site";
import { techIcon } from "@/lib/tech";

// Skills that have no brand logo get a small plain icon instead, so every chip looks the same.
const FALLBACK_ICONS: Record<string, LucideIcon> = {
  sql: Database,
  distributeddatabases: Network,
  aifundamentals: Sparkles,
};

const keyFor = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

// Brand colours that are almost black would vanish in dark mode, so they follow the text colour instead.
const isNearBlack = (hex: string) => {
  const value = parseInt(hex, 16);
  return ((value >> 16) & 255) + ((value >> 8) & 255) + (value & 255) < 150;
};

// Power BI is not in the logo library, so its three yellow bars are drawn here.
function PowerBiIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 shrink-0">
      <rect x="3" y="12" width="5" height="9" rx="1.2" fill="#E8B500" />
      <rect x="9.5" y="7" width="5" height="14" rx="1.2" fill="#F2C811" />
      <rect x="16" y="2" width="5" height="19" rx="1.2" fill="#F2C811" />
      <rect x="16" y="2" width="5" height="9" rx="1.2" fill="#C99700" opacity="0.55" />
    </svg>
  );
}

function SkillIcon({ name }: { name: string }) {
  if (keyFor(name) === "powerbi") return <PowerBiIcon />;
  const brand = techIcon(name);
  if (brand) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 shrink-0" fill={isNearBlack(brand.hex) ? "currentColor" : `#${brand.hex}`}>
        <path d={brand.path} />
      </svg>
    );
  }
  const Icon = FALLBACK_ICONS[keyFor(name)];
  if (Icon) return <Icon aria-hidden="true" className="h-6 w-6 shrink-0 text-foreground/55" />;
  return <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />;
}

// Hover colours, used one after another so neighbouring tiles differ.
const TILE_COLORS = ["#c8f23a", "#8f4cf0", "#b9a7ec"];

// Each row repeats its tiles three times (and the track holds two such sets, so even a 4K screen is always filled), so the loop never shows a gap.
function Tile({ name, index }: { name: string; index: number }) {
  return (
    <li className="skill-tile group relative shrink-0" style={{ "--tile": TILE_COLORS[index % TILE_COLORS.length] } as React.CSSProperties}>
      {/* The coloured side of the tile: it shows below and to the right when the tile lifts */}
      <span aria-hidden="true" className="skill-tile-side" />
      <span className="skill-tile-face flex h-[96px] items-center justify-center gap-4 border border-foreground bg-background px-9 text-[17px] font-medium whitespace-nowrap text-foreground">
        <SkillIcon name={name} />
        {name}
      </span>
    </li>
  );
}

function Row({ items, direction, live }: { items: string[]; direction: "right" | "left"; live: boolean }) {
  const repeated = [...items, ...items, ...items];
  return (
    <div className="marquee overflow-x-clip py-4 [&+&]:border-t [&+&]:border-foreground/15" data-live={live} data-direction={direction}>
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-4 pr-4">
            {repeated.map((name, index) => (
              <Tile key={`${name}-${index}`} name={name} index={index} />
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/**
 * Skills as two rows of tiles that slide in opposite directions: the top row moves left to right,
 * the bottom row right to left. Hovering a tile pauses its row and lifts the tile.
 */
export default function Skills() {
  const ref = useRef<HTMLDivElement>(null);
  // The rows only move while they are on screen, so they cost nothing the rest of the time.
  const live = useInView(ref, { margin: "100px 0px 100px 0px" });
  const middle = Math.ceil(skills.length / 2);

  return (
    // The section is as wide as the screen, so the rows run edge to edge on any monitor.
    // Only the heading is kept inside the usual page width.
    <section id="skills" className="scroll-mt-16 overflow-x-clip pt-24 pb-6">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
            Skills<span className="text-accent">.</span>
          </h2>
        </Reveal>
      </div>

      <Reveal>
        <div ref={ref} className="skill-rows flex flex-col border-t border-foreground/15">
          <Row items={skills.slice(0, middle)} direction="right" live={live} />
          <Row items={skills.slice(middle)} direction="left" live={live} />
        </div>
      </Reveal>
    </section>
  );
}
