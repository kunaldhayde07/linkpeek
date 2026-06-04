import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PreviewCard } from "@/components/preview/preview-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/auth/supabase/server";
import { getCollection } from "@/lib/collection/collection.service";

export const metadata: Metadata = {
  title: "Collection",
};

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const collection = await getCollection(id, user.id);

  if (!collection) notFound();

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link href="/collections">
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Back to Collections
        </Link>
      </Button>

      <PageHeader
        title={collection.name}
        description={collection.description ?? `${collection.previewCount} previews`}
      />

      {collection.previews.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No previews in this collection"
          description="Add previews from the dashboard or history page."
        >
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collection.previews.map((preview) => (
            <PreviewCard
              key={preview.id}
              url={preview.url}
              domain={preview.domain}
              title={preview.title}
              description={preview.description}
              image={preview.image}
              favicon={preview.favicon}
              tags={preview.tags}
            />
          ))}
        </div>
      )}
    </div>
  );
}
