"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/shared/logo";
import { dashboardNavItems } from "@/config";
import { cn } from "@/lib/utils/cn";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 flex-shrink-0 border-r bg-background lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center border-b px-4">
          <Logo size="sm" linkTo="/dashboard" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {dashboardNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t p-3">
          <div className="rounded-lg bg-accent/50 p-3">
            <p className="text-xs font-medium">Free Plan</p>
            <p className="mt-0.5 text-xs text-muted-foreground">100 requests/day</p>
            <Link
              href="/settings"
              className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
            >
              Upgrade →
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
