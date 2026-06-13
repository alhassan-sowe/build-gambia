
# Envora — Construction Materials Marketplace

A mobile-first marketplace for The Gambia where buyers order materials (cement, sand, blocks, gravel, iron rods, tiles, transport) directly from suppliers. Built on TanStack Start with your own Supabase project.

## Connecting your Supabase

Before I start building, you'll paste these into the project as env vars:

- `VITE_SUPABASE_URL` + `SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` + `SUPABASE_PUBLISHABLE_KEY` (anon key)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, for admin operations)

I'll deliver the SQL schema as a single migration file you run in your Supabase SQL editor (or via `supabase db push`). Storage bucket + RLS policies included.

## Database (SQL you run on your Supabase)

Enum: `app_role` (`buyer`, `supplier`, `admin`), `order_status` (`pending`, `confirmed`, `delivering`, `delivered`, `canceled`).

Tables:
- `profiles` — id (FK auth.users), email, name, phone, location, created_at. Auto-created via `on_auth_user_created` trigger.
- `user_roles` — separate role table (id, user_id, role) with `has_role(uuid, app_role)` security-definer function. **No roles on profiles.**
- `categories` — id, name (unique), description.
- `products` — id, name, description, price, unit, stock, image_url, location, is_active, supplier_id, category_id, timestamps.
- `orders` — id, buyer_id, total, delivery_address, phone, notes, status, timestamps.
- `order_items` — id, order_id, product_id, quantity, price.

RLS policies (since suppliers are auto-approved):
- profiles: user reads/updates own; admin reads all.
- user_roles: user reads own; admin manages.
- categories: public read; admin write.
- products: public read where `is_active`; supplier writes own; admin writes any.
- orders / order_items: buyer reads own; supplier reads orders containing their products; admin reads all; status updates by supplier (own) or admin.

Storage:
- Bucket `product-images` (public read). Supplier can upload to `{supplier_id}/...` path; public select policy.

Seed: ~6 starter categories (Cement, Sand, Blocks, Gravel, Iron Rods, Tiles, Transport).

## Routes (TanStack file-based)

Public:
- `/` — Landing (hero, CTAs "Order Now" / "Become a Supplier", category preview, trust strip).
- `/auth` — Login / Register tabs, role selection (Buyer/Supplier).
- `/catalog` — Search + category filters + product grid.
- `/products/$id` — Product detail, supplier info, Add to Cart / Order Now.
- `/contact` — Phone, WhatsApp link, email, FAQ accordion, message form.

Protected (under `_authenticated/`):
- `/cart` — Items, quantities, delivery form (address, phone, date, notes), Place Order.
- `/dashboard` — Buyer: past/current orders, status badges, reorder.
- `/supplier` — Overview (stats), Products tab (CRUD + image upload), Orders tab (status updates), Profile tab.
- `/admin` — Suppliers list (toggle active), categories CRUD, products manage, all orders, users & roles. Gated by `has_role(uid, 'admin')`.

## Server functions (`src/lib/*.functions.ts`)

- `products.functions.ts` — listProducts, getProduct, createProduct, updateProduct, deleteProduct.
- `orders.functions.ts` — placeOrder (creates order + items in a transaction via RPC), listMyOrders, listSupplierOrders, listAllOrders, updateOrderStatus.
- `categories.functions.ts` — list, create, update, delete.
- `admin.functions.ts` — listUsers, setUserRole, toggleSupplierActive. Each verifies `has_role` server-side.

Auth state via `@/integrations/supabase/client` in components; protected server fns use `requireSupabaseAuth` middleware. Cart lives in client state (Zustand) until checkout.

## UI / Design

- Tailwind v4 tokens in `src/styles.css`. Primary: deep teal. Soft shadows, rounded-xl cards, generous spacing.
- Inter font, mobile-first responsive.
- shadcn components: Button, Card, Input, Select, Dialog, Sheet (mobile nav + cart drawer), Tabs, Badge (order status colors), Table, Sonner toasts, Skeleton loaders, empty states.
- Navbar: logo, links, cart icon (count badge), Login OR user menu showing name + role.

## Behaviors

- Toasts on order placed, product saved, profile updated.
- Loading skeletons on lists; empty states with CTA.
- Form validation with Zod (email, phone, quantities, prices).
- Status badges: pending=amber, confirmed=blue, delivering=indigo, delivered=green, canceled=red.

## Out of scope for v1

- Payments (room left for Stripe/local provider later).
- Real-time order push notifications (status polled on dashboard load).
- Multi-language.

## Build order

1. Schema migration file + storage bucket SQL + seed categories.
2. Auth (register with role, login, profile auto-create).
3. Landing + Catalog + Product detail (public reads).
4. Cart + Checkout (place order).
5. Buyer dashboard.
6. Supplier dashboard (products CRUD with image upload, orders).
7. Admin dashboard.
8. Contact page, polish, empty/loading states, toasts.

After you approve, I'll start with the SQL migration so you can run it on your Supabase while I build the frontend.
