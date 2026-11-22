import { siGithub } from "simple-icons";
import { siteConfig } from "@/lib/site";

// Brand icons are inline SVGs because lucide-react does not ship brand logos.
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
    <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.5A9.9 9.9 0 1 0 12.04 2Zm5.8 14.1c-.25.7-1.4 1.3-1.95 1.35-.5.05-1.1.07-1.8-.12a14 14 0 0 1-5.4-3.2c-1.5-1.4-2.4-3-2.6-3.6-.2-.5-.4-1.6.3-2.4.6-.7 1.2-.8 1.5-.8h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l2 .95c.3.1.5.2.55.3.1.2.1.8-.15 1.5Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 group-hover:[stroke:url(#instagram-gradient)]"
    aria-hidden="true"
  >
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

// The Gmail "M" in five pieces: one plain colour at rest, the official colours on hover.
const GmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
    <path className="group-hover:fill-[#4285F4]" d="M1.636 21H5.455V11.73L0 7.64V19.364C0 20.268.732 21 1.636 21Z" />
    <path className="group-hover:fill-[#34A853]" d="M18.545 21h3.819C23.268 21 24 20.268 24 19.364V7.64l-5.455 4.09V21Z" />
    <path
      className="group-hover:fill-[#FBBC04]"
      d="M18.545 4.64v7.09L24 7.64V5.457c0-2.023-2.309-3.178-3.927-1.964l-1.528 1.147Z"
    />
    <path className="group-hover:fill-[#EA4335]" d="M5.455 11.73V4.64L12 9.548l6.545-4.908v7.09L12 16.64l-6.545-4.91Z" />
    <path
      className="group-hover:fill-[#C5221F]"
      d="M0 5.457V7.64l5.455 4.09V4.64L3.927 3.493C2.309 2.28 0 3.434 0 5.457Z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
    <path d={siGithub.path} />
  </svg>
);

const links = [
  { label: "GitHub", href: siteConfig.contact.github, icon: <GitHubIcon />, brand: "#181717" },
  {
    label: "WhatsApp",
    href: `https://wa.me/${siteConfig.contact.whatsapp}`,
    icon: <WhatsAppIcon />,
    brand: "#25D366",
  },
  { label: "Instagram", href: siteConfig.contact.instagram, icon: <InstagramIcon />, brand: "#E4405F" },
  { label: "LinkedIn", href: siteConfig.contact.linkedin, icon: <LinkedInIcon />, brand: "#0A66C2" },
  {
    label: "Email",
    href: `mailto:${siteConfig.contact.email}`,
    icon: <GmailIcon />,
    brand: "#EA4335",
  },
];

export default function SocialLinks() {
  return (
    <>
      {/* The official Instagram gradient, used by the icon's strokes on hover */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="instagram-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#FEDA75" />
            <stop offset="0.3" stopColor="#FA7E1E" />
            <stop offset="0.55" stopColor="#D62976" />
            <stop offset="0.8" stopColor="#962FBF" />
            <stop offset="1" stopColor="#4F5BD5" />
          </linearGradient>
        </defs>
      </svg>

      <ul className="flex items-center gap-3">
        {links.map((link) => (
          <li key={link.label}>
            {/* Plain colour at rest; the brand's own colour appears on hover */}
            <a
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              aria-label={link.label}
              style={{ "--brand": link.brand } as React.CSSProperties}
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-current/25 text-current transition duration-200 hover:-translate-y-1 hover:border-(--brand) hover:bg-white/70 hover:text-(--brand)"
            >
              {link.icon}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
