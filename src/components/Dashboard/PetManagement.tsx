import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Clock,
  Truck,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useCart } from "../../hooks/useCart";

interface Order {
  id: string;
  userId: string;
  restaurant: string;
  items: string;
  total: number;
  status: "pendiente" | "en_camino" | "entregado";
  createdAt: string;
}

export const PetManagement: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useLocalStorage<Order[]>("orders", []);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    restaurant: "",
    items: "",
    total: "",
  });

  // 🛒 Carrito global (useCart)
  const {
    items: cartItems,
    total: cartTotal,
    preview,
    isLoading,
    previewOrder,
    confirmOrder,
    clearCart,
    removeFromCart,
    addToCart,
  } = useCart();

  const userOrders = orders.filter((order) => order.userId === user?.email);

  // ---------------------------------------------------------------------------
  //  FORMULARIO LOCAL (LO QUE YA TENÍAS)
  // ---------------------------------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newOrder: Order = {
      id: editingOrder ? editingOrder.id : Date.now().toString(),
      userId: user?.email || "",
      restaurant: formData.restaurant.trim(),
      items: formData.items.trim(),
      total: parseFloat(formData.total),
      status: editingOrder ? editingOrder.status : "pendiente",
      createdAt: editingOrder ? editingOrder.createdAt : new Date().toISOString(),
    };

    if (editingOrder) {
      setOrders(orders.map((o) => (o.id === editingOrder.id ? newOrder : o)));
    } else {
      setOrders([...orders, newOrder]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ restaurant: "", items: "", total: "" });
    setShowForm(false);
    setEditingOrder(null);
  };

  const handleEdit = (order: Order) => {
    setFormData({
      restaurant: order.restaurant,
      items: order.items,
      total: order.total.toString(),
    });
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleDelete = (orderId: string) => {
    if (window.confirm("¿Deseas cancelar este pedido?")) {
      setOrders(orders.filter((o) => o.id !== orderId));
    }
  };

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "pendiente":
        return "🕐 Pendiente";
      case "en_camino":
        return "🚗 En camino";
      case "entregado":
        return "✅ Entregado";
    }
  };

  // ---------------------------------------------------------------------------
  //  🛒 FLUJO DE CARRITO: PREVIEW + CONFIRMAR PEDIDO
  // ---------------------------------------------------------------------------
  const handlePreviewOrder = async () => {
    if (!user?.id) {
      alert("No se encontró el ID del usuario para calcular el pedido.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Tu carrito está vacío. Agrega productos desde el menú.");
      return;
    }

    try {
      await previewOrder(user.id);
    } catch (error) {
      console.error(error);
      alert("No se pudo calcular el costo y tiempo del pedido.");
    }
  };

  // 👉 NUEVO: crear un pedido local usando el carrito + preview
  const addLocalOrderFromCart = () => {
    if (!user || !preview) return;

    const itemsText = cartItems
      .map((item) => `${item.product.name} x${item.quantity}`)
      .join(", ");

    const newOrder: Order = {
      id: Date.now().toString(),
      userId: user.email || "",
      // Por ahora un texto genérico; más adelante podemos poner el nombre real del restaurante
      restaurant: "Pedido desde menú",
      items: itemsText,
      total: preview.totals.total,
      status: "pendiente",
      createdAt: new Date().toISOString(),
    };

    setOrders([...orders, newOrder]);
  };

  const handleConfirmOrder = async () => {
    if (!user?.id) {
      alert("No se encontró el ID del usuario para confirmar el pedido.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    try {
      const res = await confirmOrder(user.id);

      // 👉 NUEVO: guardar el pedido en la lista local
      addLocalOrderFromCart();

      alert(res?.message || "Pedido confirmado correctamente ✅");

      // 👉 NUEVO: limpiar el carrito
      clearCart();
    } catch (error) {
      console.error(error);
      alert("No se pudo confirmar el pedido.");
    }
  };

  const hasHorarioProblem =
    preview && (!preview.horario?.dentroHorario || preview.hasError === true);

  return (
    <div className="space-y-6">
      {/* ENCABEZADO GENERAL */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#5D4037]">Mis Pedidos</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#FF8C42] hover:bg-[#FF7A00] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nuevo Pedido </span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 🛒 SECCIÓN: CARRITO ACTUAL + VALIDACIÓN ASÍNCRONA                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#FFB347]/40 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#FF8C42] rounded-lg">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#5D4037]">
                Carrito de compras
              </h3>
              <p className="text-sm text-[#8D6E63]">
                Valida disponibilidad, costos y tiempo estimado antes de
                confirmar.
              </p>
            </div>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm px-3 py-1 rounded-lg border border-[#FF8C42]/40 text-[#D35400] hover:bg-[#FFE0B2]/60 transition-colors"
            >
              Vaciar carrito
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-6 text-[#8D6E63]">
            <p>Tu carrito está vacío.</p>
            <p className="text-sm">
              Agrega productos desde el menú de restaurantes para comenzar.
            </p>
          </div>
        ) : (
          <>
            {/* Lista de items del carrito */}
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => {
                const unitPrice = Number(item.product.price) || 0;
                const lineTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between bg-[#FFF8E1] rounded-lg px-3 py-2 border border-[#FFB347]/30"
                  >
                    <div>
                      <p className="font-medium text-[#5D4037]">
                        {item.product.name}{" "}
                        <span className="text-xs text-[#8D6E63]">
                          x {item.quantity}
                        </span>
                      </p>

                      {/* 💡 Nombre / identificador del restaurante */}
                      <p className="text-xs text-[#8D6E63]">
                        Restaurante ID: {item.product.restaurant_id ?? "N/D"}
                      </p>

                      {/* 💡 Stock actual del producto */}
                      <p className="text-xs text-[#8D6E63]">
                        En stock: {item.product.stock} unidades
                      </p>

                      <p className="text-xs text-[#8D6E63]">
                        ${unitPrice.toFixed(2)} c/u
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold text-[#5D4037]">
                        ${lineTotal.toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Quitar del carrito"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totales + acciones de preview/confirm */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1 text-sm text-[#5D4037]">
                <p>
                  <span className="font-semibold">Subtotal carrito: </span>$
                  {cartTotal.toFixed(2)}
                </p>

                {preview && (
                  <>
                    <p>
                      <span className="font-semibold">Envío aproximado: </span>$
                      {preview.totals.deliveryFee.toFixed(2)}
                    </p>
                    <p>
                      <span className="font-semibold">Total estimado: </span>$
                      {preview.totals.total.toFixed(2)}
                    </p>
                    <p className="flex items-center text-xs text-[#8D6E63] mt-1">
                      <Timer className="w-4 h-4 mr-1" />
                      Tiempo estimado:{" "}
                      <span className="font-semibold ml-1">
                        {preview.etaMinutes} min
                      </span>
                    </p>

                    <p className="flex items-center text-xs mt-1">
                      {preview.horario?.dentroHorario ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                          <span className="text-green-700">
                            {preview.horario.message}
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
                          <span className="text-red-700">
                            {preview.horario?.message ||
                              "Fuera del horario de servicio."}
                          </span>
                        </>
                      )}
                    </p>
                  </>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <button
                  type="button"
                  onClick={handlePreviewOrder}
                  disabled={isLoading || cartItems.length === 0}
                  className="px-4 py-2 rounded-lg bg-[#FF8C42] hover:bg-[#FF7A00] text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Calculando..." : "Calcular costos y tiempos"}
                </button>

                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={
                    isLoading ||
                    cartItems.length === 0 ||
                    !preview ||
                    hasHorarioProblem
                  }
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Procesando..." : "Confirmar pedido"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* FORMULARIO MANUAL DE PEDIDOS (LO QUE YA TENÍAS)                    */}
      {/* ------------------------------------------------------------------ */}
      {showForm && (
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#FFB347]/30 shadow-lg">
          <h3 className="text-xl font-semibold text-[#D35400] mb-4">
            {editingOrder ? "Editar Pedido" : "Registrar Nuevo Pedido"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-[#8D6E63] text-sm font-medium mb-2">
                Restaurante
              </label>
              <input
                type="text"
                value={formData.restaurant}
                onChange={(e) =>
                  setFormData({ ...formData, restaurant: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#FFB347]/50 text-[#5D4037]
                           focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
                required
              />
            </div>
            <div>
              <label className="block text-[#8D6E63] text-sm font-medium mb-2">
                Productos
              </label>
              <input
                type="text"
                value={formData.items}
                onChange={(e) =>
                  setFormData({ ...formData, items: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#FFB347]/50 text-[#5D4037]
                           focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
                placeholder="Ejemplo: Hamburguesa, Refresco"
                required
              />
            </div>
            <div>
              <label className="block text-[#8D6E63] text-sm font-medium mb-2">
                Total ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.total}
                onChange={(e) =>
                  setFormData({ ...formData, total: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#FFB347]/50 text-[#5D4037]
                           focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
                required
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF8C42] hover:bg-[#FF7A00] text-white rounded-lg transition-colors"
              >
                {editingOrder ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de pedidos (localStorage) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#FFB347]/30 shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#FF8C42] rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#5D4037]">
                  {order.restaurant}
                </h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(order)}
                  className="p-2 text-[#5D4037] hover:bg-[#FF8C42]/20 rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-[#6D4C41]">
              <p>
                <span className="font-medium">Productos:</span> {order.items}
              </p>
              <p>
                <span className="font-medium">Total:</span> $
                {order.total.toFixed(2)}
              </p>
              <p>
                <span className="font-medium">Estado:</span>{" "}
                {getStatusLabel(order.status)}
              </p>
              <p className="text-sm text-[#8D6E63]/80">
                <Clock className="inline-block w-4 h-4 mr-1" />
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {userOrders.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Truck className="h-16 w-16 text-[#FF8C42]/40 mx-auto mb-4" />
          <p className="text-[#5D4037]/80 text-lg">Aún no tienes pedidos</p>
          <p className="text-[#8D6E63]/70">
            ¡Realiza tu primer pedido para comenzar!
          </p>
        </div>
      )}
    </div>
  );
};
