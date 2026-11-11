import { useEffect, useRef } from "react";

/**
 * Calls `onView` once, when the element's top edge crosses the middle of the
 * viewport. This uses rootMargin rather than an intersection-ratio threshold,
 * so it also works for elements taller than the screen. A ratio threshold
 * like 0.5 can never be reached by a tall section on mobile.
 */
export function useInViewOnce<T extends Element>(onView: () => void) {
  const ref = useRef<T>(null);
  const callback = useRef(onView);

  useEffect(() => {
    callback.current = onView;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback.current();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -50% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return ref;
}
