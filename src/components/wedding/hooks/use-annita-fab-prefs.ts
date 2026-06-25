"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readAnnitaFabHidden,
  readAnnitaFabPosition,
  writeAnnitaFabHidden,
  writeAnnitaFabPosition,
  type AnnitaFabPosition,
} from "@/lib/annita-fab-prefs";

export function useAnnitaFabPrefs() {
  const [hidden, setHiddenState] = useState(false);
  const [position, setPositionState] = useState<AnnitaFabPosition | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setHiddenState(readAnnitaFabHidden());
    setPositionState(readAnnitaFabPosition());
    setReady(true);

    const onHiddenChange = (event: Event) => {
      setHiddenState(Boolean((event as CustomEvent<boolean>).detail));
    };

    window.addEventListener("annita-fab:hidden", onHiddenChange);
    return () => window.removeEventListener("annita-fab:hidden", onHiddenChange);
  }, []);

  const setHidden = useCallback((next: boolean) => {
    writeAnnitaFabHidden(next);
    setHiddenState(next);
  }, []);

  const setPosition = useCallback((next: AnnitaFabPosition | null) => {
    writeAnnitaFabPosition(next);
    setPositionState(next);
  }, []);

  const showAnnita = useCallback(() => setHidden(false), [setHidden]);

  return { hidden, position, setHidden, setPosition, showAnnita, ready };
}
