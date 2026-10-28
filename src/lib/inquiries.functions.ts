import { supabase } from "@/integrations/supabase/client";

export async function listAllInquiries() {
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function createInquiry(args: {
  data: { supplier_id: string; product_id?: string | null; subject: string; message: string };
}) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Not authenticated");
  const { error } = await supabase.from("inquiries").insert({ ...args.data, buyer_id: u.user.id });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function updateInquiryStatus(args: {
  data: { id: string; status: "OPEN" | "ANSWERED" | "CLOSED" };
}) {
  const { error } = await supabase
    .from("inquiries")
    .update({ status: args.data.status })
    .eq("id", args.data.id);
  if (error) throw new Error(error.message);
  return { ok: true };
}
