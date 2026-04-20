import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";

interface SharedFav {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_price: string | null;
  product_category: string | null;
}

const SharedWishlist = () => {
  const { userId } = useParams();
  const [items, setItems] = useState<SharedFav[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      // RLS: only owner can read; for sharing, this returns nothing for others.
      // Show informational page either way.
      const { data } = await supabase
        .from("favorites")
        .select("id, product_id, product_name, product_image, product_price, product_category")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setItems((data ?? []) as SharedFav[]);
      setLoading(false);
    })();
  }, [userId]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 px-6 py-12 max-w-6xl mx-auto w-full animate-fade-in">
        <div className="text-center mb-10">
          <Heart className="w-8 h-8 mx-auto mb-3 text-primary" />
          <h1 className="text-3xl font-light tracking-wide">A shared wishlist</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Hand-picked pieces from a fellow Linea customer.
          </p>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center">Loading...</p>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-sm text-muted-foreground">
              This wishlist is private or empty. The owner can adjust sharing in their account.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <Link key={item.id} to={`/product/${item.product_id}`} className="group">
                <div className="aspect-square mb-3 overflow-hidden bg-muted/20 flex items-center justify-center">
                  {item.product_image && (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{item.product_category}</p>
                <p className="text-sm font-light line-clamp-1">{item.product_name}</p>
                {item.product_price && (
                  <p className="text-sm font-light text-muted-foreground">{item.product_price}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SharedWishlist;