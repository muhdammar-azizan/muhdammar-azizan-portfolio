import { Braces, Database, Network, Plug, Sparkles, type LucideIcon } from "lucide-react";
import Section from "./Section";
import Reveal from "./Reveal";
import { skills } from "@/lib/site";
import { techIcon } from "@/lib/tech";

// Skills that have no brand logo get a small plain icon instead, so every chip looks the same.
const FALLBACK_ICONS: Record<string, LucideIcon> = {
  sql: Database,
  restapidesign: Braces,
  apiintegration: Plug,
  distributeddatabases: Network,
  aifundamentals: Sparkles,
};

const keyFor = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

// Brand colours that are almost black would vanish in dark mode, so they follow the text colour instead.
const isNearBlack = (hex: string) => {
  const value = parseInt(hex, 16);
  return ((value >> 16) & 255) + ((value >> 8) & 255) + (value & 255) < 150;
};

function SkillIcon({ name }: { name: string }) {
  const brand = techIcon(name);
  if (brand) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0" fill={isNearBlack(brand.hex) ? "currentColor" : `#${brand.hex}`}>
        <path d={brand.path} />
      </svg>
    );
  }
  const Icon = FALLBACK_ICONS[keyFor(name)];
  if (Icon) return <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-foreground/55" />;
  return <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />;
}

/**
 * Skills in one small panel: six short groups, each skill a chip with its logo.
 * Everything is visible at once; nothing is hidden behind a click.
 */
export default function Skills() {
  return (
    <Section id="skills" title="Skills">
      <div className="grid gap-x-12 gap-y-6 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5 sm:gap-y-8 sm:p-8 md:grid-cols-2">
        {skills.map((group, index) => (
          <Reveal key={group.group} delay={index * 0.07}>
            <h3 className="mb-3 font-hand text-lg font-bold text-foreground/60">{group.group}</h3>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-background px-3.5 py-1.5 text-sm font-medium text-foreground transition duration-200 hover:-translate-y-0.5 hover:border-foreground/35 hover:shadow-md"
                >
                  <SkillIcon name={item} />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
