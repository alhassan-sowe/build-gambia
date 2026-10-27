import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/route-meta";
export const Route = createFileRoute("/checkout")({
  head: () =>
    pageHead("Request quotes", "Browse materials and request quotes before accepting an order."),
  component: () => (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">Request a quote first</h1>
      <p className="mt-3 text-muted-foreground">
        Checkout is not available. Accept a supplier quote to create an unpaid order.
      </p>
      <Button asChild className="mt-5">
        <Link to="/materials">Browse materials</Link>
      </Button>
    </div>
  ),
});
