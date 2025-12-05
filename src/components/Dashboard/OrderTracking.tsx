import React, { useEffect, useRef, useState } from "react";
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
} from "lucide-react";

type TrackingStatus =
  | "pendiente"
  | "preparando"
  | "recogiendo"
  | "en_camino"
  | "entregado";

interface Notification {
  id: number;
  message: string;
  type: "info" | "success";
}

const steps: { key: TrackingStatus; label: string; description: string }[] = [
  {
    key: "pendiente",
    label: "Pedido recibido",
    description: "Estamos confirmando los detalles con el restaurante.",
  },
  {
    key: "preparando",
    label: "Preparando tu pedido",
    description: "El restaurante está preparando tus alimentos.",
  },
  {
    key: "recogiendo",
    label: "Repartidor en el restaurante",
    description: "El repartidor está recogiendo tu pedido.",
  },
  {
    key: "en_camino",
    label: "En camino",
    description: "El repartidor va hacia tu ubicación.",
  },
  {
    key: "entregado",
    label: "Entregado",
    description: "¡Disfruta tu comida! 😋",
  },
];

export const OrderTracking: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);

  const currentStatus = steps[currentStep].key;
  const progress = (currentStep / (steps.length - 1)) * 100;

  // ──────────────────────────────────────────────────────────────
  // "Notificaciones push" simuladas
  // ──────────────────────────────────────────────────────────────
  const pushNotification = (message: string, type: "info" | "success") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Se elimina sola después de 4s
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // ──────────────────────────────────────────────────────────────
  // Simulación de cambios de estado "en tiempo real"
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) return;
    if (currentStep >= steps.length - 1) return;

    const timer = setTimeout(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        const nextStep = steps[next];

        pushNotification(
          `Estado actualizado: ${nextStep.label}`,
          nextStep.key === "entregado" ? "success" : "info"
        );

        return next;
      });
    }, 3500); // cada 3.5 segundos avanza

    return () => clearTimeout(timer);
  }, [isRunning, currentStep]);

  // ──────────────────────────────────────────────────────────────
  // Controles
  // ──────────────────────────────────────────────────────────────
  const startSimulation = () => {
    setCurrentStep(0);
    setIsRunning(true);
    setNotifications([]);
    pushNotification("Simulación iniciada para tu pedido.", "info");

    // pequeñita manipulación del DOM: centramos el mapa
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setNotifications([]);
  };

  // coordenadas simuladas del repartidor en el "mapa"
  const driverX = 10 + progress * 0.8; // 10% → 90%
  const driverY = 50 + Math.sin(progress / 15) * 10; // un poco de curva

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#5D4037]">
            Seguimiento de tu pedido
          </h2>
          <p className="text-sm text-[#8D6E63]">
            Esta pantalla es una simulación interactiva del reparto.
          </p>
        </div>

        <div className="space-x-2">
          <button
            onClick={startSimulation}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#FF8C42] hover:bg-[#FF7A00] text-white text-sm font-medium transition-colors"
          >
            <Play className="w-4 h-4 mr-1" />
            Iniciar simulación
          </button>
          <button
            onClick={resetSimulation}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-[#5D4037] text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reiniciar
          </button>
        </div>
      </div>

      {/* Tarjeta principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa y barra de progreso */}
        <div className="lg:col-span-2 space-y-4">
          {/* "Mapa" interactivo */}
          <div
            ref={mapRef}
            className="relative w-full h-64 rounded-2xl bg-gradient-to-br from-[#E3F2FD] via-[#FFF3E0] to-[#FFE0B2] border border-[#FFB347]/40 shadow-md overflow-hidden"
          >
            {/* Ruta */}
            <div className="absolute left-[10%] right-[10%] top-1/2 h-1 bg-[#FFCC80] rounded-full" />
            <div className="absolute left-[10%] right-[10%] top-1/2 border-t-2 border-dashed border-[#FB8C00]/70" />

            {/* Punto: Restaurante */}
            <div className="absolute left-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="p-2 rounded-full bg-white shadow">
                <MapPin className="w-5 h-5 text-[#D84315]" />
              </div>
              <span className="mt-1 text-xs text-[#6D4C41]">Restaurante</span>
            </div>

            {/* Punto: Cliente */}
            <div className="absolute right-[10%] top-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="p-2 rounded-full bg-white shadow">
                <MapPin className="w-5 h-5 text-[#2E7D32]" />
              </div>
              <span className="mt-1 text-xs text-[#6D4C41]">Tu casa</span>
            </div>

            {/* Repartidor moviéndose */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
              style={{
                left: `${driverX}%`,
                top: `${driverY}%`,
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#FF8C42]/30 blur-md animate-ping" />
                <div className="relative p-2 rounded-full bg-[#FF8C42] shadow-lg">
                  <Truck className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Barra de progreso de entrega */}
          <div className="bg-white/90 rounded-xl border border-[#FFB347]/40 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#FF8C42]" />
                <span className="text-sm font-semibold text-[#5D4037]">
                  Progreso de la entrega
                </span>
              </div>
              <span className="text-xs text-[#8D6E63]">
                Estado:{" "}
                <span className="font-semibold">
                  {steps[currentStep].label}
                </span>
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-[#FFE0B2] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF8C42] to-[#FF7043] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-[#8D6E63]">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Línea de tiempo de estados */}
        <div className="bg-white/90 rounded-xl border border-[#FFB347]/40 p-4 shadow-md">
          <h3 className="text-sm font-semibold text-[#5D4037] mb-3 flex items-center">
            <Truck className="w-4 h-4 mr-2 text-[#FF8C42]" />
            Estados del pedido
          </h3>

          <div className="space-y-3">
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isComplete = index < currentStep;

              return (
                <div key={step.key} className="flex items-start space-x-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                        isComplete
                          ? "bg-green-500 border-green-500 text-white"
                          : isActive
                          ? "bg-[#FF8C42] border-[#FF8C42] text-white"
                          : "bg-white border-[#FFCC80] text-[#FF8C42]"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 w-px bg-gradient-to-b from-[#FFCC80] to-transparent" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isActive
                          ? "text-[#D35400]"
                          : "text-[#5D4037]"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-[#8D6E63]">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {currentStatus === "entregado" && (
            <div className="mt-4 flex items-center text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              ¡Tu pedido llegó al destino en esta simulación!
            </div>
          )}

          {isRunning && currentStatus !== "entregado" && (
            <div className="mt-4 flex items-center text-xs text-[#8D6E63] bg-[#FFF8E1] border border-[#FFECB3] px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 mr-2 text-[#FF8C42]" />
              La simulación avanza automáticamente por los estados del pedido.
            </div>
          )}
        </div>
      </div>

      {/* "Notificaciones push" simuladas */}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2 z-40">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`max-w-xs px-4 py-3 rounded-lg shadow-lg text-sm flex items-start space-x-2 ${
                n.type === "success"
                  ? "bg-green-600 text-white"
                  : "bg-[#FF8C42] text-white"
              }`}
            >
              {n.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5" />
              )}
              <span>{n.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
