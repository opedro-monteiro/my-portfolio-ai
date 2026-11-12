"use client";

import { useRef, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useIntro } from "@/components/intro/IntroProvider";

type Theme = "light" | "dark";

const subscribe = (notify: () => void) => {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
};
const getSnapshot = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";
const applyTheme = (next: Theme) => {
  const root = document.documentElement;
  root.dataset.theme = next;
  root.style.colorScheme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {}
};
const getServerSnapshot = (): Theme => "dark";

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("Header");
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { replay } = useIntro();
  const icon = useRef<HTMLSpanElement>(null);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || !document.startViewTransition) {
      applyTheme(next);
      if (reduced) return;
    } else {
      // Circular reveal growing from the toggle to the farthest corner.
      const rect = e.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      const transition = document.startViewTransition(() => applyTheme(next));
      transition.ready.then(() => {
        // Entrance animations replay underneath the expanding circle.
        replay();
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 700,
            easing: "cubic-bezier(.65,0,.35,1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      });
    }
    // One-shot tween on the icon; finishes on its own, nothing to clean up.
    gsap.fromTo(
      icon.current,
      { rotate: -90, scale: 0.4, autoAlpha: 0 },
      { rotate: 0, scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2)" },
    );
  };

  const label = theme === "dark" ? t("themeToLight") : t("themeToDark");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`flex size-9 shrink-0 items-center justify-center rounded-[7px] text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className ?? ""}`}
    >
      <span ref={icon} className="inline-flex">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {theme === "dark" ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          ) : (
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
          )}
        </svg>
      </span>
    </button>
  );
}
