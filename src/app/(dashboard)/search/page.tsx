import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PreviewCard } from "@/components/preview/preview-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/auth/supabase/server";
import { searchPreviews } from "@/lib/search/search.service";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const results = query ? await searchPreviews(user.id, query, page, 20) : null;

  return (
    <div>
      <PageHeader title="Search" description="Search across all your previews" />

      {/* Search form */}
      <form action="/search" method="GET" className="mb-6">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
          <input
            name="q"
            type="text"
            defaultValue={query}
            placeholder="Search by title, description, URL, or domain..."
            className="w-full rounded-lg border bg-card py-3 pl-10 pr-4 text-sm outline-none ring-ring focus:ring-2"
            autoFocus
          />
        </div>
      </form>

      {/* Results */}
      {results === null ? (
        <EmptyState icon="🔍" title="Start searching" description="Type a query above to search your preview history." />
      ) : results.results.length === 0 ? (
        <EmptyState icon="😕" title="No results found" description={`No previews matched "${query}". Try a different search.`} />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {results.total} result{results.total !== 1 ? "s" : ""} for &quot;{query}&quot;
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.results.map((result) => (
              <PreviewCard
                key={result.id}
                url={result.url}
                domain={result.domain}
                title={result.title}
                description={result.description}
                image={result.image}
                favicon={result.favicon}
                layout="horizontal"
              />
            ))}
          </div>

          {results.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}>← Previous</Link>
                </Button>
              )}
              <span className="px-3 text-sm text-muted-foreground">
                Page {page} of {results.totalPages}
              </span>
              {page < results.totalPages && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}>Next →</Link>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
