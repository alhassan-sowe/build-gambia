import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Navbar, Footer } from "@/components/navbar";
import { supabase, supabaseConfigured } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: (s.redirect as string) || "/dashboard" }),
  head: () => ({ meta: [{ title: "Sign in — Envora" }, { name: "description", content: "Sign in or create an Envora account to buy or sell construction materials." }] }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const { redirect } = useSearch({ from: "/auth" });
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (isAuthenticated) router.navigate({ to: redirect as any });
  }, [isAuthenticated, redirect, router]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-md px-4 py-12">
        {!supabaseConfigured && (
          <Card className="mb-4 border-destructive/40 bg-destructive/5">
            <CardContent className="p-4 text-sm">
              Supabase isn't configured yet. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> to your env, then reload.
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Envora</CardTitle>
            <CardDescription>Login or create an account to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login"><LoginForm onDone={() => router.navigate({ to: redirect as any })} /></TabsContent>
              <TabsContent value="register"><RegisterForm onDone={() => router.navigate({ to: redirect as any })} /></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

function LoginForm({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const parsed = loginSchema.safeParse(form);
        if (!parsed.success) return toast.error("Enter a valid email and password (6+ chars)");
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        setLoading(false);
        if (error) return toast.error(error.message);
        toast.success("Welcome back");
        onDone();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}

const regSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(7),
  location: z.string().min(2),
  role: z.enum(["buyer", "supplier"]),
});

function RegisterForm({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", location: "", role: "buyer" as "buyer" | "supplier" });
  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const parsed = regSchema.safeParse(form);
        if (!parsed.success) return toast.error("Please fill all fields correctly");
        setLoading(true);
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
            data: {
              name: parsed.data.name,
              phone: parsed.data.phone,
              location: parsed.data.location,
              role: parsed.data.role,
            },
          },
        });
        setLoading(false);
        if (error) return toast.error(error.message);
        toast.success("Account created — you're signed in");
        onDone();
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Full name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+220..." />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Password</Label>
        <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Location (city/area)</Label>
        <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Banjul, Serrekunda…" />
      </div>
      <div className="space-y-2">
        <Label>I am a…</Label>
        <RadioGroup value={form.role} onValueChange={(v) => setForm({ ...form, role: v as any })} className="grid grid-cols-2 gap-3">
          <Label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-accent">
            <RadioGroupItem value="buyer" /> Buyer
          </Label>
          <Label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 hover:bg-accent">
            <RadioGroupItem value="supplier" /> Supplier
          </Label>
        </RadioGroup>
      </div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating account…" : "Create account"}</Button>
    </form>
  );
}