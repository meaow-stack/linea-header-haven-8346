import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface PointEntry {
  id: string;
  kind: "earn" | "redeem" | "adjust" | "expire";
  points: number;
  reason: string | null;
  order_id: string | null;
  created_at: string;
}

export const useLoyaltyPoints = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<PointEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setEntries([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("loyalty_points")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setEntries((data ?? []) as PointEntry[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const balance = entries.reduce(
    (sum, e) => sum + (e.kind === "earn" || e.kind === "adjust" ? e.points : -e.points),
    0,
  );

  return { entries, balance, loading, refresh };
};