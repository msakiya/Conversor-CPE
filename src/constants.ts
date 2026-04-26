export interface Product {
  id: number;
  name: string;
  price: number; // Precio base en USD
  image: string;
  category: string;
}

export interface CurrencyData {
  code: string;
  symbol: string;
  rate: number;
  isManual: boolean;
  country: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Cámara Pro Reflex",
    price: 1200,
    category: "Electrónica",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    name: "Auriculares Hi-Fi Wireless",
    price: 250,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    name: "Reloj Inteligente Serie 9",
    price: 399,
    category: "Relojes",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    name: "Mochila Tech Impermeable",
    price: 85,
    category: "Accesorios",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
  },
];

export const COUNTRY_CURRENCY_MAP: Record<string, { currency: string, symbol: string }> = {
  "AR": { currency: "ARS", symbol: "$" },
  "MX": { currency: "MXN", symbol: "$" },
  "ES": { currency: "EUR", symbol: "€" },
  "CO": { currency: "COP", symbol: "$" },
  "CL": { currency: "CLP", symbol: "$" },
  "PE": { currency: "PEN", symbol: "S/" },
  "US": { currency: "USD", symbol: "$" },
  "BR": { currency: "BRL", symbol: "R$" },
  // Default fallback
  "DEFAULT": { currency: "USD", symbol: "$" }
};
