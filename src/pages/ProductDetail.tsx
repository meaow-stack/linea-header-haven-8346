import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductDescription from "../components/product/ProductDescription";
import ProductQA from "../components/product/ProductQA";
import ProductCarousel from "../components/content/ProductCarousel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useProduct, useProductsByCategory } from "@/hooks/useProducts";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

const ProductDetail = () => {
  const { productId } = useParams();
  const { product, isLoading } = useProduct(productId);
  const { products: related } = useProductsByCategory(product?.category, product?.id);
  const { track } = useRecentlyViewed();

  useEffect(() => {
    if (product) {
      track({
        product_id: String(product.id),
        product_name: product.name,
        product_image: product.image,
        product_price: product.priceValue,
        product_category: product.category,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-6 px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-12 px-6 text-center">
          <h1 className="text-2xl font-light mb-4">Product not found</h1>
          <Link to="/category/shop" className="text-sm underline">Browse the collection</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const categorySlug = product.category.toLowerCase();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-6">
        <section className="w-full px-6">
          <div className="lg:hidden mb-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <ProductImageGallery images={product.gallery ?? [product.image]} />

            <div className="lg:pl-12 mt-8 lg:mt-0 lg:sticky lg:top-6 lg:h-fit">
              <ProductInfo product={product} />
              <ProductDescription product={product} />
              <ProductQA productId={String(product.id)} />
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="w-full mt-16 lg:mt-24">
            <ProductCarousel products={related.slice(0, 8)} title="Customers also bought" />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
