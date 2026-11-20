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
  // Memoji shown first in the hero; clicking it reveals the real photo.
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
    github: "https://github.com/muhdammar-azizan",
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

// One sheet of paper inside a project file.
export type ProjectPage =
  // A printed screenshot of the system (16:10 image inside /public/images/projects).
  | { kind: "screenshot"; src: string; caption: string }
  // Handwritten-style notes on lined paper.
  // `tech` adds a "Built with" row of sketched logos (names are matched in src/lib/tech.ts).
  | { kind: "notes"; heading: string; paragraphs?: string[]; points?: string[]; tech?: string[] }
  // Handwritten note with links to every contact channel in siteConfig.contact.
  | { kind: "contact"; heading: string; paragraphs?: string[] };

export type Project = {
  title: string;
  // Short line shown at the bottom of the opened paper.
  summary: string;
  // Color of the sticky note on the file.
  noteColor: string;
  // Screenshot that peeks out of the file on hover.
  cover: string;
  // Sheets inside the file, in reading order. The first one is shown when the file opens.
  pages: ProjectPage[];
  // Opens from the "Visit website" button.
  href: string;
  repo?: string;
};

// PLACEHOLDER DATA: text, links and most images below are samples for the design.
// Replace them with the real projects later.
export const projects: Project[] = [
  {
    title: "GredKu",
    summary: "A digital academic companion for Malaysian university students.",
    noteColor: "#fbe27a",
    cover: "/images/projects/gredku.webp",
    pages: [
      { kind: "screenshot", src: "/images/projects/gredku.webp", caption: "Home page with quick access to every tool" },
      {
        kind: "notes",
        heading: "What is GredKu?",
        paragraphs: [
          "GredKu helps students calculate GPA and CGPA using their university's official grading rules, predict the exam marks needed for a target grade, plan retakes and organise study time in one place.",
        ],
        points: [
          "Grading rules for 20 Malaysian public universities",
          "GPA calculator, exam predictor and retake planner",
          "Community space and study planner for students",
        ],
      },
      {
        kind: "notes",
        heading: "Project notes",
        points: ["Role: Software Engineer", "Year: 2026"],
        tech: ["Laravel", "PHP", "MySQL", "Tailwind CSS", "JavaScript"],
      },
    ],
    // TODO: confirm the live URL.
    href: "https://gredku.com",
  },
  {
    title: "GardenSense",
    summary: "Smart garden monitoring that tells you what your plants need.",
    noteColor: "#c5e8a0",
    cover: "/images/projects/gardensense.webp",
    pages: [
      { kind: "screenshot", src: "/images/projects/gardensense.webp", caption: "Landing page (placeholder)" },
      {
        kind: "notes",
        heading: "What is GardenSense?",
        paragraphs: [
          "Placeholder: GardenSense reads soil moisture, light and temperature sensors and turns the data into simple watering and care tips.",
        ],
        points: [
          "Live sensor dashboard",
          "Watering reminders based on soil moisture",
          "Finalist at Program Jaguh Keusahawanan Nasional 2026",
        ],
        tech: ["React", "Node.js", "Firebase", "Arduino", "IoT"],
      },
    ],
    href: "https://example.com/gardensense",
  },
  {
    title: "CukruDev",
    summary: "Company website for a team that builds websites, systems and apps.",
    noteColor: "#a6d8f2",
    cover: "/images/projects/cukrudev.webp",
    pages: [
      { kind: "screenshot", src: "/images/projects/cukrudev.webp", caption: "Company landing page (placeholder)" },
      {
        kind: "notes",
        heading: "About this website",
        paragraphs: [
          "Placeholder: the official website of CukruDev Solutions, presenting its services, past work and an easy way for clients to get in touch.",
        ],
        points: ["Service pages for web, system and app development", "Portfolio of client projects", "Contact through WhatsApp"],
        tech: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
      },
    ],
    href: "https://example.com/cukrudev",
  },
  {
    title: "TaskFlow",
    summary: "A simple task board for student group projects.",
    noteColor: "#f6b8cf",
    cover: "/images/projects/taskflow.webp",
    pages: [
      { kind: "screenshot", src: "/images/projects/taskflow.webp", caption: "Task board overview (placeholder)" },
      {
        kind: "notes",
        heading: "What is TaskFlow?",
        paragraphs: [
          "Placeholder: TaskFlow lets group members split work into tasks, set deadlines and see progress at a glance, so nobody is left guessing who does what.",
        ],
        points: ["Drag and drop task board", "Deadline reminders", "Progress overview for each member"],
        tech: ["Vue", "Express", "PostgreSQL"],
      },
    ],
    href: "https://example.com/taskflow",
    repo: "https://github.com/your-username/taskflow",
  },
];

// ---------- Project shelf ----------

// Total number of files on the projects shelf. Spots without a project become
// "Reserved for you" files that invite visitors to get in touch.
// To show a new project, add it to `projects` above; one reserved file disappears automatically.
export const SHELF_SIZE = 15;

// Everything the shelf needs to draw one file and open its paper.
export type ShelfItem = {
  id: string;
  title: string;
  summary: string;
  noteColor: string;
  // Screenshot that peeks out of the file. Reserved files have none.
  cover?: string;
  pages: ProjectPage[];
  href?: string;
  repo?: string;
  reserved: boolean;
};

const RESERVED_NOTE_COLOR = "#fbd3a6";

const reservedFile = (spot: number): ShelfItem => ({
  id: `reserved-${spot}`,
  title: "Reserved for you",
  summary: "This spot is waiting for our next project together.",
  noteColor: RESERVED_NOTE_COLOR,
  pages: [
    {
      kind: "contact",
      heading: "Let's work together",
      paragraphs: [
        "This file is still empty. It could hold your project next: a collaboration, a website, a system or an app for your business.",
        "Reach me through any of these and tell me about your idea:",
      ],
    },
  ],
  reserved: true,
});

export const shelfItems: ShelfItem[] = [
  ...projects.map((project) => ({
    id: project.title,
    title: project.title,
    summary: project.summary,
    noteColor: project.noteColor,
    cover: project.cover,
    pages: project.pages,
    href: project.href,
    repo: project.repo,
    reserved: false,
  })),
  ...Array.from({ length: Math.max(0, SHELF_SIZE - projects.length) }, (_, i) => reservedFile(i + 1)),
];
