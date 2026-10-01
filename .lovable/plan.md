# Envora v1: Rebuild on the Quote-First Model

## Decisions locked in
- Buyers order through quotes only: request a quote, the supplier sends a price, the buyer accepts, and the accepted quote becomes an order. No cart and no direct checkout.
- Suppliers submit business details and documents. An admin approves them before they can publish listings.
- Included in v1: in-app notifications, reviews (after delivery), and favorites.
- The database is rebuilt cleanly. Any existing test data is dropped.
- Out of scope: payments, transport providers, messaging, email and SMS alerts, map search, sub-categories, multiple images per product, price negotiation.

Defaults I'll use until you say otherwise:
- Currency is GMD (shown as "D850").
- The supplier sets the delivery fee in the quote.
- Quotes stay valid for 7 days.
- Buyers can cancel while an order is pending. Suppliers can cancel before delivery starts, with a reason.
- Order statuses: pending, confirmed, out for delivery, delivered, cancelled.
- Fixed units: bag, ton, trip, piece, length, m², m³.
- Delivery regions: Banjul, Kanifing (KMC), Brikama/West Coast.

## What users will see
**Public:** home, marketplace (search, category filter, region filter, pages of results), product page, supplier directory, supplier profile, contact, sign in / register.

**Buyer:** dashboard, quote requests (accept or decline), orders with a status timeline, favorites, notifications, leave a review after delivery.

**Supplier:** onboarding (business profile and document upload, then "pending approval"), dashboard, products (add, edit, deactivate), incoming quotes (respond with price, fee and validity), orders (update status), notifications.

**Admin:** overview counts, supplier verification queue (view documents, approve or reject with a reason, suspend), users, products (deactivate), categories, all quotes and orders, review moderation.

## Build order
1. New database setup: tables, security rules, server-side actions, storage, seed categories. Delivered as a migration you run in Supabase.
2. Auth and roles (signup offers buyer or supplier only), plus the shared app frame and navigation.
3. Supplier onboarding and the admin verification queue.
4. Products, marketplace, product page, supplier directory.
5. Quote flow, then order flow.
6. Notifications, favorites, reviews.
7. Admin pages, empty, loading and error states, mobile check.
8. Security test pass: buyer A cannot see buyer B's records, no self-promotion to admin, no price tampering.

## Technical details
- **Stack:** keep TanStack Start. Keep the browser Supabase client and RLS. All state changes go through Postgres `SECURITY DEFINER` RPCs. No Edge Functions.
- **Migration:** a single `supabase/migrations/0001_envora_v1.sql`. It drops the old objects (profiles.role, the old enums, old orders and products) and recreates everything. The old `schema.sql` is removed.
- **Tables:**
  - `profiles` (id = auth uid, readable only by the owner, admins and counterparties)
  - `user_roles` + `has_role()` (enum: customer, supplier, admin)
  - `suppliers` (owner_user_id unique, verification_status pending/approved/rejected, is_suspended, rejection_reason)
  - `supplier_documents` (private bucket)
  - `categories` (slug, is_active, sort_order)
  - `products` (supplier_id, category_id, unit, price, a null price means "request quote", availability_status, image_url, is_active)
  - `favorites` (unique user + product)
  - `quotes` and `quote_items` (single supplier, totals computed by the server, valid_until)
  - `orders` (unique quote_id, snapshot of totals and address)
  - `order_items` (snapshot of name, unit and price)
  - `order_status_history`
  - `reviews` (unique order_id, rating 1–5, delivered orders only)
  - `notifications`
  - `audit_log`
- **RPCs:**
  - `request_quote`, `respond_quote`, `accept_quote` (creates the order), `decline_quote`, `cancel_quote`
  - `update_order_status` (transition guard), `cancel_order`
  - `submit_supplier_verification`, `admin_review_supplier`, `admin_set_suspended`, `admin_set_role`
  - `submit_review`, `mark_notifications_read`
- Notifications are created by triggers on changes to quotes, orders and verification.
- **RLS:**
  - Clients get SELECT plus a narrow INSERT. There are no direct UPDATE grants on quotes or orders.
  - Product inserts require an approved, non-suspended supplier.
  - Public supplier info lives in `suppliers`. Personal data stays out of public reads.
- **Signup trigger:** whitelists only customer or supplier from the signup metadata.
- **Storage:**
  - `product-images` is public to read. Writes are allowed only under `{supplier_id}/`.
  - `supplier-docs` is private. Owners and admins can read it, through signed URLs.
- **Indexes:** the spec's list, a trigram index on product names, and indexes on ownership keys used by policies. Marketplace lists are paginated (24 per page).
- **Frontend:** remove the cart and checkout. Rename the `/materials` pages to `/marketplace`. Add `/suppliers`, `/suppliers/$id`, `/onboarding`, and the quotes, orders, notifications and favorites pages under `_authenticated`. Rewrite the data modules to use lowercase enums and RPCs.
- **Seed:** the spec's categories. Test users are created through signup, then promoted to admin with one SQL line.
