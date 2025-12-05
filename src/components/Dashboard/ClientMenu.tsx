import React, { useEffect, useState } from "react";
import axios from "axios";
import { UtensilsCrossed, Loader2, ShoppingCart } from "lucide-react";
import { useCart } from "../../hooks/useCart";

interface Product {
  id: number;
  restaurant_id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  preparation_time?: number;
  is_available: 0 | 1 | boolean;
  restaurant_name?: string; // por si el backend lo manda
}

const boolFrom = (v: any) => v === 1 || v === true || v === "1";

export const ClientMenu: React.FC = () => {
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ⭐ Nuevo: filtro por restaurante
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    number | "all"
  >("all");

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      if (res.data.success && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else {
        setError(res.data.message || "No se pudo cargar el menú.");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddToCart = (p: Product) => {
    if (!boolFrom(p.is_available) || p.stock <= 0) {
      alert("Este producto no está disponible.");
      return;
    }

    addToCart({
      id: p.id,
      restaurant_id: p.restaurant_id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      preparation_time: p.preparation_time,
      is_available: p.is_available,
    });
  };

  // 👉 Lista de restaurantes únicos basada en los productos
  const restaurantOptions = Array.from(
    new Map(
      products.map((p) => [
        p.restaurant_id,
        {
          id: p.restaurant_id,
          name: p.restaurant_name || `Restaurante ${p.restaurant_id}`,
        },
      ])
    ).values()
  );

  // 👉 Productos filtrados por restaurante
  const filteredProducts =
    selectedRestaurantId === "all"
      ? products
      : products.filter((p) => p.restaurant_id === selectedRestaurantId);

  return (
    <div className="bg-white/90 rounded-xl p-5 border border-[#FFB347]/40 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#FF8C42]/20 border border-[#FFB347]/60">
            <UtensilsCrossed className="h-6 w-6 text-[#FF8C42]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#5D4037]">
              Menú de restaurantes
            </h3>
            <p className="text-sm text-[#8D6E63]">
              Elige productos y agrégalos a tu carrito.
            </p>
          </div>
        </div>

        {/* ⭐ Nuevo bloque: filtro + texto del carrito */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 text-xs md:text-sm text-[#8D6E63]">
            <span className="hidden sm:inline">Filtrar por restaurante:</span>
            <select
              value={selectedRestaurantId === "all" ? "all" : String(selectedRestaurantId)}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedRestaurantId(
                  value === "all" ? "all" : Number(value)
                );
              }}
              className="px-2 py-1 rounded-lg border border-[#FFB347]/60 bg-white text-[#5D4037] text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
            >
              <option value="all">Todos</option>
              {restaurantOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (ID {r.id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs md:text-sm text-[#8D6E63]">
            <ShoppingCart className="h-4 w-4" />
            <span>Selecciona para añadir al carrito</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center text-sm text-[#8D6E63] mb-3">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Cargando productos...
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {filteredProducts.length === 0 && !loading ? (
        <p className="text-sm text-[#8D6E63]">
          No hay productos disponibles para ese restaurante.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredProducts.map((p) => {
            const numericPrice = Number(p.price) || 0;

            return (
              <div
                key={p.id}
                className="flex flex-col justify-between bg-[#FFF8E1] border border-[#FFB347]/40 rounded-lg p-3"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-[#5D4037]">{p.name}</h4>
                    <span className="text-sm font-bold text-[#D35400]">
                      ${numericPrice.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-[#8D6E63] mb-1">
                    Restaurante ID: {p.restaurant_id}
                  </p>

                  {p.description && (
                    <p className="text-xs text-[#8D6E63] mb-1">
                      {p.description}
                    </p>
                  )}

                  <p className="text-xs text-[#8D6E63]">
                    Stock: {p.stock} · Prep: {p.preparation_time ?? 15} min
                  </p>

                  {!boolFrom(p.is_available) && (
                    <p className="text-xs text-red-500 mt-1">
                      Producto no disponible
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!boolFrom(p.is_available) || p.stock <= 0}
                  onClick={() => handleAddToCart(p)}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-[#FF8C42] hover:bg-[#FF7A00] text-white text-xs font-medium flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Agregar al carrito</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
