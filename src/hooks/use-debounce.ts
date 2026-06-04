"use client";

import { useEffect, useState } from "react";

/**
 * Debounce a value by a specified delay.
 * Useful for search inputs to avoid making API calls on every keystroke.
 *
 * @example
 * const [query, setQuery] = useState("");
 * const debouncedQuery = useDebounce(query, 300);
 * // debouncedQuery updates 300ms after the last setQuery call
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
