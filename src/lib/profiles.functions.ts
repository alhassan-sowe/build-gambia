import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
export async function updateMyProfile(args: {
  data: { name: string; phone?: string | null; location?: string | null };
}) {
  const values = z
    .object({
      name: z.string().trim().max(100),
      phone: z.string().max(30).nullable().optional(),
      location: z.string().max(500).nullable().optional(),
    })
    .parse(args.data);
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Sign in required");
  const { error } = await supabase
    .from("profiles")
    .update({ ...values, phone: values.phone ?? "", location: values.location ?? "" })
    .eq("id", u.user.id);
  if (error) throw error;
  return { ok: true };
}
