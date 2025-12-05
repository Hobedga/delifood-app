import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  UtensilsCrossed,
  Trash2,
  Edit3,
  Loader2,
  ToggleLeft,
  ToggleRight,
  ListChecks, // 🆕 icono para pedidos
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface RestaurantProduct {
  id: number;
  restaurant_id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  preparation_time?: number;
  is_available: 0 | 1 | boolean;
}

// 🆕 Tipo para los pedidos que devuelve /api/orders/by-restaurant/:restaurantId
type OrderStatus =
  | "pendiente"
  | "preparando"
  | "en_camino"
  | "entregado"
  | "cancelado";

interface RestaurantOrder {
  id: number;
  user_id: number;
  total: number;
  delivery_fee: number;
  eta_minutes: number;
  status: OrderStatus;
  created_at: string;
  client_name: string;
  client_username: string;
}

const boolFrom = (v: any) => v === 1 || v === true || v === "1";

export const RestaurantMenuManager: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<RestaurantProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<RestaurantProduct | null>(null);

  // 🆕 estado para pedidos del restaurante
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    preparation_time: "15",
    is_available: true,
  });

  const restaurantId = user?.id; // usamos id del usuario restaurante

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      preparation_time: "15",
      is_available: true,
    });
  };

  const loadMenu = async () => {
    if (!restaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/products/my-menu?restaurantId=${restaurantId}`
      );
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

  // 🆕 cargar pedidos de este restaurante
  const loadOrders = async () => {
    if (!restaurantId) return;
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/orders/by-restaurant/${restaurantId}`
      );
      if (res.data.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        setOrdersError(res.data.message || "No se pudieron cargar los pedidos.");
      }
    } catch (err) {
      console.error("Error cargando pedidos del restaurante:", err);
      setOrdersError("Error al conectar con el servidor.");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [restaurantId]);

  // 🆕 “tiempo real” sencillo: refresca pedidos cada 10s
  useEffect(() => {
    if (!restaurantId) return;
    // carga inicial
    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 10000); // 10 segundos

    return () => clearInterval(interval);
  }, [restaurantId]);

  const handleEdit = (p: RestaurantProduct) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      stock: String(p.stock),
      preparation_time: String(p.preparation_time ?? 15),
      is_available: boolFrom(p.is_available),
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este producto del menú?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("❌ Error al eliminar producto");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) {
      alert("No se encontró el ID del restaurante");
      return;
    }

    const payload = {
      restaurant_id: restaurantId,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      preparation_time: Number(form.preparation_time) || 15,
      is_available: form.is_available,
    };

    setSaving(true);
    try {
      if (editing) {
        const res = await axios.put(
          `http://localhost:5000/api/products/${editing.id}`,
          payload
        );
        if (res.data.success) {
          setProducts((prev) =>
            prev.map((p) =>
              p.id === editing.id ? { ...p, ...res.data.product } : p
            )
          );
          resetForm();
        }
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/products",
          payload
        );
        if (res.data.success && res.data.product) {
          setProducts((prev) => [...prev, res.data.product]);
          resetForm();
        }
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar producto");
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== "restaurante") {
    return (
      <p className="text-[#5D4037]">
        Solo los usuarios con rol <b>restaurante</b> pueden gestionar el menú.
      </p>
    );
  }

  // 🆕 badge de estado del pedido
  const renderOrderStatus = (status: OrderStatus) => {
    const base =
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold";

    switch (status) {
      case "pendiente":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800`}>
            Pendiente
          </span>
        );
      case "preparando":
        return (
          <span className={`${base} bg-blue-100 text-blue-800`}>
            Preparando
          </span>
        );
      case "en_camino":
        return (
          <span className={`${base} bg-purple-100 text-purple-800`}>
            En camino
          </span>
        );
      case "entregado":
        return (
          <span className={`${base} bg-green-100 text-green-800`}>
            Entregado
          </span>
        );
      case "cancelado":
      default:
        return (
          <span className={`${base} bg-red-100 text-red-800`}>
            Cancelado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#FF8C42]/20 border border-[#FFB347]/60">
            <UtensilsCrossed className="h-6 w-6 text-[#FF8C42]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#5D4037]">Mi menú</h2>
            <p className="text-sm text-[#8D6E63]">
              Agrega, edita o desactiva platillos de tu restaurante.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white/90 rounded-xl p-5 border border-[#FFB347]/40 shadow-md">
        <h3 className="text-lg font-semibold text-[#D35400] mb-3 flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>{editing ? "Editar producto" : "Nuevo producto"}</span>
        </h3>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm text-[#8D6E63] mb-1">
              Nombre del platillo
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-[#FFB347]/50 bg-white text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8D6E63] mb-1">
              Precio ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-[#FFB347]/50 bg-white text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8D6E63] mb-1">
              Stock disponible
            </label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-[#FFB347]/50 bg-white text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8D6E63] mb-1">
              Tiempo de preparación (min)
            </label>
            <input
              type="number"
              min="1"
              value={form.preparation_time}
              onChange={(e) =>
                setForm({ ...form, preparation_time: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-[#FFB347]/50 bg-white text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-[#8D6E63] mb-1">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[#FFB347]/50 bg-white text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
            />
          </div>

          <div className="flex items-center space-x-2 md:col-span-2">
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, is_available: !f.is_available }))
              }
              className="flex items-center space-x-2 text-sm text-[#5D4037]"
            >
              {form.is_available ? (
                <ToggleRight className="h-5 w-5 text-green-500" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-gray-400" />
              )}
              <span>
                {form.is_available ? "Producto activo" : "Producto inactivo"}
              </span>
            </button>
          </div>

          <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-[#5D4037] text-sm"
              >
                Cancelar edición
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-[#FF8C42] hover:bg-[#FF7A00] text-white text-sm font-medium flex items-center space-x-2 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{editing ? "Guardar cambios" : "Agregar al menú"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Lista del menú */}
      <div className="bg-white/90 rounded-xl p-5 border border-[#FFB347]/40 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-[#5D4037]">
            Platillos registrados
          </h3>
          {loading && (
            <div className="flex items-center text-sm text-[#8D6E63]">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cargando menú...
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        {products.length === 0 && !loading ? (
          <p className="text-sm text-[#8D6E63]">
            Aún no tienes productos en tu menú. Agrega tu primer platillo.
          </p>
        ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#FFF3E0] border border-[#FFB347]/40"
              >
                <div>
                  <div className="font-semibold text-[#5D4037]">
                    {p.name}{" "}
                    {!boolFrom(p.is_available) && (
                      <span className="text-xs text-red-500 ml-1">
                        (inactivo)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#8D6E63]">
                    ${Number(p.price || 0).toFixed(2)} · Stock: {p.stock} ·
                    Prep: {p.preparation_time ?? 15} min
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-2 rounded-lg text-[#5D4037] hover:bg-[#FF8C42]/15"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🆕 Bloque de pedidos del restaurante */}
      <div className="bg-white/90 rounded-xl p-5 border border-[#FFB347]/40 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#FF8C42]/15 border border-[#FFB347]/50">
              <ListChecks className="h-5 w-5 text-[#FF8C42]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#5D4037]">
                Pedidos recientes de mi restaurante
              </h3>
              <p className="text-xs text-[#8D6E63]">
                Se actualiza automáticamente cada 10 segundos.
              </p>
            </div>
          </div>

          {ordersLoading && (
            <div className="flex items-center text-sm text-[#8D6E63]">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cargando pedidos...
            </div>
          )}
        </div>

        {ordersError && (
          <p className="text-sm text-red-600 mb-3">{ordersError}</p>
        )}

        {orders.length === 0 && !ordersLoading ? (
          <p className="text-sm text-[#8D6E63]">
            No hay pedidos registrados para este restaurante todavía.
          </p>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div
                key={o.id}
                className="px-3 py-2 rounded-lg bg-[#FFF3E0] border border-[#FFB347]/40 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div>
                  <p className="text-xs text-[#8D6E63]">
                    Pedido <b>#{o.id}</b> · Cliente:{" "}
                    <span className="font-semibold">{o.client_name}</span>{" "}
                    <span className="text-[11px] text-[#A1887F]">
                      (@{o.client_username})
                    </span>
                  </p>
                  <p className="text-xs text-[#8D6E63]">
                    Creado:{" "}
                    {new Date(o.created_at).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#5D4037]">
                  <span>
                    Total:{" "}
                    <b>${Number(o.total || 0).toFixed(2)}</b>
                    {o.delivery_fee > 0 && (
                      <span className="text-[11px] text-[#8D6E63]">
                        {" "}
                        (incluye envío ${Number(o.delivery_fee).toFixed(2)})
                      </span>
                    )}
                  </span>
                  <span>ETA: {o.eta_minutes} min</span>
                  {renderOrderStatus(o.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
