import { ArrowRight, User, Search as SearchIcon, X, ShoppingBag as BagIcon } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import ShoppingBagPanel from "./ShoppingBag";
import FavoritesDrawer from "@/components/favorites/FavoritesDrawer";
import ThemeToggle from "@/components/theme/ThemeToggle";

const Navigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { count: favoritesCount } = useFavorites();
  const { count: cartCount } = useCart();
  const { data: products = [] } = useProducts();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [offCanvasType, setOffCanvasType] = useState<"favorites" | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShoppingBagOpen, setIsShoppingBagOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Preload dropdown images
  useEffect(() => {
    [
      "/rings-collection.png",
      "/earrings-collection.png",
      "/arcus-bracelet.png",
      "/span-bracelet.png",
      "/founders.png",
    ].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    } else {
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  // Build categories from real product data
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set);
  }, [products]);

  const popularSearches = categories.slice(0, 6);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [products, searchQuery]);

  const navItems = [
    {
      name: "Shop",
      href: "/category/shop",
      submenuItems: categories.length > 0 ? categories : ["All Products"],
      images: [
        { src: "/rings-collection.png", alt: "Rings Collection", label: categories[0] ?? "Shop" },
        { src: "/earrings-collection.png", alt: "Earrings Collection", label: categories[1] ?? "All" },
      ],
    },
    {
      name: "New in",
      href: "/category/new-in",
      submenuItems: ["This Week's Arrivals", "Featured", "Limited Edition"],
      images: [
        { src: "/arcus-bracelet.png", alt: "Arcus Bracelet", label: "Arcus Bracelet" },
        { src: "/span-bracelet.png", alt: "Span Bracelet", label: "Span Bracelet" },
      ],
    },
    {
      name: "About",
      href: "/about/our-story",
      submenuItems: ["Our Story", "Sustainability", "Size Guide", "Customer Care", "Store Locator"],
      images: [{ src: "/founders.png", alt: "Company Founders", label: "Read our story" }],
    },
  ];

  const submitSearch = (q: string) => {
    setIsSearchOpen(false);
    if (!q.trim()) return;
    navigate(`/category/shop?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <nav className="relative bg-background/90 backdrop-blur-md border-b border-border/60">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 mt-0.5 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-5 relative">
            <span
              className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${
                isMobileMenuOpen ? "rotate-45 top-2.5" : "top-1.5"
              }`}
            />
            <span
              className={`absolute block w-5 h-px bg-current transform transition-all duration-300 top-2.5 ${
                isMobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${
                isMobileMenuOpen ? "-rotate-45 top-2.5" : "top-3.5"
              }`}
            />
          </div>
        </button>

        {/* Left nav */}
        <div className="hidden lg:flex space-x-8">
          {navItems.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => setActiveDropdown(item.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                to={item.href}
                className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-light py-6 block"
              >
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        {/* Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link to="/" className="block">
            <img src="/LINEA-1.svg" alt="LINEA" className="h-6 w-auto dark:invert" />
          </Link>
        </div>

        {/* Right icons */}
        <div className="flex items-center space-x-1">
          <button
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            aria-label="Search"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <SearchIcon className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <ThemeToggle className="hidden sm:block" />
          <button
            className="hidden lg:block p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            aria-label="Account"
            onClick={() => navigate(user ? "/account" : "/auth")}
          >
            <User className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button
            className="hidden lg:block p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative"
            aria-label={`Favorites${favoritesCount > 0 ? ` (${favoritesCount})` : ""}`}
            onClick={() => setOffCanvasType("favorites")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
            {favoritesCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-foreground text-background text-[0.6rem] font-medium flex items-center justify-center pointer-events-none">
                {favoritesCount}
              </span>
            )}
          </button>
          <button
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative"
            aria-label={`Shopping bag${cartCount > 0 ? ` (${cartCount})` : ""}`}
            onClick={() => setIsShoppingBagOpen(true)}
          >
            <BagIcon className="w-5 h-5" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-foreground text-background text-[0.6rem] font-medium flex items-center justify-center pointer-events-none">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {activeDropdown && (
        <div
          className="absolute top-full left-0 right-0 bg-background border-b border-border z-50"
          onMouseEnter={() => setActiveDropdown(activeDropdown)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="px-6 py-8">
            <div className="flex justify-between w-full">
              <div className="flex-1">
                <ul className="space-y-2">
                  {navItems
                    .find((item) => item.name === activeDropdown)
                    ?.submenuItems.map((subItem, index) => (
                      <li key={index}>
                        <Link
                          to={
                            activeDropdown === "About"
                              ? `/about/${subItem.toLowerCase().replace(/\s+/g, "-")}`
                              : `/category/${subItem.toLowerCase()}`
                          }
                          className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-light block py-2"
                        >
                          {subItem}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="flex space-x-6">
                {navItems
                  .find((item) => item.name === activeDropdown)
                  ?.images.map((image, index) => {
                    let linkTo = "/category/shop";
                    if (activeDropdown === "About") linkTo = "/about/our-story";
                    if (activeDropdown === "Shop") linkTo = `/category/${image.label.toLowerCase()}`;
                    return (
                      <Link
                        key={index}
                        to={linkTo}
                        className="w-[280px] h-[200px] cursor-pointer group relative overflow-hidden block"
                      >
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                        />
                        <div className="absolute bottom-2 left-2 text-white text-xs font-light flex items-center gap-1">
                          <span>{image.label}</span>
                          <ArrowRight size={12} />
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border z-50">
          <div className="px-6 py-8">
            <div className="max-w-2xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch(searchQuery);
                }}
                className="relative mb-6"
              >
                <div className="flex items-center border-b border-border pb-2">
                  <SearchIcon className="w-5 h-5 text-nav-foreground mr-3" strokeWidth={1.5} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-lg font-light"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-1 text-muted-foreground hover:text-foreground"
                      aria-label="Clear"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>

              {searchQuery.trim() && searchResults.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs uppercase tracking-[0.14em] font-light text-muted-foreground mb-3">
                    Suggestions
                  </h3>
                  <ul className="space-y-1">
                    {searchResults.map((p) => (
                      <li key={p.id}>
                        <Link
                          to={`/product/${p.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-4 p-2 hover:bg-muted/40 transition-colors"
                        >
                          <div className="w-12 h-12 bg-muted/40 dark:bg-muted/20 flex items-center justify-center shrink-0">
                            <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.14em] font-light text-muted-foreground">
                              {p.category}
                            </p>
                            <p className="text-sm font-light text-foreground line-clamp-1">{p.name}</p>
                          </div>
                          <p className="text-sm font-light text-foreground whitespace-nowrap">{p.price}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {searchQuery.trim() && searchResults.length === 0 && (
                <p className="text-sm font-light text-muted-foreground mb-6">
                  No products match "{searchQuery}".
                </p>
              )}

              <div>
                <h3 className="text-xs uppercase tracking-[0.14em] font-light text-muted-foreground mb-3">
                  Popular Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate(`/category/${search.toLowerCase()}`);
                      }}
                      className="text-foreground hover:bg-foreground hover:text-background text-xs font-light py-1.5 px-3 border border-border transition-colors duration-200"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile nav */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border z-50">
          <div className="px-6 py-8">
            <div className="space-y-6">
              {navItems.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className="text-foreground transition-colors duration-200 text-lg font-light block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  <div className="mt-3 pl-4 space-y-2">
                    {item.submenuItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={
                          item.name === "About"
                            ? `/about/${subItem.toLowerCase().replace(/\s+/g, "-")}`
                            : `/category/${subItem.toLowerCase()}`
                        }
                        className="text-muted-foreground hover:text-foreground text-sm font-light block py-1"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {subItem}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-border flex items-center gap-4">
                <ThemeToggle />
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate(user ? "/account" : "/auth");
                  }}
                  className="p-2 text-foreground hover:text-muted-foreground"
                  aria-label="Account"
                >
                  <User className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setOffCanvasType("favorites");
                  }}
                  className="p-2 text-foreground hover:text-muted-foreground"
                  aria-label="Favorites"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ShoppingBagPanel
        isOpen={isShoppingBagOpen}
        onClose={() => setIsShoppingBagOpen(false)}
        onViewFavorites={() => {
          setIsShoppingBagOpen(false);
          setOffCanvasType("favorites");
        }}
      />

      <FavoritesDrawer
        isOpen={offCanvasType === "favorites"}
        onClose={() => setOffCanvasType(null)}
      />
    </nav>
  );
};

export default Navigation;
