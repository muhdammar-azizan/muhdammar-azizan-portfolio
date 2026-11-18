import type { ReactNode } from "react";
import Reveal from "./Reveal";

type SectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

// Shared wrapper so every section has the same spacing and heading style.
export default function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-16 px-6 py-24">
      <Reveal>
        <h2 className="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
          <span className="text-accent">.</span>
        </h2>
      </Reveal>
      {children}
    </section>
  );
}
