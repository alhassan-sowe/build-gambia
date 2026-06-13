import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPin, Package, ArrowLeft } from "lucide-react";
import { Navbar, Footer } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useCart, formatGMD } from "@/hooks/use-cart";

export const Route = createFileRoute("/products/$id")({
  head: () => ({ meta: [{ title: "Product — Envora" }] }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const add = useCart((s) => s.add);

  const { data: p, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*, categories(name), profiles!products_supplier_id_fkey(name, location, phone)").eq("id", id).maybeSingle();
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/catalog" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to catalog
        </Link>

        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-6 w-1/3" /><Skeleton className="h-32" /></div>
          </div>
        ) : !p ? (
          <div className="rounded-xl border p-10 text-center">Product not found.</div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2">
            <div className="aspect-square overflow-hidden rounded-2xl border bg-muted">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-6xl text-muted-foreground/30">📦</div>
              )}
            </div>
            <div>
              <Badge variant="secondary">{(p as any).categories?.name ?? "Material"}</Badge>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">{p.name}</h1>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="text-4xl font-bold text-primary">{formatGMD(Number(p.price))}</div>
                <div className="text-muted-foreground">/ {p.unit}</div>
              </div>
              <p className="mt-4 whitespace-pre-line text-muted-foreground">{p.description || "No description provided."}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border bg-card p-4 text-sm">
                <div className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> {p.stock} in stock</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {p.location ?? "—"}</div>
              </div>
              {(p as any).profiles && (
                <div className="mt-4 rounded-xl border p-4 text-sm">
                  <div className="text-muted-foreground">Supplier</div>
                  <div className="font-medium">{(p as any).profiles.name}</div>
                  <div className="text-xs text-muted-foreground">{(p as any).profiles.location} · {(p as any).profiles.phone}</div>
                </div>
              )}
              <div className="mt-6 flex gap-3">
                <Button
                  size="lg"
                  disabled={p.stock <= 0}
                  onClick={() => {
                    add({
                      product_id: p.id,
                      supplier_id: p.supplier_id,
                      name: p.name,
                      price: Number(p.price),
                      unit: p.unit,
                      image_url: p.image_url,
                    });
                    toast.success("Added to cart");
                  }}
                >
                  Add to cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  disabled={p.stock <= 0}
                  onClick={() => {
                    add({
                      product_id: p.id,
                      supplier_id: p.supplier_id,
                      name: p.name,
                      price: Number(p.price),
                      unit: p.unit,
                      image_url: p.image_url,
                    });
                    router.navigate({ to: "/cart" });
                  }}
                >
                  Order now
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}