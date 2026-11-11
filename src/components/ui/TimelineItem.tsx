import type { ReactNode } from "react";
import { motion } from "motion/react";
import { fadeLeft } from "../../lib/motion";
import { useInViewOnce } from "../../hooks/useInViewOnce";

interface TimelineItemProps {
  index: number;
  children: ReactNode;
  /** Called once when the item scrolls into view (used for analytics). */
  onView?: () => void;
}

export function TimelineItem({ index, children, onView }: TimelineItemProps) {
  const ref = useInViewOnce<HTMLLIElement>(() => onView?.());

  return (
    <motion.li
      ref={ref}
      {...fadeLeft(index * 0.1)}
      className="relative pl-6 border-l border-white/10 hover:border-cyan-500/50 transition-colors"
    >
      <span aria-hidden="true" className="absolute -left-[5px] top-2 w-2 h-2 bg-cyan-500 rotate-45" />
      {children}
    </motion.li>
  );
}

interface TimelineHeadingProps {
  icon: ReactNode;
  children: string;
}

export function TimelineHeading({ icon, children }: TimelineHeadingProps) {
  return (
    <motion.div {...fadeLeft()} className="flex items-center gap-3 mb-10">
      <div aria-hidden="true" className="w-8 h-8 border border-white/10 flex items-center justify-center text-cyan-500">
        {icon}
      </div>
      <h3 className="text-xl font-bold uppercase tracking-widest">{children}</h3>
    </motion.div>
  );
}
