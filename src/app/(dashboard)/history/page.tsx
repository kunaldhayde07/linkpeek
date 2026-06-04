import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PreviewCard } from "@/components/preview/preview-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/auth/supabase/server";
import { listPreviews } from "@/lib/preview/preview.service";

export const metadata: Metadata = {
  title: "History",
};

interface HistoryPageProps {
  searchParams: Promise<{ page?: string; domain?: string }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const domain = params.domain;

  const result = await listPreviews(user.id, page, 12, { domain });

  return (
    <div>
      <PageHeader title="Preview History" description="All your generated link previews">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">+ Generate New</Link>
        </Button>
      </PageHeader>

      {result.items.length === 0 ? (
        <EmptyState
          icon="🔗"
          title="No previews yet"
          description="Generate your first link preview from the dashboard."
        >
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </EmptyState>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {result.items.map((preview) => (
              <PreviewCard
                key={preview.id}
                id={preview.id}
                url={preview.url}
                domain={preview.domain}
                title={preview.title}
                description={preview.description}
                image={preview.image}
                favicon={preview.favicon}
                engine={preview.engine}
                tags={preview.tags}
                layout="horizontal"
              />
            ))}
          </div>

          {/* Pagination */}
          {result.pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {result.pagination.hasPrevious && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/history?page=${page - 1}${domain ? `&domain=${domain}` : ""}`}>
                    ← Previous
                  </Link>
                </Button>
              )}
              <span className="px-3 text-sm text-muted-foreground">
                Page {page} of {result.pagination.totalPages}
              </span>
              {result.pagination.hasNext && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/history?page=${page + 1}${domain ? `&domain=${domain}` : ""}`}>
                    Next →
                  </Link>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
