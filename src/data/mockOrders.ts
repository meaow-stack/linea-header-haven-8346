export interface MockOrderItem {
  name: string;
  category: string;
  price: string;
  quantity: number;
  image: string;
}

export interface MockOrder {
  id: string;
  date: string;
  status: "Delivered" | "Shipped" | "Processing" | "Cancelled";
  total: string;
  items: MockOrderItem[];
}

import pantheonImage from "@/assets/pantheon.jpg";
import eclipseImage from "@/assets/eclipse.jpg";
import haloImage from "@/assets/halo.jpg";

export const mockOrders: MockOrder[] = [
  {
    id: "LIN-2024-1108",
    date: "March 14, 2024",
    status: "Delivered",
    total: "€6,050",
    items: [
      { name: "Pantheon", category: "Earrings", price: "€2,850", quantity: 1, image: pantheonImage },
      { name: "Eclipse", category: "Bracelets", price: "€3,200", quantity: 1, image: eclipseImage },
    ],
  },
  {
    id: "LIN-2024-0987",
    date: "February 2, 2024",
    status: "Delivered",
    total: "€1,950",
    items: [
      { name: "Halo", category: "Earrings", price: "€1,950", quantity: 1, image: haloImage },
    ],
  },
  {
    id: "LIN-2024-0764",
    date: "January 19, 2024",
    status: "Shipped",
    total: "€3,200",
    items: [
      { name: "Eclipse", category: "Bracelets", price: "€3,200", quantity: 1, image: eclipseImage },
    ],
  },
];
