"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { createCollectionAction } from "@/actions/collection.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateCollectionForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      toast.error("Collection name is required");
      return;
    }

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.set("name", name.trim());
      if (description.trim()) {
        formData.set("description", description.trim());
      }

      const result = await createCollectionAction(formData);

      if (!result.success) {
        toast.error(result.error ?? "Failed to create collection");
        return;
      }

      toast.success(`Collection "${name}" created!`);
      setName("");
      setDescription("");
      setIsOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to create collection");
    } finally {
      setIsCreating(false);
    }
  }

  if (!isOpen) {
    return (
      <Button size="sm" onClick={() => setIsOpen(true)}>
        <Plus className="mr-1 h-4 w-4" />
        New Collection
      </Button>
    );
  }

  return (
    <div className="w-full rounded-xl border bg-card p-5 shadow-sm sm:w-auto sm:min-w-[400px]">
      <h3 className="mb-3 text-sm font-semibold">Create Collection</h3>
      <div className="space-y-3">
        <div>
          <Label className="mb-1 text-xs">Name</Label>
          <Input
            placeholder="e.g., Q3 Campaign"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
        </div>
        <div>
          <Label className="mb-1 text-xs">Description (optional)</Label>
          <Input
            placeholder="What is this collection for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreate} disabled={isCreating || !name.trim()} size="sm">
            {isCreating ? (
              <>
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              setName("");
              setDescription("");
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
