"use client";

import Image from "next/image";
import { ExternalLink, Globe } from "lucide-react";

import { AddToCollectionButton } from "@/components/collections/add-to-collection-button";
import { cn } from "@/lib/utils/cn";

interface PreviewCardProps {
  id?: string;
  url: string;
  domain: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  favicon?: string | null;
  engine?: string;
  tags?: Array<{ id: string; name: string; color: string }>;
  createdAt?: Date;
  className?: string;
  layout?: "vertical" | "horizontal";
  showActions?: boolean;
}

export function PreviewCard({
  id,
  url,
  domain,
  title,
  description,
  image,
  favicon,
  engine,
  tags,
  className,
  layout = "vertical",
  showActions = true,
}: PreviewCardProps) {
  const isHorizontal = layout === "horizontal";

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md",
        isHorizontal ? "flex flex-row" : "flex flex-col",
        className
      )}
    >
      {/* Image */}
      <div
        className={cn(
          "relative flex items-center justify-center bg-muted/50",
          isHorizontal ? "w-48 flex-shrink-0" : "h-40"
        )}
      >
        {image ? (
          <Image
            src={image}
            alt={title ?? domain}
            fill
            className="object-cover"
            sizes={isHorizontal ? "192px" : "(max-width: 768px) 100vw, 33vw"}
            unoptimized
          />
        ) : (
          <Globe className="h-10 w-10 text-muted-foreground/30" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Domain */}
        <div className="mb-1 flex items-center gap-1.5 text-xs text-primary">
          {favicon ? (
            <Image
              src={favicon}
              alt=""
              width={14}
              height={14}
              className="rounded-sm"
              unoptimized
            />
          ) : (
            <Globe className="h-3.5 w-3.5" />
          )}
          <span className="truncate">{domain}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>
        </div>

        {/* Title */}
        <h4 className="mb-1 line-clamp-2 text-sm font-semibold leading-tight">
          {title ?? "Untitled Page"}
        </h4>

        {/* Description */}
        {description && (
          <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{description}</p>
        )}

        {/* Footer: Tags + Engine + Actions */}
        <div className="mt-auto flex items-center gap-1.5 pt-2">
          {tags?.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
              }}
            >
              {tag.name}
            </span>
          ))}
          {engine && (
            <span
              className={cn(
                "inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium",
                engine === "playwright"
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-primary/10 text-primary"
              )}
            >
              {engine}
            </span>
          )}
        </div>

        {/* Add to Collection action */}
        {showActions && id && (
          <div className="mt-2 flex items-center border-t pt-2 opacity-0 transition-opacity group-hover:opacity-100">
            <AddToCollectionButton previewId={id} />
          </div>
        )}
      </div>
    </div>
  );
}
