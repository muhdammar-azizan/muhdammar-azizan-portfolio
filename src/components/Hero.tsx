"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import SocialLinks from "./SocialLinks";
import { siteConfig } from "@/lib/site";

export default function Hero() {
  return (
    <section
      id="top"
      className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 pt-16"
    >
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 font-mono text-sm text-accent"
      >
        Hi, my name is
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
      >
        {siteConfig.name}.
      </motion.h1>
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-3 text-2xl font-semibold text-foreground/60 sm:text-4xl"
      >
        {siteConfig.tagline}
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="mt-10 flex flex-wrap items-center gap-4"
      >
        <a
          href="#projects"
          className="rounded-full bg-accent px-6 py-3 font-medium text-black transition hover:opacity-90"
        >
          View my work
        </a>
        <a
          href="#contact"
          className="rounded-full border border-white/20 px-6 py-3 font-medium transition hover:border-accent hover:text-accent"
        >
          Contact me
        </a>
        {siteConfig.resumeUrl && (
          <a
            href={siteConfig.resumeUrl}
            download
            className="inline-flex items-center gap-2 px-2 py-3 text-foreground/70 transition hover:text-accent"
          >
            <Download className="h-4 w-4" /> Resume
          </a>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-12"
      >
        <SocialLinks />
      </motion.div>
    </section>
  );
}
