import React, { useState } from 'react';
import { ShoppingBag, ShoppingCart, MapPin, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../Layout/Header';
import { PetManagement } from './PetManagement'; // ahora representa "Pedidos"
import { OrderTracking } from "./OrderTracking"; // puedes reutilizarlo para “Seguimiento”
import { UserProfile } from './UserProfile';
import { useCart } from "../../hooks/useCart";
import { ClientMenu } from "./ClientMenu";

export const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'tracking' | 'profile'>('orders');
  const { user } = useAuth();
  const { cart } = useCart();

  // Cantidad total de items en el carrito (por si manejas quantity)
  const cartCount = cart?.reduce(
    (total: number, item: any) => total + (item.quantity ?? 1),
    0
  ) ?? 0;

  const tabs = [
    { id: 'orders' as const, label: 'Mis Pedidos', icon: ShoppingBag },
    { id: 'tracking' as const, label: 'Seguimiento', icon: MapPin },
    { id: 'profile' as const, label: 'Perfil', icon: User },
  ];

  const renderContent = () => {
  switch (activeTab) {
    case 'orders':
      return (
        <>
          {/* Catálogo de productos de todos los restaurantes */}
          <ClientMenu />

          {/* Carrito + pedidos debajo */}
          <div className="mt-6">
            <PetManagement />
          </div>
        </>
      );

    case 'tracking':
      return <OrderTracking />;

    case 'profile':
      return <UserProfile />;

    default:
      return <PetManagement />;
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF3E0] via-[#FFE0B2] to-[#FFCC80]">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-[#FFB347]/40">
            {/* Encabezado principal */}
            <div className="bg-[#FF8C42]/90 px-6 py-4 border-b border-[#FFB347]/40 text-white flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  ¡Bienvenido, {user?.name}! 👋
                </h1>
                <p className="text-white/90">
                  Gestiona tus pedidos, seguimiento y perfil personal
                </p>
              </div>

              {/* Resumen rápido del carrito */}
              <div className="hidden sm:flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-xl border border-white/30">
                <ShoppingCart className="h-5 w-5 text-white" />
                <span className="text-sm font-semibold">
                  Carrito: {cartCount} {cartCount === 1 ? 'artículo' : 'artículos'}
                </span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Sidebar */}
              <div className="lg:w-64 bg-[#FFF8E1] border-r border-[#FFB347]/30">
                <nav className="p-4 space-y-3">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const isOrdersTab = tab.id === 'orders';

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                          isActive
                            ? 'bg-[#FF8C42] text-white shadow-md'
                            : 'text-[#5D4037] hover:bg-[#FFE0B2]/70 hover:text-[#D35400]'
                        }`}
                      >
                        <span className="flex items-center space-x-3">
                          <Icon size={20} />
                          <span>{tab.label}</span>
                        </span>

                        {/* Badge de carrito solo en la pestaña de pedidos */}
                        {isOrdersTab && cartCount > 0 && (
                          <span className="text-xs bg-white text-[#D35400] px-2 py-0.5 rounded-full font-semibold">
                            {cartCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Contenido principal */}
              <div className="flex-1 p-6 text-[#5D4037]">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
