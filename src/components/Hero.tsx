import { motion } from "motion/react";
import { Terminal, Code2 } from "lucide-react";
import { resumeData } from "../data";

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden border-b border-white/5 bg-[#0F0F12]">
      {/* Background futuristic elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }}></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        {/* Futuristic HUD elements */}
        <div className="absolute top-10 left-10 w-4 h-4 border-t border-l border-cyan-500/50"></div>
        <div className="absolute top-10 right-10 w-4 h-4 border-t border-r border-cyan-500/50"></div>
        <div className="absolute bottom-10 left-10 w-4 h-4 border-b border-l border-cyan-500/50"></div>
        <div className="absolute bottom-10 right-10 w-4 h-4 border-b border-r border-cyan-500/50"></div>
        
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
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ amount: 0.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-block px-2 py-1 bg-cyan-500/10 text-cyan-500 text-[10px] font-mono mb-8 tracking-widest uppercase border border-cyan-500/20"
          >
            PROFILE_v2.0
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.9, filter: "blur(12px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ amount: 0.1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter leading-none mb-6 italic serif text-[#E0E0E6] flex flex-col md:flex-row items-center justify-center gap-x-6"
          >
            <span className="font-bold not-italic">Faiz</span> <span>Insani.</span>
          </motion.h1>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-sm md:text-base font-mono text-cyan-500 mb-12 tracking-widest uppercase"
          >
            [&nbsp;{resumeData.title}&nbsp;]
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            <a href="#projects" className="px-8 py-4 bg-white text-black font-bold text-xs tracking-widest uppercase hover:bg-cyan-400 transition-colors flex items-center gap-2 group">
              <Terminal className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Explore Projects</span>
            </a>
            <a href="#resume" className="px-8 py-4 border border-white/20 text-white font-bold text-xs tracking-widest uppercase hover:bg-white/10 hover:border-cyan-500/50 transition-colors flex items-center gap-2 group">
              <Code2 className="w-4 h-4 group-hover:scale-110 transition-transform text-cyan-500" />
              <span>View Resume</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
