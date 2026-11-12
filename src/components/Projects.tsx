import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Fingerprint, BarChart3, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { projectsData } from "../data";
import type { ProjectIcon } from "../types";
import { fadeScale } from "../lib/motion";
import { track, trackProjectListView, trackProjectSelect } from "../lib/analytics";
import { useInViewOnce } from "../hooks/useInViewOnce";
import { SectionHeader } from "./ui/SectionHeader";
import { TagList } from "./ui/Tag";

const iconMap: Record<ProjectIcon, ReactNode> = {
  "fingerprint": <Fingerprint className="w-6 h-6 text-cyan-400" />,
  "bar-chart": <BarChart3 className="w-4 h-4 text-cyan-400" />,
  "map-pin": <MapPin className="w-4 h-4 text-purple-400" />,
  sparkles: <Sparkles className="w-4 h-4 text-pink-400" />,
};

export function Projects() {
  const sectionRef = useInViewOnce<HTMLElement>(() => track("section_view", { section_name: "projects" }));
  const listRef = useInViewOnce<HTMLUListElement>(() => trackProjectListView(projectsData));

  return (
    <section ref={sectionRef} id="projects" aria-labelledby="projects-title" className="py-24 relative z-10 bg-[#0A0A0C] scroll-mt-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <SectionHeader id="projects-title" label="VIBE_CODING_LAB" title={["Intelligence", "Modules"]} />

        <ul ref={listRef} className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-white/5 p-1" role="list">
          {projectsData.map((project, index) => (
            <motion.li
              key={project.id}
              {...fadeScale(index * 0.1)}
              className="group relative bg-[#121216] hover:bg-[#0F0F12] border border-transparent hover:border-cyan-500/30 transition-colors duration-300 flex flex-col"
            >
              <article className="p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-cyan-500 text-[11px] uppercase tracking-widest">
                    [{String(index + 1).padStart(2, "0")}] MODULE
                  </span>
                  <div
                    aria-hidden="true"
                    className="w-8 h-8 rounded-full border border-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors"
                  >
                    {iconMap[project.icon]}
                  </div>
                </div>

                <h3 className="text-3xl font-bold mb-4 uppercase tracking-tighter leading-none text-[#E0E0E6] group-hover:text-cyan-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-white/60 text-sm mb-8 flex-1 leading-relaxed max-w-sm">{project.description}</p>

                <div className="mb-8">
                  <TagList items={project.tags} />
                </div>

                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackProjectSelect(project, index)}
                  aria-label={`Open ${project.title} (opens in a new tab)`}
                  className="mt-auto inline-flex items-center gap-2 text-xs font-mono text-white underline underline-offset-8 decoration-cyan-500/50 hover:text-cyan-400 transition-colors group/link uppercase tracking-widest"
                >
                  <span>LAUNCH_INTERFACE</span>
                  <ArrowRight aria-hidden="true" className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </article>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
