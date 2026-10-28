import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ShoppingCart, LogOut, LayoutDashboard, Search, MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { profile, isAuthenticated, loading } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [q, setQ] = useState("");

  const dashHref =
    profile?.role === "admin"
      ? "/admin"
      : profile?.role === "supplier"
        ? "/supplier"
        : "/dashboard";

  async function signOut() {
    try {
      await qc.cancelQueries();
      qc.clear();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await navigate({ to: "/auth", replace: true });
    } catch {
      toast.error("Sign out failed. Please retry.");
    }
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/materials", search: { search: q || undefined } as never });
  }

  if (pathname === "/auth") return null;

  return (
    <header className="sticky top-0 z-40 border-b bg-surface text-surface-foreground">
      <div className="hidden md:flex items-center justify-between text-xs px-4 py-1.5 border-b border-surface-foreground/10 opacity-90">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" /> Deliver to The Gambia
        </div>
        <div className="flex items-center gap-4">
          <Link to="/contact" className="hover:text-accent">
            Help
          </Link>
          <span>·</span>
          <span>Request supplier quotes</span>
        </div>
      </div>

      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg">
            E
          </span>
          <span className="hidden sm:inline">Envora</span>
        </Link>

        <form onSubmit={onSearch} className="flex-1 max-w-2xl mx-auto">
          <div className="relative flex items-stretch">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search cement, blocks, iron rods…"
              className="h-10 rounded-l-full rounded-r-none border-0 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
            />
            <Button
              type="submit"
              className="h-10 rounded-l-none rounded-r-full px-5 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
          <Link to="/materials" className="hover:text-accent transition">
            Materials
          </Link>
          <Link to="/contact" className="hover:text-accent transition">
            Contact
          </Link>
        </nav>

        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-surface-foreground hover:bg-card/10 shrink-0"
              >
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {profile?.name || "Account"}
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-1">
                <span className="truncate">{profile?.email}</span>
                <Badge variant="secondary" className="w-fit text-xs">
                  {profile?.role}
                </Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: dashHref })}>
                <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          >
            <Link to="/auth">{loading ? "Loading…" : "Log In"}</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
