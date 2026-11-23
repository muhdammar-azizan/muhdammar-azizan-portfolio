"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { FileDown, X } from "lucide-react";
import { siteConfig } from "@/lib/site";

/**
 * Full-screen preview of the résumé. Visitors can read every page here first,
 * and download the PDF from the bar at the top if they want to keep it.
 */
export default function ResumePreview({ onClose }: { onClose: () => void }) {
  // Close with Escape, and keep the page behind from scrolling while the preview is open.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  // A portal puts it directly in <body>, so the navbar's blur cannot trap or clip it.
  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Résumé preview"
      className="fixed inset-0 z-[100] flex flex-col bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/15 bg-[#161616] px-4 py-3 text-white sm:px-6">
        <p className="min-w-0 truncate font-clash text-base font-semibold">
          Résumé <span className="hidden font-sans text-sm font-normal text-white/60 sm:inline">· {siteConfig.name}</span>
        </p>
        <div className="flex items-center gap-2">
          <a
            href={siteConfig.resumeUrl ?? "#"}
            download
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <FileDown aria-hidden="true" className="h-4 w-4" />
            Download PDF
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the preview"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/20 transition hover:bg-white/10"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Clicking the dark area beside the pages closes it too */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-6 sm:px-6" onClick={onClose}>
        <div className="mx-auto flex max-w-3xl flex-col gap-6" onClick={(event) => event.stopPropagation()}>
          {siteConfig.resumePages.map((src, index) => (
            // Plain <img>: these are fixed page pictures and should keep their full sharpness for reading.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt={`Résumé of ${siteConfig.name}, page ${index + 1} of ${siteConfig.resumePages.length}`}
              className="w-full rounded-sm bg-white shadow-2xl shadow-black/50"
              loading={index === 0 ? "eager" : "lazy"}
            />
          ))}
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}
