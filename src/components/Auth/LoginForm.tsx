// src/components/Auth/LoginForm.tsx
import React, { useState } from "react";
import axios from "axios";
import { LogIn, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onToggleMode: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/login",
        formData
      );

      if (data.success && data.user) {
        const user = data.user;
        localStorage.setItem("currentUser", JSON.stringify(user));

        // sigue usando tu login actual (aunque repita la llamada, lo dejamos igual)
        login(user.username, user.password);

        switch (user.role) {
          case "admin":
            window.location.href = "/admin";
            break;
          case "cliente":
            window.location.href = "/user";
            break;
          case "restaurante":
            window.location.href = "/restaurant";
            break;
          case "repartidor":
            window.location.href = "/delivery";
            break;
          case "supervisor":
            window.location.href = "/supervisor";
            break;
          default:
            window.location.href = "/auth";
        }
      } else {
        alert("⚠️ Usuario o contraseña incorrectos");
      }
    } catch (error: any) {
      console.error("❌ Error al iniciar sesión:", error);
      alert(
        "Error al conectar con el servidor. Verifica que el backend esté corriendo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 text-left"
    >
      <div>
        <label className="block text-[#2F3E46] font-semibold mb-2">
          Usuario
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Ingresa tu usuario"
          className="w-full px-4 py-2 rounded-lg bg-white border border-[#CAD2C5] text-[#2F3E46] placeholder-[#52796F] focus:outline-none focus:ring-2 focus:ring-[#84A98C]"
          required
        />
      </div>

      <div>
        <label className="block text-[#2F3E46] font-semibold mb-2">
          Contraseña
        </label>
        <div className="relative">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-4 py-2 rounded-lg bg-white border border-[#CAD2C5] text-[#2F3E46] placeholder-[#52796F] focus:outline-none focus:ring-2 focus:ring-[#84A98C]"
            required
          />
          <EyeOff
            className="absolute right-3 top-2.5 text-[#52796F]"
            size={18}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#84A98C] hover:bg-[#52796F] text-white py-2.5 rounded-lg font-semibold transition-colors"
      >
        <LogIn className="inline-block mr-2" size={18} />
        {loading ? "Conectando..." : "Iniciar Sesión"}
      </button>

      {/* 🔗 Nuevo: enlace a recuperación de contraseña */}
      <button
        type="button"
        onClick={() => navigate("/recover")}
        className="w-full text-xs text-center text-[#52796F] hover:text-[#354F52] underline mt-1"
      >
        ¿Olvidaste tu contraseña?
      </button>

      <div className="text-center mt-4">
        <p className="text-[#354F52] text-sm">
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-[#52796F] hover:underline"
          >
            Regístrate
          </button>
        </p>
      </div>
    </form>
  );
};
