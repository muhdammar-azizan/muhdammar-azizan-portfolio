"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Section from "./Section";
import Reveal from "./Reveal";
import { projects } from "@/lib/site";

export default function Projects() {
  return (
    <Section id="projects" title="Projects">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <Reveal key={project.title} delay={(index % 3) * 0.1}>
            <motion.article
              whileHover={{ y: -6 }}
              className="group h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-accent/30 to-white/5">
                {project.image && (
                  // next/image compresses and lazy-loads the picture automatically.
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="mt-2 text-sm text-foreground/70">{project.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-accent">
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            </motion.article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
