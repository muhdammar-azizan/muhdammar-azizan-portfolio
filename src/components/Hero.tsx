"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import SocialLinks from "./SocialLinks";
import { siteConfig } from "@/lib/site";

// Small helper so every hero element fades in one after another.
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-br from-[#060b1d] via-background to-[#101b3d]"
    >
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 pb-16 pt-28 lg:grid-cols-2">
        {/* Left column: text content */}
        <div className="order-2 lg:order-1">
          <motion.span
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm text-emerald-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Open to work
          </motion.span>

          <motion.p {...fadeUp(0.1)} className="mt-6 font-mono text-sm text-accent">
            Hi, my name is
          </motion.p>
          <motion.h1
            {...fadeUp(0.2)}
            className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            {siteConfig.name}
          </motion.h1>
          <motion.h2
            {...fadeUp(0.3)}
            className="mt-3 text-xl font-semibold text-accent sm:text-2xl"
          >
            {siteConfig.role}
          </motion.h2>
          <motion.p {...fadeUp(0.4)} className="mt-4 max-w-lg text-lg text-foreground/70">
            {siteConfig.tagline}
          </motion.p>

          <motion.div {...fadeUp(0.5)} className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="rounded-full bg-accent px-6 py-3 font-medium text-[#0a1128] transition hover:opacity-90"
            >
              View Projects
            </a>
            {/* The resume button only appears once resumeUrl is set in site.ts. */}
            {siteConfig.resumeUrl && (
              <a
                href={siteConfig.resumeUrl}
                download
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-medium transition hover:border-accent hover:text-accent"
              >
                <Download className="h-4 w-4" /> Download Resume
              </a>
            )}
          </motion.div>

          <motion.div {...fadeUp(0.6)} className="mt-10">
            <SocialLinks />
          </motion.div>
        </div>

        {/* Right column: profile photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="order-1 mx-auto w-full max-w-sm lg:order-2 lg:max-w-md"
        >
          <div className="relative">
            {/* Soft glow behind the photo */}
            <div className="absolute -inset-4 rounded-[2rem] bg-accent/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/15 shadow-2xl">
              <Image
                src={siteConfig.heroImage}
                alt={`Portrait of ${siteConfig.name}`}
                width={952}
                height={1272}
                sizes="(min-width: 1024px) 448px, (min-width: 640px) 384px, 90vw"
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
