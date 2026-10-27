import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { listQuotes, respondQuote, decideQuote } from "@/lib/quotes.functions";
import { listMyOrders } from "@/lib/orders.functions";
import { formatGMD } from "@/lib/cart";
import { friendlyError } from "@/lib/pilot-validation";
export function QuoteList({
  supplier = false,
  approved = false,
}: {
  supplier?: boolean;
  approved?: boolean;
}) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["quotes"], queryFn: listQuotes, refetchInterval: 30000 });
  const decision = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) => decideQuote(id, accept),
    onSuccess: () => {
      void qc.invalidateQueries();
      toast.success("Quote decision saved");
    },
    onError: (e) => toast.error(friendlyError(e)),
  });
  if (q.isPending) return <p>Loading quote requests…</p>;
  if (q.isError)
    return (
      <div role="alert">
        Could not load requests.{" "}
        <Button variant="outline" onClick={() => void q.refetch()}>
          Retry
        </Button>
      </div>
    );
  return (
    <div className="space-y-4">
      {!q.data.length && <p className="text-muted-foreground">No quote requests yet.</p>}
      {q.data.map((r) => {
        const response = r.quote_responses[0];
        const expired = response && Date.parse(response.expires_at) <= Date.now();
        return (
          <Card key={r.id} className="p-5">
            <div className="flex justify-between gap-2 flex-wrap">
              <h3 className="font-semibold">
                {r.quantity} × {r.product_name}
              </h3>
              <span className="text-sm">{r.status}</span>
            </div>
            <p className="text-sm mt-2">
              {r.delivery_address} · {r.phone}
            </p>
            {r.notes && <p className="text-sm mt-2 whitespace-pre-wrap">{r.notes}</p>}
            {response && (
              <div className="border-t mt-3 pt-3 space-y-2">
                <p>
                  Unit price: {formatGMD(response.unit_price)} · Delivery:{" "}
                  {formatGMD(response.delivery_fee)}
                </p>
                <p className="font-semibold">
                  Total: {formatGMD(r.quantity * response.unit_price + response.delivery_fee)}
                </p>
                <p className="text-sm">
                  Valid until {new Date(response.expires_at).toLocaleString()}
                  {expired ? " (expired)" : ""}
                </p>
                <p className="text-sm whitespace-pre-wrap">{response.notes}</p>
                {!supplier && r.status === "responded" && (
                  <div className="flex gap-2">
                    <Button
                      disabled={decision.isPending || Boolean(expired)}
                      onClick={() => decision.mutate({ id: r.id, accept: true })}
                    >
                      Accept quote
                    </Button>
                    <Button
                      variant="outline"
                      disabled={decision.isPending}
                      onClick={() => decision.mutate({ id: r.id, accept: false })}
                    >
                      Reject quote
                    </Button>
                  </div>
                )}
              </div>
            )}
            {supplier && approved && r.status === "pending" && <ResponseForm id={r.id} />}
          </Card>
        );
      })}
    </div>
  );
}
function ResponseForm({ id }: { id: string }) {
  const qc = useQueryClient();
  const [price, setPrice] = useState("");
  const [fee, setFee] = useState("0");
  const [expiry, setExpiry] = useState("");
  const [notes, setNotes] = useState("");
  const m = useMutation({
    mutationFn: () =>
      respondQuote(id, {
        price: Number(price),
        delivery_fee: Number(fee),
        expires_at: expiry ? new Date(expiry).toISOString() : "",
        notes,
      }),
    onSuccess: () => {
      void qc.invalidateQueries();
      toast.success("Quote sent");
    },
    onError: (e) => toast.error(friendlyError(e)),
  });
  return (
    <form
      className="mt-4 grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate();
      }}
    >
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <Label htmlFor={`price-${id}`}>Unit price (GMD)</Label>
          <Input
            id={`price-${id}`}
            type="number"
            step="0.01"
            min="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`fee-${id}`}>Delivery fee (GMD)</Label>
          <Input
            id={`fee-${id}`}
            type="number"
            step="0.01"
            min="0"
            required
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`expiry-${id}`}>Valid until</Label>
          <Input
            id={`expiry-${id}`}
            type="datetime-local"
            required
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
        </div>
      </div>
      <Label htmlFor={`notes-${id}`}>Quote notes</Label>
      <Textarea
        id={`notes-${id}`}
        maxLength={2000}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <Button disabled={m.isPending} type="submit">
        {m.isPending ? "Sending…" : "Send quote"}
      </Button>
    </form>
  );
}
export function OrdersList() {
  const q = useQuery({ queryKey: ["orders"], queryFn: listMyOrders });
  if (q.isPending) return <p>Loading orders…</p>;
  if (q.isError) return <p role="alert">Could not load orders.</p>;
  return (
    <div className="space-y-3">
      {!q.data.length && <p className="text-muted-foreground">No accepted quotes yet.</p>}
      {q.data.map((o) => (
        <Card key={o.id} className="p-5">
          <h3 className="font-semibold">
            Order #{o.id.slice(0, 8)} — {o.product_name}
          </h3>
          <p>
            {o.quantity} {o.unit} · {formatGMD(o.total)}
          </p>
          <p className="text-sm">
            {o.status} · Payment not recorded ({o.payment_status})
          </p>
          <p className="text-sm mt-2">{o.delivery_address}</p>
        </Card>
      ))}
    </div>
  );
}
