import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface RecentlyViewedItem {
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_price: number | null;
  product_category: string | null;
  viewed_at: string;
}

const STORAGE_KEY = "linea-recently-viewed-guest";
const MAX_ITEMS = 12;

const readGuest = (): RecentlyViewedItem[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};
const writeGuest = (items: RecentlyViewedItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
};

export const useRecentlyViewed = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems(readGuest());
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("recently_viewed")
      .select("*")
      .eq("user_id", user.id)
      .order("viewed_at", { ascending: false })
      .limit(MAX_ITEMS);
    setItems(
      ((data ?? []) as any[]).map((d) => ({
        product_id: d.product_id,
        product_name: d.product_name,
        product_image: d.product_image,
        product_price: d.product_price !== null ? Number(d.product_price) : null,
        product_category: d.product_category,
        viewed_at: d.viewed_at,
      })),
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const track = useCallback(
    async (item: Omit<RecentlyViewedItem, "viewed_at">) => {
      const newItem: RecentlyViewedItem = { ...item, viewed_at: new Date().toISOString() };
      if (!user) {
        const existing = readGuest().filter((i) => i.product_id !== item.product_id);
        const next = [newItem, ...existing].slice(0, MAX_ITEMS);
        writeGuest(next);
        setItems(next);
        return;
      }
      await supabase.from("recently_viewed").upsert(
        {
          user_id: user.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          product_price: item.product_price,
          product_category: item.product_category,
          viewed_at: newItem.viewed_at,
        },
        { onConflict: "user_id,product_id" },
      );
      setItems((prev) => {
        const without = prev.filter((i) => i.product_id !== item.product_id);
        return [newItem, ...without].slice(0, MAX_ITEMS);
      });
    },
    [user],
  );

  return { items, loading, track, refresh };
};