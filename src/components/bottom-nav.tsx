import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, ShoppingCart, ClipboardList, User } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, isAuthenticated } = useAuth();

  if (pathname === "/auth") return null;

  const dashHref =
    profile?.role === "admin"
      ? "/admin"
      : profile?.role === "supplier"
        ? "/supplier"
        : "/dashboard";

  const items = [
    { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
    {
      to: "/materials",
      label: "Browse",
      icon: LayoutGrid,
      match: (p: string) => p.startsWith("/materials"),
    },
    {
      to: isAuthenticated ? dashHref : "/auth",
      label: "Quotes",
      icon: ClipboardList,
      match: (p: string) => p === "/dashboard",
    },
    {
      to: isAuthenticated ? dashHref : "/auth",
      label: isAuthenticated ? "Account" : "Sign in",
      icon: User,
      match: (p: string) => p.startsWith("/admin") || p.startsWith("/supplier") || p === "/auth",
    },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface text-surface-foreground border-t border-surface-foreground/10 safe-bottom">
      <ul className="grid grid-cols-4">
        {items.map((it) => {
          const active = it.match(pathname);
          const Icon = it.icon;
          return (
            <li key={it.label}>
              <Link
                to={it.to as never}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition relative",
                  active
                    ? "text-primary"
                    : "text-surface-foreground/70 hover:text-surface-foreground",
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                </div>
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
