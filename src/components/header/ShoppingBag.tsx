import { X, Minus, Plus, ShoppingBag as BagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";

interface ShoppingBagProps {
  isOpen: boolean;
  onClose: () => void;
  onViewFavorites?: () => void;
}

const ShoppingBag = ({ isOpen, onClose, onViewFavorites }: ShoppingBagProps) => {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 h-screen">
      <div className="absolute inset-0 bg-foreground/40 dark:bg-background/60 backdrop-blur-sm h-screen" onClick={onClose} />

      <div className="absolute right-0 top-0 h-screen w-full max-w-md bg-background border-l border-border animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <BagIcon className="h-5 w-5" strokeWidth={1.5} />
            <h2 className="text-sm uppercase tracking-[0.18em] font-light text-foreground">
              Shopping Bag {items.length > 0 && <span className="text-muted-foreground">({items.length})</span>}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-foreground hover:text-muted-foreground transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {onViewFavorites && (
            <div className="md:hidden mb-6 pb-6 border-b border-border">
              <button
                onClick={onViewFavorites}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-border text-foreground hover:bg-muted/40 transition-colors duration-200"
              >
                <span className="text-xs uppercase tracking-[0.14em] font-light">View Favorites</span>
              </button>
            </div>
          )}

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-muted/40 flex items-center justify-center mb-5">
                <BagIcon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-light text-foreground mb-2">Your bag is empty</p>
              <p className="text-xs font-light text-muted-foreground mb-6 max-w-xs">
                Discover pieces you'll keep forever.
              </p>
              <Button asChild variant="outline" className="rounded-none font-light" onClick={onClose}>
                <Link to="/category/shop">Browse the collection</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <Link
                      to={`/product/${item.product_id}`}
                      onClick={onClose}
                      className="w-20 h-20 bg-muted/40 dark:bg-muted/20 overflow-hidden flex items-center justify-center shrink-0"
                    >
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-contain p-2"
                        />
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <div className="min-w-0">
                          {item.product_category && (
                            <p className="text-[10px] uppercase tracking-[0.14em] font-light text-muted-foreground">
                              {item.product_category}
                            </p>
                          )}
                          <Link
                            to={`/product/${item.product_id}`}
                            onClick={onClose}
                            className="text-sm font-light text-foreground line-clamp-2 hover:underline"
                          >
                            {item.product_name}
                          </Link>
                        </div>
                        <p className="text-sm font-light text-foreground whitespace-nowrap">
                          ${(item.product_price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="p-2 hover:bg-muted/50 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 py-1 text-xs font-light min-w-[36px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="p-2 hover:bg-muted/50 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="text-xs font-light text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-6 mt-6 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-[0.14em] font-light text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="text-base font-light text-foreground">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <p className="text-[11px] font-light text-muted-foreground">
                  Shipping and taxes calculated at checkout.
                </p>

                <Button
                  asChild
                  className="w-full rounded-none font-light tracking-wide bg-foreground text-background hover:bg-foreground/90"
                  size="lg"
                  onClick={onClose}
                >
                  <Link to="/checkout">Proceed to Checkout</Link>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full rounded-none font-light text-muted-foreground hover:text-foreground"
                  size="sm"
                  onClick={onClose}
                  asChild
                >
                  <Link to="/category/shop">Continue Shopping</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingBag;
