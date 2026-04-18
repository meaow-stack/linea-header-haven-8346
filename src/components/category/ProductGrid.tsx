import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import Pagination from "./Pagination";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import StarRating from "@/components/product/StarRating";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

interface ProductGridProps {
  category?: string;
  searchQuery?: string;
}

const ProductGrid = ({ category, searchQuery }: ProductGridProps) => {
  const { data: products = [], isLoading, error } = useProducts();
  const { addItem } = useCart();

  const filtered = useMemo(() => {
    let list = products;
    if (category && category !== "shop" && category !== "all" && category !== "new-in") {
      const target = category.toLowerCase();
      list = list.filter(
        (p) => p.category.toLowerCase() === target || p.category.toLowerCase().includes(target),
      );
    }
    if (category === "new-in") list = list.filter((p) => p.isNew);
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, category, searchQuery]);

  if (error) {
    return (
      <section className="w-full px-6 mb-16">
        <p className="text-sm text-muted-foreground text-center py-12">
          Could not load products. Please try again.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full px-6 mb-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))
          : filtered.map((product) => (
              <div key={product.id} className="group">
                <Link
                  to={`/product/${product.id}`}
                  className="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/40"
                >
                  <Card className="border-none shadow-none bg-transparent cursor-pointer">
                    <CardContent className="p-0">
                      <div className="aspect-square mb-4 overflow-hidden bg-muted/40 dark:bg-muted/20 relative flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                        />
                        {product.isNew && (
                          <div className="absolute top-3 left-3 px-2 py-1 text-[10px] uppercase tracking-[0.18em] font-light text-foreground bg-background/85 backdrop-blur-sm">
                            New
                          </div>
                        )}
                        <FavoriteButton
                          product={{
                            product_id: String(product.id),
                            product_name: product.name,
                            product_category: product.category,
                            product_price: product.price,
                            product_image: product.image,
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem({
                              product_id: String(product.id),
                              product_name: product.name,
                              product_category: product.category,
                              product_image: product.image,
                              product_price: product.priceValue,
                            });
                          }}
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 h-9 px-4 text-xs uppercase tracking-[0.14em] font-light rounded-none bg-foreground text-background hover:bg-foreground/90"
                        >
                          <ShoppingBag className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} />
                          Add to bag
                        </Button>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[11px] uppercase tracking-[0.16em] font-light text-muted-foreground">
                          {product.category}
                        </p>
                        <div className="flex justify-between items-baseline gap-2">
                          <h3 className="text-sm font-light text-foreground tracking-wide line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-sm font-light text-foreground whitespace-nowrap">
                            {product.price}
                          </p>
                        </div>
                        {product.rating && (
                          <StarRating
                            rating={product.rating.rate}
                            count={product.rating.count}
                            showValue
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-16">
          No products match your search.
        </p>
      )}

      {!isLoading && filtered.length > 0 && <Pagination />}
    </section>
  );
};

export default ProductGrid;
