import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Check, Package, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { OrderWithItems } from "@/hooks/useOrders";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !orderId) return;
    (async () => {
      const { data: o } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (o) {
        const { data: items } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", o.id);
        setOrder({
          ...(o as any),
          items: ((items ?? []) as any[]).map((it) => ({
            id: it.id,
            product_id: it.product_id,
            product_name: it.product_name,
            product_image: it.product_image,
            product_category: it.product_category,
            unit_price: Number(it.unit_price),
            quantity: it.quantity,
            line_total: Number(it.line_total),
          })),
        });
      }
      setLoading(false);
    })();
  }, [user, orderId]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 px-6 py-12 max-w-3xl mx-auto w-full animate-fade-in">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !order ? (
          <div className="text-center py-16">
            <h1 className="text-2xl font-light mb-4">Order not found</h1>
            <Button asChild variant="outline">
              <Link to="/account">Back to account</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <div className="inline-flex w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4 animate-scale-in">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-light tracking-wide">Thank you, {order.customer_name?.split(" ")[0] || "friend"}!</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Your order <span className="font-medium text-foreground">{order.order_number}</span> has been received.
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-4">
                      {it.product_image && (
                        <div className="w-16 h-16 bg-muted/30 flex items-center justify-center shrink-0">
                          <img src={it.product_image} alt={it.product_name} className="w-full h-full object-contain p-2" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-light text-foreground line-clamp-1">{it.product_name}</p>
                        <p className="text-xs text-muted-foreground">Qty {it.quantity}</p>
                      </div>
                      <p className="text-sm font-light">${it.line_total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${Number(order.subtotal).toFixed(2)}</span>
                  </div>
                  {Number(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Discount {order.discount_code && `(${order.discount_code})`}</span>
                      <span>−${Number(order.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{Number(order.shipping_amount) === 0 ? "Free" : `$${Number(order.shipping_amount).toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-base font-medium border-t border-border pt-3 mt-3">
                    <span>Total</span>
                    <span>${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-muted/20 p-4 flex items-start gap-3 text-sm">
                  <Package className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Your order is being prepared. You'll receive shipping updates in your account.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-3 mt-8">
              <Button asChild variant="outline">
                <Link to="/account">View all orders</Link>
              </Button>
              <Button asChild>
                <Link to="/category/shop">
                  Continue shopping <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;