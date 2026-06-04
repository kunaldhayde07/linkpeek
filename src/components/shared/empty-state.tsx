import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon = "📭", title, description, children, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
}
