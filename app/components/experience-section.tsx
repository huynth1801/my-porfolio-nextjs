"use client";

import { ChevronDown } from "@/components/ui/chevrondown";
import React, { memo, useCallback, useState } from "react";

// Helper components with refined icons

const Code = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m16 18 6-6-6-6" />
    <path d="m8 6-6 6 6 6" />
  </svg>
);
const Palette = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

// Shadcn-style Badge component
const Badge = ({
  children,
  className = "",
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline";
}) => {
  const variants = {
    default:
      "bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90",
    secondary:
      "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
    outline:
      "border border-slate-200 bg-transparent hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// --- TYPES ---
type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface TimelineItemData {
  id: string;
  title: string;
  type: string;
  company: string;
  duration: string;
  icon: IconType;
  responsibilities: string[];
  skills: string[];
}

type ExpandMode = "multi" | "single";

interface ProfessionalTimelineProps {
  data: TimelineItemData[];
  defaultExpandedIds?: string[];
  expandMode?: ExpandMode;
}

const timelineData: TimelineItemData[] = [
  {
    id: "prof-exp-1",
    title: "Junior Frontend Developer",
    type: "Full-time",
    company: "TGM Research",
    duration: "7.2025—Present",
    icon: Code,
    responsibilities: [
      "Collaborate with colleagues to develop of complex React applications with TypeScript. Optimize performance for the website",
      "Architect scalable frontend solutions using Next.js and modern tooling.",
      "Collaborate with design and backend teams to deliver high-quality products.",
      "Collaborated in an agile development environment.",
    ],
    skills: [
      "React",
      "Next.js",
      "Tailwind CSS",
      "Shadcn",
      "MaterialUI",
      "Zustand",
      "Redux Toolkit",
    ],
  },
  {
    id: "prof-exp-2",
    title: "Junior Frontend Developer",
    type: "Full-time",
    company: "CAS Corporation",
    duration: "9.2024 - 5.2025",
    icon: Palette,
    responsibilities: [
      "Worked as a Front-end Developer contributing to the development and maintenance of the company's internal CRM web application.",
      "Implemented new features and resolved bugs to enhance user experience and ensure smooth daily operations acrossdepartments.",
      "Built SEO-optimized landing pages using Next.js, enhancing online visibility and improving organic search performance.",
    ],
    skills: ["Angular", "TypeScript", "MaterialUI", "Next.js"],
  },
  {
    id: "prof-exp-3",
    title: "Frontend Developer (Short-term Contract)",
    type: "Full-time",
    company: "Likelion",
    duration: "05.2024—8.2024",
    icon: Code,
    responsibilities: [
      "Collaborated on a short-term internal project to develop a real-time web-based chat application for internal teamcommunication.",
      "Worked closely with back-end developers and designers to integrate APIs, manage chat states, and implement UIfeatures such as message grouping, typing indicators, and notifications.",
      "Contributed to optimizing performance and improving user experience through efficient component rendering and state management.",
    ],
    skills: ["React", "TailwindCSS", "JavaScript", "CSS", "HTML"],
  },
  {
    id: "prof-exp-4",
    title: "Game Developer Intern",
    type: "Full-time",
    company: "Onechain Game Studio",
    duration: "05.2023—8.2023",
    icon: Code,
    responsibilities: [
      "Implemented gameplay mechanics, player controls, scoring systems, and level progression",
      "Designed and developed hypercasual games using Cocos Creator and TypeScript.",
    ],
    skills: ["Typescript", "Cocos Creator"],
  },
];

interface TimelineItemContentProps {
  item: TimelineItemData;
}

const TimelineItemContent = memo(function TimelineItemContent({ item }: TimelineItemContentProps) {
  return (
    <div className="mt-6 space-y-6 animate-in slide-in-from-top-1 duration-200">
      {/* Responsibilities */}
      <div className="space-y-3">
        {item.responsibilities.map((responsibility, idx) => (
          <div key={`${item.id}-resp-${idx}`} className="flex items-start gap-3 group">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 shrink-0 group-hover:bg-gray-500 dark:bg-gray-500 transition-colors duration-200" />
            <p className="text-sm text-gray-400 leading-relaxed">{responsibility}</p>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        {item.skills.map((skill, skillIdx) => (
          <Badge key={`${item.id}-skill-${skillIdx}`} variant="secondary">
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  );
});
TimelineItemContent.displayName = "TimelineItemContent";

interface TimelineItemProps {
  item: TimelineItemData;
  expanded: boolean;
  onToggle: (id: string) => void;
  index: number;
}

const TimelineItem = memo(function TimelineItem({ item, expanded, onToggle }: TimelineItemProps) {
  const Icon = item.icon;
  const headerId = `timeline-header-${item.id}`;
  const contentId = `timeline-content-${item.id}`;

  return (
    <div className="relative group">
      {/* Connecting line with gradient - now always visible */}
      <div className="hidden md:block absolute left-6 top-0 bottom-0 w-0.5 bg-linear-to-b from-transparent via-gray-700 to-transparent" />

      {/* Timeline node */}
      <div className="absolute left-4 top-6 w-4 h-4 bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center transform transition-all duration-200 z-10">
        <div className="w-2 h-2 bg-slate-900 dark:bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Main content card */}
      <div className="ml-12 mb-8">
        <div
          className={`
          bg-[#0f1115] rounded-lg border border-transparent hover:border-cyan-500/30
          group
          transition-all duration-300
          ${expanded ? "shadow-lg" : "shadow-none hover:shadow-lg"}
        `}
        >
          {/* Header */}
          <button
            id={headerId}
            className="w-full text-left p-4 md:p-5 group/button cursor-pointer transition-colors duration-200 rounded-t-lg"
            onClick={() => onToggle(item.id)}
            aria-expanded={expanded}
            aria-controls={contentId}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-md">
                    <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white leading-tight truncate">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 ml-11 border-slate-200 dark:border-slate-800">
                  <Badge variant="secondary" className="text-xs">
                    {item.type}
                  </Badge>
                  <span className="text-sm text-gray-400">{item.duration}</span>
                </div>
                <span className="text-white text-sm ml-11">{item.company}</span>
              </div>

              <div
                className={`
                text-slate-400 dark:text-slate-600
                transition-transform duration-200
                ${expanded ? "rotate-180" : ""}
              `}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* Expandable content */}
          {expanded && (
            <div
              id={contentId}
              role="region"
              aria-labelledby={headerId}
              className="px-6 pb-6 border-t border-slate-100 dark:border-slate-900"
            >
              <TimelineItemContent item={item} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
TimelineItem.displayName = "TimelineItem";

export function ProfessionalTimeline({
  data,
  defaultExpandedIds,
  expandMode = "multi",
}: ProfessionalTimelineProps) {
  const initial = defaultExpandedIds ?? data.map((item) => item.id);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(initial));

  const onToggle = useCallback(
    (id: string) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (expandMode === "single") {
          return prev.has(id) ? new Set() : new Set([id]);
        }
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [expandMode],
  );

  return (
    <div className="relative">
      {data.map((item, index) => (
        <TimelineItem
          key={item.id}
          item={item}
          expanded={expanded.has(item.id)}
          onToggle={onToggle}
          index={index}
        />
      ))}
    </div>
  );
}

export default function ExperienceSection() {
  return (
    <div className="transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-white dark:text-slate-50 mb-3">
            Experience
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            A comprehensive overview of my career journey and professional achievements.
          </p>
        </header>

        <ProfessionalTimeline data={timelineData} expandMode="multi" />
      </div>
    </div>
  );
}
