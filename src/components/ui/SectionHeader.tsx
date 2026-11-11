import { motion } from "motion/react";
import { fadeUp } from "../../lib/motion";

interface SectionHeaderProps {
  id: string;
  label: string;
  title: [string, string];
}

export function SectionHeader({ id, label, title }: SectionHeaderProps) {
  return (
    <motion.div {...fadeUp(0, 40)} className="mb-16 border-b border-white/5 pb-8">
      <span className="font-mono text-cyan-500 text-[11px] mb-2 block uppercase tracking-widest">
        // {label}
      </span>
      <h2
        id={id}
        className="text-4xl md:text-5xl font-bold uppercase tracking-tighter leading-none text-[#E0E0E6]"
      >
        {title[0]}
        <br />
        {title[1]}
      </h2>
    </motion.div>
  );
}
