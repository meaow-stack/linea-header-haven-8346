import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  author_name: string | null;
  created_at: string;
  updated_at: string;
}

export const useReviews = (productId: string | undefined) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Could not load reviews", description: error.message, variant: "destructive" });
    } else if (data) {
      setReviews(data as Review[]);
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const myReview = user ? reviews.find((r) => r.user_id === user.id) : undefined;
  const average =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  const submit = useCallback(
    async (input: { rating: number; title: string; comment: string }) => {
      if (!user || !productId) return false;
      const payload = {
        user_id: user.id,
        product_id: productId,
        rating: input.rating,
        title: input.title || null,
        comment: input.comment || null,
        author_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Customer",
      };
      const { error } = await supabase
        .from("product_reviews")
        .upsert(payload, { onConflict: "user_id,product_id" });
      if (error) {
        toast({ title: "Could not save review", description: error.message, variant: "destructive" });
        return false;
      }
      toast({ title: myReview ? "Review updated" : "Review posted" });
      await load();
      return true;
    },
    [user, productId, myReview, load],
  );

  const remove = useCallback(async () => {
    if (!user || !productId || !myReview) return;
    const { error } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", myReview.id);
    if (error) {
      toast({ title: "Could not delete", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Review removed" });
    await load();
  }, [user, productId, myReview, load]);

  return { reviews, loading, myReview, average, submit, remove };
};
