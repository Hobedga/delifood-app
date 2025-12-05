import React, { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { UtensilsCrossed } from "lucide-react";

export const LoginRegisterPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF3E0] via-[#FFE0B2] to-[#FFCC80] relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[url('/src/assets/bg-pattern.svg')] opacity-10 bg-repeat"></div>

      {/* Tarjeta principal */}
      <div className="relative z-10 max-w-md w-full bg-white/80 backdrop-blur-lg border border-[#FFB347]/40 rounded-3xl shadow-2xl p-8 animate-fade-in">
        {/* Encabezado */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-[#FF8C42]/90 p-3 rounded-full shadow-lg">
            <UtensilsCrossed className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#5D4037] mt-4 tracking-tight drop-shadow-sm">
            DeliFood
          </h1>
          <p className="text-[#6D4C41]/80 text-sm mt-1">
            {isLogin ? "Bienvenido de nuevo 🍽️" : "Crea tu cuenta y empieza a disfrutar"}
          </p>
        </div>

        {/* Formulario */}
        <div className="transition-all duration-500 ease-in-out">
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>
      </div>

      {/* Pie */}
      <footer className="absolute bottom-3 text-[#795548]/70 text-sm">
        © {new Date().getFullYear()} DeliFood — Sistema de pedidos y entregas
      </footer>
    </div>
  );
};
