import React, { useState } from 'react';
import { Store, Clock, MapPin, Save, Edit3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const RestaurantProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    address: user?.address || '',
    schedule: user?.schedule || '9:00 AM - 10:00 PM',
  });

  const handleSave = () => {
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    alert('✅ Perfil del restaurante actualizado');
    setIsEditing(false);
  };

  return (
    <div className="bg-white/90 p-6 rounded-xl shadow-lg border border-[#FFB347]/30">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#FF8C42] rounded-full">
            <Store className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#5D4037]">{user?.name}</h2>
            <p className="text-[#8D6E63]">Restaurante Asociado</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-lg text-white transition-all ${
            isEditing ? 'bg-gray-400 hover:bg-gray-500' : 'bg-[#FF8C42] hover:bg-[#FF7A00]'
          }`}
        >
          {isEditing ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[#8D6E63] mb-2">Dirección</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#FFB347]/40"
            />
          ) : (
            <p className="bg-[#FFF3E0] px-3 py-2 rounded-lg">{formData.address || 'No registrada'}</p>
          )}
        </div>

        <div>
          <label className="block text-[#8D6E63] mb-2">Horario de atención</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#FFB347]/40"
            />
          ) : (
            <p className="bg-[#FFF3E0] px-3 py-2 rounded-lg">{formData.schedule}</p>
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
