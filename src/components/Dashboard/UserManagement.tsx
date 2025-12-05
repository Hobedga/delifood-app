import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Edit,
  Trash2,
  Shield,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Clock3,
} from "lucide-react";

// 👤 Modelo del usuario tal como viene de la BD
interface UserType {
  id: number;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username: string;
  email: string;
  role: "cliente" | "restaurante" | "repartidor" | "admin" | "supervisor" | string;
  phone?: string | null;
  avatar?: string | null;
  is_verified?: 0 | 1 | boolean | null;
  is_active?: 0 | 1 | boolean | null;
  registration_date?: string | null;
  last_login?: string | null;
  created_at?: string | null;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // 🔄 Cargar usuarios desde el backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users");

        if (response.data.success && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
        } else {
          console.error("Error al obtener usuarios:", response.data.message);
        }
      } catch (error) {
        console.error("❌ Error al conectar con el backend:", error);
      }
    };

    fetchUsers();
  }, []);

  // 🗑️ Eliminar usuario
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error(error);
      alert("❌ Error al eliminar usuario");
    }
  };

  // 👑 Cambiar rol admin ↔ cliente (no toca otros roles)
  const handleToggleRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "cliente" : "admin";

    try {
      await axios.put(`http://localhost:5000/api/users/${userId}`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      console.error(error);
      alert("❌ Error al cambiar rol");
    }
  };

  // 🧮 Helpers de formato
  const getDisplayName = (u: UserType) => {
    if (u.first_name || u.last_name) {
      return `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
    }
    return u.name || u.username;
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("es-ES");
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("es-ES");
  };

  const isTrue = (v: any) => v === 1 || v === true || v === "1";

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/60">
          <Users className="h-6 w-6 text-cyan-200" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
          <p className="text-sm text-white/70">
            Control de cuentas, roles, estado y verificación.
          </p>
        </div>
      </div>

            {/* Tabla */}
<div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-xl">
  <div className="overflow-x-auto w-full">
    <table
  className="text-sm"
  style={{ width: "500px" }}   // 👈 ancho forzado para provocar el scroll
>

            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Verificación
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Último acceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {users.map((user) => {
                const displayName = getDisplayName(user);
                const initials =
                  displayName
                    ?.split(" ")
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase() || "?"

                return (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    {/* Usuario */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative h-9 w-9 rounded-full overflow-hidden bg-cyan-500/40 flex items-center justify-center text-xs font-bold text-white mr-3 shadow-inner border border-white/40">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={displayName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {displayName}
                          </div>
                          <div className="text-xs text-white/70">@{user.username}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                      <div className="flex flex-col">
                        <span>{user.email}</span>
                        {user.phone && (
                          <span className="flex items-center text-xs text-cyan-200/80 mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${
                          user.role === "admin"
                            ? "bg-rose-500/20 text-rose-200 border border-rose-400/60"
                            : user.role === "cliente"
                            ? "bg-sky-500/20 text-sky-200 border border-sky-400/60"
                            : user.role === "restaurante"
                            ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/60"
                            : user.role === "repartidor"
                            ? "bg-amber-500/20 text-amber-200 border border-amber-400/60"
                            : user.role === "supervisor"
                            ? "bg-violet-500/20 text-violet-200 border border-violet-400/60"
                            : "bg-slate-500/20 text-slate-200 border border-slate-400/60"
                        }`}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role === "admin"
                          ? "Admin"
                          : user.role === "cliente"
                          ? "Cliente"
                          : user.role === "restaurante"
                          ? "Restaurante"
                          : user.role === "repartidor"
                          ? "Repartidor"
                          : user.role === "supervisor"
                          ? "Supervisor"
                          : user.role}
                      </span>
                    </td>

                    {/* Estado activo */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isTrue(user.is_active) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/60">
                          <Users className="h-3 w-3 mr-1" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-200 border border-slate-400/60">
                          <Users className="h-3 w-3 mr-1" />
                          Inactivo
                        </span>
                      )}
                    </td>

                    {/* Verificación */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isTrue(user.is_verified) ? (
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-200">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Verificado
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-semibold text-amber-200">
                          <XCircle className="h-4 w-4 mr-1" />
                          Pendiente
                        </span>
                      )}
                    </td>

                    {/* Registro */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-1 text-cyan-200" />
                        {formatDate(user.registration_date || user.created_at)}
                      </div>
                    </td>

                    {/* Último acceso */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                      <div className="flex items-center">
                        <Clock3 className="h-4 w-4 mr-1 text-cyan-200" />
                        {formatDateTime(user.last_login)}
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleRole(user.id, user.role)}
                          className="text-cyan-200 hover:text-cyan-50 p-1 rounded transition-colors"
                          title={`Cambiar a ${
                            user.role === "admin" ? "cliente" : "admin"
                          }`}
                        >
                          <Shield size={16} />
                        </button>

                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-amber-200 hover:text-amber-50 p-1 rounded transition-colors"
                          title="Ver detalle"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-rose-200 hover:text-rose-50 p-1 rounded transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estado vacío */}
      {users.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 text-lg">No hay usuarios registrados</p>
        </div>
      )}

      {/* Modal de detalle (solo lectura por ahora) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-400/40 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-cyan-300" />
              Detalle de usuario
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/90">
              <div>
                <p className="font-semibold text-white/70">Nombre</p>
                <p>{getDisplayName(selectedUser)}</p>
              </div>
              <div>
                <p className="font-semibold text-white/70">Usuario</p>
                <p>@{selectedUser.username}</p>
              </div>
              <div>
                <p className="font-semibold text-white/70">Email</p>
                <p>{selectedUser.email}</p>
              </div>
              <div>
                <p className="font-semibold text-white/70">Teléfono</p>
                <p>{selectedUser.phone || "—"}</p>
              </div>
              <div>
                <p className="font-semibold text-white/70">Rol</p>
                <p>{selectedUser.role}</p>
              </div>
              <div>
                <p className="font-semibold text-white/70">Estado</p>
                <p>{isTrue(selectedUser.is_active) ? "Activo" : "Inactivo"}</p>
              </div>
              <div>
                <p className="font-semibold text-white/70">Registro</p>
                <p>
                  {formatDate(
                    selectedUser.registration_date || selectedUser.created_at
                  )}
                </p>
              </div>
              <div>
                <p className="font-semibold text-white/70">Último acceso</p>
                <p>{formatDateTime(selectedUser.last_login)}</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};