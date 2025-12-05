import React, { useState } from 'react';
import { Settings, Clock, DollarSign, Save } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Service } from '../../types';

export const AdminSettings: React.FC = () => {
  const [services, setServices] = useLocalStorage<Service[]>('services', [
    {
      id: '1',
      name: 'Hamburgesa',
      description: 'Papas y refresco',
      duration: 30,
      price: 250,
    },
    {
      id: '2',
      name: 'Pizza',
      description: 'Familiar',
      duration: 15,
      price: 300,
    },
    {
      id: '3',
      name: 'Pollo Frito',
      description: 'Refresco mas complementos',
      duration: 60,
      price: 350,
    },
  ]);

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
  });

  const handleSubmitService = (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceData: Service = {
      id: editingService ? editingService.id : Date.now().toString(),
      name: serviceForm.name.trim(),
      description: serviceForm.description.trim(),
      duration: parseInt(serviceForm.duration),
      price: parseFloat(serviceForm.price),
    };

    if (editingService) {
      setServices(services.map(s => s.id === editingService.id ? serviceData : s));
    } else {
      setServices([...services, serviceData]);
    }

    resetServiceForm();
  };

  const resetServiceForm = () => {
    setServiceForm({ name: '', description: '', duration: '', price: '' });
    setShowServiceForm(false);
    setEditingService(null);
  };

  const handleEditService = (service: Service) => {
    setServiceForm({
      name: service.name,
      description: service.description,
      duration: service.duration.toString(),
      price: service.price.toString(),
    });
    setEditingService(service);
    setShowServiceForm(true);
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este Producto?')) {
      setServices(services.filter(s => s.id !== serviceId));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Configuración de Productos</h2>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <span>Gestión de Producto</span>
          </h3>
          <button
            onClick={() => setShowServiceForm(true)}
            className="bg-[#84A98C]/20 border border-[#84A98C]/40 text-[#F8F9FA] px-4 py-2 rounded-lg 
           focus:outline-none focus:ring-2 focus:ring-[#84A98C] transition duration-300"
          >
            Agregar Producto
          </button>
        </div>

        {showServiceForm && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-lg font-medium text-white mb-4">
              {editingService ? 'Editar Producto' : 'Nuevo Producto'}
            </h4>
            <form onSubmit={handleSubmitService} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Nombre</label>
                  <input
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2 flex items-center space-x-1">
                    <Clock size={16} />
                    <span>Duración (minutos)</span>
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2 flex items-center space-x-1">
                  <DollarSign size={16} />
                  <span>Precio (MN)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetServiceForm}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{editingService ? 'Actualizar' : 'Guardar'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-lg">{service.name}</h4>
                  <p className="text-white/70 mb-2">{service.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-white/60">
                    <span className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{service.duration} minutos</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <DollarSign size={14} />
                      <span>{service.price.toLocaleString()} MN</span>
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEditService(service)}
                    className="text-purple-300 hover:text-purple-100 p-2 rounded transition-colors"
                  >
                    <Settings size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="text-red-300 hover:text-red-100 p-2 rounded transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};