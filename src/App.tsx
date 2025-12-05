// src/App.tsx
import React from "react";
import { Loader2 } from "lucide-react";
import {
  AuthProvider,
  useAuth,
  AuthUser,
  PasswordRecovery,
} from "./hooks/useAuth";
import { Routes, Route } from "react-router-dom";

// 🧭 Dashboards
import { LoginRegisterPage } from "./components/Auth/LoginRegisterPage";
import { UserDashboard } from "./components/Dashboard/UserDashboard";
import { AdminDashboard } from "./components/Dashboard/AdminDashboard";
import { RestaurantDashboard } from "./components/Dashboard/RestaurantDashboard";
import { DeliveryDashboard } from "./components/Dashboard/DeliveryDashboard";
import { SupervisorDashboard } from "./components/Dashboard/SupervisorDashboard";

// 🛒 Carrito global
import { CartProvider } from "./hooks/useCart";

// -----------------------------------------------------------------------------
// 🌟 Componente que decide qué mostrar según el estado del usuario
// -----------------------------------------------------------------------------
const AppInnerRouter: React.FC = () => {
  const { user, isAuthReady } = useAuth();

  // 🌀 Loader elegante mientras se prepara la autenticación
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF3E0] via-[#FFE0B2] to-[#FFCC80]">
        <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-[#FFB347]/40 animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#E67E22]" />
          <span className="text-[#5D4037] font-semibold">
            Cargando sistema de DeliFood...
          </span>
        </div>
      </div>
    );
  }

  // 👉 Función para saber qué dashboard va según el rol
  const renderDashboardByRole = (currentUser: AuthUser) => {
    switch (currentUser.role) {
      case "admin":
        return <AdminDashboard />;
      case "restaurante":
        return <RestaurantDashboard />;
      case "repartidor":
        return <DeliveryDashboard />;
      case "supervisor":
        return <SupervisorDashboard />;
      case "cliente":
      default:
        return <UserDashboard />;
    }
  };

  // 🌈 Envolvemos todo en el mismo fondo que tenías
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF3E0] via-[#FFE0B2] to-[#FFCC80] transition-all duration-500">
      <Routes>
        {/* Ruta de recuperación SIEMPRE accesible */}
        <Route path="/recover" element={<PasswordRecovery />} />

        {/* Si NO hay usuario, cualquier ruta (/, /auth, etc) muestra login/registro */}
        {!user && (
          <Route path="/*" element={<LoginRegisterPage />} />
        )}

        {/* Si hay usuario, rutas para cada dashboard */}
        {user && (
          <>
            <Route path="/user" element={<UserDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/restaurant" element={<RestaurantDashboard />} />
            <Route path="/delivery" element={<DeliveryDashboard />} />
            <Route path="/supervisor" element={<SupervisorDashboard />} />

            {/* Cualquier otra ruta manda al dashboard que le toca por rol */}
            <Route path="/*" element={renderDashboardByRole(user)} />
          </>
        )}
      </Routes>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 🌐 Componente raíz con contexto global de autenticación + carrito
//   ❗ OJO: aquí YA NO usamos <BrowserRouter>. Eso se queda solo en main.tsx
// -----------------------------------------------------------------------------
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppInnerRouter />
      </CartProvider>
    </AuthProvider>
  );
}
