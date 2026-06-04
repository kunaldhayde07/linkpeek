import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Logo size="sm" />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/#features" className="hover:text-foreground">Features</Link>
            <Link href="/#api" className="hover:text-foreground">API</Link>
            <Link href="/#pricing" className="hover:text-foreground">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Logo size="sm" />
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} LinkPeek. Open source link preview platform.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <Link href="/login" className="hover:text-foreground">Login</Link>
              <Link href="/signup" className="hover:text-foreground">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
