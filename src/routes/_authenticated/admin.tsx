import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Navbar, Footer } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatGMD } from "@/hooks/use-cart";
import { statusColor } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { hasRole, loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
  if (!hasRole("admin")) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Admins only</h1>
          <p className="mt-2 text-muted-foreground">You don't have access to this area.</p>
        </div>
        <Footer />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
        <Tabs defaultValue="orders" className="mt-8">
          <TabsList>
            <TabsTrigger value="orders">All orders</TabsTrigger>
            <TabsTrigger value="users">Users & roles</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          <TabsContent value="orders"><AdminOrders /></TabsContent>
          <TabsContent value="users"><AdminUsers /></TabsContent>
          <TabsContent value="categories"><AdminCategories /></TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

function AdminOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await supabase.from("orders").select("*, order_items(*), profiles!orders_buyer_id_fkey(name)").order("created_at", { ascending: false })).data ?? [],
  });
  return (
    <div className="mt-6 space-y-3">
      {isLoading && <Skeleton className="h-32" />}
      {(data ?? []).map((o: any) => (
        <Card key={o.id}>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs text-muted-foreground">#{o.id.slice(0, 8)} · {o.profiles?.name} · {new Date(o.created_at).toLocaleDateString()}</div>
                <div className="text-lg font-semibold">{formatGMD(Number(o.total))}</div>
              </div>
              <Badge className={statusColor(o.status)}>{o.status}</Badge>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">{o.delivery_address} · {o.phone}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AdminUsers() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      const { data: roles } = await supabase.from("user_roles").select("*");
      return (profiles ?? []).map((p: any) => ({ ...p, roles: (roles ?? []).filter((r: any) => r.user_id === p.id).map((r: any) => r.role) }));
    },
  });

  async function toggleRole(userId: string, role: string, has: boolean) {
    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) return toast.error(error.message);
    }
    toast.success("Role updated");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  return (
    <div className="mt-6 space-y-3">
      {isLoading && <Skeleton className="h-32" />}
      {(data ?? []).map((u: any) => (
        <Card key={u.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="font-medium">{u.name ?? "—"}</div>
              <div className="text-xs text-muted-foreground">{u.email} · {u.location ?? "—"}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["buyer", "supplier", "admin"] as const).map((r) => (
                <Button key={r} variant={u.roles.includes(r) ? "default" : "outline"} size="sm" onClick={() => toggleRole(u.id, r, u.roles.includes(r))}>
                  {r}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AdminCategories() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["categories"], queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [] });
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="space-y-3 p-5">
          <h3 className="font-semibold">Add category</h3>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />
          <Button
            onClick={async () => {
              if (!name) return;
              const { error } = await supabase.from("categories").insert({ name, description: desc });
              if (error) toast.error(error.message); else { toast.success("Added"); setName(""); setDesc(""); qc.invalidateQueries({ queryKey: ["categories"] }); }
            }}
          >Add</Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {isLoading && <Skeleton className="h-32" />}
        {(data ?? []).map((c: any) => (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.description}</div>
              </div>
              <Button
                size="sm" variant="ghost" className="text-destructive"
                onClick={async () => {
                  if (!confirm("Delete category?")) return;
                  const { error } = await supabase.from("categories").delete().eq("id", c.id);
                  if (error) toast.error(error.message); else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["categories"] }); }
                }}
              >Delete</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}