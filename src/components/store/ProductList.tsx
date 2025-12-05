import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCart, Product } from "../../hooks/useCart";

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        if (res.data.success) setProducts(res.data.products);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p) => (
        <div
          key={p.id}
          className="bg-white/10 border border-white/15 rounded-xl p-4 text-white"
        >
          <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
          <p className="text-sm text-white/70 mb-2">{p.description}</p>
          <p className="font-bold mb-3">${p.price.toFixed(2)}</p>
          <p className="text-xs text-white/60 mb-2">
            Stock: {p.stock} {p.stock === 0 && "(No disponible)"}
          </p>
          <button
            disabled={!p.is_available || p.stock === 0}
            onClick={() => addToCart(p, 1)}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              !p.is_available || p.stock === 0
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-400 text-slate-900"
            }`}
          >
            {p.stock === 0 ? "Sin stock" : "Agregar al carrito"}
          </button>
        </div>
      ))}
    </div>
  );
};