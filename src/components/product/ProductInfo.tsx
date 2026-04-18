import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import StarRating from "@/components/product/StarRating";
import { Product } from "@/data/products";
import { useCart } from "@/hooks/useCart";

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const categorySlug = product.category.toLowerCase();

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <div className="space-y-6">
      <div className="hidden lg:block">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/category/${categorySlug}`}>{product.category}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] font-light text-muted-foreground">
          {product.category}
        </p>
        <div className="flex justify-between items-start gap-6">
          <h1 className="text-2xl md:text-3xl font-light tracking-wide text-foreground">
            {product.name}
          </h1>
          <p className="text-xl font-light text-foreground whitespace-nowrap">{product.price}</p>
        </div>
        {product.rating && (
          <StarRating rating={product.rating.rate} count={product.rating.count} showValue size="md" />
        )}
      </div>

      {product.description && (
        <p className="text-sm font-light text-muted-foreground leading-relaxed border-t border-b border-border py-6">
          {product.description}
        </p>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-[0.14em] font-light text-muted-foreground">
            Quantity
          </span>
          <div className="flex items-center border border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={decrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="h-10 flex items-center px-4 text-sm font-light min-w-12 justify-center border-l border-r border-border">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={incrementQuantity}
              className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() =>
              addItem(
                {
                  product_id: String(product.id),
                  product_name: product.name,
                  product_category: product.category,
                  product_image: product.image,
                  product_price: product.priceValue,
                },
                quantity,
              )
            }
            className="flex-1 h-12 bg-foreground text-background hover:bg-foreground/90 font-light tracking-wide rounded-none"
          >
            <ShoppingBag className="h-4 w-4 mr-2" strokeWidth={1.5} />
            Add to Bag
          </Button>
          <FavoriteButton
            variant="detail"
            product={{
              product_id: String(product.id),
              product_name: product.name,
              product_category: product.category,
              product_price: product.price,
              product_image: product.image,
            }}
            className="rounded-none shrink-0"
          />
        </div>
        <p className="text-xs font-light text-muted-foreground pt-1">
          Complimentary shipping &amp; returns. Crafted to order in 2–3 weeks.
        </p>
      </div>
    </div>
  );
};

export default ProductInfo;
