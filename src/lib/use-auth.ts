import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, AppRole } from "./types";
type AuthState = {
  userId: string | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
};
const initial = { userId: null, profile: null, loading: true, error: null, isAuthenticated: false };
const AuthContext = createContext<AuthState>({ ...initial, refresh: async () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [state, setState] = useState(initial as Omit<AuthState, "refresh">);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(async () => {
    setRevision((v) => v + 1);
  }, []);
  useEffect(() => {
    let alive = true;
    let generation = 0;
    async function load() {
      const mine = ++generation;
      setState((s) => ({ ...s, loading: true, error: null, profile: null }));
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!alive || mine !== generation) return;
        if (error || !data.user) {
          setState({ ...initial, loading: false });
          return;
        }
        const user = data.user;
        const [p, r] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
        ]);
        if (!alive || mine !== generation) return;
        if (p.error || r.error || !p.data || !r.data) {
          setState({
            userId: user.id,
            profile: null,
            loading: false,
            error: "Your account could not be loaded. Please retry.",
            isAuthenticated: true,
          });
          return;
        }
        const role = r.data.role as AppRole;
        setState({
          userId: user.id,
          profile: { ...p.data, email: user.email ?? null, role, is_active: true },
          loading: false,
          error: null,
          isAuthenticated: true,
        });
      } catch {
        if (alive && mine === generation)
          setState({ ...initial, loading: false, error: "Unable to connect. Please retry." });
      }
    }
    void load();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      if (event === "SIGNED_OUT") {
        ++generation;
        setState({ ...initial, loading: false });
        qc.clear();
      } else {
        queueMicrotask(() => {
          if (alive) {
            void load();
            void qc.invalidateQueries();
          }
        });
      }
      queueMicrotask(() => {
        if (alive) void router.invalidate();
      });
    });
    return () => {
      alive = false;
      ++generation;
      sub.subscription.unsubscribe();
    };
  }, [router, qc, revision]);
  return createElement(AuthContext.Provider, { value: { ...state, refresh } }, children);
}
export function useAuth() {
  return useContext(AuthContext);
}
