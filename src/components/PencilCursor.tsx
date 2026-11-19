"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";

// Things the pencil reacts to when it moves over them.
const INTERACTIVE = 'a, button, [role="button"], summary, label[for]';
// Places where the normal system cursor is kept, so typing stays easy.
const TEXT_FIELD = 'input, textarea, select, [contenteditable="true"]';

// The pencil is drawn upright with its tip at the top. It is tilted so the tip points
// to the top-left like an arrow, and it is turned around the tip so the tip never moves.
const REST_TILT = -42;
const HOVER_TILT = -54;
const PRESS_TILT = -34;
const TIP_X = 6; // px from the left edge of the drawing to the tip

/**
 * Replaces the mouse pointer with a small pencil. The tip is the exact click point.
 * It leans and grows a little over links and buttons, and presses down while clicking.
 * Only used with a mouse, and not when the visitor asks for reduced motion.
 */
export default function PencilCursor() {
  const reduceMotion = useReducedMotion();
  const [hasMouse, setHasMouse] = useState(false);
  const [shown, setShown] = useState(false);
  const [overLink, setOverLink] = useState(false);
  const [overField, setOverField] = useState(false);
  const [pressed, setPressed] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // A real mouse (not touch) is needed.
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHasMouse(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const enabled = hasMouse && !reduceMotion;

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      // The system cursor is hidden only once the pencil has a position, so it never disappears for nothing.
      if (root.dataset.cursor !== "on") root.dataset.cursor = "on";
      setShown(true);
    };
    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      setOverLink(!!target?.closest(INTERACTIVE));
      setOverField(!!target?.closest(TEXT_FIELD));
    };
    const onDown = (event: PointerEvent) => event.pointerType === "mouse" && setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setShown(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("blur", onUp);
    root.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onUp);
      root.removeEventListener("mouseleave", onLeave);
      delete root.dataset.cursor;
      setShown(false);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const visible = shown && !overField;
  const tilt = pressed ? PRESS_TILT : overLink ? HOVER_TILT : REST_TILT;
  const scale = pressed ? 0.9 : overLink ? 1.12 : 1;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[1000]"
      style={{ x, y, marginLeft: -TIP_X }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.svg
        width="12"
        height="48"
        viewBox="0 0 16 64"
        className="block overflow-visible"
        style={{ transformOrigin: `${TIP_X}px 0px`, filter: "drop-shadow(1px 2px 1.5px rgba(0,0,0,0.35))" }}
        initial={false}
        animate={{ rotate: tilt, scale }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
      >
        {/* Sharpened wood */}
        <path d="M8 0 L1 14 H15 Z" fill="#e9c48f" />
        {/* Graphite point */}
        <path d="M8 0 L5.2 5.8 H10.8 Z" fill="#2f2a24" />
        {/* Yellow body with lit and shaded sides */}
        <rect x="1" y="14" width="14" height="36" fill="#f4c542" />
        <rect x="1" y="14" width="4.6" height="36" fill="#ffe27a" />
        <rect x="10.4" y="14" width="4.6" height="36" fill="#d79f1c" />
        <rect x="7.6" y="14" width="0.9" height="36" fill="#e6b22d" />
        {/* Metal band */}
        <rect x="1" y="50" width="14" height="5" fill="#b9bec6" />
        <rect x="1" y="51.4" width="14" height="0.8" fill="#8c9199" />
        <rect x="1" y="53.2" width="14" height="0.8" fill="#8c9199" />
        {/* Eraser */}
        <rect x="1" y="55" width="14" height="8" rx="3" fill="#ef8fa0" />
        {/* Soft outline so it reads on both light and dark backgrounds */}
        <path
          d="M8 0 L1 14 V55 H1 V60 a3 3 0 0 0 3 3 H12 a3 3 0 0 0 3 -3 V55 V14 Z"
          fill="none"
          stroke="#2f2a24"
          strokeOpacity="0.55"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.div>
  );
}
