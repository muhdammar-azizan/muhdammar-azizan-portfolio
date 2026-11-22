import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import SocialLinks from "./SocialLinks";
import { navItems, siteConfig } from "@/lib/site";

/**
 * The last part of the page, and the place to get in touch (the "Contact" link in the navbar
 * scrolls here). It uses the inverted colours of the theme, so it reads as the end of the page.
 */
export default function Footer() {
  const { email, whatsapp, linkedin, instagram, github } = siteConfig.contact;
  const columns = [
    {
      title: "Navigate",
      links: navItems.filter((item) => item.href !== "#contact").map((item) => ({ label: item.label, href: item.href })),
    },
    {
      title: "Elsewhere",
      links: [
        { label: "GitHub", href: github },
        { label: "LinkedIn", href: linkedin },
        { label: "Instagram", href: instagram },
      ],
    },
    {
      title: "Say hello",
      links: [
        { label: email, href: `mailto:${email}` },
        { label: "WhatsApp", href: `https://wa.me/${whatsapp}` },
        ...(siteConfig.resumeUrl ? [{ label: "Resume", href: siteConfig.resumeUrl }] : []),
      ],
    },
  ];

  return (
    <footer id="contact" className="footer-invert scroll-mt-0 bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-10">
        <Reveal>
          <p className="font-hand text-xl text-background/60">Have a project in mind, or an opening on your team?</p>
          <h2 className="mt-3 max-w-3xl font-clash text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Let&apos;s work together<span className="text-accent">.</span>
          </h2>
          <a
            href={`mailto:${email}`}
            className="group mt-8 inline-flex items-center gap-2 border-b-2 border-accent pb-1 text-xl font-medium sm:text-2xl"
          >
            {email}
            <ArrowUpRight aria-hidden="true" className="h-6 w-6 text-accent transition group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </Reveal>

        <div className="mt-16 grid gap-12 border-t border-background/15 pt-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <p className="font-clash text-xl font-semibold">{siteConfig.name}</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-background/65">{siteConfig.tagline}</p>
            <div className="mt-6">
              <SocialLinks />
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-sm font-semibold tracking-wider text-background/50 uppercase">{column.title}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="break-all text-background/85 transition hover:text-accent"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-background/15 pt-6 text-sm text-background/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>Designed and built by me with Next.js.</p>
        </div>
      </div>
    </footer>
  );
}
