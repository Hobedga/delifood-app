import React from 'react';
import { ClipboardList, BarChart3, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const SupervisorProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white/90 p-6 rounded-xl shadow-lg border border-[#FFB347]/30">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-[#FF8C42] rounded-full">
          <ClipboardList className="h-8 w-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#5D4037]">{user?.name}</h2>
          <p className="text-[#8D6E63]">Supervisor General</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFF3E0] p-4 rounded-lg border border-[#FFB347]/30 text-center">
          <Users className="h-8 w-8 mx-auto text-[#FF8C42]" />
          <h3 className="font-semibold mt-2 text-[#5D4037]">Repartidores activos</h3>
          <p className="text-2xl font-bold text-[#D35400] mt-1">12</p>
        </div>

        <div className="bg-[#FFF3E0] p-4 rounded-lg border border-[#FFB347]/30 text-center">
          <BarChart3 className="h-8 w-8 mx-auto text-[#FF8C42]" />
          <h3 className="font-semibold mt-2 text-[#5D4037]">Pedidos en curso</h3>
          <p className="text-2xl font-bold text-[#D35400] mt-1">34</p>
        </div>

        <div className="bg-[#FFF3E0] p-4 rounded-lg border border-[#FFB347]/30 text-center">
          <ClipboardList className="h-8 w-8 mx-auto text-[#FF8C42]" />
          <h3 className="font-semibold mt-2 text-[#5D4037]">Reportes del día</h3>
          <p className="text-2xl font-bold text-[#D35400] mt-1">8</p>
        </div>
      </div>
    </div>
  );
};
