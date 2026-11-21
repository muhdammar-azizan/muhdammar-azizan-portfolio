"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import GlyphWord from "./GlyphWord";
import { relieveWords } from "./relieveGlyphs";
import { siteConfig } from "@/lib/site";

gsap.registerPlugin(MorphSVGPlugin);

// Remembered for the rest of the browser tab, so the intro plays once per session.
export const INTRO_SEEN_KEY = "intro-seen";

// Which letter of "Portfolio" turns into which letter of "Hello".
// P→H, o→e, l→l, i→l, o→o. The other letters (r, t, f, o) fly away.
const MORPHS: [from: number, to: number][] = [
  [0, 0],
  [1, 1],
  [6, 2],
  [7, 3],
  [8, 4],
];

/**
 * Opening screen: a small "Ammar" over a large script "Portfolio".
 * The word then breaks apart; five letters reshape into "Hello" while flying
 * to the hero greeting, and the rest scatter away.
 */
export default function Intro() {
  const [active, setActive] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const finishRef = useRef<(() => void) | null>(null);
  const skipping = useRef(false);

  useEffect(() => {
    const html = document.documentElement;
    const root = rootRef.current;
    // The inline script in layout.tsx decides before the first paint whether the intro plays.
    if (html.dataset.intro !== "play" || !root) {
      setActive(false);
      return;
    }

    window.scrollTo(0, 0);

    const finish = () => {
      html.dataset.intro = "done";
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      } catch {
        // Storage can be blocked; the intro may then play again on reload.
      }
      setActive(false);
    };

    const backdrop = root.querySelector<HTMLElement>("[data-intro-backdrop]");
    const name = root.querySelector<HTMLElement>("[data-intro-name]");
    const word = root.querySelector<HTMLElement>("[data-intro-word]");
    const letters = Array.from(root.querySelectorAll<HTMLElement>("[data-intro-word] [data-glyph-index]"));
    const skip = root.querySelector<HTMLElement>("[data-intro-skip]");

    finishRef.current = finish;

    // Everything is created inside a GSAP context, so the cleanup can undo it completely.
    // (In development React runs this effect twice; without a full revert the second run
    // would start from the hidden state left by the first and nothing would show.)
    const ctx = gsap.context(() => {}, root);
    ctx.add(() => {
      const tl = gsap.timeline();
      timeline.current = tl;

      // 1. Entrance: the name fades in, then the letters rise one after another.
      tl.from(name, { y: 12, autoAlpha: 0, duration: 0.5, ease: "power2.out" })
        .from(letters, { y: 40, autoAlpha: 0, duration: 0.6, ease: "power3.out", stagger: 0.05 }, "-=0.25")
        // Skip is available right away.
        .from(skip, { autoAlpha: 0, duration: 0.3 }, 0)
        // 2. A short pause so the word can be read.
        .addLabel("break", "+=0.45");

      // The starting state is applied now, so the text can be shown without a frozen flash.
      html.dataset.introReady = "1";

      // 3. Break apart and reshape into "Hello". Target positions are measured at this moment,
      //    after the hero has finished its own entrance.
      tl.add(() => ctx.add(() => {
        const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-hello-word] [data-glyph-index]"));
        const heroVisible =
          targets.length === MORPHS.length &&
          targets.every((t) => {
            const r = t.getBoundingClientRect();
            return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
          });

        // The flight is its own timeline; the intro ends when it does.
        const flight = gsap.timeline({ onComplete: finish });
        tl.add(flight, tl.time());

        if (!heroVisible) {
          // The greeting is not on screen (for example a link straight to a section): just fade out.
          flight.to(root, { autoAlpha: 0, duration: 0.5, ease: "power1.out" });
          return;
        }

        const morphed = new Set<number>();
        MORPHS.forEach(([from, to], i) => {
          morphed.add(from);
          const source = letters[from];
          const target = targets[to];
          const s = source.getBoundingClientRect();
          const t = target.getBoundingClientRect();
          const path = source.querySelector("path");
          const toShape = relieveWords.Hello.letters[to].d;

          flight
            .to(
              source,
              {
                x: t.left - s.left,
                y: t.top - s.top,
                scale: t.height / s.height,
                transformOrigin: "0 0",
                duration: 1.15,
                ease: "power3.inOut",
              },
              i * 0.04,
            )
            .to(path, { morphSVG: { shape: toShape, shapeIndex: "auto" }, duration: 1.0, ease: "power2.inOut" }, 0.08 + i * 0.04);
        });

        // Letters that do not become part of "Hello" scatter and fade.
        letters.forEach((letter, index) => {
          if (morphed.has(index)) return;
          flight.to(
            letter,
            {
              x: gsap.utils.random(-260, 260),
              y: gsap.utils.random(-220, 160),
              rotate: gsap.utils.random(-50, 50),
              scale: 0.6,
              autoAlpha: 0,
              filter: "blur(6px)",
              duration: 0.8,
              ease: "power2.out",
            },
            0,
          );
        });

        flight
          .to([name, skip], { autoAlpha: 0, y: -10, duration: 0.4, ease: "power1.out" }, 0)
          // The page appears behind the flying letters.
          .to(backdrop, { autoAlpha: 0, duration: 0.7, ease: "power1.inOut" }, 0.35)
          // Land: hand over to the real hero greeting.
          .add(() => {
            html.dataset.intro = "landing";
          })
          .to(word, { autoAlpha: 0, duration: 0.15 });
      }), "break");
    });

    return () => {
      delete html.dataset.introReady;
      ctx.revert();
    };
  }, []);

  // Skip: stop the animation and fade the whole screen away.
  const skipIntro = () => {
    const root = rootRef.current;
    if (!root || skipping.current) return;
    skipping.current = true;
    timeline.current?.kill();
    gsap.to(root, { autoAlpha: 0, duration: 0.3, onComplete: () => finishRef.current?.() });
  };

  if (!active) return null;

  return (
    <div
      ref={rootRef}
      className="intro-overlay fixed inset-0 z-[100] flex cursor-pointer items-center justify-center"
      onClick={skipIntro}
      role="presentation"
    >
      <div data-intro-backdrop className="absolute inset-0 bg-background" />

      <div className="intro-content relative flex flex-col items-center px-6 text-foreground">
        <p data-intro-name className="font-clash text-base font-medium uppercase tracking-[0.35em] text-foreground/70 sm:text-lg">
          {siteConfig.name.split(" ")[1]}
        </p>
        <p data-intro-word className="mt-2 text-[min(22vw,240px)] leading-none text-accent">
          <span className="sr-only">Portfolio</span>
          <GlyphWord word="Portfolio" />
        </p>
      </div>

      <button
        type="button"
        data-intro-skip
        onClick={(event) => {
          event.stopPropagation();
          skipIntro();
        }}
        className="intro-content absolute bottom-6 right-6 rounded-full border border-foreground/20 px-4 py-1.5 text-sm text-foreground/70 transition hover:border-foreground/50 hover:text-foreground sm:bottom-8 sm:right-8"
      >
        Skip
      </button>
    </div>
  );
}
