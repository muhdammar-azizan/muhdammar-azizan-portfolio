"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { siFirebase, siFlutter, siGithub, siLaravel, siNextdotjs, type SimpleIcon } from "simple-icons";
import { siteConfig } from "@/lib/site";

// ---------- What hangs where ----------

type KeychainData = {
  id: string;
  icon: SimpleIcon;
  // Distance from the left edge, as a share of the hero width: on large screens, and on phones/tablets
  // (null = not shown there, to keep small screens tidy).
  x: number;
  xSmall: number | null;
  // Chain length and fob size, relative to the base fob size (--kc), so everything scales together.
  chain: number;
  scale: number;
  // Offsets the gentle idle swing, so the keychains never move in step.
  phase: number;
  // When set, clicking the glass opens this page in a new tab.
  href?: string;
};

// A scattered, hand-placed layout. Logos come from simple-icons, so adding another one is one line here.
const KEYCHAINS: KeychainData[] = [
  { id: "laravel", icon: siLaravel, x: 21, xSmall: 12, chain: 0.7, scale: 1.0, phase: 0.4 },
  { id: "github", icon: siGithub, x: 36, xSmall: 50, chain: 1.5, scale: 0.9, phase: 2.1, href: siteConfig.contact.github },
  { id: "nextjs", icon: siNextdotjs, x: 48, xSmall: null, chain: 0.45, scale: 0.85, phase: 3.7 },
  { id: "flutter", icon: siFlutter, x: 93, xSmall: 88, chain: 1.1, scale: 1.05, phase: 5.2 },
  { id: "firebase", icon: siFirebase, x: 7, xSmall: null, chain: 1.25, scale: 0.9, phase: 1.3 },
];

// ---------- Drawing ----------

// Fob drawing space (SVG units): the 24-unit logo, glass around it, and room above for the eyelet.
const VIEW = { x: -3, y: -6, w: 30, h: 33 };
const GLASS = 4.4; // thickness of the glass around the logo, in SVG units
const LOGO_CENTER = 12; // every logo here is centred on x = 12
const EYELET_Y = -3.9; // centre of the metal ring the chain is attached to

// ---------- Swing physics ----------

const IDLE_SWAY = 0.022; // rad, how far it drifts on its own
const DAMPING = 0.9;
const MAX_ANGLE = 0.95; // rad
const MAX_SPEED = 2.4; // rad/s

type Sim = { angle: number; speed: number; time: number };

// A keychain that is a link must stay easy to click, so it settles while the pointer is on it.
const HELD_FREQUENCY = 11; // rad/s: how firmly it is pulled back to hanging straight (about 0.4 s to settle)
const LINK_NUDGE = 0.25; // the small wiggle when the pointer arrives
const LINK_REACH = 1.4; // size of the steady click area, relative to the fob width

// Name tooltip: how far below the pointer it sits, and how close to the screen edge it may go.
const TIP_OFFSET = 30;
const TIP_EDGE = 56;
const TIP_TOUCH_MS = 1500; // how long it stays after a tap

/**
 * Keychains hanging from the top of the hero. Each logo sits under a piece of glass shaped like the logo.
 * They sway a little on their own and swing when the mouse passes over them (or when they are tapped).
 */
export default function Keychains() {
  const reduceMotion = useReducedMotion();
  // The opening intro hides the page; the keychains drop in once it starts handing over.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const update = () => setReady(html.dataset.intro !== "play");
    update();
    const observer = new MutationObserver(update);
    observer.observe(html, { attributes: true, attributeFilter: ["data-intro"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-16 z-20 [--kc:46px] sm:[--kc:clamp(58px,5.6vw,108px)]"
    >
      {KEYCHAINS.map((item, index) => (
        <KeychainItem key={item.id} item={item} index={index} ready={ready} reduceMotion={!!reduceMotion} />
      ))}
    </div>
  );
}

type ItemProps = { item: KeychainData; index: number; ready: boolean; reduceMotion: boolean };

function KeychainItem({ item, index, ready, reduceMotion }: ItemProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const rotate = useMotionValue(0);
  const slotRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const fobRef = useRef<SVGSVGElement>(null);
  const sim = useRef<Sim>({ angle: 0, speed: 0, time: item.phase * 3 });
  const pointer = useRef<{ x: number; t: number } | null>(null);
  const linked = !!item.href;
  // held: the pointer is on a linked keychain, so it settles. frozen: the button is down, so it stays still.
  const held = useRef(false);
  const frozen = useRef(false);

  // Tooltip with the technology name. It follows the pointer while it is over the keychain.
  // true in the browser, false while the server renders (so the portal is never built on the server)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [tipOpen, setTipOpen] = useState(false);
  const tipX = useMotionValue(0);
  const tipY = useMotionValue(0);
  const tipTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(tipTimer.current), []);
  const placeTip = (clientX: number, clientY: number) => {
    tipX.set(Math.min(Math.max(clientX, TIP_EDGE), window.innerWidth - TIP_EDGE));
    tipY.set(clientY + TIP_OFFSET);
  };

  const width = `calc(var(--kc) * ${item.scale})`;
  const eyeletOffset = (EYELET_Y - VIEW.y) / VIEW.w; // share of the fob width
  const pivotX = ((LOGO_CENTER - VIEW.x) / VIEW.w) * 100; // % of the fob width
  const centerBelowChain = (12 - EYELET_Y) / VIEW.w; // logo centre below the end of the chain, share of the fob width

  // Adds a push to the swing (negative = the bottom moves to the right).
  const push = (impulse: number) => {
    const s = sim.current;
    s.speed = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, s.speed + impulse));
  };

  // ----- Swing simulation: a pendulum hanging from the top of the chain -----
  useEffect(() => {
    const slot = slotRef.current;
    const group = groupRef.current;
    if (!slot || !group || reduceMotion) return;

    let frame = 0;
    let last = 0;
    let length = Math.max(group.offsetHeight, 60);
    const measure = () => (length = Math.max(group.offsetHeight, 60));
    window.addEventListener("resize", measure);

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = sim.current;
      s.time += dt;
      if (frozen.current) {
        // Button held down: keep the keychain exactly where it is.
        s.speed = 0;
        frame = requestAnimationFrame(step);
        return;
      }
      // Longer chains swing more slowly, like real ones.
      const free = 1500 / length;
      // While the pointer is on a linked keychain: pulled straight, critically damped, no idle drift.
      const stiffness = held.current ? HELD_FREQUENCY * HELD_FREQUENCY : free;
      const damping = held.current ? 2 * HELD_FREQUENCY : DAMPING;
      const rest = held.current
        ? 0
        : IDLE_SWAY * Math.sin((s.time * 2 * Math.PI) / (7 + index * 1.3) + item.phase);
      const substeps = Math.max(1, Math.ceil(dt * 120));
      const h = dt / substeps;
      for (let i = 0; i < substeps; i++) {
        s.speed += (-stiffness * Math.sin(s.angle - rest) - damping * s.speed) * h;
        s.angle += s.speed * h;
        if (Math.abs(s.angle) > MAX_ANGLE) {
          s.angle = Math.sign(s.angle) * MAX_ANGLE;
          s.speed *= -0.4;
        }
      }
      rotate.set((s.angle * 180) / Math.PI);
      frame = requestAnimationFrame(step);
    };
    const start = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(step);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    // Only simulate while the hero is on screen.
    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    observer.observe(slot);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      stop();
    };
  }, [index, item.phase, reduceMotion, rotate]);

  // A little swing as it drops in, once the intro lets the page show.
  useEffect(() => {
    if (!ready || reduceMotion) return;
    const timer = window.setTimeout(() => push(index % 2 ? 1.5 : -1.5), 350 + index * 120);
    return () => window.clearTimeout(timer);
  }, [ready, reduceMotion, index]);

  // ----- Mouse and touch -----
  const side = (clientX: number) => {
    const box = fobRef.current?.getBoundingClientRect();
    if (!box) return 0;
    return (clientX - (box.left + box.width / 2)) / (box.width / 2);
  };

  const onPointerEnter = (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse") return;
    pointer.current = { x: event.clientX, t: performance.now() };
    placeTip(event.clientX, event.clientY);
    setTipOpen(true);
    // Even a slow touch of the glass nudges it away from the pointer. A link only wiggles a little,
    // then settles, so the click lands where the logo is.
    held.current = linked;
    push(-side(event.clientX) * (linked ? LINK_NUDGE : 0.5));
  };
  const onPointerMove = (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse") return;
    placeTip(event.clientX, event.clientY);
    const now = performance.now();
    const previous = pointer.current;
    // A linked keychain is not pushed around by small mouse movements while someone is aiming at it.
    if (previous && !linked) {
      const dx = event.clientX - previous.x;
      const vx = (dx / Math.max(now - previous.t, 8)) * 1000;
      // Moving right pushes the bottom of the keychain to the right (a negative angle).
      push(-dx * 0.012 * (1 + Math.min(Math.abs(vx), 2400) / 900));
    }
    pointer.current = { x: event.clientX, t: now };
  };
  const onPointerLeave = (event: ReactPointerEvent) => {
    pointer.current = null;
    held.current = false;
    frozen.current = false;
    if (event.pointerType === "mouse") setTipOpen(false);
  };
  const onPointerUp = () => {
    frozen.current = false;
  };
  const onPointerDown = (event: ReactPointerEvent) => {
    if (event.pointerType === "mouse") {
      // Pressing a link holds the keychain still until the button is released.
      if (linked) frozen.current = true;
      return;
    }
    push(-(side(event.clientX) || (Math.random() < 0.5 ? -1 : 1)) * 1.7);
    // Touch has no hover, so the name is shown for a moment after a tap.
    placeTip(event.clientX, event.clientY);
    setTipOpen(true);
    window.clearTimeout(tipTimer.current);
    tipTimer.current = window.setTimeout(() => setTipOpen(false), TIP_TOUCH_MS);
  };
  const handlers = { onPointerEnter, onPointerMove, onPointerLeave, onPointerDown, onPointerUp, onPointerCancel: onPointerLeave };

  // Invisible, solid area over the whole logo. The logo shapes have holes (the cat's face, the gaps in the
  // Laravel cube), and the mouse and touch must work there too. The outline path adds reach around odd shapes.
  const hitArea = (
    <g {...handlers} data-keychain style={{ pointerEvents: "all" }}>
      <circle cx={LOGO_CENTER} cy="12" r="12.8" fill="transparent" />
      <path d={item.icon.path} fill="transparent" stroke="transparent" strokeWidth="9" strokeLinejoin="round" />
    </g>
  );

  const slotStyle = {
    "--x-small": `${item.xSmall ?? item.x}%`,
    "--x": `${item.x}%`,
  } as CSSProperties;

  return (
    <>
    <motion.div
      ref={slotRef}
      data-keychain
      // Plain keychains are decoration; a keychain with a link stays available to keyboard and screen reader users.
      aria-hidden={item.href ? undefined : true}
      className={`absolute top-0 ${item.xSmall === null ? "hidden lg:block" : ""} left-[var(--x-small)] lg:left-[var(--x)]`}
      style={slotStyle}
      initial={reduceMotion ? false : { y: -340, opacity: 0 }}
      animate={ready || reduceMotion ? { y: 0, opacity: 1 } : undefined}
      transition={{ type: "spring", stiffness: 90, damping: 15, delay: index * 0.12 }}
    >
      {/* Small hook the chain hangs from, fixed to the edge of the navbar */}
      <span className="absolute -top-[5px] left-0 block h-[9px] w-[9px] -translate-x-1/2 rounded-full border-2 border-[#8f959e] bg-[#cfd3d9] shadow-sm" />

      {/* Everything below swings around the top of the chain */}
      <motion.div
        ref={groupRef}
        // flow-root keeps the fob's top margin inside this box (otherwise the whole box slides down).
        className="relative flow-root"
        style={{
          rotate,
          width,
          marginLeft: `calc(${width} * ${-pivotX / 100})`,
          transformOrigin: `${pivotX}% 0%`,
        }}
      >
        {/* Chain */}
        <div
          {...handlers}
          className="keychain-chain absolute top-0 w-2 -translate-x-1/2"
          style={{
            left: `${pivotX}%`,
            height: `calc(var(--kc) * ${item.chain})`,
            pointerEvents: "auto",
          }}
        />

        {/* Glass fob shaped like the logo */}
        <svg
          ref={fobRef}
          viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
          className="block overflow-visible"
          style={{
            width,
            height: `calc(${width} * ${VIEW.h / VIEW.w})`,
            marginTop: `calc(var(--kc) * ${item.chain} - ${width} * ${eyeletOffset})`,
            filter: "drop-shadow(0 5px 5px rgba(30, 20, 10, 0.32))",
          }}
        >
          <defs>
            <linearGradient id={`${id}-body`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="24" y2="24">
              <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.08" />
            </linearGradient>
            {/* Bright sheen across the glass, with a faint bounce of light at the far corner */}
            <linearGradient id={`${id}-sheen`} gradientUnits="userSpaceOnUse" x1="-3" y1="-4" x2="27" y2="26">
              <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="0.28" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.86" stopColor="#fff" stopOpacity="0.32" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h}>
              <path d={item.icon.path} fill="#fff" stroke="#fff" strokeWidth={GLASS - 0.4} strokeLinejoin="round" />
              <circle cx={LOGO_CENTER} cy="-1.7" r="2.1" fill="#fff" />
            </mask>
            {/* A crescent is the glass shape minus the same shape moved a little: light only on one edge */}
            {[
              ["a", 1.0],
              ["b", -1.0],
            ].map(([name, shift]) => (
              <mask key={name} id={`${id}-edge-${name}`} maskUnits="userSpaceOnUse" x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h}>
                <g fill="#fff" stroke="#fff" strokeWidth={GLASS - 0.4} strokeLinejoin="round">
                  <path d={item.icon.path} />
                  <circle cx={LOGO_CENTER} cy="-1.7" r="2.1" />
                </g>
                <g transform={`translate(${shift} ${shift})`} fill="#000" stroke="#000" strokeWidth={GLASS - 0.4} strokeLinejoin="round">
                  <path d={item.icon.path} />
                  <circle cx={LOGO_CENTER} cy="-1.7" r="2.1" />
                </g>
              </mask>
            ))}
          </defs>

          {/* Thickness of the glass, seen along the lower edge */}
          <path
            d={item.icon.path}
            transform="translate(0.3 0.55)"
            fill="var(--glass-edge)"
            stroke="var(--glass-edge)"
            strokeWidth={GLASS + 0.4}
            strokeLinejoin="round"
          />
          <circle cx={LOGO_CENTER + 0.3} cy="-1.15" r="2.3" fill="var(--glass-edge)" />

          {/* Pale backing so dark logos stay readable in dark mode */}
          <path d={item.icon.path} fill="var(--glass-backing)" stroke="var(--glass-backing)" strokeWidth={GLASS} strokeLinejoin="round" />

          {/* Glass body: bright rim, then the clear centre */}
          <path d={item.icon.path} fill="var(--glass-rim)" stroke="var(--glass-rim)" strokeWidth={GLASS + 0.3} strokeLinejoin="round" />
          <circle cx={LOGO_CENTER} cy="-1.7" r="2.2" fill="var(--glass-rim)" />
          <path d={item.icon.path} fill={`url(#${id}-body)`} stroke={`url(#${id}-body)`} strokeWidth={GLASS - 0.6} strokeLinejoin="round" />
          <circle cx={LOGO_CENTER} cy="-1.7" r="1.6" fill={`url(#${id}-body)`} />

          {/* The logo under the glass */}
          <path d={item.icon.path} fill={`#${item.icon.hex}`} />

          {/* Light sliding across the glass */}
          <g mask={`url(#${id}-mask)`}>
            <rect x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h} fill={`url(#${id}-sheen)`} />
            {/* Thin crescents of light on the outer edge of the glass: bright upper-left, soft lower-right */}
            <rect x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h} fill="#fff" fillOpacity="0.9" mask={`url(#${id}-edge-a)`} />
            <rect x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h} fill="#fff" fillOpacity="0.42" mask={`url(#${id}-edge-b)`} />
          </g>

          {/* Metal ring that the chain is fixed to */}
          <circle cx={LOGO_CENTER} cy={EYELET_Y} r="1.55" fill="none" stroke="#8f959e" strokeWidth="0.75" />
          <circle cx={LOGO_CENTER} cy={EYELET_Y} r="1.55" fill="none" stroke="#e6e9ee" strokeWidth="0.25" strokeDasharray="1.6 8" />

          {/* Invisible, slightly bigger shape that catches the mouse and touch (and the click, if there is a link) */}
          {item.href ? (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              aria-hidden="true"
              className="outline-none"
              style={{ pointerEvents: "all" }}
            >
              {hitArea}
            </a>
          ) : (
            hitArea
          )}
        </svg>
      </motion.div>

      {/* Steady click area at the resting place of the logo. It does not swing, so the pointer
          stays on it while the keychain settles. This is the link that keyboard and screen readers use. */}
      {item.href && (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${item.icon.title} (opens in a new tab)`}
          data-keychain
          {...handlers}
          className="pointer-events-auto absolute left-0 block -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:[outline:2px_solid_var(--accent)] focus-visible:[outline-offset:3px]"
          style={{
            top: `calc(var(--kc) * ${item.chain} + ${width} * ${centerBelowChain})`,
            width: `calc(${width} * ${LINK_REACH})`,
            height: `calc(${width} * ${LINK_REACH})`,
          }}
        />
      )}
    </motion.div>

    {/* Rendered on the page itself, not inside the swinging keychain, so it stays still and readable */}
    {mounted &&
      createPortal(
        <AnimatePresence>
          {tipOpen && (
            <motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[1001]" style={{ x: tipX, y: tipY }}>
              <motion.div
                className="-translate-x-1/2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                <div className="relative whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 font-sans text-[13px] font-medium text-background shadow-lg">
                  {/* Little arrow pointing up to the pointer */}
                  <span className="absolute -top-1 left-1/2 block h-2 w-2 -translate-x-1/2 rotate-45 rounded-[1px] bg-foreground" />
                  {item.icon.title}
                  {item.href && <span aria-hidden="true"> ↗</span>}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
