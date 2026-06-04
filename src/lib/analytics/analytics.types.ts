export interface DailyUsage {
  date: string;
  totalRequests: number;
  successfulRequests: number;
  cachedRequests: number;
  avgResponseTime: number;
}

export interface TopDomain {
  domain: string;
  count: number;
}

export interface UsageOverview {
  totalPreviews: number;
  requestsToday: number;
  remainingQuota: number;
  activeKeys: number;
  cacheHitRate: number;
}

export interface AnalyticsData {
  overview: UsageOverview;
  dailyUsage: DailyUsage[];
  topDomains: TopDomain[];
}
