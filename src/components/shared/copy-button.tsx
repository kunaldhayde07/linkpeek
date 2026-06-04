"use client";

import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCopyClipboard } from "@/hooks/use-copy-clipboard";
import { cn } from "@/lib/utils/cn";

interface CopyButtonProps {
  value: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
}

export function CopyButton({ value, className, variant = "ghost", size = "icon" }: CopyButtonProps) {
  const { copied, copyToClipboard } = useCopyClipboard();

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("h-8 w-8", className)}
      onClick={() => copyToClipboard(value)}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
    </Button>
  );
}
