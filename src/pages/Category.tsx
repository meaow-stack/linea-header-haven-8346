import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CategoryHeader from "../components/category/CategoryHeader";
import FilterSortBar from "../components/category/FilterSortBar";
import ProductGrid from "../components/category/ProductGrid";
import { useProducts } from "@/hooks/useProducts";

const Category = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: products = [] } = useProducts();

  const itemCount = products.filter((p) => {
    if (!category || category === "shop" || category === "all") return true;
    if (category === "new-in") return p.isNew;
    return p.category.toLowerCase() === category.toLowerCase();
  }).length;

  const heading = searchQuery
    ? `Search: "${searchQuery}"`
    : category
      ? category.replace(/-/g, " ")
      : "All Products";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-6">
        <CategoryHeader category={heading} />

        <FilterSortBar
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          itemCount={itemCount}
        />

        <ProductGrid category={category} searchQuery={searchQuery} />
      </main>

      <Footer />
    </div>
  );
};

export default Category;
