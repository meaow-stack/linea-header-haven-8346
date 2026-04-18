import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export interface CartProductInput {
  product_id: string;
  product_name: string;
  product_category: string | null;
  product_image: string | null;
  product_price: number;
}

export interface CartItem extends CartProductInput {
  id: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  loading: boolean;
  count: number;
  subtotal: number;
  addItem: (product: CartProductInput, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  loading: false,
  count: 0,
  subtotal: 0,
  addItem: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
});

const STORAGE_KEY = "linea-cart-guest";

const readGuestCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const writeGuestCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMerged, setHasMerged] = useState(false);

  // Load guest cart on first mount
  useEffect(() => {
    if (!user && !authLoading) {
      setItems(readGuestCart());
    }
  }, [user, authLoading]);

  // When user signs in, merge guest cart into DB then load DB cart
  useEffect(() => {
    if (!user || hasMerged) return;
    let active = true;
    setLoading(true);

    (async () => {
      const guestItems = readGuestCart();

      // Merge guest items
      if (guestItems.length > 0) {
        for (const g of guestItems) {
          await supabase
            .from("cart_items")
            .upsert(
              {
                user_id: user.id,
                product_id: g.product_id,
                product_name: g.product_name,
                product_category: g.product_category,
                product_image: g.product_image,
                product_price: g.product_price,
                quantity: g.quantity,
              },
              { onConflict: "user_id,product_id" },
            );
        }
        writeGuestCart([]);
      }

      const { data, error } = await supabase
        .from("cart_items")
        .select("id, product_id, product_name, product_category, product_image, product_price, quantity")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        toast({ title: "Could not load cart", description: error.message, variant: "destructive" });
      } else if (data) {
        setItems(
          data.map((row) => ({
            id: row.id,
            product_id: row.product_id,
            product_name: row.product_name,
            product_category: row.product_category,
            product_image: row.product_image,
            product_price: Number(row.product_price),
            quantity: row.quantity,
          })),
        );
      }
      setLoading(false);
      setHasMerged(true);
    })();

    return () => {
      active = false;
    };
  }, [user, hasMerged]);

  // Reset merge flag when user signs out
  useEffect(() => {
    if (!user) {
      setHasMerged(false);
      setItems(readGuestCart());
    }
  }, [user]);

  // Persist guest cart whenever it changes
  useEffect(() => {
    if (!user) writeGuestCart(items);
  }, [items, user]);

  const addItem = useCallback(
    async (product: CartProductInput, quantity = 1) => {
      const existing = items.find((i) => i.product_id === product.product_id);
      const newQty = (existing?.quantity ?? 0) + quantity;

      if (user) {
        const { data, error } = await supabase
          .from("cart_items")
          .upsert(
            {
              user_id: user.id,
              ...product,
              quantity: newQty,
            },
            { onConflict: "user_id,product_id" },
          )
          .select("id, product_id, product_name, product_category, product_image, product_price, quantity")
          .single();
        if (error) {
          toast({ title: "Could not add to bag", description: error.message, variant: "destructive" });
          return;
        }
        if (data) {
          setItems((prev) => {
            const without = prev.filter((i) => i.product_id !== product.product_id);
            return [
              {
                id: data.id,
                product_id: data.product_id,
                product_name: data.product_name,
                product_category: data.product_category,
                product_image: data.product_image,
                product_price: Number(data.product_price),
                quantity: data.quantity,
              },
              ...without,
            ];
          });
        }
      } else {
        setItems((prev) => {
          const idx = prev.findIndex((i) => i.product_id === product.product_id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], quantity: newQty };
            return next;
          }
          return [{ ...product, id: `guest-${product.product_id}`, quantity }, ...prev];
        });
      }

      toast({ title: "Added to bag", description: product.product_name });
    },
    [items, user],
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeItemImpl(productId);
        return;
      }
      const existing = items.find((i) => i.product_id === productId);
      if (!existing) return;

      setItems((prev) => prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i)));

      if (user) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("user_id", user.id)
          .eq("product_id", productId);
        if (error) {
          setItems((prev) => prev.map((i) => (i.product_id === productId ? existing : i)));
          toast({ title: "Could not update", description: error.message, variant: "destructive" });
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, user],
  );

  const removeItemImpl = async (productId: string) => {
    const existing = items.find((i) => i.product_id === productId);
    if (!existing) return;
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
    if (user) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      if (error) {
        setItems((prev) => [existing, ...prev]);
        toast({ title: "Could not remove", description: error.message, variant: "destructive" });
      }
    }
  };

  const removeItem = useCallback(removeItemImpl, [items, user]);

  const clearCart = useCallback(async () => {
    setItems([]);
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    } else {
      writeGuestCart([]);
    }
  }, [user]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product_price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, count, subtotal, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
