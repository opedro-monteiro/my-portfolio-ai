"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useIntro } from "./IntroProvider";

gsap.registerPlugin(useGSAP);

/** Counter eases to this while assets load, then finishes HOLD_AT -> 100. */
const HOLD_AT = 90;
const MIN_SECONDS = 1.1;
const MAX_SECONDS = 9;

export function IntroLoader() {
  const t = useTranslations("Loader");
  const { markReady } = useIntro();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const rootEl = root.current;
      if (!rootEl || !contextSafe) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(rootEl, { display: "none" });
        markReady();
        return;
      }

      const q = gsap.utils.selector(rootEl);
      const countEl = q("[data-loader=count]")[0] as HTMLElement;
      const barEl = q("[data-loader=bar]")[0];
      const countMask = q("[data-loader=count-mask]")[0];

      const html = document.documentElement;
      const prevOverflow = html.style.overflow;
      html.style.overflow = "hidden";

      let disposed = false;
      const progress = { v: 0 };
      const paint = () => {
        countEl.textContent = String(Math.round(progress.v));
        gsap.set(barEl, { scaleX: progress.v / 100 });
      };
      const teardown = () => {
        if (disposed) return;
        disposed = true;
        html.style.overflow = prevOverflow;
      };

      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .from(countMask, { yPercent: 105, duration: 0.7, ease: "expo.out" })
        .from(barEl, { autoAlpha: 0, duration: 0.4 }, 0.1);

      // Phase A: optimistic progress while assets load
      gsap.to(progress, {
        v: HOLD_AT,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: paint,
      });

      const pageLoaded = new Promise<void>((resolve) => {
        if (document.readyState === "complete") resolve();
        else window.addEventListener("load", () => resolve(), { once: true });
      });
      const minTime = new Promise<void>((resolve) => {
        gsap.delayedCall(MIN_SECONDS, resolve);
      });
      const maxTime = new Promise<void>((resolve) => {
        gsap.delayedCall(MAX_SECONDS, resolve);
      });
      const fontsReady = document.fonts.ready.then(() => {});

      // Outro: counter leaves, overlay lifts to reveal the interface
      const outro = contextSafe(() => {
        gsap
          .timeline({
            onComplete: () => {
              gsap.set(rootEl, { display: "none" });
              teardown();
            },
          })
          .to(countMask, { yPercent: -105, duration: 0.45, ease: "power3.in" }, 0)
          .to(barEl, { autoAlpha: 0, duration: 0.3 }, 0)
          .call(markReady, undefined, 0.3)
          .to(rootEl, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, 0.3);
      });

      const finish = contextSafe(() => {
        if (disposed) return;
        gsap.to(progress, {
          v: 100,
          duration: 0.5,
          ease: "power2.inOut",
          overwrite: true,
          onUpdate: paint,
          onComplete: outro,
        });
      });

      Promise.race([
        Promise.all([pageLoaded, fontsReady, minTime]),
        maxTime,
      ]).then(finish);

      return teardown;
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      data-loader="root"
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] overflow-hidden bg-black text-white"
    >
      <noscript>
        <style>{`[data-loader=root]{display:none!important}`}</style>
      </noscript>
      <span className="sr-only">{t("loading")}</span>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 flex items-start gap-1 px-[18px] pb-4 sm:px-11 sm:pb-6"
      >
        <div data-loader="count-mask" className="overflow-hidden">
          <span
            data-loader="count"
            className="block text-[clamp(4.5rem,13vw,11rem)] font-semibold leading-none tracking-[-0.06em] tabular-nums"
          >
            0
          </span>
        </div>
        <span className="mt-[0.35em] font-mono text-[clamp(1rem,2vw,1.75rem)] font-medium text-white/50">
          %
        </span>
      </div>

      <div
        aria-hidden
        data-loader="bar"
        className="absolute inset-x-0 bottom-0 h-px bg-primary"
        style={{ transform: "scaleX(0)", transformOrigin: "0 50%" }}
      />
    </div>
  );
}
