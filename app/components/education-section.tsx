"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import clsx from "clsx";

export type EducationItem = {
  id: string;
  school: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  tags?: string[];
  logoSrc?: string;
};

interface EducationSectionProps {
  title?: string;
  subtitle?: string;
  items: EducationItem[];
}

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 160, damping: 18 } },
};

export const EducationSection: React.FC<EducationSectionProps> = ({
  title = "Education",
  subtitle,
  items,
}) => {
  return (
    <section id="education" className="py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">{title}</h3>
            {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <Badge className=" from-cyan-500 to-pink-500 text-white shadow-md">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {items.length} entries
            </span>
          </Badge>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
          className="relative"
        >
          {/* Vertical timeline line on md+ */}
          <div className="hidden md:block absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />

          <div className="space-y-6 md:space-y-8">
            {items.map((it, idx) => (
              <motion.article key={it.id} className={clsx("relative md:pl-16", "group")}>
                {/* Timeline dot (desktop) */}
                <div className="hidden md:absolute md:left-0 md:top-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.15)]" />
                  </div>
                </div>

                <Card className="bg-[#0f1115] border border-transparent hover:border-cyan-500/30 transition-all duration-300 shadow-lg">
                  <CardHeader className="p-4 md:p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <CardTitle className="text-lg font-semibold text-white leading-tight truncate">
                              {it.degree} {it.field ? `· ${it.field}` : ""}
                            </CardTitle>
                            <p className="text-sm text-gray-300 truncate">{it.school}</p>
                          </div>

                          <div className="flex flex-col items-end text-right">
                            <span className="text-sm text-gray-400">
                              {formatRange(it.startDate, it.endDate)}
                            </span>
                            {it.tags && it.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {it.tags.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs px-2 py-1"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {it.description && (
                          <CardContent className="p-0 mt-3">
                            <p className="text-sm text-gray-400 leading-relaxed">
                              {it.description}
                            </p>
                          </CardContent>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

function formatRange(start?: string, end?: string) {
  if (!start && !end) return "";
  if (!start) return `${end ?? ""}`;
  if (!end) return `${start} — Present`;
  return `${start} — ${end}`;
}

export default EducationSection;
