import React, { useState } from 'react';
import { Truck, Clock, MapPin, CheckCircle, XCircle, Package } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface Order {
  id: string;
  userId: string;
  restaurant: string;
  items: string;
  total: number;
  status: 'pendiente' | 'preparando' | 'en_camino' | 'entregado' | 'cancelado';
  driver?: string;
  eta?: string;
  createdAt: string;
}

export const AppointmentBooking: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    restaurant: '',
    items: '',
    total: '',
  });

  const userOrders = orders.filter((o) => o.userId === user?.email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newOrder: Order = {
      id: Date.now().toString(),
      userId: user?.email || '',
      restaurant: formData.restaurant.trim(),
      items: formData.items.trim(),
      total: parseFloat(formData.total),
      status: 'pendiente',
      driver: 'Sin asignar',
      createdAt: new Date().toISOString(),
    };

    setOrders([...orders, newOrder]);
    setFormData({ restaurant: '', items: '', total: '' });
    setShowForm(false);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pendiente':
        return 'text-yellow-600';
      case 'preparando':
        return 'text-orange-500';
      case 'en_camino':
        return 'text-blue-500';
      case 'entregado':
        return 'text-green-600';
      case 'cancelado':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'entregado':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'cancelado':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'en_camino':
        return <Truck className="h-6 w-6 text-blue-500 animate-bounce" />;
      case 'preparando':
        return <Package className="h-6 w-6 text-orange-500 animate-pulse" />;
      default:
        return <Clock className="h-6 w-6 text-yellow-500 animate-pulse" />;
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#5D4037]">Seguimiento de Pedidos</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#FF8C42] hover:bg-[#FF7A00] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Package size={20} />
          <span>Nuevo Pedido</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#FFB347]/30 shadow-lg">
          <h3 className="text-xl font-semibold text-[#D35400] mb-4">Registrar Pedido</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8D6E63] text-sm font-medium mb-2">Restaurante</label>
              <input
                type="text"
                value={formData.restaurant}
                onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#FFB347]/50 text-[#5D4037] focus:ring-2 focus:ring-[#FF8C42]"
                required
              />
            </div>
            <div>
              <label className="block text-[#8D6E63] text-sm font-medium mb-2">Productos</label>
              <input
                type="text"
                value={formData.items}
                onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#FFB347]/50 text-[#5D4037] focus:ring-2 focus:ring-[#FF8C42]"
                placeholder="Ejemplo: Pizza, Refresco"
                required
              />
            </div>
            <div>
              <label className="block text-[#8D6E63] text-sm font-medium mb-2">Total ($)</label>
              <input
                type="number"
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#FFB347]/50 text-[#5D4037] focus:ring-2 focus:ring-[#FF8C42]"
                required
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF8C42] hover:bg-[#FF7A00] text-white rounded-lg"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {userOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#FFB347]/30 shadow-md"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-3">
                {getStatusIcon(order.status)}
                <h3 className="text-lg font-semibold text-[#5D4037]">{order.restaurant}</h3>
              </div>
              <span className={`font-medium ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 text-[#6D4C41]">
              <p>
                <span className="font-medium">Productos:</span> {order.items}
              </p>
              <p>
                <span className="font-medium">Total:</span> ${order.total.toFixed(2)}
              </p>
              <p>
                <span className="font-medium">Repartidor:</span> {order.driver}
              </p>
              <p className="text-sm text-[#8D6E63]/80 flex items-center gap-1">
                <Clock size={16} /> {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Simulador de cambio de estado */}
            <div className="flex space-x-2 mt-4">
              {order.status !== 'entregado' && order.status !== 'cancelado' && (
                <>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'preparando')}
                    className="text-sm bg-yellow-400/80 hover:bg-yellow-500 text-white px-3 py-1 rounded-md"
                  >
                    Preparando
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'en_camino')}
                    className="text-sm bg-blue-500/80 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                  >
                    En Camino
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'entregado')}
                    className="text-sm bg-green-500/80 hover:bg-green-600 text-white px-3 py-1 rounded-md"
                  >
                    Entregado
                  </button>
                </>
              )}
              <button
                onClick={() => updateOrderStatus(order.id, 'cancelado')}
                className="text-sm bg-red-400/80 hover:bg-red-500 text-white px-3 py-1 rounded-md ml-auto"
              >
                Cancelar
              </button>
            </div>
          </div>
        ))}
      </div>

      {userOrders.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Truck className="h-16 w-16 text-[#FF8C42]/40 mx-auto mb-4" />
          <p className="text-[#5D4037]/80 text-lg">Aún no hay pedidos en seguimiento</p>
          <p className="text-[#8D6E63]/70">Realiza un nuevo pedido para comenzar</p>
        </div>
      )}
    </div>
  );
};
