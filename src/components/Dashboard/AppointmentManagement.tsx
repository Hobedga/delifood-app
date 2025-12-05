import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Edit2 } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Appointment, User, Pet } from '../../types';

export const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('appointments', []);
  const [users] = useLocalStorage<User[]>('users', []);
  const [pets] = useLocalStorage<Pet[]>('pets', []);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredAppointments = appointments.filter(apt => 
    filterStatus === 'all' || apt.status === filterStatus
  );

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
  };

  const handleAddNotes = (appointmentId: string, notes: string) => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId ? { ...apt, notes } : apt
    ));
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Usuario no encontrado';
  };

  const getPetName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet?.name || 'Mascota no encontrada';
  };

  const getPetSpecies = (petId: string) => {
  const pet = pets.find(p => p.id === petId);
  return pet?.species || 'Especie no encontrada';
};

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-400" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestión de Pedidos</h2>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#84A98C]/20 border border-[#84A98C]/40 text-[#F8F9FA] px-4 py-2 rounded-lg 
           focus:outline-none focus:ring-2 focus:ring-[#84A98C] transition duration-300"
        >
          <option value="all">Todos los pedidos</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmados</option>
          <option value="completed">Completados</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            userName={getUserName(appointment.userId)}
            petName={getPetName(appointment.petId)}
            species={getPetSpecies(appointment.petId)}
            onStatusChange={handleStatusChange}
            onAddNotes={handleAddNotes}
            getStatusIcon={getStatusIcon}
          />
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 text-lg">
            {filterStatus === 'all' ? 'No hay pedidos registrados' : `No hay pedidos ${filterStatus}`}
          </p>
        </div>
      )}
    </div>
  );
};

interface AppointmentCardProps {
  appointment: Appointment;
  userName: string;
  petName: string;
  species: string;
  onStatusChange: (appointmentId: string, newStatus: Appointment['status']) => void;
  onAddNotes: (appointmentId: string, notes: string) => void;
  getStatusIcon: (status: Appointment['status']) => React.ReactNode;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  userName,
  petName,
  species,
  onStatusChange,
  onAddNotes,
  getStatusIcon,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(appointment.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const handleSaveNotes = () => {
    onAddNotes(appointment.id, notes);
    setIsEditingNotes(false);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="h-5 w-5 text-purple-300" />
            <span className="text-white font-semibold">
              {new Date(appointment.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <Clock className="h-5 w-5 text-purple-300" />
            <span className="text-white">{appointment.time}</span>
          </div>
          <p className="text-white/80 mb-1">
            <span className="font-medium">Cliente:</span> {userName}
          </p>
          <p className="text-white/80 mb-1">
            <span className="font-medium">Mascota:</span> {petName}
          </p>
          <p className="text-white/80">
            <span className="font-medium">Motivo:</span> {appointment.reason}
          </p>
          <p className="text-white/80 mb-1">
            <span className="font-medium">Especie:</span> {species}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {getStatusIcon(appointment.status)}
          <select
            value={appointment.status}
            onChange={(e) => onStatusChange(appointment.id, e.target.value as Appointment['status'])}
            className="bg-white/10 border border-white/20 text-white px-3 py-1 rounded text-sm"
          >
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      </div>

      <div className="border-t border-white/20 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">Notas del veterinario:</span>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-purple-300 hover:text-purple-100 text-sm"
          >
            {showNotes ? 'Ocultar' : 'Mostrar'} notas
          </button>
        </div>
        
        {showNotes && (
          <div className="space-y-3">
            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                  rows={3}
                  placeholder="Agregar notas sobre la consulta..."
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 p-3 rounded-lg">
                <p className="text-white/80 mb-2">
                  {appointment.notes || 'No hay notas agregadas'}
                </p>
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-purple-300 hover:text-purple-100 text-sm flex items-center space-x-1"
                >
                  <Edit2 size={14} />
                  <span>{appointment.notes ? 'Editar' : 'Agregar'} notas</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};