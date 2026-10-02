import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "./types";

export async function updateMyProfile(args: { data: { name: string; phone?: string | null; location?: string | null } }) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not authenticated");
  const { error } = await supabase.from("profiles").update(args.data).eq("id", u.user.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function listAllProfiles() {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function setSupplierActive(args: { data: { id: string; is_active: boolean } }) {
  const { error } = await supabase.from("profiles").update({ is_active: args.data.is_active }).eq("id", args.data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function setUserRole(args: { data: { id: string; role: AppRole } }) {
  const { error: e1 } = await supabase.from("profiles").update({ role: args.data.role }).eq("id", args.data.id);
  if (e1) throw new Error(e1.message);
  await supabase.from("user_roles").delete().eq("user_id", args.data.id);
  const { error: e2 } = await supabase.from("user_roles").insert({ user_id: args.data.id, role: args.data.role });
  if (e2) throw new Error(e2.message);
  return { ok: true };
}

export async function listAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*, profiles!products_supplier_id_fkey(name), categories(name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((r: any) => ({
    ...r,
    supplier_name: r.profiles?.name ?? null,
    category_name: r.categories?.name ?? null,
  }));
}
