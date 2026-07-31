import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { Projects } from "./components/Projects";
import { Resume } from "./components/Resume";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#E0E0E6] font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navigation />
      <main className="pt-20">
        <Hero />
        <Projects />
        <Resume />
      </main>
      
      <footer className="px-6 md:px-8 py-6 md:py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-white/30 border-t border-white/5 bg-[#0F0F12]">
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <span>STATUS: <span className="text-cyan-400">OPTIMIZED</span></span>
          <span>LOC: <span className="text-white/60">ID_JKT</span></span>
          <span>VIBE: <span className="text-white/60">FUTURISM_CORE</span></span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 items-center">
          <a href="https://faiznfi.github.io" target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest">faiznfi.github.io</a>
          <span className="text-white/60">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
