import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Pagination from "./Pagination";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { products } from "@/data/products";
import organicEarring from "@/assets/organic-earring.png";
import linkBracelet from "@/assets/link-bracelet.png";

const ProductGrid = () => {
  return (
    <section className="w-full px-6 mb-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/40"
          >
            <Card className="border-none shadow-none bg-transparent group cursor-pointer">
              <CardContent className="p-0">
                <div className="aspect-square mb-4 overflow-hidden bg-muted/20 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-105"
                  />
                  <img
                    src={product.category === "Earrings" ? organicEarring : linkBracelet}
                    alt={`${product.name} lifestyle`}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100"
                  />
                  {product.isNew && (
                    <div className="absolute top-3 left-3 px-2 py-1 text-[10px] uppercase tracking-[0.18em] font-light text-foreground bg-background/80 backdrop-blur-sm">
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
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] uppercase tracking-[0.16em] font-light text-muted-foreground">
                    {product.category}
                  </p>
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="text-sm font-light text-foreground tracking-wide">
                      {product.name}
                    </h3>
                    <p className="text-sm font-light text-foreground whitespace-nowrap">
                      {product.price}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Pagination />
    </section>
  );
};

export default ProductGrid;
