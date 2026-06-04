import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { createClient } from "@/lib/auth/supabase/server";
import { getAnalytics } from "@/lib/analytics/analytics.service";

export const metadata: Metadata = {
  title: "Analytics",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const analytics = await getAnalytics(user.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Monitor your API usage and performance" />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Previews" value={analytics.overview.totalPreviews.toLocaleString()} />
        <StatCard label="Today's Requests" value={analytics.overview.requestsToday.toLocaleString()} />
        <StatCard
          label="Cache Hit Rate"
          value={`${analytics.overview.cacheHitRate}%`}
          trend={analytics.overview.cacheHitRate > 50 ? "up" : "neutral"}
        />
        <StatCard label="Active Keys" value={analytics.overview.activeKeys} />
      </div>

      {/* Daily usage chart (simplified) */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Daily Requests (Last 7 Days)</h3>
        {analytics.dailyUsage.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No usage data yet</p>
        ) : (
          <div className="flex items-end gap-1" style={{ height: 140 }}>
            {analytics.dailyUsage
              .slice()
              .reverse()
              .map((day) => {
                const max = Math.max(...analytics.dailyUsage.map((d) => d.totalRequests), 1);
                const height = Math.max(4, (day.totalRequests / max) * 120);
                return (
                  <div key={day.date} className="group flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {day.totalRequests}
                    </span>
                    <div
                      className="w-full rounded-t bg-primary/70 transition-colors hover:bg-primary"
                      style={{ height }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(day.date).toLocaleDateString("en", { weekday: "short" })}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Top domains */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Top Domains</h3>
        {analytics.topDomains.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No data yet</p>
        ) : (
          <div className="space-y-3">
            {analytics.topDomains.map((domain) => {
              const max = analytics.topDomains[0]?.count ?? 1;
              const width = Math.max(5, (domain.count / max) * 100);
              return (
                <div key={domain.domain} className="flex items-center gap-3">
                  <span className="w-32 truncate text-sm">{domain.domain}</span>
                  <div className="flex-1">
                    <div className="h-5 rounded bg-muted">
                      <div
                        className="h-full rounded bg-primary/60"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-10 text-right text-xs text-muted-foreground">{domain.count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
