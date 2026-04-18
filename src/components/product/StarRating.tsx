import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number | null;
  className?: string;
  interactive?: boolean;
  onChange?: (n: number) => void;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const StarRating = ({
  rating,
  size = "sm",
  showValue = false,
  count,
  className,
  interactive = false,
  onChange,
}: StarRatingProps) => {
  const sizeClass = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= Math.round(rating);
          const StarIcon = (
            <Star
              key={n}
              className={cn(
                sizeClass,
                filled ? "fill-foreground text-foreground" : "fill-transparent text-muted-foreground/40",
                "transition-colors",
              )}
              strokeWidth={1.5}
            />
          );
          if (interactive && onChange) {
            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                aria-label={`Rate ${n} stars`}
                className="hover:scale-110 transition-transform"
              >
                {StarIcon}
              </button>
            );
          }
          return StarIcon;
        })}
      </div>
      {showValue && (
        <span className="text-xs font-light text-muted-foreground">
          {rating.toFixed(1)}
          {count != null && <span className="ml-1">({count})</span>}
        </span>
      )}
    </div>
  );
};

export default StarRating;
