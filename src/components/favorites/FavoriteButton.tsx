import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites, FavoriteProduct } from "@/hooks/useFavorites";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  product: FavoriteProduct;
  variant?: "card" | "detail";
  className?: string;
}

const FavoriteButton = ({ product, variant = "card", className }: FavoriteButtonProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(product.product_id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Sign in to save favorites",
        description: "Create an account or sign in to save items you love.",
      });
      navigate("/auth", { state: { from: window.location.pathname } });
      return;
    }
    toggleFavorite(product);
  };

  if (variant === "detail") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={active ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={active}
        className={cn(
          "h-12 w-12 flex items-center justify-center border border-border bg-background hover:bg-muted/40 transition-colors",
          className,
        )}
      >
        <Heart
          className={cn("h-5 w-5 transition-all", active ? "fill-foreground text-foreground" : "text-foreground")}
          strokeWidth={1.5}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={active}
      className={cn(
        "absolute top-2 right-2 z-10 h-9 w-9 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-300 hover:bg-background",
        active && "opacity-100",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all",
          active ? "fill-foreground text-foreground scale-110" : "text-foreground",
        )}
        strokeWidth={1.5}
      />
    </button>
  );
};

export default FavoriteButton;
