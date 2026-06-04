import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Folder } from "lucide-react";

import { CreateCollectionForm } from "@/components/collections/create-collection-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { createClient } from "@/lib/auth/supabase/server";
import { listCollections } from "@/lib/collection/collection.service";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Collections",
};

export default async function CollectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const collections = await listCollections(user.id);

  return (
    <div>
      <PageHeader title="Collections" description="Organize your previews into groups">
        <CreateCollectionForm />
      </PageHeader>

      {collections.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No collections yet"
          description="Create your first collection to organize your link previews."
        >
          <CreateCollectionForm />
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.id}`}>
              <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Folder className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{collection.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {collection.previewCount} preview{collection.previewCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                {collection.description && (
                  <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                    {collection.description}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Updated {formatRelative(collection.updatedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
