"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { useIntro } from "@/components/intro/IntroProvider";

gsap.registerPlugin(useGSAP, SplitText);

const STACK = [
  { key: "react", icon: "/react.svg" },
  { key: "node", icon: "/node.svg" },
  { key: "typescript", icon: "/typescript.svg" },
  // aws.svg is navy: invert + hue-rotate keeps the orange, lightens the navy on the dark theme
  {
    key: "aws",
    icon: "/aws.svg",
    className: "[:root[data-theme=dark]_&]:[filter:invert(1)_hue-rotate(180deg)]",
  },
  { key: "ai", icon: null },
] as const;

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const BUTTON = `inline-flex h-[50px] w-fit items-center gap-2 rounded-[10px] px-6 text-[16px] md:h-[min(50px,6.2svh)] md:px-[min(1.5rem,3svh)] md:text-[length:min(16px,2.2svh)] transition-colors ${FOCUS}`;

function SparklesIcon({ label }: { label: string }) {
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 24 24"
      className="size-9 md:size-[min(2.25rem,3.8svh)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.9 4.6 11 8.3a2 2 0 0 0 1.3 1.3l3.7 1.1-3.7 1.1a2 2 0 0 0-1.3 1.3L9.9 17l-1.1-3.9a2 2 0 0 0-1.3-1.3L3.8 10.7l3.7-1.1a2 2 0 0 0 1.3-1.3ZM18 3v4M20 5h-4M18 17v4M20 19h-4" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function Hero() {
  const t = useTranslations("Hero");
  const { ready, replayKey } = useIntro();
  const root = useRef<HTMLElement>(null);

  // Runs once the loader has revealed the interface.
  useGSAP(
    () => {
      if (!ready) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(root);

      const photo = q("[data-hero=photo]");
      const photoWrap = q("[data-hero=photo-wrap]");
      const glow = q("[data-hero=glow]");

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        // Portrait: curtain wipe up from the base while the image settles from a zoom
        .fromTo(
          photoWrap,
          { clipPath: "inset(100% -60% 0% 0%)" },
          {
            clipPath: "inset(0% -60% 0% 0%)",
            duration: 1.3,
            ease: "power4.inOut",
            clearProps: "clipPath",
          },
          0,
        )
        .from(
          photo,
          { scale: 1.22, yPercent: 8, transformOrigin: "50% 100%", duration: 1.8 },
          0,
        )
        .from(
          glow,
          { autoAlpha: 0, scale: 0.8, transformOrigin: "50% 100%", duration: 1.8 },
          0.15,
        )
        .from(q("[data-hero=eyebrow]"), { autoAlpha: 0, y: 8, duration: 0.6 }, 0.1)
        .from(q("[data-hero=dot]"), { scale: 0, duration: 0.5, ease: "back.out(3)" }, 0.1);

      // Pointer parallax: portrait and glow drift in opposite directions (mouse only).
      // The photo is anchored to the base, so it only ever moves down/sideways.
      const photoX = gsap.quickTo(photo, "x", { duration: 0.9, ease: "power3.out" });
      const photoY = gsap.quickTo(photo, "y", { duration: 0.9, ease: "power3.out" });
      const glowX = gsap.quickTo(glow, "x", { duration: 1.2, ease: "power3.out" });
      const glowY = gsap.quickTo(glow, "y", { duration: 1.2, ease: "power3.out" });

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        const r = root.current?.getBoundingClientRect();
        if (!r) return;
        const nx = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
        const ny = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
        photoX(nx * 28);
        photoY(ny * 10);
        glowX(nx * -44);
        glowY((ny - 0.5) * -24);
      };
      const onLeave = () => {
        photoX(0);
        photoY(0);
        glowX(0);
        glowY(0);
      };

      const el = root.current;
      el?.addEventListener("pointermove", onMove);
      el?.addEventListener("pointerleave", onLeave);
      const detach = () => {
        el?.removeEventListener("pointermove", onMove);
        el?.removeEventListener("pointerleave", onLeave);
      };

      // Headline: one masked line-reveal per block; re-splits on resize/font load.
      SplitText.create(q("[data-hero=line]"), {
        type: "lines",
        mask: "lines",
        linesClass: "hero-line",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.09,
            delay: 0.15,
          }),
      });

      SplitText.create(q("[data-hero=text]"), {
        type: "lines",
        mask: "lines",
        linesClass: "hero-line",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.07,
            delay: 0.75,
          }),
      });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(
          q("[data-hero=cta]"),
          { autoAlpha: 0, y: 18, duration: 0.7, stagger: 0.09 },
          1.05,
        )
        .from(
          q("[data-hero=rule]"),
          { scaleX: 0, duration: 1.1, ease: "power3.inOut", transformOrigin: "0 50%" },
          1.2,
        )
        .from(
          q("[data-hero=stat]"),
          { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.07 },
          1.35,
        );

      return detach;
    },
    { scope: root, dependencies: [ready, replayKey], revertOnUpdate: true },
  );

  return (
    <section
      ref={root}
      id="home"
      className="relative grid w-full grid-cols-1 items-stretch overflow-clip border-b border-border md:h-(--hero-h) md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
    >
      {/* Copy */}
      <div className="relative z-10 flex flex-col justify-center px-[18px] pb-14 pt-[140px] sm:px-11 sm:pb-[72px] sm:pt-[88px] md:pb-[4svh] md:pt-[4svh]">
        <div>
          <p data-hero="eyebrow" className="mb-3 flex items-center gap-2.5 font-mono text-[11px] md:mb-[1.8svh] font-medium uppercase leading-[1.4] tracking-[0.16em] text-foreground/65">
            <span
              data-hero="dot"
              aria-hidden
              className="size-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]"
            />
            <span>{t("available")}</span>
          </p>

          <h1 className="font-sans text-[2.1rem] font-bold leading-[1.04] tracking-[-0.035em] text-balance sm:text-[2.6rem] md:text-[length:min(3.5rem,5.2svh,3.7vw)] md:leading-[1.02] md:tracking-[-0.038em]">
            <span data-hero="line" className="block">{t("headline")}</span>
          </h1>

          <p
            data-hero="line"
            className="mt-4 font-sans text-[1.35rem] font-semibold leading-[1.2] tracking-[-0.02em] md:mt-[2.2svh] md:text-[length:min(1.75rem,3.2svh,2.2vw)]"
          >
            {t.rich("greeting", {
              highlight: (chunks) => (
                <span className="text-primary-text">{chunks}</span>
              ),
            })}
          </p>

          <p
            data-hero="text"
            className="mt-2 font-mono text-[11px] font-medium uppercase leading-[1.4] tracking-[0.14em] text-muted-foreground md:mt-[1svh]"
          >
            {t("role")}
          </p>

          <p
            data-hero="text"
            className="mt-4 max-w-[54ch] text-[16px] leading-[1.5] text-pretty opacity-70 sm:text-[17px] md:mt-[2.2svh] md:text-[length:min(1.125rem,2.3svh,1.45vw)]"
          >
            {t("description")}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3 md:mt-[3.6svh]">
          <a
            data-hero="cta"
            href="#ask-ai"
            className={`${BUTTON} group bg-primary font-bold text-primary-foreground hover:brightness-110`}
          >
            {t("ctaAskAi")}
            <ArrowUpRightIcon />
          </a>
          <a
            data-hero="cta"
            href="#projects"
            className={`${BUTTON} group border border-foreground/20 font-medium hover:border-foreground/40 hover:bg-secondary`}
          >
            {t("ctaProjects")}
            <ArrowUpRightIcon />
          </a>
        </div>

        <div
          data-hero="rule"
          aria-hidden
          className="mt-14 h-px max-w-[760px] bg-border md:mt-[4svh]"
        />
        <dl
          aria-label={t("stackLabel")}
          className="grid max-w-[760px] grid-cols-2 gap-x-8 gap-y-6 pt-8 sm:flex sm:gap-x-6 md:pt-[2.6svh]"
        >
          {STACK.map((item) => {
            const name = t(`stack.${item.key}.value`);
            return (
              <div
                key={item.key}
                data-hero="stat"
                className="flex min-w-0 flex-col-reverse items-center text-center sm:flex-1 sm:basis-0"
              >
                <dt className="mt-2.5 font-mono text-[11px] md:mt-[1.2svh] font-medium uppercase leading-[1.35] tracking-[0.12em] text-muted-foreground">
                  {t(`stack.${item.key}.label`)}
                </dt>
                <dd className="flex size-10 items-center justify-center md:size-[min(2.5rem,4.2svh)]">
                  {item.icon ? (
                    <Image
                      src={item.icon}
                      alt={name}
                      width={36}
                      height={36}
                      className={`size-9 object-contain md:size-[min(2.25rem,3.8svh)] ${"className" in item ? item.className : ""}`}
                    />
                  ) : (
                    <SparklesIcon label={name} />
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {/* Visual: static glow + cut-out portrait */}
      <div className="relative hidden min-h-80 w-full items-center justify-center sm:flex">
        <div className="pointer-events-none absolute inset-0 flex select-none items-end justify-center">
          <div
            aria-hidden
            data-hero="glow"
            className="absolute inset-0 bg-[radial-gradient(70%_65%_at_50%_100%,color-mix(in_oklab,var(--primary)_26%,transparent),transparent_72%)]"
          />
          <div
            data-hero="photo-wrap"
            className="relative z-20 flex h-full max-h-[900px] w-full items-end justify-start"
          >
            <Image
              data-hero="photo"
              src="/Pedro-Monteiro-cutout.png"
              alt={t("photoAlt")}
              width={1254}
              height={1254}
              priority
              sizes="(min-width: 768px) 70vw, 100vw"
              className="h-auto w-[min(135%,calc(var(--hero-h)*1.1))] max-w-none shrink-0 translate-y-px object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
