import { Link } from "react-router-dom";
import { X, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FavoritesDrawer = ({ isOpen, onClose }: FavoritesDrawerProps) => {
  const { user } = useAuth();
  const { favorites, loading, removeFavorite } = useFavorites();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 h-screen">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-screen w-full sm:w-[420px] bg-background border-l border-border animate-slide-in-right flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-base font-light tracking-wide">Favorites</h2>
            {user && favorites.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {favorites.length} {favorites.length === 1 ? "item" : "items"} saved
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-foreground hover:text-muted-foreground transition-colors"
            aria-label="Close"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!user ? (
            <DrawerEmpty
              title="Sign in to save favorites"
              description="Keep your favorite pieces with you across every device."
              ctaLabel="Sign in"
              ctaTo="/auth"
              onCtaClick={onClose}
            />
          ) : loading ? (
            <p className="text-sm text-muted-foreground p-6">Loading...</p>
          ) : favorites.length === 0 ? (
            <DrawerEmpty
              title="No favorites yet"
              description="Tap the heart on any piece to add it to your favorites."
              ctaLabel="Browse the collection"
              ctaTo="/category/shop"
              onCtaClick={onClose}
              variant="outline"
            />
          ) : (
            <ul className="divide-y divide-border">
              {favorites.map((fav) => (
                <li key={fav.id} className="p-6">
                  <div className="flex gap-4">
                    <Link
                      to={`/product/${fav.product_id}`}
                      onClick={onClose}
                      className="shrink-0 block w-20 h-20 overflow-hidden bg-muted/10"
                    >
                      {fav.product_image && (
                        <img src={fav.product_image} alt={fav.product_name} className="w-full h-full object-cover" />
                      )}
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <Link
                        to={`/product/${fav.product_id}`}
                        onClick={onClose}
                        className="block"
                      >
                        {fav.product_category && (
                          <p className="text-xs font-light text-muted-foreground">{fav.product_category}</p>
                        )}
                        <h3 className="text-sm font-medium truncate">{fav.product_name}</h3>
                        {fav.product_price && (
                          <p className="text-sm font-light mt-1">{fav.product_price}</p>
                        )}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFavorite(fav.product_id)}
                        className="self-start mt-2 text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {user && favorites.length > 0 && (
          <div className="border-t border-border p-6">
            <Button asChild variant="outline" className="w-full" onClick={onClose}>
              <Link to="/favorites">
                View all favorites
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const DrawerEmpty = ({
  title,
  description,
  ctaLabel,
  ctaTo,
  onCtaClick,
  variant = "default",
}: {
  title: string;
  description: string;
  ctaLabel: string;
  ctaTo: string;
  onCtaClick: () => void;
  variant?: "default" | "outline";
}) => (
  <div className="flex flex-col items-center justify-center text-center px-6 py-16">
    <div className="h-14 w-14 rounded-full bg-muted/40 flex items-center justify-center mb-5">
      <Heart className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
    </div>
    <h3 className="text-base font-light tracking-wide mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground mb-6 max-w-xs">{description}</p>
    <Button asChild variant={variant} onClick={onCtaClick}>
      <Link to={ctaTo}>{ctaLabel}</Link>
    </Button>
  </div>
);

export default FavoritesDrawer;
