"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navItems, siteConfig } from "@/lib/site";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  // Link currently under the mouse (or keyboard focus), used for the glass hover pill.
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-foreground/10 bg-background/80 font-clash backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="text-xl font-semibold tracking-tight">
          {siteConfig.name.split(" ")[1]}
          <span className="text-accent">.</span>
        </a>

        {/* Desktop links. A glass pill slides to whichever link is hovered or focused. */}
        <ul
          className="hidden gap-1 text-base font-medium md:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {navItems.map((item) => (
            <li key={item.href} className="relative">
              {hovered === item.href && (
                <motion.span
                  layoutId="nav-glass"
                  aria-hidden="true"
                  className="nav-glass absolute inset-0 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <a
                href={item.href}
                onMouseEnter={() => setHovered(item.href)}
                onFocus={() => setHovered(item.href)}
                onBlur={() => setHovered(null)}
                className="relative block rounded-full px-4 py-2 text-foreground/70 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Resume button only appears once resumeUrl is set in site.ts */}
          {siteConfig.resumeUrl && (
            <a
              href={siteConfig.resumeUrl}
              download
              className="hidden rounded-full border border-accent px-4 py-1.5 text-sm text-accent transition hover:bg-accent hover:text-accent-contrast md:block"
            >
              Resume
            </a>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="border-t border-foreground/10 px-6 py-4 md:hidden">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="block py-2 text-foreground/80"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
