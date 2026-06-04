"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, AlertTriangle, Copy, Check } from "lucide-react";

import { createApiKeyAction, revokeApiKeyAction } from "@/actions/api-key.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils/cn";

import type { ApiKeyDisplay } from "@/lib/auth/auth.types";

interface ApiKeysClientProps {
  initialKeys: ApiKeyDisplay[];
}

export function ApiKeysClient({ initialKeys }: ApiKeysClientProps) {
  const [keys, setKeys] = useState<ApiKeyDisplay[]>(initialKeys);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeKeys = keys.filter((k) => !k.revokedAt);

  async function handleCreate() {
    setIsCreating(true);
    try {
      const result = await createApiKeyAction(newKeyName || undefined);

      if (!result.success) {
        toast.error(result.error ?? "Failed to create key");
        return;
      }

      if (result.data) {
        setCreatedKey(result.data.rawKey);
        setKeys((prev) => [
          {
            id: result.data!.id,
            name: result.data!.name,
            keyPrefix: result.data!.keyPrefix,
            lastUsedAt: null,
            revokedAt: null,
            createdAt: result.data!.createdAt,
          },
          ...prev,
        ]);
        setNewKeyName("");
        setShowCreate(false);
        toast.success("API key created!");
      }
    } catch {
      toast.error("Failed to create API key");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRevoke(keyId: string) {
    if (!confirm("Are you sure you want to revoke this key? This cannot be undone.")) return;

    try {
      const result = await revokeApiKeyAction(keyId);

      if (!result.success) {
        toast.error(result.error ?? "Failed to revoke key");
        return;
      }

      setKeys((prev) =>
        prev.map((k) => (k.id === keyId ? { ...k, revokedAt: new Date() } : k))
      );
      toast.success("API key revoked");
    } catch {
      toast.error("Failed to revoke key");
    }
  }

  async function copyKey() {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Created key modal */}
      {createdKey && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            🔑 API Key Created
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Copy your API key now. It won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
            <code className="flex-1 break-all font-mono text-xs">{createdKey}</code>
            <Button variant="ghost" size="sm" onClick={copyKey}>
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            This key will not be shown again. Please save it in a secure location.
          </div>
          <Button size="sm" className="mt-3" onClick={() => setCreatedKey(null)}>
            I&apos;ve saved my key
          </Button>
        </div>
      )}

      {/* Create form */}
      <div className="flex items-end gap-2">
        {showCreate ? (
          <>
            <div className="flex-1">
              <Label className="mb-1.5 text-xs">Key Name (optional)</Label>
              <Input
                placeholder="e.g., Production"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Key"}
            </Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={() => setShowCreate(true)} disabled={activeKeys.length >= 5}>
            <Plus className="mr-1 h-4 w-4" />
            Generate New Key
          </Button>
        )}
      </div>

      {/* Keys table */}
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Key</th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">Created</th>
              <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">Last Used</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No API keys yet. Generate one to get started.
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr
                  key={key.id}
                  className={cn("border-b transition-colors hover:bg-muted/30", key.revokedAt && "opacity-50")}
                >
                  <td className="px-4 py-3 text-sm font-medium">
                    <span className={cn(key.revokedAt && "line-through")}>{key.name ?? "Unnamed"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                      {key.keyPrefix}••••••••
                    </code>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                    {formatRelative(key.createdAt)}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                    {key.lastUsedAt ? formatRelative(key.lastUsedAt) : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    {key.revokedAt ? (
                      <span className="inline-flex rounded bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
                        Revoked
                      </span>
                    ) : (
                      <span className="inline-flex rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!key.revokedAt && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleRevoke(key.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Revoke
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
