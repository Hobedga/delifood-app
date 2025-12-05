import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LogIn,
  Phone,
  ShieldCheck,
  Smartphone,
  KeyRound,
  ArrowLeft,
  Building2,
} from "lucide-react";

// 🧩 Tipado del usuario
export interface AuthUser {
  id?: number;
  name: string;
  email: string;
  username: string;
  password?: string;
  role: "cliente" | "restaurante" | "repartidor" | "admin" | "supervisor";

  // 🔽 Nuevos campos (todos opcionales por ahora)
  phone?: string | null;
  avatar?: string | null;
  date_of_birth?: string | null;
  is_verified?: boolean;
  is_active?: boolean;
  registration_date?: string;
  last_login?: string | null;
  reset_token?: string | null;
  fcm_token?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthReady: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (newUser: AuthUser) => Promise<boolean>;
  logout: () => void;
}

// 🌐 Configuración del contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ⚙️ Configuración global de API
const API_BASE = "http://localhost:5000/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // ✅ Recuperar sesión guardada
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) setUser(JSON.parse(savedUser));
    setIsAuthReady(true);
  }, []);

  // ✅ Registro de usuario
  const register = async (newUser: AuthUser) => {
    try {
      const { data } = await axios.post(`${API_BASE}/register`, newUser);
      alert(`✅ ${data.message || "Usuario registrado correctamente"}`);
      return true;
    } catch (err: any) {
      console.error("❌ Error en registro:", err);
      alert(err.response?.data?.message || "Error al registrar usuario");
      return false;
    }
  };

  // ✅ Inicio de sesión
  const login = async (username: string, password: string) => {
    try {
      const { data } = await axios.post(`${API_BASE}/login`, {
        username,
        password,
      });

      if (data.success) {
        setUser(data.user);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        alert("✅ Bienvenido de nuevo a DeliFood 🍽️");
        return true;
      } else {
        alert("⚠️ Credenciales incorrectas");
        return false;
      }
    } catch (err: any) {
      console.error("❌ Error al iniciar sesión:", err);
      alert("Error al conectar con el servidor");
      return false;
    }
  };

  // ✅ Cerrar sesión
  const logout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    alert("👋 Sesión cerrada correctamente");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthReady, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 🎣 Hook para usar autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

// 🪄 BONUS: Componente visual opcional de Login (embellecido)
export const AuthLoginBox: React.FC<{ onLogin: (u: string, p: string) => void }> =
  ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate(); // 👈 ya lo tenías

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF3E0] via-[#FFE0B2] to-[#FFCC80] font-[Poppins]">
        <div className="bg-white/80 backdrop-blur-xl border border-[#FFB347]/40 p-8 rounded-3xl shadow-2xl max-w-sm w-full">
          <h1 className="text-3xl font-bold text-[#5D4037] text-center mb-6">
            Inicia Sesión
          </h1>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#6D4C41] font-medium">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu usuario"
                className="w-full mt-1 px-4 py-2 rounded-lg bg-white border border-[#FFB347]/50 focus:ring-2 focus:ring-[#FF8C42] text-[#5D4037] placeholder-[#A1887F] outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-sm text-[#6D4C41] font-medium">
                Contraseña
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-lg bg-white border border-[#FFB347]/50 focus:ring-2 focus:ring-[#FF8C42] text-[#5D4037] placeholder-[#A1887F] outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-[#A1887F] hover:text-[#E67E22] transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              onClick={() => onLogin(username, password)}
              className="w-full mt-4 bg-gradient-to-r from-[#FF8C42] to-[#E67E22] text-white py-2.5 rounded-lg font-semibold flex justify-center items-center gap-2 hover:shadow-md transition-all"
            >
              <LogIn size={18} />
              <span>Iniciar sesión</span>
            </button>

            {/* 🔗 NUEVO: enlace a recuperación de contraseña */}
            <button
              type="button"
              onClick={() => navigate("/recover")}
              className="w-full mt-2 text-xs text-center text-[#6D4C41] hover:text-[#E67E22] underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>
      </div>
    );
  };

/* -------------------------------------------------------------------------- */
/* 🌟 NUEVO: Flujo de recuperación de contraseña con SMS (SIMULADO)          */
/* -------------------------------------------------------------------------- */

type RecoveryStep = 1 | 2 | 3;

export const PasswordRecovery: React.FC = () => {
  const [step, setStep] = useState<RecoveryStep>(1);
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    role: "cliente" as AuthUser["role"],
    identifier: "", // correo o usuario
    phone: "",
    businessName: "",
    smsCode: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Simula una llamada asíncrona al backend
  const fakeApiDelay = (ms = 900) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  /* Paso 1: Solicitar código SMS */
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.identifier.trim()) {
      setError("Ingresa tu correo o nombre de usuario.");
      return;
    }

    // Validación especial para repartidores
    if (form.role === "repartidor" && !form.phone.trim()) {
      setError("Para repartidores, ingresa el número de teléfono registrado.");
      return;
    }

    // Validación para cuentas comerciales
    if (
      (form.role === "restaurante" ||
        form.role === "admin" ||
        form.role === "supervisor") &&
      !form.businessName.trim()
    ) {
      setError(
        "Para cuentas comerciales, ingresa el nombre del restaurante/empresa."
      );
      return;
    }

    setLoading(true);
    await fakeApiDelay(); // simulamos llamada al backend

    // Generar código de 6 dígitos
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(code);
    setStep(2);
    setLoading(false);

    setMessage(
      `🔐 Código SMS enviado (simulado). Solo para pruebas, tu código es: ${code}`
    );
  };

  /* Paso 2: Verificar código SMS */
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.smsCode.trim()) {
      setError("Ingresa el código SMS que recibiste.");
      return;
    }

    if (!generatedCode || form.smsCode.trim() !== generatedCode) {
      setError("El código SMS no coincide. Intenta de nuevo.");
      return;
    }

    setLoading(true);
    await fakeApiDelay();
    setLoading(false);
    setStep(3);
    setMessage(
      "✅ Identidad verificada (demo). Ahora puedes crear una nueva contraseña."
    );
  };

  /* Paso 3: Establecer nueva contraseña */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.newPassword || form.newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    await fakeApiDelay(); // aquí iría la llamada real al backend
    setLoading(false);

    setMessage(
      "🔒 Contraseña actualizada (simulado). También se envió una notificación de seguridad a tu correo y SMS (demo)."
    );

    // Opcional: resetear flujo
    setStep(1);
    setForm({
      role: "cliente",
      identifier: "",
      phone: "",
      businessName: "",
      smsCode: "",
      newPassword: "",
      confirmPassword: "",
    });
    setGeneratedCode(null);
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label className="text-sm text-[#6D4C41] font-medium">
              Tipo de cuenta
            </label>
            <select
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  role: e.target.value as AuthUser["role"],
                }))
              }
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[#FFB347]/50 bg-white text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
            >
              <option value="cliente">Cliente</option>
              <option value="repartidor">Repartidor</option>
              <option value="restaurante">Restaurante / Comercial</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-[#6D4C41] font-medium">
              Correo o usuario
            </label>
            <input
              type="text"
              value={form.identifier}
              onChange={(e) =>
                setForm((f) => ({ ...f, identifier: e.target.value }))
              }
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[#FFB347]/50 bg-white text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
              placeholder="ejemplo@correo.com o nombre de usuario"
            />
          </div>

          {form.role === "repartidor" && (
            <div>
              <label className="text-sm text-[#6D4C41] font-medium flex items-center gap-1">
                <Phone size={14} />
                Teléfono registrado del repartidor
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[#FFB347]/50 bg-white text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
                placeholder="+52 55 1234 5678"
              />
              <p className="text-xs text-[#8D6E63] mt-1">
                Usamos este número para validar que eres el repartidor correcto.
              </p>
            </div>
          )}

          {(form.role === "restaurante" ||
            form.role === "admin" ||
            form.role === "supervisor") && (
            <div>
              <label className="text-sm text-[#6D4C41] font-medium flex items-center gap-1">
                <Building2 size={14} />
                Nombre del restaurante / empresa
              </label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, businessName: e.target.value }))
                }
                className="mt-1 w-full px-3 py-2 rounded-lg border border-[#FFB347]/50 bg-white text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
                placeholder="Ej. Pastelería Leti"
              />
              <p className="text-xs text-[#8D6E63] mt-1">
                Validamos la identidad de las cuentas comerciales antes de
                permitir cambios críticos.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-[#FF8C42] to-[#E67E22] text-white py-2.5 rounded-lg font-semibold flex justify-center items-center gap-2 hover:shadow-md transition-all disabled:opacity-60"
          >
            <Smartphone size={18} />
            {loading ? "Enviando código..." : "Enviar código SMS de verificación"}
          </button>
        </form>
      );
    }

    if (step === 2) {
      return (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <p className="text-sm text-[#6D4C41]">
            Hemos enviado un código de 6 dígitos a tu teléfono registrado
            (simulado). Ingresa el código para continuar.
          </p>

          <div>
            <label className="text-sm text-[#6D4C41] font-medium">
              Código SMS
            </label>
            <input
              type="text"
              value={form.smsCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, smsCode: e.target.value }))
              }
              className="mt-1 w-full px-3 py-2 rounded-lg border border-[#FFB347]/50 bg-white text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
              placeholder="Ingresa el código recibido"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-[#FF8C42] to-[#E67E22] text-white py-2.5 rounded-lg font-semibold flex justify-center items-center gap-2 hover:shadow-md transition-all disabled:opacity-60"
          >
            <ShieldCheck size={18} />
            {loading ? "Verificando..." : "Verificar código"}
          </button>
        </form>
      );
    }

    // step === 3
    return (
      <form onSubmit={handleResetPassword} className="space-y-4">
        <p className="text-sm text-[#6D4C41]">
          Crea una nueva contraseña para tu cuenta.
        </p>

        <div>
          <label className="text-sm text-[#6D4C41] font-medium">
            Nueva contraseña
          </label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) =>
              setForm((f) => ({ ...f, newPassword: e.target.value }))
            }
            className="mt-1 w-full px-3 py-2 rounded-lg border border-[#FFB347]/50 bg-white text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label className="text-sm text-[#6D4C41] font-medium">
            Confirmar nueva contraseña
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm((f) => ({ ...f, confirmPassword: e.target.value }))
            }
            className="mt-1 w-full px-3 py-2 rounded-lg border border-[#FFB347]/50 bg-white text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-gradient-to-r from-[#FF8C42] to-[#E67E22] text-white py-2.5 rounded-lg font-semibold flex justify-center items-center gap-2 hover:shadow-md transition-all disabled:opacity-60"
        >
          <KeyRound size={18} />
          {loading ? "Guardando..." : "Guardar nueva contraseña"}
        </button>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF3E0] via-[#FFE0B2] to-[#FFCC80] font-[Poppins]">
      <div className="bg-white/80 backdrop-blur-xl border border-[#FFB347]/40 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-[#5D4037] flex items-center gap-2">
            <ShieldCheck size={22} className="text-[#FF8C42]" />
            Recuperar contraseña
          </h1>
        </div>

        <p className="text-xs text-[#8D6E63] mb-2">
          Este flujo es una <b>demo</b>: simula SMS, validación de repartidores,
          cuentas comerciales y notificaciones de seguridad.
        </p>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
            {message}
          </div>
        )}

        {renderStep()}

        <button
          type="button"
          onClick={() => {
            setStep(1);
            setError(null);
            setMessage(null);
          }}
          className="mt-3 text-xs text-[#6D4C41] flex items-center gap-1 hover:text-[#E67E22] transition-colors"
        >
          <ArrowLeft size={14} />
          Volver al primer paso
        </button>
      </div>
    </div>
  );
};
