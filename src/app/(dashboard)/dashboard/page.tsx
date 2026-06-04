import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PreviewGenerator } from "@/components/preview/preview-generator";
import { PreviewCard } from "@/components/preview/preview-card";
import { StatCard } from "@/components/shared/stat-card";
import { createClient } from "@/lib/auth/supabase/server";
import { getUsageOverview } from "@/lib/analytics/analytics.service";
import { listPreviews } from "@/lib/preview/preview.service";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [overview, recentPreviews] = await Promise.all([
    getUsageOverview(user.id),
    listPreviews(user.id, 1, 6),
  ]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Previews"
          value={overview.totalPreviews.toLocaleString()}
          change={`${overview.activeKeys} active keys`}
        />
        <StatCard
          label="Today's Requests"
          value={overview.requestsToday.toLocaleString()}
          change={`of ${overview.requestsToday + overview.remainingQuota} daily limit`}
        />
        <StatCard
          label="Remaining Quota"
          value={overview.remainingQuota.toLocaleString()}
          change="resets at midnight UTC"
        />
        <StatCard
          label="Cache Hit Rate"
          value={`${overview.cacheHitRate}%`}
          change="last 7 days"
          trend={overview.cacheHitRate > 50 ? "up" : "neutral"}
        />
      </div>

      {/* Preview Generator */}
      <PreviewGenerator />

      {/* Recent Previews */}
      {recentPreviews.items.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-semibold">Recent Previews</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentPreviews.items.map((preview) => (
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
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
