import React, { useState } from 'react';
import { Bike, Save, Edit3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const DeliveryProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    vehicle: user?.vehicle || 'Motocicleta',
    status: user?.status || 'Disponible',
  });

  const handleSave = () => {
    const updated = { ...user, ...formData };
    localStorage.setItem('currentUser', JSON.stringify(updated));
    alert('🚗 Perfil del repartidor actualizado');
    setIsEditing(false);
  };

  return (
    <div className="bg-white/90 p-6 rounded-xl shadow-lg border border-[#FFB347]/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#FF8C42] rounded-full">
            <Bike className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#5D4037]">{user?.name}</h2>
            <p className="text-[#8D6E63]">Repartidor</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg text-white ${
            isEditing ? 'bg-gray-400 hover:bg-gray-500' : 'bg-[#FF8C42] hover:bg-[#FF7A00]'
          }`}
        >
          {isEditing ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[#8D6E63] mb-2">Tipo de vehículo</label>
          {isEditing ? (
            <select
              value={formData.vehicle}
              onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#FFB347]/40"
            >
              <option value="Motocicleta">Motocicleta</option>
              <option value="Automóvil">Automóvil</option>
              <option value="Bicicleta">Bicicleta</option>
            </select>
          ) : (
            <p className="bg-[#FFF3E0] px-3 py-2 rounded-lg">{formData.vehicle}</p>
          )}
        </div>

        <div>
          <label className="block text-[#8D6E63] mb-2">Estado actual</label>
          {isEditing ? (
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#FFB347]/40"
            >
              <option value="Disponible">Disponible</option>
              <option value="En entrega">En entrega</option>
              <option value="Fuera de servicio">Fuera de servicio</option>
            </select>
          ) : (
            <p
              className={`px-3 py-2 rounded-lg ${
                formData.status === 'Disponible'
                  ? 'bg-green-200 text-green-700'
                  : formData.status === 'En entrega'
                  ? 'bg-yellow-200 text-yellow-700'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {formData.status}
            </p>
          )}
        </div>

        {isEditing && (
          <button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mt-4"
          >
            <Save size={18} />
            <span>Guardar cambios</span>
          </button>
        )}
      </div>
    </div>
  );
};
