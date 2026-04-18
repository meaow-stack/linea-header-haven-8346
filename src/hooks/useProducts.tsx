import { useQuery } from "@tanstack/react-query";
import { Product, formatPrice, titleCase } from "@/data/products";

interface ApiProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

const NEW_IDS = new Set([1, 2, 5, 8, 14, 18]);

const mapProduct = (p: ApiProduct): Product => ({
  id: p.id,
  name: p.title,
  category: titleCase(p.category),
  price: formatPrice(p.price),
  priceValue: p.price,
  image: p.image,
  description: p.description,
  rating: p.rating,
  isNew: NEW_IDS.has(p.id),
  gallery: [p.image],
  material: undefined,
  dimensions: undefined,
  weight: undefined,
  editorsNotes: p.description,
});

const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch("https://fakestoreapi.com/products");
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
  const data: ApiProduct[] = await res.json();
  return data.map(mapProduct);
};

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 10,
  });

export const useProduct = (id: string | number | undefined) => {
  const { data: products, ...rest } = useProducts();
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  const product = products?.find((p) => p.id === numId);
  return { product, products, ...rest };
};

export const useProductsByCategory = (category: string | undefined, excludeId?: number) => {
  const { data: products = [], ...rest } = useProducts();
  const target = category?.toLowerCase().trim();
  const filtered = !target || target === "shop" || target === "all"
    ? products
    : products.filter((p) => p.category.toLowerCase() === target || p.category.toLowerCase().includes(target));
  return {
    products: excludeId ? filtered.filter((p) => p.id !== excludeId) : filtered,
    ...rest,
  };
};
