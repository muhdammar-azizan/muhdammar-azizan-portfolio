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
  // One-line summary shown under the carousel.
  summary: string;
  // Longer text shown when "View details" is opened.
  details: string;
  highlights: string[];
  tags: string[];
  role: string;
  year: string;
  // Screenshot of the project website, 16:10, inside /public/images/projects.
  image: string;
  // Main color of the project; the section background follows it.
  color: string;
  // Opens when the center card is clicked.
  href: string;
  repo?: string;
};

// PLACEHOLDER DATA: titles, text, links and images below are samples for the design.
// Replace them with the real projects later.
export const projects: Project[] = [
  {
    title: "GredKu",
    summary: "A digital academic companion for Malaysian university students.",
    details:
      "GredKu helps students calculate GPA and CGPA using their university's official grading rules, predict the exam marks needed for a target grade, plan retakes and organise study time in one place.",
    highlights: [
      "Grading rules for 20 Malaysian public universities",
      "GPA calculator, exam predictor and retake planner",
      "Community space and study planner for students",
    ],
    tags: ["Laravel", "MySQL", "Tailwind CSS", "JavaScript"],
    role: "Software Engineer",
    year: "2026",
    image: "/images/projects/gredku.webp",
    color: "#b5502d",
    // TODO: confirm the live URL.
    href: "https://gredku.com",
  },
  {
    title: "GardenSense",
    summary: "Smart garden monitoring that tells you exactly what your plants need.",
    details:
      "Placeholder: GardenSense reads soil moisture, light and temperature sensors and turns the data into simple watering and care tips. It was pitched as a finalist idea at Program Jaguh Keusahawanan Nasional 2026.",
    highlights: [
      "Live sensor dashboard",
      "Watering reminders based on soil moisture",
      "Finalist at Program Jaguh Keusahawanan Nasional 2026",
    ],
    tags: ["React", "Node.js", "IoT", "Firebase"],
    role: "Developer and pitch presenter",
    year: "2026",
    image: "/images/projects/gardensense.webp",
    color: "#4f8a3c",
    href: "https://example.com/gardensense",
  },
  {
    title: "CukruDev Website",
    summary: "Company website for a team that builds websites, systems and apps.",
    details:
      "Placeholder: the official website of CukruDev Solutions, presenting its services, past work and an easy way for clients to get in touch.",
    highlights: [
      "Service pages for web, system and mobile app development",
      "Portfolio of client projects",
      "Contact form connected to WhatsApp",
    ],
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    role: "Software Engineer",
    year: "2026",
    image: "/images/projects/cukrudev.webp",
    color: "#2f5bd3",
    href: "https://example.com/cukrudev",
  },
  {
    title: "TaskFlow",
    summary: "A simple task board for student group projects.",
    details:
      "Placeholder: TaskFlow lets group members split work into tasks, set deadlines and see progress at a glance, so nobody is left guessing who does what.",
    highlights: ["Drag and drop task board", "Deadline reminders", "Progress overview for each member"],
    tags: ["Vue", "Express", "PostgreSQL"],
    role: "Full-stack developer",
    year: "2025",
    image: "/images/projects/taskflow.webp",
    color: "#7c4ddb",
    href: "https://example.com/taskflow",
    repo: "https://github.com/your-username/taskflow",
  },
];
