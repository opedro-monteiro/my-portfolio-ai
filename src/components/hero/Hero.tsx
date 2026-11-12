"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";
import GrainGradient from "@/components/grain-gradient/GrainGradient";
import { useIntro } from "@/components/intro/IntroProvider";

gsap.registerPlugin(useGSAP, SplitText, ScrambleTextPlugin);

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
const BUTTON = `inline-flex h-[46px] w-fit items-center gap-2 rounded-[9px] px-5 text-[15px] transition-colors ${FOCUS}`;

function SparklesIcon({ label }: { label: string }) {
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 24 24"
      className="size-7"
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

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Hero() {
  const t = useTranslations("Hero");
  const { ready } = useIntro();
  const root = useRef<HTMLElement>(null);

  // Runs once the loader has revealed the interface.
  useGSAP(
    () => {
      if (!ready) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(root);
      const eyebrow = q("[data-hero=eyebrow-text]")[0];
      const eyebrowFinal = eyebrow?.textContent ?? "";

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(q("[data-hero=photo]"), { autoAlpha: 0, scale: 1.08, duration: 1.8 }, 0)
        .from(q("[data-hero=canvas]"), { autoAlpha: 0, duration: 2 }, 0)
        .from(q("[data-hero=dot]"), { scale: 0, duration: 0.5, ease: "back.out(3)" }, 0.1)
        .to(
          eyebrow,
          {
            duration: 1.2,
            ease: "none",
            scrambleText: { text: eyebrowFinal, chars: "01", speed: 0.6 },
          },
          0.1,
        );

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

      tl.from(
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
    },
    { scope: root, dependencies: [ready] },
  );

  return (
    <section
      ref={root}
      id="home"
      className="relative grid w-full grid-cols-1 items-stretch border-b border-border md:min-h-[520px] md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
    >
      {/* Mobile: gradient behind the copy */}
      <div
        aria-hidden
        data-hero="canvas-mobile"
        className="pointer-events-none absolute inset-0 select-none overflow-hidden sm:hidden"
      >
        <GrainGradient className="absolute inset-0 block h-full w-full" />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/70 to-background" />
      </div>

      {/* Copy */}
      <div className="relative z-10 flex flex-col justify-center px-[18px] pb-14 pt-[140px] sm:px-11 sm:pb-[72px] sm:pt-[88px]">
        <div>
          <p className="mb-3 flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase leading-[1.4] tracking-[0.16em] text-foreground/65">
            <span
              data-hero="dot"
              aria-hidden
              className="size-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]"
            />
            <span data-hero="eyebrow-text">{t("available")}</span>
          </p>

          <h1 className="mb-[22px] font-sans text-[2.75rem] font-bold leading-[1.0] tracking-[-0.04em] text-balance sm:text-[3.5rem] lg:text-[3.75rem] lg:leading-[0.96] lg:tracking-[-0.042em] xl:text-[4.25rem]">
            <span data-hero="line" className="block">{t("line1")}</span>
            <span data-hero="line" className="block">{t("line2")}</span>
            <span data-hero="line" className="block">
              {t.rich("line3", {
                highlight: (chunks) => (
                  <span className="text-primary-text">{chunks}</span>
                ),
              })}
            </span>
          </h1>

          <p
            data-hero="text"
            className="max-w-[34ch] text-[17px] leading-[1.45] text-pretty opacity-70 sm:text-[19px] lg:text-[21px]"
          >
            {t("description")}
          </p>
        </div>

        <div className="mt-[34px] flex flex-wrap items-center gap-2.5">
          <a
            data-hero="cta"
            href="#projects"
            className={`${BUTTON} group bg-primary font-bold text-primary-foreground hover:brightness-110`}
          >
            {t("ctaProjects")}
          </a>
          <a
            data-hero="cta"
            href="#ask-ai"
            className={`${BUTTON} group border border-foreground/20 font-medium hover:border-foreground/40 hover:bg-secondary`}
          >
            {t("ctaAskAi")}
            <ArrowRightIcon />
          </a>
        </div>

        <div
          data-hero="rule"
          aria-hidden
          className="mt-11 h-px max-w-[640px] bg-border"
        />
        <dl
          aria-label={t("stackLabel")}
          className="grid max-w-[640px] grid-cols-2 gap-x-8 gap-y-6 pt-[26px] sm:flex sm:gap-x-6"
        >
          {STACK.map((item) => {
            const name = t(`stack.${item.key}.value`);
            return (
              <div
                key={item.key}
                data-hero="stat"
                className="flex min-w-0 flex-col-reverse items-center text-center sm:flex-1 sm:basis-0"
              >
                <dt className="mt-2.5 font-mono text-[11px] font-medium uppercase leading-[1.35] tracking-[0.12em] text-muted-foreground">
                  {t(`stack.${item.key}.label`)}
                </dt>
                <dd className="flex size-8 items-center justify-center">
                  {item.icon ? (
                    <Image
                      src={item.icon}
                      alt={name}
                      width={28}
                      height={28}
                      className={`size-7 object-contain ${"className" in item ? item.className : ""}`}
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

      {/* Visual: gradient + cut-out portrait */}
      <div className="relative hidden min-h-80 w-full items-center justify-center sm:flex">
        <div className="pointer-events-none absolute inset-0 flex select-none items-end justify-center overflow-hidden">
          <div className="absolute inset-0 z-10 h-full w-full bg-linear-to-l from-transparent via-transparent to-background" />
          <GrainGradient
            className="absolute inset-0 block h-full w-full"
            data-hero="canvas"
          />
          <Image
            data-hero="photo"
            src="/Pedro-Monteiro-cutout.png"
            alt={t("photoAlt")}
            width={1254}
            height={1254}
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="relative z-20 h-full max-h-[720px] w-auto translate-y-px object-contain object-bottom"
          />
        </div>
      </div>
    </section>
  );
}
