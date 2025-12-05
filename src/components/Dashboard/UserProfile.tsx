import React, { useState } from 'react';
import { User, Mail, Save, Edit3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSave = () => {
    if (!user) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: any) =>
      u.email === user.email ? { ...u, name: formData.name, email: formData.email } : u
    );

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify({ ...user, ...formData }));
    alert('✅ Perfil actualizado correctamente');
    setIsEditing(false);
    window.location.reload(); // actualiza los datos en pantalla
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#5D4037]">Mi Perfil</h2>

      <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-[#FFB347]/30 shadow-lg">
        {/* Encabezado con avatar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#FF8C42] rounded-full shadow-md">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#5D4037]">{user?.name}</h3>
              <p className="text-[#8D6E63] capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              isEditing
                ? 'bg-gray-400 hover:bg-gray-500 text-white'
                : 'bg-[#FF8C42] hover:bg-[#FF7A00] text-white shadow-md'
            }`}
          >
            <Edit3 size={18} />
            <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
          </button>
        </div>

        {/* Formulario de perfil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[#8D6E63] text-sm font-medium mb-2">
              Nombre completo
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#FFB347]/40 text-[#5D4037] focus:ring-2 focus:ring-[#FF8C42]"
              />
            ) : (
              <p className="bg-[#FFF3E0] px-3 py-2 rounded-lg text-[#5D4037] border border-[#FFB347]/30">
                {user?.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[#8D6E63] text-sm font-medium mb-2">
              Correo electrónico
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#FFB347]/40 text-[#5D4037] focus:ring-2 focus:ring-[#FF8C42]"
              />
            ) : (
              <p className="bg-[#FFF3E0] px-3 py-2 rounded-lg text-[#5D4037] border border-[#FFB347]/30">
                {user?.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[#8D6E63] text-sm font-medium mb-2">Usuario</label>
            <p className="bg-[#FFF3E0] px-3 py-2 rounded-lg text-[#5D4037] border border-[#FFB347]/30">
              {user?.username}
            </p>
          </div>

          <div>
            <label className="block text-[#8D6E63] text-sm font-medium mb-2">
              Fecha de registro
            </label>
            <p className="bg-[#FFF3E0] px-3 py-2 rounded-lg text-[#5D4037] border border-[#FFB347]/30">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'No disponible'}
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        {isEditing && (
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-md transition"
            >
              <Save size={18} />
              <span>Guardar cambios</span>
            </button>
          </div>
        )}

        {!isEditing && (
          <div className="flex justify-end mt-6">
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
