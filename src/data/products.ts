// Product type used across the app. Products are now fetched from FakeStoreAPI
// at runtime via `useProducts` (see src/hooks/useProducts.tsx). This file keeps
// the shared `Product` type and helpers used by static UI bits.

export interface Product {
  id: number;
  name: string;
  category: string;
  price: string; // formatted with currency symbol
  priceValue: number; // raw number for cart math
  image: string;
  isNew?: boolean;
  description?: string;
  rating?: { rate: number; count: number };
  gallery?: string[];
  material?: string;
  dimensions?: string;
  weight?: string;
  editorsNotes?: string;
}

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const titleCase = (s: string) =>
  s
    .split(/[\s-_/]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
