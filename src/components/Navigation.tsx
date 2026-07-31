import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Terminal } from "lucide-react";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Projects", href: "#projects" },
    { name: "Resume", href: "#resume" },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-[#0A0A0C]/90 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6 border-b border-white/5"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <a href="#" className="flex items-center gap-3 text-white group">
            <div className="w-8 h-8 bg-cyan-500 rounded-sm rotate-45 flex items-center justify-center">
              <span className="-rotate-45 font-bold text-[#0A0A0C] text-sm">F</span>
            </div>
            <span className="font-mono tracking-tighter text-lg font-bold uppercase">faiznfi.systems</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest text-white/50">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="hover:text-cyan-400 transition-colors uppercase"
              >
                // {link.name}
              </a>
            ))}
          </nav>

          <a 
            href="mailto:faiznfi@gmail.com"
            className="hidden md:inline-block px-4 py-2 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono hover:bg-cyan-500/10 transition-colors uppercase"
          >
            CONTACT_ME
          </a>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-white/50 hover:text-cyan-400"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-0 z-[60] bg-[#0F0F12] flex flex-col"
          >
            <div className="p-6 flex justify-end">
              <button 
                className="text-white/50 hover:text-cyan-400 p-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center flex-1 gap-8 font-mono tracking-widest">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xl uppercase text-white/50 hover:text-cyan-400 transition-colors"
                >
                  // {link.name}
                </a>
              ))}
              <a 
                href="mailto:faiznfi@gmail.com"
                className="mt-8 px-6 py-3 border border-cyan-500/30 text-cyan-400 text-xs font-mono hover:bg-cyan-500/10 transition-colors uppercase"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                CONTACT_ME
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
