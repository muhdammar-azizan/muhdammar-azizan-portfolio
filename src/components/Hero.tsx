"use client";

import { motion } from "framer-motion";
import FlipPortrait from "./FlipPortrait";
import { siteConfig } from "@/lib/site";

export default function Hero() {
  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      <h1 className="sr-only">{siteConfig.name}</h1>

      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 pb-12 pt-28 lg:grid-cols-2">
        {/* Left column is intentionally empty for now. */}
        <div />

        {/* Right column: photo that flips to the memoji when clicked */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center lg:justify-end"
        >
          <FlipPortrait
            front={siteConfig.heroImage}
            back={siteConfig.heroAvatar}
            name={siteConfig.name}
            width={800}
            height={1096}
          />
        </motion.div>
      </div>
    </section>
  );
}
