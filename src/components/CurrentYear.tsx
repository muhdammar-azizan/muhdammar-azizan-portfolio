"use client";

import { useEffect, useRef } from "react";

// The year is written in the browser: reading the date while the page is built is not allowed,
// and a built page would go out of date. The printed value is only a fallback.
const FALLBACK_YEAR = 2026;

export default function CurrentYear() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.textContent = String(new Date().getFullYear());
  }, []);

  return (
    <span ref={ref} suppressHydrationWarning>
      {FALLBACK_YEAR}
    </span>
  );
}
