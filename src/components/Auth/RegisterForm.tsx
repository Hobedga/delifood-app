import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, UserPlus, Check, X } from "lucide-react";

interface RegisterFormProps {
  onToggleMode: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "cliente",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/api/register", {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: formData.role,
      });

      if (data.success) {
        alert("✅ Registro exitoso. Ahora puedes iniciar sesión.");
        onToggleMode();
      } else {
        setError(data.message || "Error al registrarse");
      }
    } catch (err: any) {
      console.error("❌ Error al registrar:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
    >
      <h2 className="text-xl font-semibold text-[#2F3E46] mb-4">
        Crear cuenta nueva
      </h2>

      <input
        name="name"
        placeholder="Nombre completo"
        value={formData.name}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded-lg bg-white border border-[#CAD2C5] text-[#2F3E46] focus:ring-2 focus:ring-[#84A98C]"
        required
      />

      <input
        name="email"
        type="email"
        placeholder="Correo electrónico"
        value={formData.email}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded-lg bg-white border border-[#CAD2C5] text-[#2F3E46] focus:ring-2 focus:ring-[#84A98C]"
        required
      />

      <input
        name="username"
        placeholder="Nombre de usuario"
        value={formData.username}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded-lg bg-white border border-[#CAD2C5] text-[#2F3E46] focus:ring-2 focus:ring-[#84A98C]"
        required
      />

      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded-lg bg-white border border-[#CAD2C5] text-[#2F3E46] focus:ring-2 focus:ring-[#84A98C]"
      >
        <option value="cliente">Cliente</option>
        <option value="restaurante">Restaurante</option>
        <option value="repartidor">Repartidor</option>
        <option value="admin">Administrador</option>
        <option value="supervisor">Supervisor</option>
      </select>

      <div className="relative">
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-white border border-[#CAD2C5] text-[#2F3E46] focus:ring-2 focus:ring-[#84A98C]"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2 text-[#52796F]"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <input
        name="confirmPassword"
        type={showPassword ? "text" : "password"}
        placeholder="Confirmar contraseña"
        value={formData.confirmPassword}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded-lg bg-white border border-[#CAD2C5] text-[#2F3E46] focus:ring-2 focus:ring-[#84A98C]"
        required
      />

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#84A98C] hover:bg-[#52796F] text-white py-2 rounded-lg font-semibold transition-colors"
      >
        {loading ? "Registrando..." : "Registrarse"}
      </button>
    </form>
  );
};
