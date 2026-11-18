import Section from "./Section";
import Reveal from "./Reveal";
import { siteConfig } from "@/lib/site";

export default function About() {
  return (
    <Section id="about" title="About">
      <div className="max-w-2xl space-y-4 text-lg text-foreground/70">
        {siteConfig.bio.map((paragraph, index) => (
          <Reveal key={index} delay={index * 0.1}>
            <p>{paragraph}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
