import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Minus, Plus } from "lucide-react";
import { Navbar, Footer } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart, formatGMD } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/cart")({
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, clear, total } = useCart();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [delivery, setDelivery] = useState({ address: "", phone: profile?.phone ?? "", notes: "" });
  const [placing, setPlacing] = useState(false);

  async function placeOrder() {
    if (!user) return;
    if (items.length === 0) return toast.error("Your cart is empty");
    if (!delivery.address || !delivery.phone) return toast.error("Add delivery address and phone");
    setPlacing(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        buyer_id: user.id,
        total: total(),
        delivery_address: delivery.address,
        phone: delivery.phone,
        notes: delivery.notes,
      })
      .select()
      .single();
    if (error || !order) {
      setPlacing(false);
      return toast.error(error?.message ?? "Could not place order");
    }
    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        supplier_id: i.supplier_id,
        quantity: i.quantity,
        price: i.price,
        name: i.name,
      })),
    );
    setPlacing(false);
    if (itemsError) return toast.error(itemsError.message);
    clear();
    toast.success("Order placed successfully");
    router.navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-xl border bg-card p-10 text-center">
            <div className="text-4xl">🛒</div>
            <h3 className="mt-2 text-lg font-semibold">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground">Browse the catalog to add materials.</p>
            <Link to="/catalog"><Button className="mt-4">Browse catalog</Button></Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              {items.map((i) => (
                <Card key={i.product_id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {i.image_url ? <img src={i.image_url} className="h-full w-full object-cover" alt={i.name} /> : <div className="grid h-full w-full place-items-center text-2xl text-muted-foreground/40">📦</div>}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{i.name}</div>
                      <div className="text-sm text-muted-foreground">{formatGMD(i.price)} / {i.unit}</div>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-md border">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQty(i.product_id, i.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                        <span className="w-8 text-center text-sm">{i.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQty(i.product_id, i.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatGMD(i.price * i.quantity)}</div>
                      <Button variant="ghost" size="icon" onClick={() => remove(i.product_id)} className="mt-2 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="h-fit">
              <CardContent className="space-y-4 p-5">
                <h3 className="font-semibold">Delivery details</h3>
                <div className="space-y-2"><Label>Address</Label><Input value={delivery.address} onChange={(e) => setDelivery({ ...delivery, address: e.target.value })} placeholder="Street, area, landmark" /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={delivery.phone} onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })} placeholder="+220..." /></div>
                <div className="space-y-2"><Label>Notes (optional)</Label><Textarea value={delivery.notes} onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })} rows={3} /></div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatGMD(total())}</span>
                </div>
                <Button onClick={placeOrder} disabled={placing} className="w-full" size="lg">
                  {placing ? "Placing order…" : "Place order"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">Pay on delivery. Supplier will confirm shortly.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}