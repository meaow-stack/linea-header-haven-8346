import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  full_name: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
}

export type AddressInput = Omit<Address, "id" | "user_id">;

export const useAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default_shipping", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Could not load addresses", description: error.message, variant: "destructive" });
    } else {
      setAddresses((data ?? []) as Address[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createAddress = async (input: AddressInput) => {
    if (!user) return null;
    if (input.is_default_shipping) {
      await supabase.from("addresses").update({ is_default_shipping: false }).eq("user_id", user.id);
    }
    if (input.is_default_billing) {
      await supabase.from("addresses").update({ is_default_billing: false }).eq("user_id", user.id);
    }
    const { data, error } = await supabase
      .from("addresses")
      .insert({ ...input, user_id: user.id })
      .select("*")
      .single();
    if (error) {
      toast({ title: "Could not save address", description: error.message, variant: "destructive" });
      return null;
    }
    await refresh();
    return data as Address;
  };

  const updateAddress = async (id: string, input: Partial<AddressInput>) => {
    if (!user) return;
    if (input.is_default_shipping) {
      await supabase.from("addresses").update({ is_default_shipping: false }).eq("user_id", user.id);
    }
    if (input.is_default_billing) {
      await supabase.from("addresses").update({ is_default_billing: false }).eq("user_id", user.id);
    }
    const { error } = await supabase.from("addresses").update(input).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else await refresh();
  };

  const deleteAddress = async (id: string) => {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const defaultShipping = addresses.find((a) => a.is_default_shipping) ?? addresses[0] ?? null;

  return { addresses, loading, defaultShipping, refresh, createAddress, updateAddress, deleteAddress };
};