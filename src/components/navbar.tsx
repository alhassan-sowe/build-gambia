import { Link, useRouter } from "@tanstack/react-router";
import { Menu, ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Package, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const links = [
  { to: "/", label: "Home" },
  { to: "/catalog", label: "Catalog" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const { isAuthenticated, profile, roles, signOut, user } = useAuth();
  const count = useCart((s) => s.items.reduce((a, i) => a + i.quantity, 0));
  const router = useRouter();
  const role = roles[0];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">E</div>
          <span className="text-lg font-semibold tracking-tight">Envora</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {count > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-[10px]">{count}</Badge>
            )}
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="hidden gap-2 md:flex">
                  <UserIcon className="h-4 w-4" />
                  <span className="max-w-32 truncate">{profile?.name ?? user?.email}</span>
                  {role && <Badge variant="secondary" className="capitalize">{role}</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.navigate({ to: "/dashboard" })}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> My orders
                </DropdownMenuItem>
                {roles.includes("supplier") && (
                  <DropdownMenuItem onClick={() => router.navigate({ to: "/supplier" })}>
                    <Package className="mr-2 h-4 w-4" /> Supplier panel
                  </DropdownMenuItem>
                )}
                {roles.includes("admin") && (
                  <DropdownMenuItem onClick={() => router.navigate({ to: "/admin" })}>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    router.navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="hidden md:block">
              <Button>Login</Button>
            </Link>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Envora</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-2">
                {links.map((l) => (
                  <Link key={l.to} to={l.to} className="rounded-md px-3 py-2 hover:bg-accent">
                    {l.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="rounded-md px-3 py-2 hover:bg-accent">My orders</Link>
                    {roles.includes("supplier") && (
                      <Link to="/supplier" className="rounded-md px-3 py-2 hover:bg-accent">Supplier panel</Link>
                    )}
                    {roles.includes("admin") && (
                      <Link to="/admin" className="rounded-md px-3 py-2 hover:bg-accent">Admin</Link>
                    )}
                    <Button variant="outline" onClick={signOut}>Sign out</Button>
                  </>
                ) : (
                  <Link to="/auth"><Button className="w-full">Login</Button></Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-muted/30">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">E</div>
            <span className="font-semibold">Envora</span>
          </div>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            The Gambia's direct marketplace for construction materials & transport.
          </p>
        </div>
        <div className="text-sm">
          <div className="font-semibold">Marketplace</div>
          <div className="mt-2 flex flex-col gap-1 text-muted-foreground">
            <Link to="/catalog">Browse catalog</Link>
            <Link to="/auth">Become a supplier</Link>
            <Link to="/contact">Contact us</Link>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Envora. Banjul, The Gambia.
        </div>
      </div>
    </footer>
  );
}