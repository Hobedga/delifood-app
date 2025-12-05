import React, { useState, useEffect } from "react";
import { MapPin, Package, Clock, User } from "lucide-react";
import { Header } from "../Layout/Header";
import { DeliveryProfile } from "./DeliveryProfile";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";

// Opcional: usa el mismo base URL que en auth
const API_BASE = "http://localhost:5000/api";

/* -------------------------------------------------------------------------- */
/* 🧾 Tipo de pedido para repartidor                                          */
/* -------------------------------------------------------------------------- */

type DeliveryStatus = "pendiente" | "asignado" | "en_camino" | "entregado";

interface DeliveryOrder {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  clientName: string;
  clientAddress: string;
  total: number;
  distanceKm: number;
  etaMinutes: number;
  paymentMethod: "efectivo" | "tarjeta";
  status: DeliveryStatus;
  createdAt: string;
  takenBy?: string | null; // username del repartidor
  notes?: string;
}

/* -------------------------------------------------------------------------- */
/* 📦 Panel de rutas actuales (pedidos)                                       */
/* -------------------------------------------------------------------------- */

const DeliveryRoutesPanel: React.FC = () => {
  const { user } = useAuth(); // repartidor actual
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyMine, setOnlyMine] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Cargar pedidos disponibles (demo + hook para conectar backend)
useEffect(() => {
  let isMounted = true;

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders/for-delivery");
      if (res.data.success && Array.isArray(res.data.orders)) {
        const mapped: DeliveryOrder[] = res.data.orders.map((o: any) => ({
          id: String(o.id),
          restaurantName: o.restaurant_name || "Restaurante",
          restaurantAddress: "Dirección no registrada", // TODO: cuando tengas dirección real
          clientName: o.client_name || "Cliente",
          clientAddress: "Dirección no registrada",     // TODO: igual
          total: Number(o.total || 0),
          distanceKm: 0,        // TODO: podrías calcular luego con mapas
          etaMinutes: o.eta_minutes || 20,
          paymentMethod: "efectivo", // por ahora fijo (no tienes columna aún)
          status: o.status as DeliveryStatus,
          createdAt: o.created_at,
          takenBy: null,        // luego podemos enlazar repartidor real
          notes: "",
        }));

        if (isMounted) setOrders(mapped);
      }
    } catch (err) {
      console.error("Error cargando pedidos de entrega:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  setLoading(true);
  fetchOrders();

  // ⏱️ Polling cada 5 segundos
  const interval = setInterval(fetchOrders, 5000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
}, []);

  // Filtro "solo mis pedidos"
  const filteredOrders = orders.filter((o) => {
    if (!onlyMine) return o.status !== "entregado";
    if (!user?.username) return false;
    return o.takenBy === user.username && o.status !== "entregado";
  });

  // Asignar pedido al repartidor
  const handleTakeOrder = async (orderId: string) => {
    if (!user?.username) {
      alert("No se encontró el usuario del repartidor.");
      return;
    }

    setActionLoadingId(orderId);
    try {
      // 🔗 Llamada opcional al backend
      // await axios.post(`${API_BASE}/delivery/orders/${orderId}/take`, {
      //   delivery_username: user.username,
      // });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: "asignado", takenBy: user.username }
            : o
        )
      );
    } catch (err) {
      console.error("Error al tomar pedido:", err);
      alert("No se pudo tomar el pedido (demo).");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Cambiar estado (en_camino / entregado)
  const handleUpdateStatus = async (orderId: string, newStatus: DeliveryStatus) => {
    if (!user?.username) {
      alert("No se encontró el usuario del repartidor.");
      return;
    }

    setActionLoadingId(orderId);
    try {
      // 🔗 Llamada opcional al backend
      // await axios.post(`${API_BASE}/delivery/orders/${orderId}/status`, {
      //   status: newStatus,
      //   delivery_username: user.username,
      // });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      console.error("Error actualizando estado:", err);
      alert("No se pudo actualizar el estado del pedido (demo).");
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderStatusBadge = (status: DeliveryStatus) => {
    const base =
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold";

    switch (status) {
      case "pendiente":
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800`}>
            Pendiente
          </span>
        );
      case "asignado":
        return (
          <span className={`${base} bg-blue-100 text-blue-800`}>
            Asignado
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
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-[#5D4037]">
        Cargando pedidos disponibles...
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-[#5D4037]">
            Rutas de entrega actuales
          </h2>
          <label className="flex items-center gap-2 text-xs text-[#6D4C41]">
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={(e) => setOnlyMine(e.target.checked)}
            />
            Ver solo mis pedidos
          </label>
        </div>

        <div className="text-center py-10 text-[#8D6E63] bg-[#FFF8E1] rounded-xl border border-[#FFB347]/40">
          No hay pedidos activos en este momento.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-[#5D4037]">
          Rutas de entrega actuales
        </h2>
        <label className="flex items-center gap-2 text-xs text-[#6D4C41]">
          <input
            type="checkbox"
            checked={onlyMine}
            onChange={(e) => setOnlyMine(e.target.checked)}
          />
          Ver solo mis pedidos
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map((order) => {
          const isMine = order.takenBy === user?.username;
          const disabled = actionLoadingId === order.id;

          return (
            <div
              key={order.id}
              className="bg-white/90 backdrop-blur-md border border-[#FFB347]/40 rounded-xl p-4 shadow-sm flex flex-col gap-3"
            >
              {/* Encabezado */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#8D6E63]">Pedido</p>
                  <p className="font-semibold text-[#5D4037]">{order.id}</p>
                  <p className="text-xs text-[#8D6E63]">
                    Creado: {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {renderStatusBadge(order.status)}
                  {order.takenBy && (
                    <p className="text-[10px] text-[#8D6E63]">
                      Asignado a:{" "}
                      <span className="font-semibold">{order.takenBy}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Restaurante */}
              <div className="bg-[#FFF3E0] rounded-lg p-3 border border-[#FFCC80]/60">
                <p className="text-xs font-semibold text-[#D35400] flex items-center gap-1">
                  <MapPin size={14} /> Restaurante
                </p>
                <p className="text-sm font-semibold text-[#5D4037]">
                  {order.restaurantName}
                </p>
                <p className="text-xs text-[#8D6E63]">
                  {order.restaurantAddress}
                </p>
              </div>

              {/* Cliente */}
              <div className="bg-[#E8F5E9] rounded-lg p-3 border border-[#A5D6A7]/60">
                <p className="text-xs font-semibold text-[#2E7D32] flex items-center gap-1">
                  <User size={14} /> Cliente
                </p>
                <p className="text-sm font-semibold text-[#33691E]">
                  {order.clientName}
                </p>
                <p className="text-xs text-[#558B2F]">
                  {order.clientAddress}
                </p>
              </div>

              {/* Datos de entrega */}
              <div className="grid grid-cols-2 gap-2 text-xs text-[#5D4037]">
                <p>
                  <span className="font-semibold">Total:</span> $
                  {order.total.toFixed(2)}
                </p>
                <p>
                  <span className="font-semibold">Distancia:</span>{" "}
                  {order.distanceKm.toFixed(1)} km
                </p>
                <p className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>
                    ETA:{" "}
                    <span className="font-semibold">
                      {order.etaMinutes} min
                    </span>
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Pago:</span>{" "}
                  {order.paymentMethod === "efectivo"
                    ? "Efectivo"
                    : "Tarjeta"}
                </p>
              </div>

              {/* Mapa simulación */}
              <div className="h-16 rounded-lg bg-gradient-to-r from-[#FFECB3] to-[#FFE0B2] border border-[#FFCC80]/70 flex items-center justify-center text-[11px] text-[#8D6E63] italic">
                Mapa aproximado de ruta (demo). Aquí después puedes integrar
                Google Maps o Leaflet.
              </div>

              {order.notes && (
                <p className="text-[11px] text-[#6D4C41] bg-[#FFF8E1] rounded-md px-2 py-1">
                  <span className="font-semibold">Notas:</span> {order.notes}
                </p>
              )}

              {/* Acciones */}
              <div className="flex flex-wrap gap-2 mt-1">
                {order.status === "pendiente" && !order.takenBy && (
                  <button
                    disabled={disabled}
                    onClick={() => handleTakeOrder(order.id)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#FF8C42] hover:bg-[#E67E22] text-white text-xs font-semibold transition-colors disabled:opacity-60"
                  >
                    Tomar pedido
                  </button>
                )}

                {isMine && order.status === "asignado" && (
                  <button
                    disabled={disabled}
                    onClick={() => handleUpdateStatus(order.id, "en_camino")}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#42A5F5] hover:bg-[#1E88E5] text-white text-xs font-semibold transition-colors disabled:opacity-60"
                  >
                    Iniciar entrega
                  </button>
                )}

                {isMine && order.status === "en_camino" && (
                  <button
                    disabled={disabled}
                    onClick={() => handleUpdateStatus(order.id, "entregado")}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#66BB6A] hover:bg-[#43A047] text-white text-xs font-semibold transition-colors disabled:opacity-60"
                  >
                    Marcar como entregado
                  </button>
                )}

                {!isMine && order.takenBy && (
                  <p className="text-[11px] text-[#8D6E63]">
                    Este pedido ya está asignado a otro repartidor.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 🧭 Dashboard del repartidor                                                */
/* -------------------------------------------------------------------------- */

export const DeliveryDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("routes");

  const tabs = [
    { id: "routes", label: "Rutas Actuales", icon: MapPin },
    { id: "history", label: "Historial de Entregas", icon: Package },
    { id: "schedule", label: "Horarios", icon: Clock },
    { id: "profile", label: "Mi Perfil", icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "routes":
        return <DeliveryRoutesPanel />;
      case "history":
        return (
          <p className="text-[#5D4037]">
            📦 Aquí después podremos listar el historial real de entregas.
          </p>
        );
      case "schedule":
        return (
          <p className="text-[#5D4037]">
            🕓 Aquí podrás mostrar los horarios y turnos del repartidor.
          </p>
        );
      case "profile":
        return <DeliveryProfile />;
      default:
        return <DeliveryProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFE0B2] via-[#FFCC80] to-[#FFD54F]">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-[#FFB347]/40">
            {/* Encabezado principal */}
            <div className="bg-[#FF8C42]/90 px-6 py-4 border-b border-[#FFB347]/40 text-white">
              <h1 className="text-2xl font-bold">Panel del Repartidor 🚗</h1>
              <p className="text-white/90">Gestiona tus entregas y estado</p>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Sidebar */}
              <div className="lg:w-64 bg-[#FFF8E1] border-r border-[#FFB347]/30">
                <nav className="p-4 space-y-3">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                          isActive
                            ? "bg-[#FF8C42] text-white shadow-md"
                            : "text-[#5D4037] hover:bg-[#FFE0B2]/70 hover:text-[#D35400]"
                        }`}
                      >
                        <Icon size={20} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Contenido principal */}
              <div className="flex-1 p-6">{renderContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
