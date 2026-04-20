import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  min_subtotal: number;
  max_uses: number | null;
  max_uses_per_user: number;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}

export interface AppliedDiscount {
  code: DiscountCode;
  amount: number; // discount applied to subtotal
  freeShipping: boolean;
}

export const useDiscounts = () => {
  const { user } = useAuth();
  const [applied, setApplied] = useState<AppliedDiscount | null>(null);
  const [validating, setValidating] = useState(false);

  const validate = useCallback(
    async (
      rawCode: string,
      subtotal: number,
    ): Promise<{ ok: boolean; error?: string; applied?: AppliedDiscount }> => {
      const code = rawCode.trim().toUpperCase();
      if (!code) return { ok: false, error: "Enter a code" };
      setValidating(true);
      const { data, error } = await supabase
        .from("discount_codes")
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .maybeSingle();
      setValidating(false);
      if (error) return { ok: false, error: error.message };
      if (!data) return { ok: false, error: "Invalid code" };

      const c = data as DiscountCode;
      const now = new Date();
      if (c.valid_from && new Date(c.valid_from) > now)
        return { ok: false, error: "Code not yet active" };
      if (c.valid_until && new Date(c.valid_until) < now)
        return { ok: false, error: "Code expired" };
      if (c.max_uses !== null && c.used_count >= c.max_uses)
        return { ok: false, error: "Code usage limit reached" };
      if (subtotal < Number(c.min_subtotal))
        return {
          ok: false,
          error: `Minimum subtotal $${Number(c.min_subtotal).toFixed(2)}`,
        };

      // Per-user usage check (if signed in)
      if (user) {
        const { count } = await supabase
          .from("discount_redemptions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("discount_code_id", c.id);
        if ((count ?? 0) >= c.max_uses_per_user)
          return { ok: false, error: "You've already used this code" };
      }

      let amount = 0;
      let freeShipping = false;
      if (c.type === "percentage") amount = subtotal * (Number(c.value) / 100);
      else if (c.type === "fixed") amount = Math.min(Number(c.value), subtotal);
      else if (c.type === "free_shipping") freeShipping = true;

      const result: AppliedDiscount = { code: c, amount: Math.round(amount * 100) / 100, freeShipping };
      setApplied(result);
      return { ok: true, applied: result };
    },
    [user],
  );

  const clear = () => setApplied(null);

  const recordRedemption = async (orderId: string) => {
    if (!applied || !user) return;
    await supabase.from("discount_redemptions").insert({
      discount_code_id: applied.code.id,
      user_id: user.id,
      order_id: orderId,
      amount_discounted: applied.amount,
    });
    // best-effort increment on used_count
    await supabase.rpc("increment" as any).catch(() => {});
  };

  return { applied, validate, clear, validating, recordRedemption };
};