import type { MotionProps } from "motion/react";

/** Default viewport: animate once when 20% of the element is visible. */
const viewport = { once: true, amount: 0.2 } as const;

/** Fade + slide up. Used for section headers and sidebar cards. */
export function fadeUp(delay = 0, distance = 20): MotionProps {
  return {
    initial: { opacity: 0, y: distance },
    whileInView: { opacity: 1, y: 0 },
    viewport,
    transition: { duration: 0.6, delay, ease: "easeOut" },
  };
}

/** Fade + slide in from the left. Used for timeline items. */
export function fadeLeft(delay = 0): MotionProps {
  return {
    initial: { opacity: 0, x: -20 },
    whileInView: { opacity: 1, x: 0 },
    viewport,
    transition: { duration: 0.5, delay, ease: "easeOut" },
  };
}

/** Fade + slight scale. Used for project cards. */
export function fadeScale(delay = 0): MotionProps {
  return {
    initial: { opacity: 0, scale: 0.95 },
    whileInView: { opacity: 1, scale: 1 },
    viewport,
    transition: { duration: 0.5, delay, ease: "easeOut" },
  };
}
