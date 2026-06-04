"use client";

import { useState, useEffect } from "react";
import { FolderPlus, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import { addToCollectionAction } from "@/actions/collection.actions";
import { Button } from "@/components/ui/button";

import type { CollectionWithCount } from "@/lib/collection/collection.types";

interface AddToCollectionButtonProps {
  previewId: string;
}

export function AddToCollectionButton({ previewId }: AddToCollectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [collections, setCollections] = useState<CollectionWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && collections.length === 0) {
      setIsLoading(true);
      // Fetch collections via a server action
      fetchCollections().then((data) => {
        setCollections(data);
        setIsLoading(false);
      });
    }
  }, [isOpen, collections.length]);

  async function fetchCollections(): Promise<CollectionWithCount[]> {
    try {
      const { listCollectionsAction } = await import("@/actions/collection.actions");
      const result = await listCollectionsAction();
      return result ?? [];
    } catch {
      return [];
    }
  }

  async function handleAdd(collectionId: string) {
    setAddingTo(collectionId);
    try {
      const result = await addToCollectionAction(collectionId, previewId);
      if (result.success) {
        toast.success("Added to collection!");
        setIsOpen(false);
      } else {
        toast.error(result.error ?? "Failed to add");
      }
    } catch {
      toast.error("Failed to add to collection");
    } finally {
      setAddingTo(null);
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <FolderPlus className="mr-1 h-3 w-3" />
        Add to Collection
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-56 rounded-lg border bg-card p-2 shadow-lg">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : collections.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                No collections yet. Create one first.
              </p>
            ) : (
              collections.map((col) => (
                <button
                  key={col.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd(col.id);
                  }}
                  disabled={addingTo === col.id}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  {addingTo === col.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FolderPlus className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="flex-1 truncate">{col.name}</span>
                  <span className="text-[10px] text-muted-foreground">{col.previewCount}</span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
