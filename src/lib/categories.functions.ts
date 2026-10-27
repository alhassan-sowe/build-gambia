import { supabase } from "@/integrations/supabase/client";
export async function listCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data || [];
}
