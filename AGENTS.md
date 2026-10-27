# Architecture rules
- Keep the existing TanStack routes and design; pilot data uses the generated Cloud browser client with RLS.
- Read roles only from protected user_roles, never profile fields or user metadata; signup creates buyers and authenticated supplier onboarding uses a restricted RPC.
- Sensitive quote, approval and acceptance transitions use database RPCs with explicit caller checks and empty search_path; orders have no browser writes.
- Use one AuthProvider subscription for shared account state and query invalidation, with generation guards against stale responses.
- Public catalog queries never join private profiles or supplier_businesses; only listing fields are public.
- The versioned supabase migration mirrors the applied Drizzle migration; legacy schema.sql is retained but not applied.
