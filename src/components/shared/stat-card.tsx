import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({ label, value, change, trend = "neutral", className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-4 shadow-sm", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      {change && (
        <p
          className={cn("mt-1 text-xs", {
            "text-emerald-500": trend === "up",
            "text-red-500": trend === "down",
            "text-muted-foreground": trend === "neutral",
          })}
        >
          {trend === "up" && "↑ "}
          {trend === "down" && "↓ "}
          {change}
        </p>
      )}
    </div>
  );
}
