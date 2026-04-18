import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import StarRating from "@/components/product/StarRating";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/data/products";

interface ProductCarouselProps {
  products?: Product[];
  title?: string;
}

const ProductCarousel = ({ products: override, title }: ProductCarouselProps) => {
  const { data: fetched = [], isLoading } = useProducts();
  const list = override ?? fetched.slice(0, 8);

  return (
    <section className="w-full mb-16 px-6">
      {title && (
        <h2 className="text-xs uppercase tracking-[0.18em] font-light text-muted-foreground mb-6">
          {title}
        </h2>
      )}
      <Carousel opts={{ align: "start", loop: false }} className="w-full">
        <CarouselContent>
          {(isLoading && !override
            ? Array.from({ length: 4 }).map((_, i) => ({ id: -i - 1 } as Product))
            : list
          ).map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-1/2 md:basis-1/3 lg:basis-1/4 pr-2 md:pr-4"
            >
              {product.id < 0 ? (
                <div className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <Link to={`/product/${product.id}`}>
                  <Card className="border-none shadow-none bg-transparent group">
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
                          <StarRating rating={product.rating.rate} count={product.rating.count} showValue />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default ProductCarousel;
