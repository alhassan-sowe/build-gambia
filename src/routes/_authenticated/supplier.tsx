import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/use-auth";
import { getMyBusiness, registerSupplier } from "@/lib/quotes.functions";
import {
  listMyProducts,
  createProduct,
  updateProduct,
  toggleProductActive,
} from "@/lib/products.functions";
import { listCategories } from "@/lib/categories.functions";
import { friendlyError } from "@/lib/pilot-validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { QuoteList, OrdersList } from "@/components/quote-list";
import { pageHead } from "@/lib/route-meta";
import type { Database } from "@/integrations/supabase/types";
type Product = Database["public"]["Tables"]["products"]["Row"];
export const Route = createFileRoute("/_authenticated/supplier")({
  head: () =>
    pageHead(
      "Supplier dashboard",
      "Manage your business application, listings and quote responses.",
    ),
  component: Supplier,
});
function Supplier() {
  const auth = useAuth();
  const q = useQuery({ queryKey: ["my-business"], queryFn: getMyBusiness });
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const m = useMutation({
    mutationFn: () => registerSupplier({ name, location }),
    onSuccess: () => {
      sessionStorage.removeItem("envora-supplier-intent");
      void auth.refresh();
      void qc.invalidateQueries();
      toast.success("Application submitted for approval");
    },
    onError: (e) => toast.error(friendlyError(e)),
  });
  if (q.isPending || auth.loading) return <p className="p-8">Loading supplier account…</p>;
  if (q.isError || auth.error)
    return (
      <div className="p-8" role="alert">
        Could not load your account.{" "}
        <Button
          onClick={() => {
            void q.refetch();
            void auth.refresh();
          }}
        >
          Retry
        </Button>
      </div>
    );
  const approved = q.data?.verification_status === "approved";
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Supplier dashboard</h1>
      {!q.data ? (
        <form
          className="max-w-lg mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            m.mutate();
          }}
        >
          <h2 className="text-xl font-semibold">Business application</h2>
          <div>
            <Label htmlFor="business-name">Business name</Label>
            <Input
              id="business-name"
              required
              minLength={2}
              maxLength={150}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="business-location">Business location</Label>
            <Input
              id="business-location"
              required
              minLength={2}
              maxLength={500}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Admin approval is required before listing materials or responding to quotes.
          </p>
          <Button disabled={m.isPending}>Submit application</Button>
        </form>
      ) : (
        <>
          <p className="mt-3">
            {q.data.business_name} · {q.data.verification_status}
          </p>
          {!approved && (
            <p className="mt-3 text-muted-foreground">
              Publishing and quote responses are unavailable until approved.
            </p>
          )}
          <Tabs defaultValue="products" className="mt-6">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="quotes">Quotes</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="products">
              <Products approved={approved} />
            </TabsContent>
            <TabsContent value="quotes">
              <QuoteList supplier approved={approved} />
            </TabsContent>
            <TabsContent value="orders">
              <OrdersList />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
function Products({ approved }: { approved: boolean }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["my-products"], queryFn: listMyProducts });
  const cats = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      toggleProductActive({ data: { id, is_active: active } }),
    onSuccess: () => void qc.invalidateQueries(),
    onError: (e) => toast.error(friendlyError(e)),
  });
  return (
    <div className="mt-6">
      <Button
        disabled={!approved}
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
      >
        Add product
      </Button>
      {open && (
        <ProductForm
          key={editing?.id ?? "new"}
          initial={editing}
          categories={cats.data || []}
          done={() => {
            setOpen(false);
            void qc.invalidateQueries();
          }}
        />
      )}
      {q.isPending ? (
        <p>Loading listings…</p>
      ) : q.isError ? (
        <p role="alert">Could not load listings.</p>
      ) : (
        <div className="space-y-3 mt-4">
          {!q.data.length && <p>No listings yet.</p>}
          {q.data.map((p) => (
            <Card key={p.id} className="p-4 flex flex-wrap gap-3 justify-between">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p>
                  {p.stock} {p.unit} · {p.is_active ? "Active" : "Archived"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!approved}
                  onClick={() => {
                    setEditing(p);
                    setOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  disabled={!approved || toggle.isPending}
                  onClick={() => toggle.mutate({ id: p.id, active: !p.is_active })}
                >
                  {p.is_active ? "Archive" : "Publish"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
function ProductForm({
  initial,
  categories,
  done,
}: {
  initial: Product | null;
  categories: { id: string; name: string }[];
  done: () => void;
}) {
  const [f, setF] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    price: String(initial?.price ?? ""),
    stock: String(initial?.stock ?? 0),
    unit: initial?.unit ?? "bag",
    location: initial?.location ?? "",
    category_id: initial?.category_id ?? "",
    image_url: initial?.image_url ?? "",
  });
  const m = useMutation({
    mutationFn: () => {
      const data = {
        ...f,
        price: Number(f.price),
        stock: Number(f.stock),
        category_id: f.category_id || null,
        image_url: f.image_url || null,
      };
      return initial
        ? updateProduct({ data: { ...data, id: initial.id } })
        : createProduct({ data });
    },
    onSuccess: () => {
      toast.success("Product saved");
      done();
    },
    onError: (e) => toast.error(friendlyError(e)),
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate();
      }}
      className="max-w-2xl my-6 space-y-3 border-y py-5"
    >
      <h2 className="font-semibold">{initial ? "Edit product" : "New product"}</h2>
      {(["name", "price", "stock", "unit", "location", "image_url"] as const).map((k) => (
        <div key={k}>
          <Label htmlFor={`product-${k}`}>
            {
              {
                name: "Material name",
                price: "Indicative unit price (GMD)",
                stock: "Stock",
                unit: "Unit",
                location: "Location",
                image_url: "Photo URL (HTTPS, optional)",
              }[k]
            }
          </Label>
          <Input
            id={`product-${k}`}
            type={k === "price" || k === "stock" ? "number" : k === "image_url" ? "url" : "text"}
            min={k === "price" ? "0.01" : k === "stock" ? "0" : undefined}
            step={k === "price" ? "0.01" : k === "stock" ? "1" : undefined}
            maxLength={k === "image_url" ? 2000 : k === "location" ? 500 : 150}
            required={["name", "price", "stock", "unit"].includes(k)}
            value={f[k]}
            onChange={(e) => setF({ ...f, [k]: e.target.value })}
          />
        </div>
      ))}
      <Label htmlFor="category">Category</Label>
      <select
        id="category"
        className="w-full border rounded-md p-2 bg-background"
        value={f.category_id}
        onChange={(e) => setF({ ...f, category_id: e.target.value })}
      >
        <option value="">Uncategorized</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        maxLength={3000}
        value={f.description}
        onChange={(e) => setF({ ...f, description: e.target.value })}
      />
      <div className="flex gap-2">
        <Button disabled={m.isPending}>Save product</Button>
        <Button type="button" variant="outline" onClick={done}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
