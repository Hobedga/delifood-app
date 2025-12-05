import React, { useState } from 'react';
import { Menu, ClipboardList, Star, Settings, User } from 'lucide-react';
import { Header } from '../Layout/Header';
import { RestaurantProfile } from './RestaurantProfile';
import { RestaurantMenuManager } from './RestaurantMenuManager'; // ⬅️ nuevo import
import { RestaurantOrdersPanel } from "./RestaurantOrdersPanel";

export const RestaurantDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');

  const tabs = [
    { id: 'menu', label: 'Mi Menú', icon: Menu },
    { id: 'orders', label: 'Pedidos', icon: ClipboardList },
    { id: 'reviews', label: 'Reseñas', icon: Star },
    { id: 'profile', label: 'Perfil del Restaurante', icon: User },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'menu':
        return <RestaurantMenuManager />;   // ⬅️ aquí usamos el componente real
      case "orders":
  return <RestaurantOrdersPanel />;
      case 'reviews':
        return <p className="text-[#5D4037]">⭐ Reseñas de clientes.</p>;
      case 'profile':
        return <RestaurantProfile />;
      case 'settings':
        return <p className="text-[#5D4037]">⚙️ Configuración del restaurante.</p>;
      default:
        return <RestaurantProfile />;
    }
  };

  // resto igual…

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF3E0] via-[#FFE0B2] to-[#FFCC80]">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-[#FFB347]/40">
            {/* Encabezado principal */}
            <div className="bg-[#FF8C42]/90 px-6 py-4 border-b border-[#FFB347]/40 text-white">
              <h1 className="text-2xl font-bold">Panel del Restaurante 🍽️</h1>
              <p className="text-white/90">Gestiona tu menú, pedidos y perfil</p>
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
                            ? 'bg-[#FF8C42] text-white shadow-md'
                            : 'text-[#5D4037] hover:bg-[#FFE0B2]/70 hover:text-[#D35400]'
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
