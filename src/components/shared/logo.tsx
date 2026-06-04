import Link from "next/link";

import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  linkTo?: string;
}

export function Logo({ className, size = "md", linkTo = "/" }: LogoProps) {
  const sizes = {
    sm: { icon: "h-6 w-6 text-xs", text: "text-base" },
    md: { icon: "h-8 w-8 text-sm", text: "text-xl" },
    lg: { icon: "h-10 w-10 text-base", text: "text-2xl" },
  };

  const s = sizes[size];

  const content = (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground",
          s.icon
        )}
      >
        ⚡
      </div>
      <span className={cn("font-bold tracking-tight", s.text)}>LinkPeek</span>
    </div>
  );

  if (linkTo) {
    return <Link href={linkTo}>{content}</Link>;
  }

  return content;
}
