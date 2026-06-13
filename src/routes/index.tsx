import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Truck, ShieldCheck, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar, Footer } from "@/components/navbar";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Envora — Order Construction Materials in The Gambia" },
      { name: "description", content: "Cement, sand, blocks, gravel, iron rods, tiles and transport — ordered directly from trusted suppliers across urban Gambia." },
      { property: "og:title", content: "Envora — Construction Materials Marketplace" },
      { property: "og:description", content: "Order construction materials directly from suppliers across The Gambia." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { data: cats } = useQuery({
    queryKey: ["categories-home"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-accent/20" />
        <div className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> Built for The Gambia
            </span>
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Building materials, <span className="text-primary">delivered direct.</span>
            </h1>
            <p className="mt-4 max-w-lg text-balance text-lg text-muted-foreground">
              Skip the middlemen. Order cement, sand, blocks, iron rods, tiles and transport
              from verified suppliers across urban Gambia.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalog">
                <Button size="lg" className="gap-2">
                  Order materials <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">Become a supplier</Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Same-day in Banjul</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Verified suppliers</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Real-time stock</div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border bg-muted shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80"
                alt="Construction site"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Shop by category</h2>
            <p className="mt-1 text-muted-foreground">Everything for your project, from foundation to finish.</p>
          </div>
          <Link to="/catalog" className="hidden text-sm font-medium text-primary hover:underline md:inline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(cats ?? []).map((c: any) => (
            <Link key={c.id} to="/catalog" search={{ category: c.id } as any}>
              <Card className="group h-full transition hover:border-primary hover:shadow-md">
                <CardContent className="flex flex-col items-start gap-2 p-5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-lg text-primary">
                    {c.name[0]}
                  </div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.description}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold tracking-tight">How Envora works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { n: "1", t: "Browse & compare", d: "Find materials with real prices and live stock from local suppliers." },
              { n: "2", t: "Place your order", d: "Set delivery address and quantity — pay on delivery." },
              { n: "3", t: "Get it delivered", d: "Suppliers confirm, dispatch and deliver to your site." },
            ].map((s) => (
              <Card key={s.n}>
                <CardContent className="p-6">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-bold">{s.n}</div>
                  <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
