import React, { useState } from 'react';
import { Users, Calendar, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Header } from '../Layout/Header';
import { UserManagement } from './UserManagement';
import { AppointmentManagement } from './AppointmentManagement';
import { AdminSettings } from './AdminSettings';
import { AdminStats } from './AdminStats';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const { user } = useAuth();

  const tabs = [
    { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'appointments', label: 'Pedidos', icon: Calendar },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <AdminStats />;
      case 'users':
        return <UserManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D3B66] via-[#145374] to-[#5584AC]">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
            {/* Encabezado interno */}
            <div className="bg-gradient-to-r from-[#145374] via-[#1E5F74] to-[#5584AC] px-6 py-4 border-b border-white/30">
              <h1 className="text-2xl font-bold text-[#FDFBF6] drop-shadow-md">
                Panel de Administración
              </h1>
              <p className="text-[#E9C46A] text-sm font-medium">
                Control general del sistema DeliFood
              </p>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Sidebar */}
              <div className="lg:w-64 bg-[#0D3B66]/70 border-r border-[#E9C46A]/30">
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
                            ? 'bg-[#E9C46A] text-[#0D3B66] shadow-md'
                            : 'text-[#F1FAEE] hover:bg-[#E9C46A]/20 hover:text-white'
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
              <div className="flex-1 p-6 text-[#FDFBF6]">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
