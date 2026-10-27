import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/use-auth";
import { QuoteList, OrdersList } from "@/components/quote-list";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/route-meta";
export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => pageHead("My quotes", "View your quote requests and accepted orders."),
  component: Dashboard,
});
function Dashboard() {
  const a = useAuth();
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">My quotes</h1>
      {a.error && <p role="alert">{a.error}</p>}
      <Button asChild className="mt-4">
        <Link to="/materials">Browse materials</Link>
      </Button>
      <section className="mt-8">
        <QuoteList />
      </section>
      <h2 className="text-xl font-semibold mt-10 mb-4">Accepted orders</h2>
      <OrdersList />
    </div>
  );
}
