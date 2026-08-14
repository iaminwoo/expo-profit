"use client";

import { useEffect, useRef, useState } from "react";

export function useHydratedState<T>(initialValue: T, load: () => T) {
  const [value, setValue] = useState(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);
  const loadRef = useRef(load);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setValue(loadRef.current());
      setIsHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return { value, setValue, isHydrated };
}
