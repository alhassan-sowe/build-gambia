import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/use-auth";
import { listBusinesses, reviewSupplier } from "@/lib/quotes.functions";
import { friendlyError } from "@/lib/pilot-validation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuoteList, OrdersList } from "@/components/quote-list";
import { pageHead } from "@/lib/route-meta";
export const Route = createFileRoute("/_authenticated/admin")({
  head: () => pageHead("Supplier review", "Review supplier applications and view pilot activity."),
  component: Admin,
});
function Admin() {
  const auth = useAuth();
  if (auth.loading) return <p className="p-8">Loading account…</p>;
  if (auth.profile?.role !== "admin") return <p className="p-8">Admin access required.</p>;
  return <AdminContent />;
}
function AdminContent() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["businesses"], queryFn: listBusinesses });
  const m = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      reviewSupplier(id, status, ""),
    onSuccess: () => {
      void qc.invalidateQueries();
      toast.success("Supplier review saved");
    },
    onError: (e) => toast.error(friendlyError(e)),
  });
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Supplier review</h1>
      <div className="space-y-3 mt-6">
        {q.isPending ? (
          <p>Loading applications…</p>
        ) : q.isError ? (
          <p role="alert">Could not load applications.</p>
        ) : !q.data.length ? (
          <p>No supplier applications yet.</p>
        ) : (
          q.data.map((b) => (
            <Card key={b.id} className="p-5">
              <h2 className="font-semibold">{b.business_name}</h2>
              <p>
                {b.location} · {b.verification_status}
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  disabled={m.isPending || b.verification_status === "approved"}
                  onClick={() => m.mutate({ id: b.id, status: "approved" })}
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  disabled={m.isPending || b.verification_status === "rejected"}
                  onClick={() => m.mutate({ id: b.id, status: "rejected" })}
                >
                  Reject
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
      <h2 className="text-xl font-semibold mt-10 mb-4">Quote requests</h2>
      <QuoteList supplier />
      <h2 className="text-xl font-semibold mt-10 mb-4">Orders</h2>
      <OrdersList />
    </div>
  );
}
