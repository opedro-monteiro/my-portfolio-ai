import { useTranslations } from "next-intl";

export function AnnouncementBar() {
  const t = useTranslations("Announcement");

  return (
    <aside
      aria-label={t("label")}
      className="relative mx-auto w-full max-w-[1456px] px-2 print:hidden"
    >
      <div className="flex h-[34px] items-center justify-center gap-2.5 border-x border-b border-border bg-muted px-4 text-center text-[12.5px] leading-none">
        <span className="inline-flex shrink-0 items-center rounded-[4px] border border-primary/40 px-1.5 py-1 font-mono text-[9px] font-medium uppercase leading-none tracking-[0.1em] text-primary-text">
          {t("tag")}
        </span>
        <a
          href="#ask-ai"
          className="group inline-flex min-w-0 items-center gap-1.5 font-medium tracking-tight underline-offset-4 transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="truncate leading-[1.4]">{t("text")}</span>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </aside>
  );
}
