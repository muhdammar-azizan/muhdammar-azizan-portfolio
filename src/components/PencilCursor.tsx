"use client";

import { useEffect, useRef, useState } from "react";
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

// Pencil trail: a thin line that follows the tip while the mouse moves and fades away.
const TRAIL_LIFETIME = 1000; // ms a point of the line stays visible
const TRAIL_WIDTH = 1.6; // px, at the freshest end of the line
const TRAIL_MIN_STEP = 1.5; // px the mouse must move before a new point is added
const TRAIL_WOBBLE = 0.35; // px of hand-drawn unevenness

type TrailPoint = { x: number; y: number; t: number; breakBefore: boolean };

/**
 * Replaces the mouse pointer with a small pencil. The tip is the exact click point.
 * It leans and grows a little over links and buttons, presses down while clicking,
 * and draws a thin pencil line behind it that fades away within a second.
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Hide the system cursor right away. The pencil itself appears with the first mouse move.
    root.dataset.cursor = "on";

    // ---------- Trail ----------
    let points: TrailPoint[] = [];
    let frame = 0;
    let startNewLine = true;
    let overTextField = false;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const draw = (now: number) => {
      points = points.filter((point) => now - point.t < TRAIL_LIFETIME);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (points.length < 2) {
        frame = points.length ? requestAnimationFrame(draw) : 0;
        return;
      }

      // The line takes the page's text colour, so it shows on both light and dark backgrounds.
      const ink = getComputedStyle(root).getPropertyValue("--foreground").trim() || "#1c1917";
      ctx.strokeStyle = ink;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 1; i < points.length; i++) {
        const to = points[i];
        if (to.breakBefore) continue;
        const from = points[i - 1];
        // Fresh end of the line is darker and a little thicker; the old end is thin and faint.
        const life = 1 - (now - to.t) / TRAIL_LIFETIME;
        ctx.globalAlpha = 0.7 * life * life;
        ctx.lineWidth = TRAIL_WIDTH * (0.45 + 0.55 * life);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    const addPoint = (px: number, py: number) => {
      const last = points[points.length - 1];
      if (last && !startNewLine && Math.hypot(px - last.x, py - last.y) < TRAIL_MIN_STEP) return;
      points.push({
        x: px + (Math.random() - 0.5) * 2 * TRAIL_WOBBLE,
        y: py + (Math.random() - 0.5) * 2 * TRAIL_WOBBLE,
        t: performance.now(),
        breakBefore: startNewLine,
      });
      startNewLine = false;
      if (!frame) frame = requestAnimationFrame(draw);
    };

    // ---------- Pointer ----------
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      // Set again in case something removed it (for example a hot reload during development).
      if (root.dataset.cursor !== "on") root.dataset.cursor = "on";
      setShown(true);
      // No line where the normal cursor is used (text fields).
      if (!overTextField) addPoint(event.clientX, event.clientY);
    };
    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      overTextField = !!target?.closest(TEXT_FIELD);
      setOverLink(!!target?.closest(INTERACTIVE));
      setOverField(overTextField);
      if (overTextField) startNewLine = true;
    };
    const onDown = (event: PointerEvent) => event.pointerType === "mouse" && setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => {
      setShown(false);
      // The line starts fresh when the mouse comes back, instead of jumping across the screen.
      startNewLine = true;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("blur", onUp);
    window.addEventListener("resize", resize);
    root.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onUp);
      window.removeEventListener("resize", resize);
      root.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frame);
      delete root.dataset.cursor;
      setShown(false);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const visible = shown && !overField;
  const tilt = pressed ? PRESS_TILT : overLink ? HOVER_TILT : REST_TILT;
  const scale = pressed ? 0.9 : overLink ? 1.12 : 1;

  return (
    <>
      {/* Pencil line behind the tip; drawn on a canvas that covers the screen */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[999] h-screen w-screen"
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[1000]"
        style={{ x, y, marginLeft: -TIP_X }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.svg
          width="12"
          height="34"
          viewBox="0 0 16 45"
          className="block overflow-visible"
          style={{ transformOrigin: `${TIP_X}px 0px`, filter: "drop-shadow(1px 2px 1.5px rgba(0,0,0,0.35))" }}
          initial={false}
          animate={{ rotate: tilt, scale }}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
        >
          {/* Sharpened wood */}
          <path d="M8 0 L1 12 H15 Z" fill="#e9c48f" />
          {/* Graphite point */}
          <path d="M8 0 L5.4 4.9 H10.6 Z" fill="#2f2a24" />
          {/* Yellow body with lit and shaded sides */}
          <rect x="1" y="12" width="14" height="21" fill="#f4c542" />
          <rect x="1" y="12" width="4.6" height="21" fill="#ffe27a" />
          <rect x="10.4" y="12" width="4.6" height="21" fill="#d79f1c" />
          <rect x="7.6" y="12" width="0.9" height="21" fill="#e6b22d" />
          {/* Metal band */}
          <rect x="1" y="33" width="14" height="5" fill="#b9bec6" />
          <rect x="1" y="34.4" width="14" height="0.8" fill="#8c9199" />
          <rect x="1" y="36.2" width="14" height="0.8" fill="#8c9199" />
          {/* Eraser */}
          <rect x="1" y="38" width="14" height="7" rx="3" fill="#ef8fa0" />
          {/* Soft outline so it reads on both light and dark backgrounds */}
          <path
            d="M8 0 L1 12 V42 a3 3 0 0 0 3 3 H12 a3 3 0 0 0 3 -3 V12 Z"
            fill="none"
            stroke="#2f2a24"
            strokeOpacity="0.55"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.div>
    </>
  );
}
