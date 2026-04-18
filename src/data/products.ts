import pantheonImage from "@/assets/pantheon.jpg";
import eclipseImage from "@/assets/eclipse.jpg";
import haloImage from "@/assets/halo.jpg";
import obliqueImage from "@/assets/oblique.jpg";
import lintelImage from "@/assets/lintel.jpg";
import shadowlineImage from "@/assets/shadowline.jpg";
import shadowline1 from "@/assets/shadowline-1.jpg";
import organicEarring from "@/assets/organic-earring.png";
import linkBracelet from "@/assets/link-bracelet.png";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  isNew?: boolean;
  material?: string;
  dimensions?: string;
  weight?: string;
  editorsNotes?: string;
  gallery?: string[];
}

export const products: Product[] = [
  {
    id: 1,
    name: "Pantheon",
    category: "Earrings",
    price: "€2,850",
    image: pantheonImage,
    isNew: true,
    material: "18k Gold Plated Sterling Silver",
    dimensions: "2.5cm x 1.2cm",
    weight: "4.2g per earring",
    editorsNotes:
      "A modern interpretation of classical architecture, bridging timeless elegance with contemporary minimalism.",
    gallery: [pantheonImage, organicEarring, haloImage, lintelImage, obliqueImage],
  },
  {
    id: 2,
    name: "Eclipse",
    category: "Bracelets",
    price: "€3,200",
    image: eclipseImage,
    material: "Solid 18k Yellow Gold",
    dimensions: "Inner circumference 17cm",
    weight: "32g",
    editorsNotes:
      "Sculpted from a single arc of gold — a quiet statement on the wrist.",
    gallery: [eclipseImage, linkBracelet, shadowlineImage, shadowline1],
  },
  {
    id: 3,
    name: "Halo",
    category: "Earrings",
    price: "€1,950",
    image: haloImage,
    isNew: true,
    material: "Recycled Sterling Silver",
    dimensions: "1.8cm diameter",
    weight: "3.1g per earring",
    editorsNotes: "An exercise in restraint — pure circle, perfect proportion.",
    gallery: [haloImage, organicEarring, pantheonImage, obliqueImage],
  },
  {
    id: 4,
    name: "Oblique",
    category: "Earrings",
    price: "€1,650",
    image: obliqueImage,
    material: "18k Gold Vermeil",
    dimensions: "3.0cm x 0.8cm",
    weight: "3.6g per earring",
    editorsNotes: "Angular geometry softened by a brushed satin finish.",
    gallery: [obliqueImage, organicEarring, lintelImage, haloImage],
  },
  {
    id: 5,
    name: "Lintel",
    category: "Earrings",
    price: "€2,250",
    image: lintelImage,
    material: "Polished Sterling Silver",
    dimensions: "2.2cm x 1.5cm",
    weight: "4.8g per earring",
    editorsNotes: "Inspired by the negative space of a doorway.",
    gallery: [lintelImage, organicEarring, pantheonImage, haloImage],
  },
  {
    id: 6,
    name: "Shadowline",
    category: "Bracelets",
    price: "€3,950",
    image: shadowlineImage,
    material: "18k Gold with hand-set onyx",
    dimensions: "Inner circumference 16.5cm",
    weight: "28g",
    editorsNotes: "Light and shadow held in suspension along the wrist.",
    gallery: [shadowlineImage, shadowline1, linkBracelet, eclipseImage],
  },
];

const filler = [
  { name: "Meridian", category: "Earrings", price: "€2,450", image: pantheonImage },
  { name: "Vertex", category: "Bracelets", price: "€2,800", image: eclipseImage },
  { name: "Apex", category: "Earrings", price: "€1,550", image: haloImage },
  { name: "Zenith", category: "Earrings", price: "€1,850", image: obliqueImage },
  { name: "Prism", category: "Earrings", price: "€2,050", image: lintelImage },
  { name: "Radiant", category: "Bracelets", price: "€3,650", image: shadowlineImage },
  { name: "Stellar", category: "Earrings", price: "€2,150", image: pantheonImage },
  { name: "Cosmos", category: "Bracelets", price: "€2,950", image: eclipseImage },
  { name: "Aurora", category: "Earrings", price: "€1,750", image: haloImage },
  { name: "Nebula", category: "Earrings", price: "€1,850", image: obliqueImage },
  { name: "Orbit", category: "Earrings", price: "€2,350", image: lintelImage },
  { name: "Galaxy", category: "Bracelets", price: "€3,450", image: shadowlineImage },
  { name: "Lunar", category: "Earrings", price: "€2,050", image: pantheonImage },
  { name: "Solar", category: "Bracelets", price: "€3,150", image: eclipseImage },
  { name: "Astral", category: "Earrings", price: "€1,650", image: haloImage },
  { name: "Cosmic", category: "Earrings", price: "€1,950", image: obliqueImage },
  { name: "Celestial", category: "Earrings", price: "€2,250", image: lintelImage },
  { name: "Ethereal", category: "Bracelets", price: "€3,750", image: shadowlineImage },
];

filler.forEach((p, i) => {
  products.push({
    id: 7 + i,
    name: p.name,
    category: p.category,
    price: p.price,
    image: p.image,
    material: p.category === "Earrings" ? "18k Gold Plated Sterling Silver" : "Solid 18k Gold",
    dimensions: p.category === "Earrings" ? "2.4cm x 1.1cm" : "Inner circumference 17cm",
    weight: p.category === "Earrings" ? "3.8g per earring" : "30g",
    editorsNotes: "A considered piece — designed to be worn every day, forever.",
    gallery: [p.image, organicEarring, linkBracelet, haloImage],
  });
});

export const getProductById = (id: string | number | undefined): Product => {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  return products.find((p) => p.id === numId) ?? products[0];
};
