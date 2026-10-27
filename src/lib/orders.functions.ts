import { supabase } from "@/integrations/supabase/client";
export async function listMyOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data || [];
}
export const listSupplierOrders = listMyOrders;
export const listAllOrders = listMyOrders;
