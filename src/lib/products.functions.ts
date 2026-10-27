import { supabase } from "@/integrations/supabase/client";
import { productSchema } from "./pilot-validation";
import type { z } from "zod";
type ProductInput = z.infer<typeof productSchema>;
export async function listProducts(args?: { data?: { categoryId?: string; search?: string } }) {
  let q = supabase
    .from("products")
    .select("*, categories(name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(100);
  if (args?.data?.categoryId) q = q.eq("category_id", args.data.categoryId);
  if (args?.data?.search)
    q = q.ilike("name", `%${args.data.search.slice(0, 100).replace(/[%_]/g, "")}%`);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map((p) => ({ ...p, category_name: p.categories?.name ?? null }));
}
export async function getProduct(args: { data: { id: string } }) {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("id", args.data.id)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? { ...data, category_name: data.categories?.name ?? null } : null;
}
export async function listMyProducts() {
  const { data: u, error: e } = await supabase.auth.getUser();
  if (e || !u.user) throw new Error("Sign in required");
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("supplier_id", u.user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data || [];
}
export async function createProduct(args: { data: ProductInput }) {
  const payload = productSchema.parse(args.data);
  const { data: u, error: e } = await supabase.auth.getUser();
  if (e || !u.user) throw new Error("Sign in required");
  const { data, error } = await supabase
    .from("products")
    .insert({ ...payload, supplier_id: u.user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function updateProduct(args: { data: ProductInput & { id: string } }) {
  const payload = productSchema.parse(args.data);
  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", args.data.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function toggleProductActive(args: { data: { id: string; is_active: boolean } }) {
  const { data, error } = await supabase
    .from("products")
    .update({ is_active: args.data.is_active })
    .eq("id", args.data.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
