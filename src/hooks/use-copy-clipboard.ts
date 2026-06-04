"use client";

import { useCallback, useState } from "react";

/**
 * Copy text to clipboard with feedback state.
 *
 * @example
 * const { copied, copyToClipboard } = useCopyClipboard();
 * <button onClick={() => copyToClipboard("some text")}>
 *   {copied ? "Copied!" : "Copy"}
 * </button>
 */
export function useCopyClipboard(resetDelay: number = 2000) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);
        return true;
      } catch {
        console.error("Failed to copy to clipboard");
        return false;
      }
    },
    [resetDelay]
  );

  return { copied, copyToClipboard };
}
