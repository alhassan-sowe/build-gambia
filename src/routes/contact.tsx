import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import { Navbar, Footer } from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Envora" }, { name: "description", content: "Get in touch with the Envora team for support, partnerships, or supplier onboarding." }] }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Get in touch</h1>
        <p className="mt-1 text-muted-foreground">We're here to help buyers and suppliers across The Gambia.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { icon: Phone, label: "Call us", value: "+220 000 0000" },
            { icon: MessageCircle, label: "WhatsApp", value: "+220 000 0000" },
            { icon: Mail, label: "Email", value: "hello@envora.gm" },
            { icon: MapPin, label: "Office", value: "Kanifing, The Gambia" },
          ].map((c) => (
            <Card key={c.label}>
              <CardContent className="flex items-center gap-3 p-5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><c.icon className="h-5 w-5" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                  <div className="font-medium">{c.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="mt-12 text-xl font-bold">Frequently asked</h2>
        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="1"><AccordionTrigger>How do I become a supplier?</AccordionTrigger><AccordionContent>Create an account and select "Supplier" during signup. You'll be able to list products immediately.</AccordionContent></AccordionItem>
          <AccordionItem value="2"><AccordionTrigger>How is delivery handled?</AccordionTrigger><AccordionContent>Suppliers manage delivery. You can also book a Transport listing separately for haulage.</AccordionContent></AccordionItem>
          <AccordionItem value="3"><AccordionTrigger>Can I pay on delivery?</AccordionTrigger><AccordionContent>Yes. Payment is arranged directly with the supplier on delivery in this version.</AccordionContent></AccordionItem>
        </Accordion>
      </div>
      <Footer />
    </div>
  );
}