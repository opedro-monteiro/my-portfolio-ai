"use client";

import { createContext, useContext, useState } from "react";

type IntroState = {
  /** true once the loader has revealed the interface; page animations wait for it. */
  ready: boolean;
  markReady: () => void;
};

const IntroContext = createContext<IntroState>({
  ready: false,
  markReady: () => {},
});

export const useIntro = () => useContext(IntroContext);

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  return (
    <IntroContext value={{ ready, markReady: () => setReady(true) }}>
      {children}
    </IntroContext>
  );
}
