import { supabase } from "@/integrations/supabase/client";
import type { OrderStatus } from "./types";

type CreateOrderInput = {
  delivery_address: string;
  phone: string;
  notes?: string | null;
  items: { product_id: string; quantity: number }[];
};

export async function createOrder(args: { data: CreateOrderInput }) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Please log in to place an order");

  const ids = args.data.items.map((i) => i.product_id);
  const { data: products, error: pe } = await supabase
    .from("products")
    .select("id, price, stock, is_active")
    .in("id", ids);
  if (pe) throw new Error(pe.message);
  if (!products || products.length !== ids.length) throw new Error("Some products not found");

  let total = 0;
  const itemsToInsert: { product_id: string; quantity: number; price: number }[] = [];
  for (const it of args.data.items) {
    const p = products.find((x) => x.id === it.product_id);
    if (!p || !p.is_active) throw new Error("Product unavailable");
    if (p.stock < it.quantity) throw new Error("Insufficient stock");
    total += Number(p.price) * it.quantity;
    itemsToInsert.push({ product_id: p.id, quantity: it.quantity, price: Number(p.price) });
  }

  const { data: order, error: oe } = await supabase
    .from("orders")
    .insert({
      buyer_id: u.user.id,
      delivery_address: args.data.delivery_address,
      phone: args.data.phone,
      notes: args.data.notes ?? null,
      total,
      status: "PENDING",
    })
    .select()
    .single();
  if (oe) throw new Error(oe.message);

  const { error: ie } = await supabase
    .from("order_items")
    .insert(itemsToInsert.map((it) => ({ ...it, order_id: order.id })));
  if (ie) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error(ie.message);
  }
  return order;
}

export async function listMyOrders() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name, unit))")
    .eq("buyer_id", u.user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((o: any) => ({
    ...o,
    items: (o.order_items || []).map((it: any) => ({
      ...it,
      product_name: it.products?.name,
      product_unit: it.products?.unit,
    })),
  }));
}

export async function listSupplierOrders() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not authenticated");
  const { data: myProducts, error: pe } = await supabase
    .from("products")
    .select("id, name, unit")
    .eq("supplier_id", u.user.id);
  if (pe) throw new Error(pe.message);
  const productIds = (myProducts || []).map((p) => p.id);
  if (productIds.length === 0) return [];

  const { data: items, error: ie } = await supabase
    .from("order_items")
    .select("*, orders(*, profiles!orders_buyer_id_fkey(name))")
    .in("product_id", productIds);
  if (ie) throw new Error(ie.message);

  const byOrder = new Map<string, any>();
  for (const it of items || []) {
    const o = (it as any).orders;
    if (!o) continue;
    const pname = myProducts?.find((p) => p.id === (it as any).product_id);
    if (!byOrder.has(o.id)) {
      byOrder.set(o.id, { ...o, buyer_name: o.profiles?.name ?? null, items: [] });
    }
    byOrder.get(o.id).items.push({
      ...it,
      product_name: pname?.name,
      product_unit: pname?.unit,
    });
  }
  return Array.from(byOrder.values()).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function updateOrderStatus(args: { data: { id: string; status: OrderStatus } }) {
  const { error } = await supabase.from("orders").update({ status: args.data.status }).eq("id", args.data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function listAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name, unit)), profiles!orders_buyer_id_fkey(name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((o: any) => ({
    ...o,
    buyer_name: o.profiles?.name ?? null,
    items: (o.order_items || []).map((it: any) => ({
      ...it,
      product_name: it.products?.name,
      product_unit: it.products?.unit,
    })),
  }));
}
