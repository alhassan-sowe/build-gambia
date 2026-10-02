import { supabase } from "@/integrations/supabase/client";

type ProductInput = {
  name: string;
  description?: string | null;
  price: number;
  unit: string;
  stock: number;
  image_url?: string | null;
  location?: string | null;
  category_id?: string | null;
};

function normalize(rows: any[] | null) {
  return (rows || []).map((r: any) => ({
    ...r,
    supplier_name: r.profiles?.name ?? null,
    supplier_phone: r.profiles?.phone ?? null,
    category_name: r.categories?.name ?? null,
  }));
}

export async function listProducts(args?: { data?: { categoryId?: string; search?: string } }) {
  const d = args?.data || {};
  let q = supabase
    .from("products")
    .select("*, profiles!products_supplier_id_fkey(name, is_active), categories(name)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (d.categoryId) q = q.eq("category_id", d.categoryId);
  if (d.search) q = q.ilike("name", `%${d.search}%`);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return normalize(data).filter((r: any) => r.profiles?.is_active !== false);
}

export async function getProduct(args: { data: { id: string } }) {
  const { data, error } = await supabase
    .from("products")
    .select("*, profiles!products_supplier_id_fkey(name, phone, location), categories(name)")
    .eq("id", args.data.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const r = data as any;
  return {
    ...r,
    supplier_name: r.profiles?.name ?? null,
    supplier_phone: r.profiles?.phone ?? null,
    category_name: r.categories?.name ?? null,
  };
}

export async function listMyProducts() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("supplier_id", u.user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((r: any) => ({ ...r, category_name: r.categories?.name ?? null }));
}

export async function createProduct(args: { data: ProductInput }) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("products")
    .insert({ ...args.data, supplier_id: u.user.id, is_active: true })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(args: { data: { id: string } & Partial<ProductInput> }) {
  const { id, ...rest } = args.data;
  const { data, error } = await supabase.from("products").update(rest).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProduct(args: { data: { id: string } }) {
  const { error } = await supabase.from("products").delete().eq("id", args.data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function toggleProductActive(args: { data: { id: string; is_active: boolean } }) {
  const { error } = await supabase.from("products").update({ is_active: args.data.is_active }).eq("id", args.data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
