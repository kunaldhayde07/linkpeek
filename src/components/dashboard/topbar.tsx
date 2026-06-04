"use client";

import { Menu, LogOut } from "lucide-react";
import { useState } from "react";

import { signOutAction } from "@/actions/auth.actions";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "./mobile-sidebar";

interface TopbarProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function Topbar({ userName, userEmail }: TopbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = (userName ?? userEmail ?? "U").charAt(0).toUpperCase();

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b px-4 lg:px-6">
        {/* Mobile: Logo + menu */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <Logo size="sm" linkTo="/dashboard" />
        </div>

        {/* Desktop: Empty left side (sidebar has logo) */}
        <div className="hidden lg:block" />

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </div>
          <form action={signOutAction}>
            <Button variant="ghost" size="icon" className="h-8 w-8" type="submit">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </form>
        </div>
      </header>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
