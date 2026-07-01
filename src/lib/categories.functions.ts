import { supabase } from "@/integrations/supabase/client";

export async function listCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createCategory(args: { data: { name: string; description?: string | null } }) {
  const { data, error } = await supabase.from("categories").insert(args.data).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCategory(args: { data: { id: string; name?: string; description?: string | null } }) {
  const { id, ...rest } = args.data;
  const { error } = await supabase.from("categories").update(rest).eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteCategory(args: { data: { id: string } }) {
  const { error } = await supabase.from("categories").delete().eq("id", args.data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
