import { Link } from "react-router-dom";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

const RecentlyViewedRail = () => {
  const { items } = useRecentlyViewed();
  if (items.length === 0) return null;

  return (
    <section className="w-full mb-16 px-6 animate-fade-in">
      <h2 className="text-xs uppercase tracking-[0.18em] font-light text-muted-foreground mb-6">
        Recently Viewed
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 snap-x">
        {items.map((item) => (
          <Link
            key={item.product_id}
            to={`/product/${item.product_id}`}
            className="snap-start shrink-0 w-40 group"
          >
            <div className="aspect-square mb-2 overflow-hidden bg-muted/30 flex items-center justify-center">
              {item.product_image && (
                <img
                  src={item.product_image}
                  alt={item.product_name}
                  className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <p className="text-[10px] uppercase tracking-[0.14em] font-light text-muted-foreground line-clamp-1">
              {item.product_category}
            </p>
            <p className="text-sm font-light text-foreground line-clamp-1">{item.product_name}</p>
            {item.product_price !== null && (
              <p className="text-sm font-light text-muted-foreground">${item.product_price.toFixed(0)}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewedRail;