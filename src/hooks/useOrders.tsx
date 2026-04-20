import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import type { CartItem } from "@/hooks/useCart";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderRow {
  id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total: number;
  currency: string;
  discount_code: string | null;
  customer_email: string | null;
  customer_name: string | null;
  tracking_number: string | null;
  carrier: string | null;
  shipping_address: any;
  created_at: string;
}

export interface OrderItemRow {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_category: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface OrderWithItems extends OrderRow {
  items: OrderItemRow[];
}

interface PlaceOrderInput {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shipping: number;
  tax: number;
  total: number;
  discountCode: string | null;
  customerEmail: string;
  customerName: string;
  shippingAddress: Record<string, any>;
  billingAddress?: Record<string, any> | null;
}

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    setLoading(true);
    const { data: ords, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Could not load orders", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    if (!ords || ords.length === 0) {
      setOrders([]);
      setLoading(false);
      return;
    }
    const ids = ords.map((o) => o.id);
    const { data: itemRows } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", ids);
    const grouped: OrderWithItems[] = ords.map((o) => ({
      ...(o as OrderRow),
      items: ((itemRows ?? []) as any[])
        .filter((it) => it.order_id === o.id)
        .map((it) => ({
          id: it.id,
          product_id: it.product_id,
          product_name: it.product_name,
          product_image: it.product_image,
          product_category: it.product_category,
          unit_price: Number(it.unit_price),
          quantity: it.quantity,
          line_total: Number(it.line_total),
        })),
    }));
    setOrders(grouped);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const placeOrder = useCallback(
    async (input: PlaceOrderInput): Promise<OrderWithItems | null> => {
      if (!user) {
        toast({ title: "Please sign in to place an order", variant: "destructive" });
        return null;
      }
      // Generate order number client-side (also have DB function as backup)
      const orderNumber = `LIN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: "paid",
          subtotal: input.subtotal,
          discount_amount: input.discountAmount,
          shipping_amount: input.shipping,
          tax_amount: input.tax,
          total: input.total,
          discount_code: input.discountCode,
          customer_email: input.customerEmail,
          customer_name: input.customerName,
          shipping_address: input.shippingAddress,
          billing_address: input.billingAddress ?? input.shippingAddress,
        })
        .select("*")
        .single();

      if (orderErr || !order) {
        toast({ title: "Could not create order", description: orderErr?.message, variant: "destructive" });
        return null;
      }

      const itemsPayload = input.items.map((it) => ({
        order_id: order.id,
        product_id: it.product_id,
        product_name: it.product_name,
        product_image: it.product_image,
        product_category: it.product_category,
        unit_price: it.product_price,
        quantity: it.quantity,
        line_total: it.product_price * it.quantity,
      }));
      const { data: itemRows, error: itemsErr } = await supabase
        .from("order_items")
        .insert(itemsPayload)
        .select("*");
      if (itemsErr) {
        toast({ title: "Order saved, items failed", description: itemsErr.message, variant: "destructive" });
      }

      // Award loyalty points: 1 pt per $1 spent (rounded)
      const earned = Math.round(input.total);
      if (earned > 0) {
        await supabase.from("loyalty_points").insert({
          user_id: user.id,
          kind: "earn",
          points: earned,
          reason: `Order ${order.order_number}`,
          order_id: order.id,
        });
      }

      const full: OrderWithItems = {
        ...(order as OrderRow),
        items: ((itemRows ?? []) as any[]).map((it) => ({
          id: it.id,
          product_id: it.product_id,
          product_name: it.product_name,
          product_image: it.product_image,
          product_category: it.product_category,
          unit_price: Number(it.unit_price),
          quantity: it.quantity,
          line_total: Number(it.line_total),
        })),
      };
      setOrders((prev) => [full, ...prev]);
      return full;
    },
    [user],
  );

  return { orders, loading, refresh, placeOrder };
};