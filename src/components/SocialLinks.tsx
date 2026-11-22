import { Mail } from "lucide-react";
import { siGithub } from "simple-icons";
import { siteConfig } from "@/lib/site";

// Brand icons are inline SVGs because lucide-react does not ship brand logos.
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.5A9.9 9.9 0 1 0 12.04 2Zm5.8 14.1c-.25.7-1.4 1.3-1.95 1.35-.5.05-1.1.07-1.8-.12a14 14 0 0 1-5.4-3.2c-1.5-1.4-2.4-3-2.6-3.6-.2-.5-.4-1.6.3-2.4.6-.7 1.2-.8 1.5-.8h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l2 .95c.3.1.5.2.55.3.1.2.1.8-.15 1.5Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.55h.05c.55-1 1.85-2.05 3.8-2.05 4.05 0 4.8 2.65 4.8 6.1V21h-4v-4.9c0-1.2 0-2.7-1.65-2.7s-1.9 1.3-1.9 2.6V21h-4V9.75Z" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
    <path d={siGithub.path} />
  </svg>
);

const links = [
  { label: "GitHub", href: siteConfig.contact.github, icon: <GitHubIcon /> },
  {
    label: "WhatsApp",
    href: `https://wa.me/${siteConfig.contact.whatsapp}`,
    icon: <WhatsAppIcon />,
  },
  { label: "Instagram", href: siteConfig.contact.instagram, icon: <InstagramIcon /> },
  { label: "LinkedIn", href: siteConfig.contact.linkedin, icon: <LinkedInIcon /> },
  {
    label: "Email",
    href: `mailto:${siteConfig.contact.email}`,
    icon: <Mail className="h-5 w-5" aria-hidden="true" />,
  },
];

export default function SocialLinks() {
  return (
    <ul className="flex items-center gap-3">
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            aria-label={link.label}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-current/25 text-current transition hover:-translate-y-1 hover:border-accent hover:text-accent"
          >
            {link.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}
