import { supabase } from "@/integrations/supabase/client";
import { quoteSchema, responseSchema, businessSchema } from "./pilot-validation";
import type { z } from "zod";
export async function requestQuote(input: z.infer<typeof quoteSchema>) {
  const v = quoteSchema.parse(input);
  const { data, error } = await supabase.rpc("request_quote", {
    _product_id: v.product_id,
    _quantity: v.quantity,
    _address: v.delivery_address,
    _phone: v.phone,
    _notes: v.notes,
  });
  if (error) throw error;
  return data;
}
export async function listQuotes() {
  const { data, error } = await supabase
    .from("quote_requests")
    .select("*, quote_responses(*)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data || [];
}
export async function respondQuote(id: string, input: z.infer<typeof responseSchema>) {
  const v = responseSchema.parse(input);
  const { data, error } = await supabase.rpc("respond_quote", {
    _request_id: id,
    _price: v.price,
    _delivery_fee: v.delivery_fee,
    _expires_at: v.expires_at,
    _notes: v.notes,
  });
  if (error) throw error;
  return data;
}
export async function decideQuote(id: string, accept: boolean) {
  const { data, error } = await supabase.rpc("decide_quote", { _request_id: id, _accept: accept });
  if (error) throw error;
  return data;
}
export async function registerSupplier(input: z.infer<typeof businessSchema>) {
  const v = businessSchema.parse(input);
  const { error } = await supabase.rpc("register_supplier", {
    _name: v.name,
    _location: v.location,
  });
  if (error) throw error;
}
export async function getMyBusiness() {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Sign in required");
  const { data, error } = await supabase
    .from("supplier_businesses")
    .select("*")
    .eq("id", u.user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
export async function listBusinesses() {
  const { data, error } = await supabase
    .from("supplier_businesses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data || [];
}
export async function reviewSupplier(id: string, status: "approved" | "rejected", notes: string) {
  const { error } = await supabase.rpc("review_supplier", {
    _id: id,
    _status: status,
    _notes: notes,
  });
  if (error) throw error;
}
