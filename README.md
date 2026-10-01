# Build Gambia

Build a web app called “Envora” — a construction materials marketplace for urban The Gambia where buyers can order materials directly and suppliers can manage listings.

Goal (outcome)

Buyers can find and order construction materials (cement, sand, blocks, gravel, iron rods, tiles, transport) directly.

Suppliers can list products, update prices/stock, and receive orders.

Admin can approve suppliers and manage the platform.

The platform feels clean, modern, premium, and trustworthy, with a mobile-first design.

Users and roles

Buyer: browse materials, add to cart, place direct orders, track orders.

Supplier: add/edit/delete products, manage stock & price, view incoming orders.

Admin: approve suppliers, manage categories/products, view all orders, manage users.

Data model (Supabase)

Create these tables:

profiles

id (uuid, PK)

email

name

role: enum (BUYER, SUPPLIER, ADMIN)

phone

location

created_at

categories

id (PK)

name (unique)

description

products

id (PK)

name

description

price (float)

unit (e.g., “bag”, “ton”, “piece”)

stock (int)

image_url

location

is_active (boolean)

supplier_id (FK → profiles.id)

category_id (FK → categories.id)

created_at, updated_at

orders

id (PK)

buyer_id (FK → profiles.id)

total (float)

delivery_address

phone

notes

status: enum (PENDING, CONFIRMED, DELIVERING, DELIVERED, CANCELED)

created_at, updated_at

order_items

id (PK)

order_id (FK → orders.id)

product_id (FK → products.id)

quantity (int)

price (float)

Screens (in order of user flow)

Landing page

Headline: “Envora – Order construction materials directly in The Gambia.”

Subhead: “Find cement, sand, blocks, gravel, iron rods, tiles, and transport from trusted suppliers.”

CTA buttons: “Order Now” and “Become a Supplier”.

Categories preview.

Login / Register page

Tabs: Login and Register.

Fields: email, password, name, phone, location.

Role selection: Buyer or Supplier.

“Log In” and “Create Account” buttons.

Use Supabase authentication.

Materials catalog

Category filters.

Search bar.

Product cards: image, name, price per unit, stock, supplier name, location.

“Order” button on each card.

Product details page

Photos.

Name, description, price, unit, available stock.

Supplier info and phone.

Delivery options.

“Add to Cart” and “Order Now” buttons.

Cart / Checkout page

List of items with quantity and total.

Delivery address form.

Phone number.

Delivery date picker.

Notes field.

“Place Order” button.

On submit: create order + order_items.

Buyer dashboard

View past and current orders.

Order status and details.

Reorder button.

Supplier dashboard

Overview: number of products, pending orders, total sales.

Products tab: add, edit, delete products.

Orders tab: view incoming orders, accept, reject, update status.

Profile tab: update contact info and location.

Admin dashboard

Approve suppliers (toggle active/inactive).

Manage categories.

Manage products (edit, delete).

View all orders.

Manage users and roles.

Contact / Support page

Phone number.

WhatsApp link.

Email.

FAQ section.

Message form.

Workflows

Buyer purchases flow

Trigger: Buyer clicks “Order Now”.

Steps: bypass cart or go through cart → add delivery address → submit order.

Outcome: order created with status PENDING, supplier receives notification.

Supplier adds product flow

Trigger: Supplier logs into dashboard.

Steps: click “Add Product” → fill form → upload image → save.

Outcome: new product appears in catalog after admin approval (optional).

Admin approves supplier flow

Trigger: new supplier registers.

Steps: admin sees new supplier in dashboard → click “Approve”.

Outcome: supplier can now add products.

Order status update flow

Trigger: supplier or admin updates order.

Steps: change status from PENDING → CONFIRMED → DELIVERING → DELIVERED/CANCELED.

Outcome: buyer sees updated status in dashboard.

Design style

Premium, clean, and trustworthy.

Modern marketplace look.

Mobile-first and responsive.

Soft shadows, rounded corners.

Primary color: deep blue or teal.

Typography: Inter or system sans-serif.

Use badges for order status.

Use clear CTAs like “Order Now”, “Add to Cart”, “Place Order”.

Auth & security

Use Supabase authentication.

Protect all routes: only logged-in users can access dashboards or place orders.

Role-based access:

Buyers can only see their own orders.

Suppliers can only manage their own products and orders.

Admin can see everything.

Additional behavior

If user is not logged in, show “Login” button; if logged in, show user name and role in navbar.

Show loading states and empty states.

Show success toasts when:

order is placed,

product is added,

profile is updated.

“Ask me any clarifying questions you need before you start building this marketplace.”

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1cb57dc9-4b2e-475d-81cf-791752a4f925).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
