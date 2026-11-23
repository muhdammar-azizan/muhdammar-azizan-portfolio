"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FileDown, Phone } from "lucide-react";
import { GitHubIcon, GmailIcon, InstagramIcon, LinkedInIcon, WhatsAppIcon } from "./SocialLinks";
import { useProfileFlipped } from "@/lib/profileFlip";
import { formatPhone, shortUrl, siteConfig } from "@/lib/site";

// Square crops of the face from the two hero pictures (public/images).
const MEMOJI_FACE = "/images/avatar-memoji-face.webp";
const PHOTO_FACE = "/images/avatar-photo-face.webp";

type Row = { label: string; value: string; href: string; brand: string; icon: ReactNode; external?: boolean };

/**
 * Small round profile picture at the right end of the navbar. It flips between the memoji and the real photo
 * together with the portrait in the hero. Clicking it opens a menu with every way to get in touch,
 * and a link to download the résumé.
 */
export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const flipped = useProfileFlipped();
  const reduceMotion = useReducedMotion();

  // Close when clicking elsewhere or pressing Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const { email, whatsapp, linkedin, instagram, github } = siteConfig.contact;
  const instagramName = `@${shortUrl(instagram).split("/")[1]?.split("?")[0] ?? ""}`;
  const rows: Row[] = [
    { label: "Email", value: email, href: `mailto:${email}`, brand: "#EA4335", icon: <GmailIcon /> },
    { label: "WhatsApp", value: formatPhone(whatsapp), href: `https://wa.me/${whatsapp}`, brand: "#25D366", icon: <WhatsAppIcon />, external: true },
    {
      label: "Phone",
      value: formatPhone(whatsapp),
      href: `tel:+${whatsapp}`,
      brand: "#0f766e",
      icon: <Phone className="h-5 w-5" aria-hidden="true" />,
    },
    {
      label: "LinkedIn",
      value: shortUrl(linkedin).replace("linkedin.com/in/", ""),
      href: linkedin,
      brand: "#0A66C2",
      icon: <LinkedInIcon />,
      external: true,
    },
    { label: "Instagram", value: instagramName, href: instagram, brand: "#E4405F", icon: <InstagramIcon />, external: true },
    { label: "GitHub", value: shortUrl(github).replace("github.com/", ""), href: github, brand: "#181717", icon: <GitHubIcon />, external: true },
  ];

  const flip = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 60, damping: 11 };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={open ? "Close the profile menu" : "Open the profile menu"}
        aria-expanded={open}
        aria-controls="profile-menu"
        onClick={() => setOpen((value) => !value)}
        className="relative block h-10 w-10 cursor-pointer rounded-full outline-none ring-2 ring-foreground/15 transition hover:ring-accent focus-visible:ring-accent aria-expanded:ring-accent"
        style={{ perspective: 400 }}
      >
        {/* The two faces turn together with the portrait in the hero */}
        <motion.span
          className="absolute inset-0 block"
          style={{ transformStyle: "preserve-3d" }}
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={flip}
        >
          <Face src={MEMOJI_FACE} alt="Memoji of Muhammad Ammar" />
          <Face src={PHOTO_FACE} alt="Photo of Muhammad Ammar" back />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="profile-menu"
            className="absolute right-0 top-full z-50 mt-3 w-[min(21rem,calc(100vw-1.5rem))] origin-top-right rounded-2xl border border-foreground/15 bg-background p-2 font-sans shadow-2xl shadow-black/20"
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="px-3 pb-2 pt-2">
              <p className="font-clash text-base font-semibold leading-tight">{siteConfig.name}</p>
              <p className="mt-0.5 text-sm text-foreground/60">{siteConfig.role}</p>
            </div>

            <ul className="flex flex-col">
              {rows.map((row) => (
                <li key={row.label}>
                  <a
                    href={row.href}
                    target={row.external ? "_blank" : undefined}
                    rel={row.external ? "noopener noreferrer" : undefined}
                    style={{ "--brand": row.brand } as CSSProperties}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-foreground/[0.06] focus-visible:bg-foreground/[0.06] focus-visible:outline-none"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center text-foreground/70 transition-colors group-hover:text-(--brand)">
                      {row.icon}
                    </span>
                    <span className="min-w-0 leading-tight">
                      <span className="block text-xs text-foreground/50">{row.label}</span>
                      <span className="block truncate text-sm font-medium">{row.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {/* A thin line, then the résumé */}
            <div aria-hidden="true" className="mx-3 my-2 h-px bg-foreground/15" />

            {siteConfig.resumeUrl ? (
              <a
                href={siteConfig.resumeUrl}
                download
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-accent transition-colors hover:bg-accent/10 focus-visible:bg-accent/10 focus-visible:outline-none"
              >
                <FileDown aria-hidden="true" className="h-5 w-5 shrink-0" />
                <span className="text-sm font-semibold">Download Résumé</span>
                <span className="ml-auto text-xs text-accent/70">PDF</span>
              </a>
            ) : (
              // The file is not added yet (siteConfig.resumeUrl is null), so this row is shown but not clickable.
              <p className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-foreground/45">
                <FileDown aria-hidden="true" className="h-5 w-5 shrink-0" />
                <span className="text-sm font-semibold">Download Résumé</span>
                <span className="ml-auto text-xs">Coming soon</span>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// One side of the round avatar. The back side is pre-rotated so it faces forward after the flip.
function Face({ src, alt, back }: { src: string; alt: string; back?: boolean }) {
  return (
    <span
      className="absolute inset-0 block overflow-hidden rounded-full bg-foreground/10"
      style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: back ? "rotateY(180deg)" : undefined }}
    >
      <Image src={src} alt={alt} width={64} height={64} className="h-full w-full object-cover" />
    </span>
  );
}
