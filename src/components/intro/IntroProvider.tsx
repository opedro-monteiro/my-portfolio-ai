"use client";

import { createContext, useContext, useState } from "react";

type IntroState = {
  /** true once the loader has revealed the interface; page animations wait for it. */
  ready: boolean;
  markReady: () => void;
  /** bumps every time page entrance animations should play again (e.g. theme change). */
  replayKey: number;
  replay: () => void;
};

const IntroContext = createContext<IntroState>({
  ready: false,
  markReady: () => {},
  replayKey: 0,
  replay: () => {},
});

export const useIntro = () => useContext(IntroContext);

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  return (
    <IntroContext value={{
        ready,
        markReady: () => setReady(true),
        replayKey,
        replay: () => setReplayKey((k) => k + 1),
      }}>
      {children}
    </IntroContext>
  );
}
