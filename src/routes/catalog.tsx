import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Navbar, Footer } from "@/components/navbar";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatGMD } from "@/hooks/use-cart";

export const Route = createFileRoute("/catalog")({
  validateSearch: (s: Record<string, unknown>) => ({ category: (s.category as string) || "", q: (s.q as string) || "" }),
  head: () => ({ meta: [{ title: "Catalog — Envora" }, { name: "description", content: "Browse construction materials and transport services from suppliers across The Gambia." }] }),
  component: CatalogPage,
});

function CatalogPage() {
  const search = useSearch({ from: "/catalog" });
  const [q, setQ] = useState(search.q);
  const [cat, setCat] = useState(search.category);

  const { data: cats } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", cat, q],
    queryFn: async () => {
      let query = supabase.from("products").select("*, categories(name)").eq("is_active", true);
      if (cat) query = query.eq("category_id", cat);
      if (q) query = query.ilike("name", `%${q}%`);
      const { data } = await query.order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Catalog</h1>
        <p className="mt-1 text-muted-foreground">All construction materials, in one place.</p>

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative md:max-w-sm md:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search materials…" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={cat === "" ? "default" : "outline"} size="sm" onClick={() => setCat("")}>All</Button>
            {(cats ?? []).map((c: any) => (
              <Button key={c.id} variant={cat === c.id ? "default" : "outline"} size="sm" onClick={() => setCat(c.id)}>{c.name}</Button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
            : (products ?? []).map((p: any) => (
                <Link
                  key={p.id}
                  to="/products/$id"
                  params={{ id: p.id }}
                  className="group"
                >
                  <Card className="h-full overflow-hidden transition hover:shadow-lg">
                    <div className="aspect-square overflow-hidden bg-muted">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-4xl text-muted-foreground/40">📦</div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="text-[10px]">{p.categories?.name ?? "Material"}</Badge>
                      <div className="mt-2 line-clamp-1 font-semibold">{p.name}</div>
                      <div className="mt-1 flex items-baseline justify-between">
                        <div className="text-lg font-bold text-primary">{formatGMD(Number(p.price))}</div>
                        <div className="text-xs text-muted-foreground">/ {p.unit}</div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"} • {p.location ?? "—"}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
        {!isLoading && products?.length === 0 && (
          <div className="rounded-xl border bg-card p-10 text-center">
            <div className="text-4xl">🔍</div>
            <h3 className="mt-2 font-semibold">No products yet</h3>
            <p className="text-sm text-muted-foreground">Try a different search or check back soon.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}