"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useIntro } from "./IntroProvider";
import {
  MARK_HEIGHT,
  MARK_PATH,
  MARK_WIDTH,
  MARK_ZOOM_POINT,
  MARK_ZOOM_RADIUS,
} from "./logo-mark";

gsap.registerPlugin(useGSAP);

/** Counter eases to this while assets load, then finishes HOLD_AT -> 100. */
const HOLD_AT = 90;
const MIN_SECONDS = 1.4;
const MAX_SECONDS = 9;

/** Resting size of the mark on screen. */
const MARK_PX = 72;

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
      const labelEl = q("[data-loader=label]")[0];
      const holeEl = q("[data-loader=hole]")[0];
      const inkEl = q("[data-loader=ink]")[0];
      const fillEl = q("[data-loader=fill]")[0];

      const html = document.documentElement;
      const prevOverflow = html.style.overflow;
      html.style.overflow = "hidden";

      let disposed = false;
      const progress = { v: 0 };
      const zoom = { p: 0 };

      // Places the monogram on screen. p=0: centred at its resting size.
      // p=1: scaled until the thickest point of the glyph covers the viewport.
      const place = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const cx = w / 2;
        const cy = h / 2;
        const s0 = Math.min(MARK_PX, w * 0.22) / MARK_WIDTH;
        const sEnd = ((Math.hypot(w, h) / 2) / MARK_ZOOM_RADIUS) * 1.15;
        const s = s0 * Math.pow(sEnd / s0, zoom.p);

        // Zoom point travels from its resting spot to the screen centre.
        const restX = cx + s0 * (MARK_ZOOM_POINT.x - MARK_WIDTH / 2);
        const restY = cy + s0 * (MARK_ZOOM_POINT.y - MARK_HEIGHT / 2);
        const zx = restX + (cx - restX) * zoom.p;
        const zy = restY + (cy - restY) * zoom.p;

        const transform = `translate(${zx - s * MARK_ZOOM_POINT.x} ${zy - s * MARK_ZOOM_POINT.y}) scale(${s})`;
        holeEl.setAttribute("transform", transform);
        inkEl.setAttribute("transform", transform);
      };

      const paint = () => {
        countEl.textContent = String(Math.round(progress.v)).padStart(3, "0");
        // The monogram fills from the bottom as the page loads.
        gsap.set(fillEl, { attr: { y: MARK_HEIGHT * (1 - progress.v / 100) } });
      };

      const teardown = () => {
        if (disposed) return;
        disposed = true;
        window.removeEventListener("resize", place);
        html.style.overflow = prevOverflow;
      };

      window.addEventListener("resize", place);
      place();
      paint();

      gsap.from([inkEl, labelEl], {
        autoAlpha: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1,
      });

      // Phase A: optimistic progress while assets load
      gsap.to(progress, {
        v: HOLD_AT,
        duration: 1.6,
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

      // Outro: the solid mark vanishes, leaving a window onto the page that zooms to full screen
      const outro = contextSafe(() => {
        gsap
          .timeline({
            onComplete: () => {
              gsap.set(rootEl, { display: "none" });
              teardown();
            },
          })
          .to(labelEl, { autoAlpha: 0, duration: 0.2, ease: "power2.out" }, 0)
          .to(inkEl, { autoAlpha: 0, duration: 0.12, ease: "none" }, 0.1)
          .to(
            zoom,
            { p: 1, duration: 1.35, ease: "power3.in", onUpdate: place },
            0.1,
          )
          .call(markReady, undefined, 0.9);
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
      className="pointer-events-auto fixed inset-0 z-[100] overflow-hidden"
    >
      <noscript>
        <style>{`[data-loader=root]{display:none!important}`}</style>
      </noscript>
      <span className="sr-only">{t("loading")}</span>

      {/* Solid colour with the monogram cut out of it: the page shows through the cut-out. */}
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask
            id="loader-hole"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="100%"
            height="100%"
          >
            <rect width="100%" height="100%" fill="#fff" />
            <g data-loader="hole" transform="scale(0)">
              <path d={MARK_PATH} fill="#000" />
            </g>
          </mask>
          <clipPath id="loader-fill">
            <rect
              data-loader="fill"
              x="0"
              y={MARK_HEIGHT}
              width={MARK_WIDTH}
              height={MARK_HEIGHT}
            />
          </clipPath>
        </defs>

        <rect
          width="100%"
          height="100%"
          mask="url(#loader-hole)"
          className="fill-primary"
        />

        {/* Loading state of the mark: sits exactly over the cut-out until the zoom starts. */}
        <g data-loader="ink" transform="scale(0)">
          <path d={MARK_PATH} className="fill-primary" />
          <path d={MARK_PATH} className="fill-primary-foreground" opacity={0.16} />
          <path
            d={MARK_PATH}
            className="fill-primary-foreground"
            clipPath="url(#loader-fill)"
          />
        </g>
      </svg>

      <p
        aria-hidden
        data-loader="label"
        className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-2 pb-6 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.16em] text-primary-foreground sm:pb-8"
      >
        <span>{t("status")}</span>
        <span data-loader="count" className="tabular-nums">
          000
        </span>
      </p>
    </div>
  );
}
