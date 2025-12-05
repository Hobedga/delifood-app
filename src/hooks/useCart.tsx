import React, { createContext, useContext, useState } from "react";
import axios from "axios";

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  is_available: 0 | 1 | boolean;
  restaurant_id?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

/** 🔍 Resultado de la previsualización del pedido */
export interface OrderPreview {
  success: boolean;
  hasError: boolean;
  cart: any[];
  totals: {
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
  etaMinutes: number;
  horario: {
    dentroHorario: boolean;
    message: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  total: number;

  // ✅ Validación fuerte de carrito (contra /api/products/validate-cart)
  validateCart: () => Promise<boolean>;

  // 🆕 Datos de la previsualización de pedido (costos, tiempos, etc.)
  preview: OrderPreview | null;
  isLoading: boolean;

  // 🆕 Flujo de pedido
  previewOrder: (userId: number) => Promise<OrderPreview>;
  confirmOrder: (userId: number) => Promise<any>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [preview, setPreview] = useState<OrderPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // 📦 Gestión local del carrito
  // ---------------------------------------------------------------------------
  const addToCart = (product: Product, quantity: number = 1) => {
    // Validación rápida en frontend
    if (!product.is_available) {
      alert("Este producto no está disponible.");
      return;
    }

    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          alert(
            `Solo hay ${product.stock} unidades disponibles de ${product.name}.`
          );
          return prev;
        }
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: newQty } : i
        );
      } else {
        if (quantity > product.stock) {
          alert(
            `Solo hay ${product.stock} unidades disponibles de ${product.name}.`
          );
          return prev;
        }
        return [...prev, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setPreview(null);
  };

  const total = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  // ---------------------------------------------------------------------------
  // ✅ Validación fuerte contra productos (lo que ya tenías)
  //    ÚTIL si quieres mantener tu endpoint /api/products/validate-cart
  // ---------------------------------------------------------------------------
  const validateCart = async (): Promise<boolean> => {
    if (items.length === 0) {
      alert("Tu carrito está vacío.");
      return false;
    }

    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const res = await axios.post(
        "http://localhost:5000/api/products/validate-cart",
        payload
      );

      if (res.data.success) {
        return true;
      }

      return false;
    } catch (err: any) {
      const problems = err.response?.data?.problems;
      if (Array.isArray(problems) && problems.length > 0) {
        let msg = "Algunos productos no están disponibles:\n\n";
        problems.forEach((p: any) => {
          if (p.reason === "NOT_ENOUGH_STOCK") {
            msg += `- ${p.name}: solo ${p.available} disponibles (pediste ${p.requested})\n`;
          } else if (p.reason === "NOT_AVAILABLE") {
            msg += `- ${p.name}: marcado como no disponible\n`;
          } else {
            msg += `- Producto ID ${p.productId}: no encontrado\n`;
          }
        });
        alert(msg);
      } else {
        alert("Error al validar el carrito.");
      }
      return false;
    }
  };

  // ---------------------------------------------------------------------------
  // 🆕  PREVIEW DEL PEDIDO (costos + tiempos + validación asíncrona)
  //     -> usa /api/orders/preview
  // ---------------------------------------------------------------------------
  const previewOrder = async (userId: number): Promise<OrderPreview> => {
    if (items.length === 0) {
      throw new Error("El carrito está vacío");
    }

    setIsLoading(true);
    try {
      const payload = {
        userId,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const res = await axios.post<OrderPreview>(
        "http://localhost:5000/api/orders/preview",
        payload
      );

      setPreview(res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Error al previsualizar pedido:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 🆕  CONFIRMAR PEDIDO (crea orden, descuenta stock, genera notificación)
  //     -> usa /api/orders/confirm
  // ---------------------------------------------------------------------------
  const confirmOrder = async (userId: number): Promise<any> => {
    if (items.length === 0) {
      throw new Error("El carrito está vacío");
    }

    setIsLoading(true);
    try {
      const payload = {
        userId,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const res = await axios.post(
        "http://localhost:5000/api/orders/confirm",
        payload
      );

      if (res.data.success) {
        // Si todo salió bien, limpiamos carrito y preview
        clearCart();
      }

      return res.data;
    } catch (error) {
      console.error("❌ Error al confirmar pedido:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        total,
        validateCart,
        preview,
        isLoading,
        previewOrder,
        confirmOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de un CartProvider");
  return ctx;
};
