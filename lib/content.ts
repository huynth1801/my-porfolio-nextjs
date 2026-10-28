/**
 * Single source of truth for everything written on the site.
 * Update your story here — sections only render what this file says.
 */

export const profile = {
  name: "Huy Nguyen",
  fullName: "Nguyen Thai Huu Huy",
  role: "Frontend Developer",
  location: "Ho Chi Minh City, Vietnam",
  email: "huuhuy1801@gmail.com",
  github: "https://github.com/huynth1801",
  linkedin: "https://www.linkedin.com/in/huy-nguyen-085382206/",
  resume: "/NguyenThaiHuuHuy_FrontEndDeveloper.pdf",
  tagline:
    "I build playful, high-performance web experiences with React and Next.js — and a game developer's sense of feel.",
};

export type Strength = {
  icon: "gamepad" | "gauge" | "rocket";
  title: string;
  desc: string;
};

export const strengths: Strength[] = [
  {
    icon: "gamepad",
    title: "Game-feel interactions",
    desc: "Cocos Creator background — easing, feedback and motion that make an interface feel alive, not just animated.",
  },
  {
    icon: "gauge",
    title: "Performance-first",
    desc: "Profiling, lazy loading and render discipline keep things at 60fps — even when WebGL is on the page.",
  },
  {
    icon: "rocket",
    title: "Ships end-to-end",
    desc: "From an OCR module that sped up document processing to a real-time chat app — features delivered with design and backend teams.",
  },
];

export type Experience = {
  id: string;
  index: string;
  title: string;
  type: string;
  company: string;
  duration: string;
  summary: string;
  responsibilities: string[];
  skills: string[];
};

export const experiences: Experience[] = [
  {
    id: "prof-exp-1",
    index: "01",
    title: "Junior Frontend Developer",
    type: "Full-time",
    company: "TGM Research",
    duration: "7.2025 — Present",
    summary: "Building complex React applications and architecting scalable frontend solutions.",
    responsibilities: [
      "Develop complex React applications with TypeScript and optimize website performance.",
      "Architect scalable frontend solutions using Next.js and modern tooling.",
      "Collaborate with design and backend teams to deliver high-quality products.",
      "Work in an agile development environment.",
    ],
    skills: ["React", "Next.js", "Tailwind CSS", "Shadcn", "MaterialUI", "Zustand", "Redux Toolkit"],
  },
  {
    id: "prof-exp-2",
    index: "02",
    title: "Junior Frontend Developer",
    type: "Full-time",
    company: "CAS Corporation",
    duration: "9.2024 — 5.2025",
    summary:
      "Internal CRM platform, an OCR module and SEO-optimized landing pages built with Next.js.",
    responsibilities: [
      "Developed and maintained the company's internal CRM web application.",
      "Implemented new features and resolved bugs to keep daily operations smooth across departments.",
      "Built an OCR module that automatically extracts information from scanned documents, improving processing speed for internal teams.",
      "Built SEO-optimized landing pages using Next.js, improving organic search performance.",
    ],
    skills: ["Angular", "TypeScript", "MaterialUI", "Next.js"],
  },
  {
    id: "prof-exp-3",
    index: "03",
    title: "Frontend Developer",
    type: "Short-term contract",
    company: "Likelion",
    duration: "5.2024 — 8.2024",
    summary: "Owned the frontend of a real-time web chat application for internal teams.",
    responsibilities: [
      "Owned the frontend of a real-time web-based chat application for internal team communication.",
      "Integrated APIs and managed chat states: message grouping, typing indicators and notifications.",
      "Optimized component rendering and state management for a smoother user experience.",
    ],
    skills: ["React", "TailwindCSS", "JavaScript", "CSS", "HTML"],
  },
  {
    id: "prof-exp-4",
    index: "04",
    title: "Game Developer Intern",
    type: "Internship",
    company: "Onechain Game Studio",
    duration: "5.2023 — 8.2023",
    summary: "Where the motion design obsession started: hypercasual games in Cocos Creator.",
    responsibilities: [
      "Designed and developed hypercasual games using Cocos Creator and TypeScript.",
      "Implemented gameplay mechanics, player controls, scoring systems and level progression.",
      "Optimized game performance for smooth gameplay across devices.",
    ],
    skills: ["TypeScript", "Cocos Creator"],
  },
];

export type Project = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  stack: string[];
  demo?: string;
  repo?: string;
  icon: "store" | "clapperboard" | "gamepad" | "globe";
  accent: string;
  year: string;
};

export const projects: Project[] = [
  {
    id: "myshop",
    title: "MyShop",
    tagline: "Full-stack e-commerce storefront",
    description:
      "Online store with product catalog, categories, cart and Stripe Checkout — an Astro 5 + React islands frontend backed by a Java 21 Spring Boot API on PostgreSQL, with an admin area for orders.",
    stack: ["Astro 5", "React", "Stripe", "Spring Boot", "PostgreSQL"],
    demo: "https://thuyshop.store",
    repo: "https://github.com/huynth1801/myshop-astro",
    icon: "store",
    accent: "#34d399",
    year: "2026",
  },
  {
    id: "sunfix",
    title: "Sunfix",
    tagline: "Movie discovery website",
    description:
      "Movie database with trending / top-rated categories, dark mode and a flexible Axios API layer for fast content updates.",
    stack: ["React", "TailwindCSS", "Axios", "REST API"],
    demo: "https://sunfix.netlify.app/",
    repo: "https://github.com/huynth1801/react-movie",
    icon: "clapperboard",
    accent: "#f472b6",
    year: "2023",
  },
  {
    id: "flappy-bird",
    title: "Flappy Bird",
    tagline: "Hypercasual game clone",
    description:
      "A faithful Flappy Bird built in Cocos Creator with TypeScript — where I learned to think in game loops, not page loads.",
    stack: ["Cocos Creator", "TypeScript"],
    repo: "https://github.com/huynth1801/FlappyBird",
    icon: "gamepad",
    accent: "#fbbf24",
    year: "2023",
  },
  {
    id: "portfolio",
    title: "This portfolio",
    tagline: "Interactive 3D floating career island",
    description:
      "The site you're on right now: a low-poly floating island 'Career City' with 5 districts, real-time day/night lighting, camera transitions, and mascot cat — built with React Three Fiber, Three.js, and GSAP.",
    stack: ["Next.js 16", "React Three Fiber", "GSAP", "Lenis"],
    repo: "https://github.com/huynth1801/my-porfolio-nextjs",
    icon: "globe",
    accent: "#a78bfa",
    year: "2026",
  },
];

export type Education = {
  id: string;
  school: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate: string;
  description?: string;
  tags?: string[];
};

export const educations: Education[] = [
  {
    id: "uni-1",
    school: "Ho Chi Minh City University of Technology",
    degree: "Electronics and Telecommunication Engineering",
    startDate: "2018",
    endDate: "2022",
  },
  {
    id: "uni-2",
    school: "UEH University",
    degree: "Software Engineering",
    startDate: "2023",
    endDate: "2025",
    tags: ["Certificate"],
  },
];

/** Grouped skills for the quick-view panel (resume-accurate). */
export const skillGroups: Array<{ title: string; items: string[] }> = [
  {
    title: "Languages",
    items: ["TypeScript", "JavaScript", "HTML/CSS", "SQL", "Java"],
  },
  {
    title: "Frameworks & libraries",
    items: ["React", "Next.js", "Angular", "TailwindCSS", "MaterialUI", "shadcn/ui", "Redux Toolkit", "Zustand"],
  },
  {
    title: "Creative & tools",
    items: ["Cocos Creator", "WebGL / R3F", "GSAP", "Git", "Figma"],
  },
];

/** What a room hotspot opens. */
export type PanelKey = "about" | "experience" | "projects" | "skills" | "education" | "contact";
