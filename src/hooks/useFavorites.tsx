import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export interface FavoriteProduct {
  product_id: string;
  product_name: string;
  product_category: string | null;
  product_price: string | null;
  product_image: string | null;
}

export interface FavoriteRow extends FavoriteProduct {
  id: string;
  created_at: string;
}

interface FavoritesContextValue {
  favorites: FavoriteRow[];
  favoriteIds: Set<string>;
  loading: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: FavoriteProduct) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  count: number;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  favoriteIds: new Set(),
  loading: false,
  isFavorite: () => false,
  toggleFavorite: async () => {},
  removeFavorite: async () => {},
  count: 0,
});

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    let active = true;
    setLoading(true);
    supabase
      .from("favorites")
      .select("id, product_id, product_name, product_category, product_price, product_image, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          toast({ title: "Could not load favorites", description: error.message, variant: "destructive" });
        } else if (data) {
          setFavorites(data as FavoriteRow[]);
        }
        setLoading(false);
      });
    return () => { active = false; };
  }, [user]);

  const favoriteIds = new Set(favorites.map((f) => f.product_id));

  const isFavorite = useCallback((productId: string) => favoriteIds.has(productId), [favoriteIds]);

  const toggleFavorite = useCallback(async (product: FavoriteProduct) => {
    if (!user) return;
    const existing = favorites.find((f) => f.product_id === product.product_id);

    if (existing) {
      // optimistic remove
      setFavorites((prev) => prev.filter((f) => f.product_id !== product.product_id));
      const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
      if (error) {
        setFavorites((prev) => [existing, ...prev]);
        toast({ title: "Could not remove favorite", description: error.message, variant: "destructive" });
      }
    } else {
      // optimistic add with temp id
      const tempId = `temp-${product.product_id}`;
      const tempRow: FavoriteRow = { ...product, id: tempId, created_at: new Date().toISOString() };
      setFavorites((prev) => [tempRow, ...prev]);
      const { data, error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, ...product })
        .select("id, product_id, product_name, product_category, product_price, product_image, created_at")
        .single();
      if (error) {
        setFavorites((prev) => prev.filter((f) => f.id !== tempId));
        toast({ title: "Could not save favorite", description: error.message, variant: "destructive" });
      } else if (data) {
        setFavorites((prev) => prev.map((f) => (f.id === tempId ? (data as FavoriteRow) : f)));
      }
    }
  }, [user, favorites]);

  const removeFavorite = useCallback(async (productId: string) => {
    const existing = favorites.find((f) => f.product_id === productId);
    if (!existing) return;
    setFavorites((prev) => prev.filter((f) => f.product_id !== productId));
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
    if (error) {
      setFavorites((prev) => [existing, ...prev]);
      toast({ title: "Could not remove favorite", description: error.message, variant: "destructive" });
    }
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      favoriteIds,
      loading,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      count: favorites.length,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);
