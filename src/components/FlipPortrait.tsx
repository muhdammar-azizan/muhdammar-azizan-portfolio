"use client";

import Image from "next/image";
import { useState, type PointerEvent } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { Sparkles } from "lucide-react";

const NEON = "#DBFF00";
const SPARK_COLORS = [NEON, "#A3E635", "#FACC15", "#FFFFFF"];
const SPARK_COUNT = 18;
// Maximum tilt (degrees) when the mouse moves over the photo.
const MAX_TILT = 12;

type Spark = { id: number; x: number; y: number; size: number; color: string; delay: number };

type FlipPortraitProps = {
  front: string;
  back: string;
  name: string;
  width: number;
  height: number;
};

/**
 * Polaroid that tilts with the mouse and flips in 3D when clicked,
 * swapping the real photo for the memoji with a glare sweep and a spark burst.
 */
export default function FlipPortrait({ front, back, name, width, height }: FlipPortraitProps) {
  const [flipped, setFlipped] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const reduceMotion = useReducedMotion();
  // Lifts the card toward the viewer while it flips.
  const lift = useAnimationControls();

  // Mouse tilt, smoothed with a spring.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 150, damping: 15 });
  const rotateY = useSpring(tiltY, { stiffness: 150, damping: 15 });

  const handleMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse" || reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(-py * MAX_TILT * 2);
    tiltY.set(px * MAX_TILT * 2);
  };

  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const handleClick = () => {
    setFlipped((value) => !value);
    setFlipCount((count) => count + 1);
    if (reduceMotion) return;

    lift.start({
      scale: [1, 1.08, 1],
      z: [0, 80, 0],
      transition: { duration: 0.8, ease: "easeInOut" },
    });

    // Sparks fly out in a ring from the center of the photo.
    const burst = Date.now();
    setSparks(
      Array.from({ length: SPARK_COUNT }, (_, i) => {
        const angle = (i / SPARK_COUNT) * Math.PI * 2 + Math.random() * 0.4;
        const distance = 220 + Math.random() * 180;
        return {
          id: burst + i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: 4 + Math.random() * 8,
          color: SPARK_COLORS[i % SPARK_COLORS.length],
          delay: Math.random() * 0.15,
        };
      }),
    );
  };

  const flipTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 60, damping: 11, mass: 1 };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative" style={{ perspective: 1400 }}>
        {/* Spark burst in front of the photo */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <AnimatePresence>
            {sparks.map((spark) => (
              <motion.span
                key={spark.id}
                className="absolute rounded-full"
                style={{
                  width: spark.size,
                  height: spark.size,
                  backgroundColor: spark.color,
                  boxShadow: `0 0 12px ${spark.color}`,
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{ x: spark.x, y: spark.y, scale: [0, 1.4, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 0.9, delay: spark.delay, ease: "easeOut" }}
                onAnimationComplete={() =>
                  setSparks((list) => list.filter((item) => item.id !== spark.id))
                }
              />
            ))}
          </AnimatePresence>
        </div>

        <motion.button
          type="button"
          onClick={handleClick}
          onPointerMove={handleMove}
          onPointerLeave={resetTilt}
          aria-pressed={flipped}
          aria-label={flipped ? `Show photo of ${name}` : `Show memoji of ${name}`}
          className="relative block cursor-pointer rounded-sm outline-none focus-visible:ring-4 focus-visible:ring-accent/60"
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          whileHover={reduceMotion ? undefined : { scale: 1.03 }}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        >
          {/* The card that flips */}
          <motion.div
            className="relative"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={flipTransition}
          >
            {/* Lift and grow slightly during each flip */}
            <motion.div animate={lift} style={{ transformStyle: "preserve-3d" }}>
              <Face src={front} alt={`Photo of ${name}`} width={width} height={height} glareKey={flipCount} priority />
              <Face
                src={back}
                alt={`Memoji of ${name}`}
                width={width}
                height={height}
                glareKey={flipCount}
                back
              />
            </motion.div>
          </motion.div>
        </motion.button>
      </div>

      {/* Hint below the photo */}
      <p className="inline-flex items-center gap-2 text-sm text-foreground/60 lg:text-[max(0.875rem,0.9vw)]">
        <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
        {flipped ? "Click to see the real me" : "Click the photo to meet my memoji"}
      </p>
    </div>
  );
}

type FaceProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  glareKey: number;
  back?: boolean;
  priority?: boolean;
};

// One side of the polaroid. The back side is pre-rotated so it faces forward after the flip.
function Face({ src, alt, width, height, glareKey, back, priority }: FaceProps) {
  return (
    <div
      className={`overflow-hidden rounded-sm shadow-2xl shadow-black/30 ${back ? "absolute inset-0" : "relative"}`}
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes="(min-width: 1024px) 45vw, 80vw"
        className="h-auto max-h-[75vh] w-auto max-w-full"
      />
      {/* Light glare that sweeps across the photo on every flip */}
      {glareKey > 0 && (
        <motion.span
          key={glareKey}
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/70 to-transparent"
          initial={{ x: "0%" }}
          animate={{ x: "400%" }}
          transition={{ duration: 0.9, delay: 0.15, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
