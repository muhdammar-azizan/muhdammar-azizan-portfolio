import Section from "./Section";
import Reveal from "./Reveal";
import SocialLinks from "./SocialLinks";
import { siteConfig } from "@/lib/site";

export default function Contact() {
  return (
    <Section id="contact" title="Contact">
      <Reveal>
        <p className="max-w-xl text-lg text-foreground/70">
          Have a project in mind or just want to say hi? Reach out on any platform below.
        </p>
        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="mt-6 inline-block text-xl font-medium text-accent hover:underline"
        >
          {siteConfig.contact.email}
        </a>
        <div className="mt-8">
          <SocialLinks />
        </div>
      </Reveal>
    </Section>
  );
}
