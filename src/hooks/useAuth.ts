import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  const checkRole = useCallback(async (u: User | null) => {
    if (!u) return setIsAdmin(false);
    const { data } = await supabase.rpc("has_role", { _user_id: u.id, _role: "admin" });
    setIsAdmin(!!data);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setTimeout(() => void checkRole(u), 0);
    });
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      await checkRole(data.user);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [checkRole]);

  return { user, isAdmin, ready, refreshRole: () => checkRole(user) };
}
