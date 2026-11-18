"use client";

import { useSyncExternalStore, type MouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

// Length of the circular theme reveal (ms).
const REVEAL_MS = 700;

// Watch the data-theme attribute so the icon always matches the real theme.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const getTheme = () => document.documentElement.dataset.theme ?? "light";
const getServerTheme = () => "light";

function applyTheme(next: string) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Storage can be blocked; the theme still changes for this visit.
  }
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  const isDark = theme === "dark";

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const next = isDark ? "light" : "dark";
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Older browsers or reduced motion: switch instantly.
    if (!("startViewTransition" in document) || reduceMotion) {
      applyTheme(next);
      return;
    }

    // The new theme grows as a circle from the center of this button.
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    // Turn off normal color transitions so the circle shows the final colors right away.
    root.classList.add("theme-switching");
    const transition = document.startViewTransition(() => applyTheme(next));

    transition.ready.then(() => {
      root.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
        },
        {
          duration: REVEAL_MS,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
    transition.finished.finally(() => root.classList.remove("theme-switching"));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-foreground/15 transition hover:border-accent hover:text-accent"
    >
      {/* Icon spins in and out when the theme changes */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ rotate: -90, scale: 0, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
