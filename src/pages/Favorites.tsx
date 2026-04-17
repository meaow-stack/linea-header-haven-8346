import { Link } from "react-router-dom";
import { Heart, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

const Favorites = () => {
  const { user, loading: authLoading } = useAuth();
  const { favorites, loading, removeFavorite } = useFavorites();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 px-6 py-12 max-w-7xl mx-auto w-full">
        <div className="flex items-end justify-between mb-10 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl md:text-4xl font-light tracking-wide">Favorites</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {favorites.length === 0
                ? "Pieces you love, kept in one place"
                : `${favorites.length} ${favorites.length === 1 ? "item" : "items"} saved`}
            </p>
          </div>
        </div>

        {!user && !authLoading ? (
          <EmptyState
            title="Sign in to view your favorites"
            description="Save the pieces you love and find them on any device."
            cta={<Button asChild><Link to="/auth">Sign in</Link></Button>}
          />
        ) : loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : favorites.length === 0 ? (
          <EmptyState
            title="No favorites yet"
            description="Tap the heart on any piece to add it here."
            cta={<Button asChild variant="outline"><Link to="/category/shop">Browse the collection</Link></Button>}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {favorites.map((fav) => (
              <div key={fav.id} className="group relative">
                <Link to={`/product/${fav.product_id}`} className="block">
                  <div className="aspect-square mb-3 overflow-hidden bg-muted/10 relative">
                    {fav.product_image && (
                      <img
                        src={fav.product_image}
                        alt={fav.product_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFavorite(fav.product_id); }}
                      aria-label="Remove from favorites"
                      className="absolute top-2 right-2 h-9 w-9 flex items-center justify-center rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-colors"
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {fav.product_category && (
                      <p className="text-xs font-light text-muted-foreground">{fav.product_category}</p>
                    )}
                    <div className="flex justify-between items-center gap-2">
                      <h3 className="text-sm font-medium text-foreground truncate">{fav.product_name}</h3>
                      {fav.product_price && (
                        <p className="text-sm font-light text-foreground whitespace-nowrap">{fav.product_price}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

const EmptyState = ({ title, description, cta }: { title: string; description: string; cta: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center text-center py-24 px-6">
    <div className="h-16 w-16 rounded-full bg-muted/40 flex items-center justify-center mb-6">
      <Heart className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
    </div>
    <h2 className="text-xl font-light tracking-wide mb-2">{title}</h2>
    <p className="text-sm text-muted-foreground mb-8 max-w-sm">{description}</p>
    {cta}
  </div>
);

export default Favorites;
