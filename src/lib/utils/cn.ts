import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx.
 * Handles conditional classes and resolves Tailwind conflicts.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-primary", "px-6")
 * // → "py-2 px-6 bg-primary" (px-4 overridden by px-6)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
