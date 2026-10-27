import { z } from "zod";
export const quantitySchema = z.number().finite().int().positive().max(1000000);
export const moneySchema = z
  .number()
  .finite()
  .positive()
  .max(9999999999.99)
  .refine(
    (v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.0001,
    "Use at most two decimal places",
  );
export const stockSchema = z.number().finite().int().min(0).max(2147483647);
export const productSchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().max(3000).nullable().optional(),
  price: moneySchema,
  unit: z.string().trim().min(1).max(30),
  stock: stockSchema,
  image_url: z.string().url().startsWith("https://").max(2000).nullable().optional(),
  location: z.string().max(500).nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
});
export const quoteSchema = z.object({
  product_id: z.string().uuid(),
  quantity: quantitySchema,
  delivery_address: z.string().trim().min(3).max(500),
  phone: z.string().trim().min(5).max(30),
  notes: z.string().max(2000),
});
export const businessSchema = z.object({
  name: z.string().trim().min(2).max(150),
  location: z.string().trim().min(2).max(500),
});
export const emailSchema = z.string().trim().email().max(255);
export const authSchema = z.object({ email: emailSchema, password: z.string().min(8).max(128) });
export const responseSchema = z.object({
  price: moneySchema,
  delivery_fee: z
    .number()
    .finite()
    .min(0)
    .max(9999999999.99)
    .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.0001),
  expires_at: z
    .string()
    .refine(
      (v) =>
        Number.isFinite(Date.parse(v)) &&
        Date.parse(v) > Date.now() &&
        Date.parse(v) <= Date.now() + 90 * 86400000,
      "Expiry must be within the next 90 days",
    ),
  notes: z.string().max(2000),
});
export function friendlyError(error: unknown) {
  return error instanceof z.ZodError
    ? error.issues[0]?.message || "Check your inputs."
    : "The action could not be completed. Check your connection, permissions and current availability, then try again.";
}
