"use client";

import { motion } from "framer-motion";
import FlipPortrait from "./FlipPortrait";
import { siteConfig } from "@/lib/site";

// Each line of text fades up one after another.
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: "easeOut" as const },
});

export default function Hero() {
  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      {/* On laptops this matches the other sections (72rem wide).
          On larger screens the hero grows with the screen width. */}
      <div className="mx-auto grid min-h-screen max-w-[max(72rem,80vw)] items-center gap-12 px-6 pb-12 pt-28 lg:grid-cols-2 lg:gap-[max(3rem,4vw)]">
        {/* Left column: short introduction */}
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <motion.p
            {...fadeUp(0.1)}
            className="font-relieve text-5xl text-accent sm:text-6xl lg:text-[max(3.75rem,4.3vw)]"
          >
            Hello
          </motion.p>
          <motion.h1
            {...fadeUp(0.25)}
            className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[max(3.75rem,4.2vw)]"
          >
            I am {siteConfig.name}
          </motion.h1>
          <motion.p
            {...fadeUp(0.4)}
            className="mt-4 text-lg font-medium uppercase tracking-[0.25em] text-foreground/60 lg:text-[max(1.125rem,1.25vw)]"
          >
            {siteConfig.role}
          </motion.p>
          <motion.p
            {...fadeUp(0.55)}
            className="mx-auto mt-6 max-w-md text-lg text-foreground/70 lg:mx-0 lg:max-w-[max(28rem,30vw)] lg:text-[max(1.125rem,1.3vw)]"
          >
            {siteConfig.tagline}
          </motion.p>
        </div>

        {/* Right column: photo that flips to the memoji when clicked */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="order-1 flex justify-center lg:order-2 lg:justify-end"
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
