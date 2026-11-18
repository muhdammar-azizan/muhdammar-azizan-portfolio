"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { navItems, siteConfig } from "@/lib/site";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="font-semibold tracking-tight">
          {siteConfig.name.split(" ")[1]}
          <span className="text-accent">.</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden gap-8 text-sm md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="text-foreground/70 transition hover:text-accent">
                {item.label}
              </a>
            </li>
          ))}
        </ul>

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
      </nav>

      {open && (
        <ul className="border-t border-white/10 px-6 py-4 md:hidden">
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
