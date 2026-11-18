// Central place for all site content. Replace the placeholders below with real data.

export const siteConfig = {
  name: "Muhammad Ammar Azizan",
  title: "Muhammad Ammar Azizan | Software Engineer",
  description:
    "Portfolio of Muhammad Ammar Azizan, a software engineer building clean and reliable web applications.",
  // TODO: replace with the real domain after deployment.
  url: "https://example.com",
  tagline: "Building reliable web applications, from idea to deployment.",
  role: "Software Engineer",
  // Profile photo shown in the hero section.
  heroImage: "/images/profile-polaroid.jpg",
  // Memoji version shown on the back of the hero photo when it is clicked.
  heroAvatar: "/images/profile-avatar-polaroid.jpg",
  bio: [
    "Placeholder: write a short introduction about yourself here.",
    "Placeholder: add a second paragraph about your background and what drives you.",
  ],
  // Phone number in international format without "+" or spaces, e.g. 60123456789.
  contact: {
    whatsapp: "60000000000",
    instagram: "https://www.instagram.com/your-username",
    linkedin: "https://www.linkedin.com/in/your-username",
    email: "you@example.com",
  },
  // Put the resume file in /public and set its path here, e.g. "/resume.pdf".
  resumeUrl: null as string | null,
};

export const navItems = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export type Project = {
  title: string;
  description: string;
  tags: string[];
  // Image path inside /public/images, e.g. "/images/project-one.jpg".
  image?: string;
  href?: string;
};

export const projects: Project[] = [
  {
    title: "Project One",
    description: "Placeholder description for your first project.",
    tags: ["Next.js", "TypeScript"],
  },
  {
    title: "Project Two",
    description: "Placeholder description for your second project.",
    tags: ["React", "Node.js"],
  },
  {
    title: "Project Three",
    description: "Placeholder description for your third project.",
    tags: ["Python", "API"],
  },
];
