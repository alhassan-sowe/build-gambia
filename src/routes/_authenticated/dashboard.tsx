import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Navbar, Footer } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatGMD } from "@/hooks/use-cart";
import { statusColor } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user, profile } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, order_items(*)").eq("buyer_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.name ?? "friend"}</h1>
        <p className="mt-1 text-muted-foreground">Track your orders and reorder anytime.</p>

        <div className="mt-8 space-y-3">
          {isLoading && <Skeleton className="h-32" />}
          {!isLoading && data?.length === 0 && (
            <div className="rounded-xl border bg-card p-10 text-center">
              <div className="text-4xl">📦</div>
              <h3 className="mt-2 font-semibold">No orders yet</h3>
              <Link to="/catalog"><Button className="mt-3">Browse materials</Button></Link>
            </div>
          )}
          {(data ?? []).map((o: any) => (
            <Card key={o.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Order #{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString()}</div>
                    <div className="mt-1 text-lg font-semibold">{formatGMD(Number(o.total))}</div>
                  </div>
                  <Badge className={statusColor(o.status)}>{o.status}</Badge>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">{o.delivery_address}</div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {o.order_items.map((it: any) => (
                    <span key={it.id} className="rounded-md bg-muted px-2 py-1">{it.quantity}× {it.name}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}