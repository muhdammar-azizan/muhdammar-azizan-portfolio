import { useId } from "react";
import { techIcon } from "@/lib/tech";

// Graphite colour for the pencil outline.
const PENCIL = "#2f2a24";

// Brand colours that are near black would look like a plain pencil smudge,
// so they are coloured in with a softer dark grey.
const softenColour = (hex: string) => {
  const value = parseInt(hex, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return r + g + b < 90 ? "#4a4a4a" : `#${hex}`;
};

// Small stable number from a string, so every logo wobbles a little differently but the same on every visit.
const seedFrom = (text: string) => [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 97;

type SketchLogoProps = {
  name: string;
};

/**
 * A technology logo drawn as if sketched on paper: slightly wobbly edges,
 * coloured in with a grainy crayon texture, and a loose pencil outline.
 */
export default function SketchLogo({ name }: SketchLogoProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const icon = techIcon(name);
  const seed = seedFrom(name);

  return (
    <figure className="flex w-[calc(var(--line)*2.9)] flex-col items-center">
      <svg viewBox="-2 -2 28 28" className="h-[calc(var(--line)*1.9)] w-[calc(var(--line)*1.9)] overflow-visible" role="img" aria-label={`${name} logo`}>
        <defs>
          {/* Crayon fill: wobbly edges plus a grainy, uneven colour */}
          <filter id={`${id}-fill`} x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="2" seed={seed} result="wobble" />
            <feDisplacementMap in="SourceGraphic" in2="wobble" scale="1.4" xChannelSelector="R" yChannelSelector="G" result="shape" />
            <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="1" seed={seed + 7} result="noise" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.55" result="grain" />
            <feComposite in="shape" in2="grain" operator="in" />
          </filter>
          {/* Pencil line: a different wobble so it does not sit exactly on the colour */}
          <filter id={`${id}-line`} x="-15%" y="-15%" width="130%" height="130%">
            <feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="2" seed={seed + 3} result="wobble" />
            <feDisplacementMap in="SourceGraphic" in2="wobble" scale="1.1" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {icon ? (
          <>
            <path d={icon.path} fill={softenColour(icon.hex)} fillOpacity={1} filter={`url(#${id}-fill)`} />
            <path
              d={icon.path}
              fill="none"
              stroke={PENCIL}
              strokeOpacity={0.75}
              strokeWidth={0.45}
              strokeLinejoin="round"
              transform="translate(0.35 -0.3)"
              filter={`url(#${id}-line)`}
            />
          </>
        ) : (
          // No logo available: a hand-drawn star as a placeholder mark.
          <path
            d="M12 2.5l2.6 6.2 6.6.5-5 4.3 1.6 6.5L12 16.6 6.2 20l1.6-6.5-5-4.3 6.6-.5z"
            fill="#e2b04a"
            fillOpacity={0.6}
            stroke={PENCIL}
            strokeOpacity={0.75}
            strokeWidth={0.6}
            strokeLinejoin="round"
            filter={`url(#${id}-line)`}
          />
        )}
      </svg>
      <figcaption className="mt-1 text-center text-[length:calc(var(--line)*0.48)] leading-tight text-[#2a2f3a]/80">
        {name}
      </figcaption>
    </figure>
  );
}
