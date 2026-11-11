import { motion } from "motion/react";
import { Terminal, Code2 } from "lucide-react";
import { resumeData } from "../data";
import { track } from "../lib/analytics";

// The hero is above the fold, so it animates on mount instead of on scroll.
const enter = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: "easeOut" as const },
});

export function Hero() {
  const [firstName, ...rest] = resumeData.name.split(" ");
  const lastName = rest.join(" ");

  return (
    <section
      aria-label="Introduction"
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden border-b border-white/5 bg-[#0F0F12]"
    >
      {/* Decorative background */}
      <div aria-hidden="true" className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] motion-safe:animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] motion-safe:animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* HUD corners */}
        <div className="absolute top-10 left-10 w-4 h-4 border-t border-l border-cyan-500/50" />
        <div className="absolute top-10 right-10 w-4 h-4 border-t border-r border-cyan-500/50" />
        <div className="absolute bottom-10 left-10 w-4 h-4 border-b border-l border-cyan-500/50" />
        <div className="absolute bottom-10 right-10 w-4 h-4 border-b border-r border-cyan-500/50" />

        <div className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-mono tracking-[0.2em] text-cyan-500/30 hidden lg:block uppercase">
          SYS_READY // VIBE_PROTOCOL: ACTIVE
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-[8px] font-mono tracking-[0.2em] text-cyan-500/30 hidden lg:block uppercase">
          LAT: -6.2088 // LNG: 106.8456
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <motion.div
            {...enter()}
            className="inline-block px-2 py-1 bg-cyan-500/10 text-cyan-500 text-[11px] font-mono mb-8 tracking-widest uppercase border border-cyan-500/20"
          >
            PROFILE_v2.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter leading-none mb-6 italic text-[#E0E0E6] flex flex-col md:flex-row items-center justify-center gap-x-6"
          >
            <span className="font-bold not-italic">{firstName}</span> <span>{lastName}.</span>
          </motion.h1>

          <motion.p
            {...enter(0.2)}
            className="text-sm md:text-base font-mono text-cyan-500 mb-12 tracking-widest uppercase"
          >
            [&nbsp;{resumeData.title}&nbsp;]
          </motion.p>

          <motion.div {...enter(0.4)} className="flex flex-wrap items-center justify-center gap-6">
            <a
              href="#projects"
              onClick={() => track("cta_click", { link_text: "Explore Projects", link_url: "#projects", click_location: "hero" })}
              className="px-8 py-4 bg-white text-black font-bold text-xs tracking-widest uppercase hover:bg-cyan-400 transition-colors flex items-center gap-2 group"
            >
              <Terminal aria-hidden="true" className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Explore Projects</span>
            </a>
            <a
              href="#resume"
              onClick={() => track("cta_click", { link_text: "View Resume", link_url: "#resume", click_location: "hero" })}
              className="px-8 py-4 border border-white/20 text-white font-bold text-xs tracking-widest uppercase hover:bg-white/10 hover:border-cyan-500/50 transition-colors flex items-center gap-2 group"
            >
              <Code2 aria-hidden="true" className="w-4 h-4 group-hover:scale-110 transition-transform text-cyan-500" />
              <span>View Resume</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
