import { AnnouncementBar } from "@/components/header/AnnouncementBar";
import { Header } from "@/components/header/Header";
import { Hero } from "@/components/hero/Hero";
import { IntroLoader } from "@/components/intro/IntroLoader";
import { IntroProvider } from "@/components/intro/IntroProvider";

export default function HomePage() {
  return (
    <IntroProvider>
      <IntroLoader />
      <AnnouncementBar />
      <div className="relative mx-auto w-full max-w-[1456px] px-2">
        <div className="border-x border-border bg-background print:border-none">
          <Header />
          <main>
            <Hero />
          </main>
        </div>
      </div>
    </IntroProvider>
  );
}
