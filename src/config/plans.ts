// ============================================================================
// Plan Configuration
// Defines limits and features for each subscription tier
// ============================================================================

export interface PlanConfig {
  name: string;
  slug: "free" | "pro" | "enterprise";
  description: string;
  price: number; // Monthly price in USD (0 for free)
  limits: {
    dailyRequests: number;
    maxApiKeys: number;
    maxCollections: number;
    maxBatchSize: number;
    screenshotsPerDay: number;
    historyRetentionDays: number;
  };
  features: string[];
}

export const plans: Record<string, PlanConfig> = {
  free: {
    name: "Free",
    slug: "free",
    description: "Perfect for side projects and testing",
    price: 0,
    limits: {
      dailyRequests: 100,
      maxApiKeys: 5,
      maxCollections: 10,
      maxBatchSize: 10,
      screenshotsPerDay: 10,
      historyRetentionDays: 30,
    },
    features: [
      "100 API requests per day",
      "5 API keys",
      "10 collections",
      "Metadata extraction",
      "Playwright fallback",
      "Full-text search",
      "JSON/CSV export",
    ],
  },
  pro: {
    name: "Pro",
    slug: "pro",
    description: "For growing applications and teams",
    price: 19,
    limits: {
      dailyRequests: 10_000,
      maxApiKeys: 20,
      maxCollections: 100,
      maxBatchSize: 50,
      screenshotsPerDay: 100,
      historyRetentionDays: 365,
    },
    features: [
      "10,000 API requests per day",
      "20 API keys",
      "100 collections",
      "Priority Playwright rendering",
      "Screenshot capture",
      "Batch processing (50 URLs)",
      "Advanced analytics",
      "Email support",
    ],
  },
  enterprise: {
    name: "Enterprise",
    slug: "enterprise",
    description: "For high-volume applications",
    price: 99,
    limits: {
      dailyRequests: 100_000,
      maxApiKeys: 100,
      maxCollections: 1000,
      maxBatchSize: 50,
      screenshotsPerDay: 1000,
      historyRetentionDays: -1, // Unlimited
    },
    features: [
      "100,000 API requests per day",
      "100 API keys",
      "Unlimited collections",
      "Dedicated Playwright instances",
      "Custom scraping rules",
      "Webhook notifications",
      "SLA guarantee",
      "Priority support",
    ],
  },
};

/**
 * Get the plan configuration for a given plan slug.
 */
export function getPlanConfig(slug: string): PlanConfig {
  return plans[slug] ?? plans["free"]!;
}
