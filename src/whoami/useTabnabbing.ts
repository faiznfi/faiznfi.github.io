import { useEffect, useState } from "react";

const FAKE_TITLE = "⚠ Session expired — sign in again";
const FAKE_FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23dc2626"/><text x="8" y="12" font-size="12" text-anchor="middle" fill="white">!</text></svg>',
  );

function setFavicon(href: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = href;
}

/**
 * Tabnabbing demo: while the visitor is looking at another tab, this tab
 * rewrites its own title and favicon to look like a login alert. When they
 * come back, it restores itself and reports that it changed while hidden.
 * It only changes this tab's own title/icon; it never opens or fakes a login.
 */
export function useTabnabbing(enabled: boolean) {
  const [swapped, setSwapped] = useState(false);
  const [caughtAt, setCaughtAt] = useState<Date>();

  useEffect(() => {
    if (!enabled) return;
    const originalTitle = document.title;
    const originalIcon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.href ?? "/favicon.ico";
    let timer: number | undefined;

    const onHide = () => {
      if (document.visibilityState !== "hidden") return;
      // Wait a moment, as a real attack would, so the change isn't visible as you leave.
      timer = window.setTimeout(() => {
        document.title = FAKE_TITLE;
        setFavicon(FAKE_FAVICON);
        setSwapped(true);
      }, 1500);
    };
    const onShow = () => {
      if (document.visibilityState !== "visible") return;
      if (timer) clearTimeout(timer);
      document.title = originalTitle;
      setFavicon(originalIcon);
      setSwapped((was) => {
        if (was) setCaughtAt(new Date());
        return false;
      });
    };

    document.addEventListener("visibilitychange", onHide);
    document.addEventListener("visibilitychange", onShow);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      document.removeEventListener("visibilitychange", onShow);
      if (timer) clearTimeout(timer);
      document.title = originalTitle;
      setFavicon(originalIcon);
    };
  }, [enabled]);

  return { swapped, caughtAt, fakeTitle: FAKE_TITLE };
}
