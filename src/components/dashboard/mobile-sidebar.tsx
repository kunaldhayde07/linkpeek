"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useEffect } from "react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { dashboardNavItems } from "@/config";
import { cn } from "@/lib/utils/cn";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  // Close when route changes
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background shadow-xl lg:hidden">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b px-4">
            <Logo size="sm" linkTo="/dashboard" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

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
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
