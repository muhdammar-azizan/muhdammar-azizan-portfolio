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
  // Two short paragraphs for the About section. Text between ** ** is drawn with a highlighter pen.
  bio: [
    "I'm Muhammad Ammar bin Azizan, a Software Engineering student at Universiti Malaysia Pahang Al-Sultan Abdullah (UMPSA). I enjoy **turning ideas into working software**, from the database and backend logic to the interface people actually use. I'm currently looking for an **internship and entry-level full-stack opportunities** where I can contribute, learn quickly and grow as an engineer.",
    "What drives me is building things that are **genuinely useful**, especially for students and communities in Malaysia. I like working in a team, explaining technical ideas in a way anyone can follow, and **improving a little every day** through consistent habits. Outside of coding, I'm always reading and looking for new ideas to bring back into my work.",
  ],
  // Sticky notes beside the About paper. Each one repeats a short line from the paragraphs above.
  aboutNotes: [
    { label: "Looking for", text: "an internship and entry-level full-stack opportunities", color: "#fbe27a" },
    { label: "Driven by", text: "building things that are genuinely useful", color: "#c5e8a0" },
    { label: "Every day", text: "improving a little through consistent habits", color: "#a6d8f2" },
  ],
  // Phone number in international format without "+" or spaces, e.g. 60123456789.
  contact: {
    whatsapp: "60175744235",
    instagram: "https://www.instagram.com/ammarzizan_",
    linkedin: "https://www.linkedin.com/in/ammar-azizan",
    github: "https://github.com/muhdammar-azizan",
    email: "muhdammar.azizan@gmail.com",
  },
  // Put the resume file in /public and set its path here, e.g. "/resume.pdf".
  resumeUrl: null as string | null,
};

export const navItems = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Journey", href: "#journey" },
  { label: "Achievements", href: "#achievements" },
  { label: "Skills", href: "#skills" },
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
export const SHELF_SIZE = 10;

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

// ---------- Journey (timeline, newest first) ----------

export type JourneyEntry = {
  kind: "experience" | "education";
  title: string;
  organisation: string;
  // Logo shown on the pinned paper beside the timeline, a file in public/logos (for example "/logos/cukrudev.png").
  // Until the file is added, the short text in `mark` is drawn on the paper instead.
  logo?: string;
  mark: string;
  // Shown beside "Experience", for example "Part Time".
  type?: string;
  // Dates are plain text. Use "Present" as the end for something that is still going on.
  start: string;
  end: string;
  story: string;
  // Two or three short tags shown as stickers under the story.
  highlights: string[];
  // Optional short list of activities shown under the card, each with a stack of photo papers.
  activities?: Activity[];
};

export type Activity = {
  date: string;
  title: string;
  // One or two sentences.
  detail: string;
  // Each photo is one paper in the stack. `src` is an image in public (for example "/images/activities/launch-1.jpg");
  // without it a placeholder is drawn. The caption is written on the paper.
  photos: { src?: string; caption: string }[];
};

export const journeyIntro =
  "From a matriculation classroom to building real products with a team, this is how my path in tech has unfolded.";

// TODO: replace every [BRACKETED] date below with the real one. Bracketed dates are drawn with a dotted underline.
export const journey: JourneyEntry[] = [
  {
    kind: "experience",
    title: "Partner and Logistics Manager",
    organisation: "CukruDev Solutions",
    mark: "CD",
    logo: "/logos/cukrudev.png",
    type: "Part Time",
    start: "[START MONTH YEAR]",
    end: "Present",
    story:
      "CukruDev Solutions is a registered company I run in partnership with my teammates, built alongside our studies. We take on website projects for clients, and we also build our own digital products aimed at helping Malaysian students. As Logistics Manager, I keep the work organised: planning tasks, coordinating deadlines and resources across the team, and making sure what we promise to clients is actually delivered. I also contribute as a software engineer, so I see both how a product is built and how a business keeps running behind it.",
    highlights: ["Teamwork", "Operations and Planning", "Client Delivery"],
    // TODO: dummy activities. Replace with the real ones and add photos (any number per activity).
    activities: [
      {
        date: "[MONTH YEAR]",
        title: "Client website launch",
        detail: "Planned the timeline with the team and handed over a finished website to our first client.",
        photos: [{ caption: "Launch day" }, { caption: "Final review" }, { caption: "Handover" }],
      },
      {
        date: "[MONTH YEAR]",
        title: "Team planning sprint",
        detail: "Set up a weekly task board so every member knew their deadlines and what was blocking them.",
        photos: [{ caption: "Whiteboard" }, { caption: "Task board" }, { caption: "Team meeting" }, { caption: "Weekly check-in" }],
      },
      {
        date: "[MONTH YEAR]",
        title: "Student product beta test",
        detail: "Ran a small beta with students to collect feedback before the public release.",
        photos: [{ caption: "Beta session" }, { caption: "Feedback notes" }],
      },
    ],
  },
  {
    kind: "education",
    title: "Bachelor of Software Engineering student",
    organisation: "Universiti Malaysia Pahang Al-Sultan Abdullah (UMPSA), Faculty of Computing",
    mark: "UMPSA",
    logo: "/logos/umpsa.png",
    start: "[START YEAR]",
    end: "Present",
    story:
      "At UMPSA I moved from learning programming basics to building complete systems: databases, web and mobile applications, and the integration between them. University is also where I stepped outside the classroom. I joined national and university level competitions, pitched ideas to judges, worked with mentors, and picked up industry skills through programmes in data analytics and artificial intelligence. Those experiences taught me that good software is only half the job, and that explaining it clearly to people is the other half. I have also kept a strong academic record while doing all of this.",
    highlights: ["Full Stack Development", "Competitions and Pitching", "Data and AI Learning"],
    // TODO: dummy activities. Replace with the real ones.
    activities: [
      {
        date: "[MONTH YEAR]",
        title: "Hackathon weekend",
        detail: "Built and pitched a working prototype with a small team in one weekend.",
        photos: [{ caption: "Team photo" }, { caption: "Pitching" }, { caption: "Prize giving" }],
      },
      {
        date: "[MONTH YEAR]",
        title: "Data analytics workshop",
        detail: "Learned to clean and present data, and finished with a small dashboard.",
        photos: [{ caption: "Workshop" }, { caption: "Group work" }],
      },
    ],
  },
  {
    kind: "education",
    title: "Matriculation student",
    organisation: "Kolej Matrikulasi Kedah",
    mark: "KMK",
    logo: "/logos/kmk.png",
    start: "[START YEAR]",
    end: "[END YEAR]",
    // Optional: add one sentence about your stream, a club or a memory from KMK, right after "under pressure."
    story:
      "Kolej Matrikulasi Kedah was where my foundation was built. The programme was fast and demanding, and it taught me discipline, time management and how to study consistently under pressure. It prepared me for university and gave me the habits I still rely on today.",
    highlights: ["Discipline", "Time Management", "Strong Foundation"],
    // TODO: dummy activities. Replace with the real ones.
    activities: [
      {
        date: "[MONTH YEAR]",
        title: "College programme or club",
        detail: "A short note about something you took part in at the college.",
        photos: [{ caption: "With friends" }, { caption: "On the day" }],
      },
    ],
  },
];

// ---------- Achievements ----------

export type Achievement = {
  title: string;
  // Where it happened, for example the competition or programme name.
  event: string;
  year: string;
  // Very short text for the round stamp, 12 characters at most (for example "Champion", "Top 10").
  result: string;
  // Colour of the stamp: gold, silver and bronze for places, "merit" for everything else.
  tier: "gold" | "silver" | "bronze" | "merit";
  kind: "Competition" | "Award" | "Certificate" | "Programme";
  // One or two sentences.
  story: string;
};

export const achievementsIntro = "A few moments I am proud of: competitions, awards and programmes that pushed me beyond the classroom.";

// TODO: this is dummy data. Replace every entry with the real achievements (add or remove entries freely).
export const achievements: Achievement[] = [
  {
    title: "National Hackathon Champion",
    event: "Sample National Hackathon",
    year: "2025",
    result: "Champion",
    tier: "gold",
    kind: "Competition",
    story: "Led a team of four to build a working prototype in 24 hours and pitched it to a panel of industry judges.",
  },
  {
    title: "Best Innovation Award",
    event: "Sample University Innovation Expo",
    year: "2025",
    result: "Best Idea",
    tier: "silver",
    kind: "Award",
    story: "Recognised for an idea that solves a real problem for students, from the first sketch to a live demo.",
  },
  {
    title: "Dean's List",
    event: "Faculty of Computing, UMPSA",
    year: "2024",
    result: "Dean's List",
    tier: "merit",
    kind: "Award",
    story: "Kept a strong academic result while taking part in competitions and running a company.",
  },
  {
    title: "Data Analytics Programme",
    event: "Sample Industry Training Programme",
    year: "2024",
    result: "Completed",
    tier: "merit",
    kind: "Programme",
    story: "Learned to clean, analyse and present data, and finished with a small dashboard project.",
  },
  {
    title: "Pitching Competition Finalist",
    event: "Sample Startup Pitch Challenge",
    year: "2024",
    result: "Finalist",
    tier: "bronze",
    kind: "Competition",
    story: "Pitched a student-focused product in front of mentors and investors, and learned how to tell the story behind the code.",
  },
  {
    title: "AI Fundamentals Certificate",
    event: "Sample Online Learning Platform",
    year: "2023",
    result: "Certified",
    tier: "merit",
    kind: "Certificate",
    story: "Covered the basics of machine learning and how to use AI tools responsibly in real projects.",
  },
];

// ---------- Skills ----------

// One flat list, shown as two rows of tiles that slide in opposite directions.
// A skill gets a coloured logo when src/lib/tech.ts knows it, or a small icon from the Skills component otherwise.
export const skills = [
  "PHP",
  "Flutter",
  "Laravel",
  "MySQL",
  "Dart",
  "HTML",
  "CSS",
  "JavaScript",
  "SQL",
  "Python",
  "Firebase",
  "GitHub",
  "Distributed Databases",
  "IoT with ESP32",
  "SAP Analytics Cloud",
  "Power BI",
  "AI Fundamentals",
];
