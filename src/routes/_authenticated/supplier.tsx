import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, ImagePlus } from "lucide-react";
import { Navbar, Footer } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatGMD } from "@/hooks/use-cart";
import { statusColor } from "@/lib/status";

export const Route = createFileRoute("/_authenticated/supplier")({
  component: SupplierPage,
});

function SupplierPage() {
  const { user, profile, hasRole, refresh } = useAuth();

  if (!hasRole("supplier") && !hasRole("admin")) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Supplier access required</h1>
          <p className="mt-2 text-muted-foreground">Your account is registered as a buyer. Click below to also become a supplier.</p>
          <Button
            className="mt-4"
            onClick={async () => {
              const { error } = await supabase.from("user_roles").insert({ user_id: user!.id, role: "supplier" });
              if (error) toast.error(error.message); else { toast.success("You're now a supplier"); refresh(); }
            }}
          >
            Become a supplier
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Supplier dashboard</h1>
        <p className="mt-1 text-muted-foreground">Manage your products and incoming orders.</p>

        <Tabs defaultValue="products" className="mt-8">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          <TabsContent value="products"><ProductsTab /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="profile"><ProfileTab profile={profile} userId={user!.id} onSaved={refresh} /></TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

function ProductsTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["supplier-products", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("products").select("*, categories(name)").eq("supplier_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-end">
        <ProductDialog onSaved={() => qc.invalidateQueries({ queryKey: ["supplier-products"] })}>
          <Button><Plus className="mr-2 h-4 w-4" /> Add product</Button>
        </ProductDialog>
      </div>
      {isLoading && <Skeleton className="h-40" />}
      {!isLoading && data?.length === 0 && (
        <div className="rounded-xl border p-10 text-center text-muted-foreground">No products yet. Click "Add product" to start.</div>
      )}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((p: any) => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {p.image_url ? <img src={p.image_url} className="h-full w-full object-cover" alt={p.name} /> : <div className="grid h-full w-full place-items-center text-2xl">📦</div>}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate font-semibold">{p.name}</div>
                    <Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Live" : "Hidden"}</Badge>
                  </div>
                  <div className="text-sm text-primary">{formatGMD(Number(p.price))} / {p.unit}</div>
                  <div className="text-xs text-muted-foreground">Stock: {p.stock} · {p.categories?.name}</div>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <ProductDialog product={p} onSaved={() => qc.invalidateQueries({ queryKey: ["supplier-products"] })}>
                  <Button size="sm" variant="outline"><Pencil className="mr-1 h-3 w-3" /> Edit</Button>
                </ProductDialog>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={async () => {
                    if (!confirm("Delete this product?")) return;
                    const { error } = await supabase.from("products").delete().eq("id", p.id);
                    if (error) toast.error(error.message); else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["supplier-products"] }); }
                  }}
                ><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProductDialog({ product, children, onSaved }: { product?: any; children: React.ReactNode; onSaved: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    unit: product?.unit ?? "bag",
    stock: product?.stock ?? 0,
    image_url: product?.image_url ?? "",
    location: product?.location ?? "",
    category_id: product?.category_id ?? "",
    is_active: product?.is_active ?? true,
  });
  const { data: cats } = useQuery({ queryKey: ["categories"], queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [] });

  async function uploadImage(file: File) {
    setUploading(true);
    const path = `${user!.id}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (error) { setUploading(false); return toast.error(error.message); }
    const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: pub.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  }

  async function save() {
    if (!form.name || !form.price) return toast.error("Name and price are required");
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      supplier_id: user!.id,
      category_id: form.category_id || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(product ? "Product updated" : "Product added");
    setOpen(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Price (GMD)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div className="space-y-2"><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="bag, ton, m³…" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{(cats ?? []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Banjul, Serrekunda…" /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="space-y-2">
            <Label>Product image</Label>
            <div className="flex items-center gap-3">
              {form.image_url ? <img src={form.image_url} className="h-16 w-16 rounded-lg object-cover" alt="" /> : <div className="grid h-16 w-16 place-items-center rounded-lg bg-muted text-2xl">📦</div>}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                <Button variant="outline" type="button" asChild><span><ImagePlus className="mr-2 h-4 w-4" /> {uploading ? "Uploading…" : "Upload"}</span></Button>
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="active">Listing live</Label>
            <Switch id="active" checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrdersTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["supplier-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // get order_items I supply, then load their orders
      const { data: items } = await supabase.from("order_items").select("*, orders(*)").eq("supplier_id", user!.id).order("id", { ascending: false });
      // group by order
      const map = new Map<string, any>();
      (items ?? []).forEach((it: any) => {
        if (!it.orders) return;
        const o = map.get(it.orders.id) ?? { ...it.orders, items: [] };
        o.items.push(it);
        map.set(it.orders.id, o);
      });
      return Array.from(map.values()).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    },
  });

  async function setStatus(orderId: string, status: string) {
    const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", orderId);
    if (error) toast.error(error.message); else { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["supplier-orders"] }); }
  }

  return (
    <div className="mt-6 space-y-3">
      {isLoading && <Skeleton className="h-32" />}
      {!isLoading && data?.length === 0 && <div className="rounded-xl border p-10 text-center text-muted-foreground">No orders yet.</div>}
      {(data ?? []).map((o: any) => (
        <Card key={o.id}>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-xs text-muted-foreground">Order #{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleString()}</div>
                <div className="mt-1 text-sm">{o.delivery_address} · {o.phone}</div>
              </div>
              <Badge className={statusColor(o.status)}>{o.status}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {o.items.map((it: any) => (
                <span key={it.id} className="rounded-md bg-muted px-2 py-1">{it.quantity}× {it.name} · {formatGMD(Number(it.price) * it.quantity)}</span>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Select value={o.status} onValueChange={(v) => setStatus(o.id, v)}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["pending", "confirmed", "delivering", "delivered", "canceled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProfileTab({ profile, userId, onSaved }: { profile: any; userId: string; onSaved: () => void }) {
  const [form, setForm] = useState({ name: profile?.name ?? "", phone: profile?.phone ?? "", location: profile?.location ?? "" });
  const [saving, setSaving] = useState(false);
  return (
    <Card className="mt-6 max-w-xl">
      <CardContent className="space-y-4 p-5">
        <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="space-y-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
        <Button
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            const { error } = await supabase.from("profiles").update(form).eq("id", userId);
            setSaving(false);
            if (error) toast.error(error.message); else { toast.success("Profile updated"); onSaved(); }
          }}
        >{saving ? "Saving…" : "Save changes"}</Button>
      </CardContent>
    </Card>
  );
}