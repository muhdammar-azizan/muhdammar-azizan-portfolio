import Section from "./Section";
import Reveal from "./Reveal";
import { skills } from "@/lib/site";

export default function Skills() {
  return (
    <Section id="skills" title="Skills">
      <div className="grid gap-6 md:grid-cols-3">
        {skills.map((group, index) => (
          <Reveal key={group.title} delay={index * 0.1}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-accent/60">
              <h3 className="mb-4 text-lg font-semibold">{group.title}</h3>
              <ul className="space-y-2 text-foreground/70">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
