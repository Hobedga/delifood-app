import React from 'react';
import { LogOut, User, Utensils, ShoppingBag, Truck, ShieldCheck, Crown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // 🎨 Estilos e íconos según el rol
  const roleStyles: Record<
    string,
    { bg: string; text: string; accent: string; icon: JSX.Element }
  > = {
    // 🩵 Admin: Azul petróleo + Dorado elegante
    admin: {
      bg: 'from-[#0D3B66] via-[#145374] to-[#5584AC]',
      text: '#FDFBF6',
      accent: '#E9C46A',
      icon: <Crown className="h-6 w-6 text-[#E9C46A]" />,
    },
    // 🧡 Cliente
    cliente: {
      bg: 'from-[#FFB347] via-[#FFD580] to-[#FFF3E0]',
      text: '#4E342E',
      accent: '#FF8C42',
      icon: <ShoppingBag className="h-6 w-6 text-[#4E342E]" />,
    },
    // 🍴 Restaurante
    restaurante: {
      bg: 'from-[#FF7043] via-[#FF8A65] to-[#FFCCBC]',
      text: '#4E342E',
      accent: '#E64A19',
      icon: <Utensils className="h-6 w-6 text-[#4E342E]" />,
    },
    // 🚚 Repartidor
    repartidor: {
      bg: 'from-[#43A047] via-[#81C784] to-[#C8E6C9]',
      text: '#1B5E20',
      accent: '#2E7D32',
      icon: <Truck className="h-6 w-6 text-[#1B5E20]" />,
    },
    // 🧭 Supervisor
    supervisor: {
      bg: 'from-[#2196F3] via-[#64B5F6] to-[#BBDEFB]',
      text: '#0D47A1',
      accent: '#1976D2',
      icon: <ShieldCheck className="h-6 w-6 text-[#0D47A1]" />,
    },
  };

  const style = user ? roleStyles[user.role] || roleStyles['cliente'] : roleStyles['cliente'];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'cliente':
        return 'Cliente';
      case 'restaurante':
        return 'Restaurante';
      case 'repartidor':
        return 'Repartidor';
      case 'supervisor':
        return 'Supervisor';
      default:
        return 'Usuario';
    }
  };

  return (
    <header
      className={`bg-gradient-to-r ${style.bg} shadow-lg border-b border-white/30 backdrop-blur-md transition-all duration-500`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO + NOMBRE */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/30 rounded-xl shadow-md border border-white/30">
            <img
              src="/src/logo.png"
              alt="DeliFood Logo"
              className="h-14 w-14 object-cover rounded-md"
            />
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-wide drop-shadow-sm"
              style={{ color: style.text }}
            >
              DeliFood
            </h1>
            <p className="text-sm opacity-90" style={{ color: style.text }}>
              Sistema de pedidos y entregas
            </p>
          </div>
        </div>

        {/* USUARIO + ROL + LOGOUT */}
        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white/30 px-4 py-2 rounded-xl shadow-md border border-white/30">
              {style.icon}
              <div className="flex flex-col">
                <span className="text-sm font-semibold" style={{ color: style.text }}>
                  {user.name}
                </span>
                <span
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: style.accent }}
                >
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl transition-all duration-300 hover:bg-white/30 border border-transparent hover:border-white/40"
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" style={{ color: style.text }} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
