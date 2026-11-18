"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/site";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-end justify-center overflow-hidden"
    >
      {/* Big static script word behind the photo. Color follows the theme. */}
      <h1
        className="pointer-events-none absolute inset-x-0 top-[22%] select-none text-center font-script text-[26vw] leading-none text-hero-word sm:top-[18%] sm:text-[20vw]"
      >
        Portfolio
        <span className="sr-only"> of {siteConfig.name}</span>
      </h1>

      {/* Cut-out photo, anchored to the bottom and centered. */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex justify-center"
      >
        <Image
          src={siteConfig.heroImage}
          alt={`Portrait of ${siteConfig.name}`}
          width={760}
          height={1132}
          sizes="(min-width: 640px) 560px, 90vw"
          priority
          className="h-[80vh] w-auto max-w-[95vw] object-contain object-bottom"
        />
      </motion.div>
    </section>
  );
}
