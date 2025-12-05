import React from 'react';
import { Users, Notebook, Calendar, TrendingUp, Trash2 } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { User, Pet, Appointment } from '../../types';

export const AdminStats: React.FC = () => {
  const [users] = useLocalStorage<User[]>('users', []);
  const [pets] = useLocalStorage<Pet[]>('pets', []);
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('appointments', []);

  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalPets = pets.length;
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;

  const handleDeleteAppointment = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      const updated = appointments.filter(apt => apt.id !== id);
      setAppointments(updated);
    }
  };

  const stats = [
    {
      title: 'Total Usuarios',
      value: totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Pedidos Registrados',
      value: totalPets,
      icon: Notebook,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      title: 'Pedidos Totales',
      value: totalAppointments,
      icon: Calendar,
      color: 'bg-purple-500',
      change: '+15%',
    },
    {
      title: 'Pedidos Pendientes',
      value: pendingAppointments,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      change: '-5%',
    },
  ];

  const recentAppointments = appointments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Estadísticas del Sistema</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change} vs mes anterior
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Pedidos Recientes</h3>
          <div className="space-y-3">
            {recentAppointments.map((appointment) => {
              const user = users.find(u => u.id === appointment.userId);
              const pet = pets.find(p => p.id === appointment.petId);
              return (
                <div key={appointment.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{user?.name}</p>
                    <p className="text-white/70 text-sm">{pet?.name} - {appointment.reason}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-white/70 text-sm">{appointment.date}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                      appointment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {appointment.status === 'confirmed' ? 'Confirmada' :
                       appointment.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                    </span>
                    <div>
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-red-400 hover:text-red-600 mt-1 text-xs flex items-center space-x-1"
                        title="Eliminar cita"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Resumen del Sistema</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Usuarios activos</span>
              <span className="text-white font-semibold">{totalUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Pedidos por usuario</span>
              <span className="text-white font-semibold">
                {totalUsers > 0 ? (totalPets / totalUsers).toFixed(1) : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Pedidos por día</span>
              <span className="text-white font-semibold">
                {(totalAppointments / 30).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Tasa de confirmación</span>
              <span className="text-white font-semibold">
                {totalAppointments > 0 
                  ? Math.round((appointments.filter(a => a.status === 'confirmed').length / totalAppointments) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};