import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { resumeData } from "../data";

const navLinks = [
  { name: "Home", href: "#top" },
  { name: "Projects", href: "#projects" },
  { name: "Resume", href: "#resume" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // While the mobile menu is open: lock page scroll and close on Escape.
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 ${
          isScrolled ? "bg-[#0A0A0C]/90 backdrop-blur-md py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <a href="#top" className="flex items-center gap-3 text-white group" aria-label="faiznfi.systems — back to top">
            <div aria-hidden="true" className="w-8 h-8 bg-cyan-500 rounded-sm rotate-45 flex items-center justify-center">
              <span className="-rotate-45 font-bold text-[#0A0A0C] text-sm">F</span>
            </div>
            <span className="font-mono tracking-tighter text-lg font-bold uppercase">faiznfi.systems</span>
          </a>

          {/* Desktop Nav */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest text-white/60">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="hover:text-cyan-400 transition-colors uppercase">
                <span aria-hidden="true">// </span>
                {link.name}
              </a>
            ))}
          </nav>

          <a
            href={`mailto:${resumeData.email}`}
            className="hidden md:inline-block px-4 py-2 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono hover:bg-cyan-500/10 transition-colors uppercase"
          >
            CONTACT_ME
          </a>

          {/* Mobile Toggle */}
          <button
            type="button"
            className="md:hidden p-2 -mr-2 text-white/60 hover:text-cyan-400"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <Menu className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-0 z-[60] bg-[#0F0F12] flex flex-col"
          >
            <div className="p-6 flex justify-end">
              <button
                type="button"
                className="text-white/60 hover:text-cyan-400 p-2"
                onClick={closeMenu}
                aria-label="Close menu"
                autoFocus
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex flex-col items-center justify-center flex-1 gap-8 font-mono tracking-widest">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={closeMenu}
                  className="text-xl uppercase text-white/60 hover:text-cyan-400 transition-colors"
                >
                  <span aria-hidden="true">// </span>
                  {link.name}
                </a>
              ))}
              <a
                href={`mailto:${resumeData.email}`}
                className="mt-8 px-6 py-3 border border-cyan-500/30 text-cyan-400 text-xs font-mono hover:bg-cyan-500/10 transition-colors uppercase"
                onClick={closeMenu}
              >
                CONTACT_ME
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
