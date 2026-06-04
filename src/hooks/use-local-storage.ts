"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Persist state in localStorage with SSR-safe defaults.
 *
 * @example
 * const [theme, setTheme] = useLocalStorage("theme", "light");
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      console.warn(`Error reading localStorage key "${key}"`);
    }
  }, [key]);

  // Write to localStorage on change
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch {
        console.warn(`Error setting localStorage key "${key}"`);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
