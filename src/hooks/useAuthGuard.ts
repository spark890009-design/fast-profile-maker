import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useAuthGuard(requireAdmin = false) {
  const nav = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async (s: Session | null) => {
      if (!s) {
        nav("/auth", { replace: true });
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", s.user.id);
      const admin = !!data?.some((r) => r.role === "admin");
      if (!mounted) return;
      setSession(s);
      setIsAdmin(admin);
      if (requireAdmin && !admin) {
        nav("/dashboard", { replace: true });
        return;
      }
      setReady(true);
    };
    supabase.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => check(s));
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [nav, requireAdmin]);

  return { session, isAdmin, ready };
}
