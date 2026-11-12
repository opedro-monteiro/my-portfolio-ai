"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useIntro } from "@/components/intro/IntroProvider";
import { ThemeToggle } from "./ThemeToggle";

gsap.registerPlugin(useGSAP);

const NAV = ["about", "projects", "skills", "experience", "contact"] as const;
const LOCALE_LABEL: Record<string, string> = { en: "EN", "pt-br": "PT" };
const GITHUB_URL = "https://github.com/opedro-monteiro";
const RESUME_URL = "/Profile.pdf";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const UTILITY_LINK = `rounded-[6px] text-[13px] leading-none text-muted-foreground transition-colors hover:text-foreground ${FOCUS}`;

/** Drawn from public/github.svg as a mask, so it takes the text colour (white on dark, black on light). */
function GithubIcon() {
  return (
    <span
      aria-hidden
      className="size-4 shrink-0 bg-current [-webkit-mask:url(/github.svg)_center/contain_no-repeat] [mask:url(/github.svg)_center/contain_no-repeat]"
    />
  );
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-3.5"
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

export function Header() {
  const t = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();
  const { ready, replayKey } = useIntro();
  const [open, setOpen] = useState(false);

  const root = useRef<HTMLElement>(null);
  const menuTl = useRef<gsap.core.Timeline | null>(null);

  // Mobile menu timeline (independent of the intro).
  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      menuTl.current = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" } })
        .fromTo(
          "[data-header=panel]",
          { autoAlpha: 0, y: -12 },
          { autoAlpha: 1, y: 0, duration: reduceMotion ? 0 : 0.3 },
        )
        .from(
          "[data-header=mobile-item]",
          { autoAlpha: 0, x: -14, duration: reduceMotion ? 0 : 0.3, stagger: 0.05 },
          "-=0.15",
        );
    },
    { scope: root },
  );

  // Entrance: waits for the loader to reveal the interface.
  useGSAP(
    () => {
      if (!ready) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      // The bar itself only slides in on the first load; replays keep it in place.
      if (replayKey === 0) tl.from(root.current, { yPercent: -100, duration: 0.9 });
      tl.from("[data-header=logo]", { autoAlpha: 0, x: -14, duration: 0.7 }, 0.25)
        .from(
          "[data-header=item]",
          { autoAlpha: 0, y: -10, duration: 0.6, stagger: 0.06 },
          0.35,
        )
        .from(
          "[data-header=util]",
          { autoAlpha: 0, y: -10, duration: 0.6, stagger: 0.06 },
          0.5,
        );
    },
    { scope: root, dependencies: [ready, replayKey], revertOnUpdate: true },
  );

  const toggleMenu = () => {
    const next = !open;
    setOpen(next);
    if (next) menuTl.current?.play();
    else menuTl.current?.reverse();
  };

  const closeMenu = () => {
    setOpen(false);
    menuTl.current?.reverse();
  };

  return (
    <header
      ref={root}
      className="sticky top-0 z-50 flex h-(--nav-height) w-full items-center gap-5 border-b border-border bg-background/90 px-[18px] backdrop-blur-md print:hidden lg:px-11"
    >
      <a
        href="#home"
        data-header="logo"
        aria-label={t("home")}
        className={`flex shrink-0 items-center gap-2.5 rounded-[7px] leading-none ${FOCUS}`}
      >
        <Image
          src="/Pedro-Monteiro-avatar.png"
          alt={t("logoAlt")}
          width={249}
          height={256}
          priority
          className="h-(--nav-height) w-auto shrink-0 object-contain object-bottom"
        />
        <span className="text-[15.5px] font-bold leading-none tracking-[-0.01em]">
          <span className="font-mono">Monteiro</span>Dev
        </span>
      </a>

      <nav aria-label={t("navLabel")} className="hidden items-center lg:flex">
        <ul className="flex items-center gap-0.5">
          {NAV.map((key) => (
            <li key={key} data-header="item">
              <a
                href={`#${key}`}
                className={`inline-flex items-center rounded-[7px] px-3 py-[7px] text-[13.5px] leading-none text-muted-foreground transition-colors duration-200 hover:bg-foreground/[0.06] hover:text-foreground ${FOCUS}`}
              >
                {t(key)}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <ul className="ml-auto hidden items-center gap-[18px] lg:flex">
        <li data-header="util">
          <div
            role="group"
            aria-label={t("language")}
            className="flex items-center gap-0.5 font-mono text-xs"
          >
            {routing.locales.map((l) => (
              <Link
                key={l}
                href={pathname}
                locale={l}
                aria-current={l === locale ? "true" : undefined}
                className={`rounded-[6px] px-2 py-1 transition-colors ${FOCUS} ${
                  l === locale
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {LOCALE_LABEL[l] ?? l}
              </Link>
            ))}
          </div>
        </li>
        <li data-header="util">
          <ThemeToggle />
        </li>
        <li data-header="util">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${UTILITY_LINK} flex items-center gap-1.5`}
          >
            <GithubIcon />
            {t("github")}
          </a>
        </li>
        <li data-header="util">
          <a
            href={RESUME_URL}
            download="Pedro-Monteiro-Resume.pdf"
            className={UTILITY_LINK}
          >
            {t("resume")}
          </a>
        </li>
        <li data-header="util">
          <a
            href="#contact"
            className={`group inline-flex items-center gap-2 rounded-[8px] bg-primary px-3.5 py-2 text-[13px] font-bold leading-none text-primary-foreground transition hover:brightness-110 ${FOCUS}`}
          >
            {t("cta")}
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              <ArrowRightIcon />
            </span>
          </a>
        </li>
      </ul>

      <div className="ml-auto flex items-center gap-0.5 lg:hidden">
        <ThemeToggle />
      <button
        type="button"
        onClick={toggleMenu}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        className={`flex size-9 shrink-0 items-center justify-center rounded-[7px] opacity-70 transition hover:bg-foreground/[0.06] hover:opacity-100 lg:hidden ${FOCUS}`}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {open ? (
            <path d="M6 6l12 12M18 6 6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>
      </div>

      <div
        id="mobile-menu"
        data-header="panel"
        inert={!open}
        className="invisible absolute inset-x-0 top-full border-b border-border bg-background/95 px-[18px] pb-6 pt-2 backdrop-blur-md lg:hidden"
      >
        <ul className="flex flex-col text-lg">
          {NAV.map((key) => (
            <li key={key} data-header="mobile-item">
              <a
                href={`#${key}`}
                onClick={closeMenu}
                className="block border-b border-border py-3"
              >
                {t(key)}
              </a>
            </li>
          ))}
          <li
            data-header="mobile-item"
            className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-5"
          >
            <a
              href="#contact"
              onClick={closeMenu}
              className="inline-flex items-center gap-2 rounded-[8px] bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
            >
              {t("cta")}
              <ArrowRightIcon />
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
            >
              <GithubIcon />
              {t("github")}
            </a>
            <a
              href={RESUME_URL}
              download="Pedro-Monteiro-Resume.pdf"
              className="text-sm text-muted-foreground"
            >
              {t("resume")}
            </a>
            <span
              role="group"
              aria-label={t("language")}
              className="ml-auto flex items-center gap-1 font-mono text-xs"
            >
              {routing.locales.map((l) => (
                <Link
                  key={l}
                  href={pathname}
                  locale={l}
                  aria-current={l === locale ? "true" : undefined}
                  className={`rounded-[6px] px-2 py-1 ${
                    l === locale
                      ? "bg-foreground/10 text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {LOCALE_LABEL[l] ?? l}
                </Link>
              ))}
            </span>
          </li>
        </ul>
      </div>
    </header>
  );
}
