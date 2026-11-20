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
const TRAIL_LIFETIME = 500; // ms a point of the line stays visible
const TRAIL_WIDTH = 1.6; // px, at the freshest end of the line
const TRAIL_MIN_STEP = 1.5; // px the mouse must move before a new point is added
const TRAIL_WOBBLE = 0.35; // px of hand-drawn unevenness

// The line is only drawn on empty space. It is not drawn on, or close to, anything in this list
// (menu bar, images, project files, buttons, links, headings, paragraphs) or any element that holds text.
const CONTENT =
  "header, footer, img, picture, video, svg, button, a, input, textarea, select, label, summary, figure, article, " +
  "h1, h2, h3, h4, h5, h6, p, li, .ruler, [data-shelf-slot], [data-keychain]";
const CONTENT_MARGIN = 24; // px of clear space needed around the pencil tip

// ---------- Where the content is ----------
// "Is there content near the pointer?" is answered from a list of rectangles. Asking the browser what is under the
// pointer (hit testing) five times per frame was one of the most expensive things on the page, and it got worse
// the more layers the page had. The list is rebuilt now and then, which is far cheaper.
type Box = { l: number; t: number; r: number; b: number };

const BOX_REFRESH_MS = 200; // how old the list may get while the mouse is moving
let boxes: Box[] = [];
let boxesAt = -Infinity;
let boxesDirty = true;
const markBoxesDirty = () => {
  boxesDirty = true;
};

const collectBoxes = (): Box[] => {
  const found: Box[] = [];
  const width = window.innerWidth;
  const height = window.innerHeight;
  const add = (element: Element) => {
    // The pencil itself and its trail are not content.
    if (element.closest("[data-pencil]")) return;
    const rect = element.getBoundingClientRect();
    // Skip hidden things, hairlines and anything far outside the screen.
    if (rect.width < 2 || rect.height < 2) return;
    if (rect.right < -CONTENT_MARGIN || rect.bottom < -CONTENT_MARGIN) return;
    if (rect.left > width + CONTENT_MARGIN || rect.top > height + CONTENT_MARGIN) return;
    found.push({
      l: rect.left - CONTENT_MARGIN,
      t: rect.top - CONTENT_MARGIN,
      r: rect.right + CONTENT_MARGIN,
      b: rect.bottom + CONTENT_MARGIN,
    });
  };
  document.querySelectorAll(CONTENT).forEach(add);
  // Anything that holds words of its own, such as a span or div with text in it.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set<Element>();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (parent && !seen.has(parent) && node.textContent?.trim()) {
      seen.add(parent);
      add(parent);
    }
  }
  return found;
};

// True when this spot is on, or within a few pixels of, text, a picture, a button and so on.
const nearContent = (px: number, py: number, now: number) => {
  if (boxesDirty || now - boxesAt > BOX_REFRESH_MS) {
    boxes = collectBoxes();
    boxesAt = now;
    boxesDirty = false;
  }
  for (const box of boxes) if (px >= box.l && px <= box.r && py >= box.t && py <= box.b) return true;
  return false;
};

type TrailPoint = { x: number; y: number; t: number; breakBefore: boolean };

/**
 * Replaces the mouse pointer with a small pencil. The tip is the exact click point.
 * It leans and grows a little over links and buttons, presses down while clicking,
 * and draws a thin pencil line behind it, on empty space only, that fades away in half a second.
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
    // Mouse positions that arrived since the last frame. They are handled together, once per frame.
    let pending: [number, number][] = [];
    let frame = 0;
    let startNewLine = true;
    let overTextField = false;
    let isShown = false;
    let dpr = 1;

    // The line takes the page's text colour, so it shows on both light and dark backgrounds.
    // It is read once, and again when the theme changes. Reading it on every frame forces the browser to
    // recalculate styles in the middle of an animation.
    let ink = "#1c1917";
    const readInk = () => {
      ink = getComputedStyle(root).getPropertyValue("--foreground").trim() || "#1c1917";
    };
    readInk();
    const themeObserver = new MutationObserver(readInk);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const addPoint = (px: number, py: number, now: number) => {
      const last = points[points.length - 1];
      if (last && !startNewLine && Math.hypot(px - last.x, py - last.y) < TRAIL_MIN_STEP) return;
      points.push({
        x: px + (Math.random() - 0.5) * 2 * TRAIL_WOBBLE,
        y: py + (Math.random() - 0.5) * 2 * TRAIL_WOBBLE,
        t: now,
        breakBefore: startNewLine,
      });
      startNewLine = false;
    };

    const tick = (now: number) => {
      frame = 0;

      // The check "is this empty space?" asks the browser what is under the pointer, which is the costly
      // part. A mouse can report hundreds of positions per second, so it runs once per frame, not once per move.
      if (pending.length) {
        const [lastX, lastY] = pending[pending.length - 1];
        if (overTextField || nearContent(lastX, lastY, now)) {
          // On or near content: no line, and the next line starts fresh instead of joining across the gap.
          startNewLine = true;
        } else {
          for (const [px, py] of pending) addPoint(px, py, now);
        }
        pending = [];
      }

      points = points.filter((point) => now - point.t < TRAIL_LIFETIME);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (points.length >= 2) {
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
      }

      // Keep drawing while the line is still fading; stop when nothing is left.
      if (points.length) frame = requestAnimationFrame(tick);
    };
    const ensureFrame = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    // ---------- Pointer ----------
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      // Set again in case something removed it (for example a hot reload during development).
      if (root.dataset.cursor !== "on") root.dataset.cursor = "on";
      if (!isShown) {
        isShown = true;
        setShown(true);
      }
      // No line where the normal cursor is used (text fields).
      if (overTextField) {
        startNewLine = true;
        return;
      }
      // Keep every position the mouse reported, so fast strokes stay smooth.
      const reported = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : [];
      if (reported.length > 1) for (const e of reported) pending.push([e.clientX, e.clientY]);
      else pending.push([event.clientX, event.clientY]);
      ensureFrame();
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
      isShown = false;
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
    // The list of content rectangles is out of date after scrolling or resizing.
    window.addEventListener("scroll", markBoxesDirty, { passive: true, capture: true });
    window.addEventListener("resize", markBoxesDirty);
    root.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("scroll", markBoxesDirty, { capture: true });
      window.removeEventListener("resize", markBoxesDirty);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onUp);
      window.removeEventListener("resize", resize);
      root.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
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
        data-pencil
        className="pointer-events-none fixed inset-0 z-[999] h-screen w-screen"
      />

      <motion.div
        aria-hidden="true"
        data-pencil
        className="pointer-events-none fixed left-0 top-0 z-[1000]"
        // Its own layer: moving the pencil is then only a change of position, and the browser does not have to
        // work out again how every other layer on the page overlaps it on each mouse move.
        style={{ x, y, marginLeft: -TIP_X, willChange: "transform" }}
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
