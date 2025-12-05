import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, ListChecks } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

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

const API_BASE = "http://localhost:5000/api";

export const RestaurantOrdersPanel: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restaurantId = user?.id; // 👈 mismo id que usas en el menú

  const loadOrders = async () => {
    if (!restaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${API_BASE}/orders/by-restaurant/${restaurantId}`
      );
      if (res.data.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        setError(res.data.message || "No se pudieron cargar los pedidos.");
      }
    } catch (err) {
      console.error("Error cargando pedidos del restaurante:", err);
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    if (!restaurantId) return;

    // 🔁 pseudo tiempo real: refresca cada 10 segundos
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  const renderStatus = (status: OrderStatus) => {
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
    <div className="bg-white/90 rounded-xl p-5 border border-[#FFB347]/40 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-[#FF8C42]/15 border border-[#FFB347]/50">
            <ListChecks className="h-5 w-5 text-[#FF8C42]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#5D4037]">
              Pedidos actuales y pasados
            </h3>
            <p className="text-xs text-[#8D6E63]">
              Se actualiza automáticamente cada 10 segundos.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center text-sm text-[#8D6E63]">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Cargando pedidos...
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {orders.length === 0 && !loading ? (
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
                      (envío ${Number(o.delivery_fee).toFixed(2)})
                    </span>
                  )}
                </span>
                <span>ETA: {o.eta_minutes} min</span>
                {renderStatus(o.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
