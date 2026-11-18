"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/site";

export default function Hero() {
  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      <h1 className="sr-only">{siteConfig.name}</h1>

      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 pb-12 pt-28 lg:grid-cols-2">
        {/* Left column is intentionally empty for now. */}
        <div />

        {/* Right column: profile photo */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center lg:justify-end"
        >
          <Image
            src={siteConfig.heroImage}
            alt={`Portrait of ${siteConfig.name}`}
            width={800}
            height={1096}
            sizes="(min-width: 1024px) 420px, 80vw"
            priority
            className="h-auto max-h-[75vh] w-auto max-w-full rounded-sm shadow-2xl shadow-black/30"
          />
        </motion.div>
      </div>
    </section>
  );
}
