import { motion } from "motion/react";
import { BarChart3, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { projectsData } from "../data";

const iconMap: Record<string, React.ReactNode> = {
  "bar-chart": <BarChart3 className="w-6 h-6 text-cyan-400" />,
  "map-pin": <MapPin className="w-6 h-6 text-purple-400" />,
  "sparkles": <Sparkles className="w-6 h-6 text-pink-400" />
};

export function Projects() {
  return (
    <section id="projects" className="py-24 relative z-10 bg-[#0A0A0C]">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="mb-16 border-b border-white/5 pb-8"
        >
          <span className="font-mono text-cyan-500 text-[10px] mb-2 block uppercase tracking-widest">// VIBE_CODING_LAB</span>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter leading-none text-[#E0E0E6]">Intelligence<br/>Modules</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-white/5 p-1">
          {projectsData.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-[#121216] hover:bg-[#0F0F12] border border-transparent hover:border-cyan-500/30 transition-all duration-300 flex flex-col"
            >
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-cyan-500 text-[10px] uppercase tracking-widest">
                    [0{index + 1}] MODULE
                  </span>
                  <div className="w-8 h-8 rounded-full border border-cyan-500/20 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500/10 transition-colors">
                    {iconMap[project.icon] || <Sparkles className="w-4 h-4" />}
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold mb-4 uppercase tracking-tighter leading-none text-[#E0E0E6] group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                <p className="text-white/40 text-xs mb-8 flex-1 uppercase leading-relaxed max-w-sm">{project.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {project.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 text-[10px] font-mono bg-white/5 border border-white/10 text-white/60 uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <a 
                  href={project.link} 
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto inline-flex items-center gap-2 text-xs font-mono text-white underline underline-offset-8 decoration-cyan-500/50 hover:text-cyan-400 transition-colors group/link uppercase tracking-widest"
                >
                  <span>LAUNCH_INTERFACE</span>
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
