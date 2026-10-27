import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { getProduct } from "@/lib/products.functions";
import { requestQuote } from "@/lib/quotes.functions";
import { useAuth } from "@/lib/use-auth";
import { friendlyError } from "@/lib/pilot-validation";
import { formatGMD } from "@/lib/cart";
import { pageHead } from "@/lib/route-meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
export const Route = createFileRoute("/materials/$productId")({
  head: () =>
    pageHead("Material details", "View material availability and request a supplier quote."),
  component: Detail,
});
function Detail() {
  const { productId } = Route.useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState("1");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const q = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct({ data: { id: productId } }),
  });
  const m = useMutation({
    mutationFn: () =>
      requestQuote({
        product_id: productId,
        quantity: Number(quantity),
        delivery_address: address,
        phone,
        notes,
      }),
    onSuccess: () => {
      toast.success("Quote request submitted");
      void navigate({ to: "/dashboard" });
    },
    onError: (e) => toast.error(friendlyError(e)),
  });
  if (q.isPending) return <p className="p-8">Loading material…</p>;
  if (q.isError)
    return (
      <div className="p-8" role="alert">
        Unable to load material. <Button onClick={() => void q.refetch()}>Retry</Button>
      </div>
    );
  const p = q.data;
  if (!p)
    return (
      <div className="p-8">
        Material not available. <Link to="/materials">Back to materials</Link>
      </div>
    );
  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/materials" className="text-sm text-muted-foreground">
        Back to materials
      </Link>
      <div className="grid md:grid-cols-2 gap-8 mt-5">
        <div className="aspect-square bg-muted border rounded-lg overflow-hidden">
          {p.image_url ? (
            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
          ) : (
            <div className="h-full flex items-center justify-center">
              <Package className="h-20 w-20 text-muted-foreground" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{p.name}</h1>
          <p className="mt-3 text-2xl font-bold text-primary">
            {formatGMD(p.price)} / {p.unit}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Indicative price · {p.stock} available · {p.location}
          </p>
          <p className="mt-5 whitespace-pre-wrap">{p.description}</p>
          <h2 className="text-xl font-semibold mt-8">Request a quote</h2>
          {auth.loading ? (
            <p>Loading account…</p>
          ) : auth.error ? (
            <p role="alert">{auth.error}</p>
          ) : !auth.isAuthenticated ? (
            <Button asChild className="mt-4">
              <Link to="/auth">Sign in to request a quote</Link>
            </Button>
          ) : auth.profile?.role !== "buyer" ? (
            <p className="mt-3">Quote requests require a buyer account.</p>
          ) : (
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                m.mutate();
              }}
            >
              <div>
                <Label htmlFor="quantity">Quantity ({p.unit})</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="1000000"
                  step="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address">Delivery location / address</Label>
                <Textarea
                  id="address"
                  required
                  minLength={3}
                  maxLength={500}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  required
                  minLength={5}
                  maxLength={30}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  maxLength={2000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button disabled={m.isPending} className="w-full">
                {m.isPending ? "Submitting…" : "Submit quote request"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
