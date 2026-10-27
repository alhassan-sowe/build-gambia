import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { pageHead } from "@/lib/route-meta";
export const Route = createFileRoute("/contact")({
  head: () => pageHead("Help", "Answers about quotes, supplier approval and payment arrangements."),
  component: () => (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold">Help</h1>
      <p className="mt-4 text-muted-foreground">Support contact details are not available yet.</p>
      <Accordion type="single" collapsible className="mt-8">
        <AccordionItem value="quotes">
          <AccordionTrigger>How do I request materials?</AccordionTrigger>
          <AccordionContent>
            Open a material, submit a quote request and review the supplier response in My quotes.
            Accepting a valid quote creates an unpaid order.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="supplier">
          <AccordionTrigger>Can I become a supplier?</AccordionTrigger>
          <AccordionContent>
            Sign in and complete your business application in the supplier dashboard. Admin approval
            is required before publishing or responding.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="payment">
          <AccordionTrigger>How is payment handled?</AccordionTrigger>
          <AccordionContent>
            Payments are arranged separately with the supplier. Envora does not process or confirm
            payments.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
});
