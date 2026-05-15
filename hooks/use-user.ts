"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  username: string;
  avatarUrl: string;
  repoCount: number;
}

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) { setLoading(false); return; }

      const meta = u.user_metadata ?? {};

      // Count connected repos
      const { count } = await supabase
        .from("repositories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", u.id);

      setUser({
        id: u.id,
        email: u.email ?? "",
        name: meta.full_name ?? meta.name ?? meta.user_name ?? "GitHub User",
        username: meta.user_name ?? meta.preferred_username ?? "",
        avatarUrl: meta.avatar_url ?? "",
        repoCount: count ?? 0,
      });
      setLoading(false);
    });
  }, []);

  return { user, loading };
}
