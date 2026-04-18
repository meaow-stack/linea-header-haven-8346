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
import { Minus, Plus } from "lucide-react";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { Product } from "@/data/products";
import { toast } from "@/hooks/use-toast";

interface ProductInfoProps {
  product: Product;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(1);
  const categorySlug = product.category.toLowerCase();

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <div className="space-y-6">
      {/* Breadcrumb - Show only on desktop */}
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
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Product title and price */}
      <div className="space-y-2">
        <div className="flex justify-between items-start gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] font-light text-muted-foreground mb-2">
              {product.category}
            </p>
            <h1 className="text-3xl md:text-4xl font-light tracking-wide text-foreground">
              {product.name}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xl font-light text-foreground whitespace-nowrap">{product.price}</p>
          </div>
        </div>
      </div>

      {/* Product details */}
      <div className="space-y-5 py-6 border-t border-b border-border">
        {product.material && (
          <div className="grid grid-cols-[120px_1fr] gap-4">
            <h3 className="text-xs uppercase tracking-[0.14em] font-light text-muted-foreground">
              Material
            </h3>
            <p className="text-sm font-light text-foreground">{product.material}</p>
          </div>
        )}

        {product.dimensions && (
          <div className="grid grid-cols-[120px_1fr] gap-4">
            <h3 className="text-xs uppercase tracking-[0.14em] font-light text-muted-foreground">
              Dimensions
            </h3>
            <p className="text-sm font-light text-foreground">{product.dimensions}</p>
          </div>
        )}

        {product.weight && (
          <div className="grid grid-cols-[120px_1fr] gap-4">
            <h3 className="text-xs uppercase tracking-[0.14em] font-light text-muted-foreground">
              Weight
            </h3>
            <p className="text-sm font-light text-foreground">{product.weight}</p>
          </div>
        )}

        {product.editorsNotes && (
          <div className="grid grid-cols-[120px_1fr] gap-4">
            <h3 className="text-xs uppercase tracking-[0.14em] font-light text-muted-foreground">
              Editor's notes
            </h3>
            <p className="text-sm font-light text-muted-foreground italic leading-relaxed">
              "{product.editorsNotes}"
            </p>
          </div>
        )}
      </div>

      {/* Quantity and Add to Cart */}
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
              toast({
                title: "Added to bag",
                description: `${quantity} × ${product.name}`,
              })
            }
            className="flex-1 h-12 bg-foreground text-background hover:bg-foreground/90 font-light tracking-wide rounded-none"
          >
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
