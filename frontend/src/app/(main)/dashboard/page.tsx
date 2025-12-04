"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
  Package,
  TrendingUp,
  Clock,
  MapPin,
  MoreVertical,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Route,
  Timer
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { shipmentService, ShipmentDTO } from '@/lib/middleware/services/shipment.service';
import { vehicleService, VehicleDTO } from '@/lib/middleware/services/vehicle.service';

interface Pedido {
  id: string;
  numeroPedido: string;
  cliente: string;
  destino: string;
  estado: string;
  fechaCreacion: Date;
  fechaEntrega?: Date;
  valor: number;
}

interface EntregaMensual {
  mes: string;
  entregas: number;
}

interface DistribucionZonas {
  zona: string;
  entregas: number;
  color?: string;
}

interface PedidoEnProceso {
  numeroPedido: string;
  progreso: number;
  id: string;
  etapa: string;
}

interface RangoTiempo {
  rango: string;
  cantidad: number;
  valor?: number;
}

interface DashboardData {
  entregasMensuales: EntregaMensual[];
  distribucionZonas: DistribucionZonas[];
  pedidosEnProceso: PedidoEnProceso[];
  tiemposEntrega: RangoTiempo[];
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPedidos: 0,
    pedidosCompletados: 0,
    tiempoPromedioEntrega: 0,
    eficienciaRutas: 0,
    enTransito: 0,
    vehiculosDisponibles: 0
  });

  const [pedidosRecientes, setPedidosRecientes] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('Cargando...');
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState({ available: false, url: '' });
  const [modeInfo, setModeInfo] = useState({ mode: 'backend', features: ['Datos en tiempo real'] });

  // Real-time dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    entregasMensuales: [],
    distribucionZonas: [],
    pedidosEnProceso: [],
    tiemposEntrega: []
  });

  useEffect(() => {
    loadDashboardData();
    // Polling cada 30 segundos para actualizar datos
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendStatus = useCallback(async () => {
    try {
      // Intentar obtener envíos para verificar conexión
      await shipmentService.getShipments();
      setBackendStatus({ available: true, url: 'Backend Conectado' });
      setModeInfo({ mode: 'backend', features: ['Datos en tiempo real', 'Actualización automática'] });
    } catch (error) {
      setBackendStatus({ available: false, url: 'Backend no disponible' });
      setModeInfo({ mode: 'error', features: ['Error de conexión', 'Backend no disponible'] });
    }
  }, []);

  const retryBackendConnection = () => {
    setIsLoading(true);
    checkBackendStatus();
    loadDashboardData();
  };

  // Función helper para procesar envíos y calcular métricas
  const processShipmentsData = (shipments: ShipmentDTO[]) => {
    const total = shipments.length;
    const completados = shipments.filter(s => s.status === 'DELIVERED');
    const enTransito = shipments.filter(s => s.status === 'IN_TRANSIT');
    const creados = shipments.filter(s => s.status === 'CREATED');

    // Calcular tiempo promedio de entrega
    let totalTiempoEntrega = 0;
    let tiempoCount = 0;
    for (const shipment of completados) {
      if (shipment.estimatedDeliveryDate && shipment.createdAt) {
        const fechaCreacion = new Date(shipment.createdAt);
        const fechaEntrega = new Date(shipment.estimatedDeliveryDate);
        const dias = Math.ceil((fechaEntrega.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24));
        if (dias > 0) {
          totalTiempoEntrega += dias;
          tiempoCount++;
        }
      }
    }
    const tiempoPromedio = tiempoCount > 0 ? Math.round(totalTiempoEntrega / tiempoCount) : 0;

    // Calcular tasa de entrega
    const tasaEntrega = total > 0 ? Math.round((completados.length / total) * 100) : 0;

    return {
      total,
      completados: completados.length,
      enTransito: enTransito.length,
      creados: creados.length,
      tiempoPromedio,
      tasaEntrega
    };
  };

  // Función helper para agrupar envíos por mes
  const groupByMonth = (shipments: ShipmentDTO[]) => {
    const meses: Record<string, { entregas: number; creados: number; cancelados: number }> = {};
    
    shipments.forEach(shipment => {
      const fecha = new Date(shipment.createdAt);
      const mesKey = fecha.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
      
      if (!meses[mesKey]) {
        meses[mesKey] = { entregas: 0, creados: 0, cancelados: 0 };
      }
      
      meses[mesKey].creados++;
      if (shipment.status === 'DELIVERED') meses[mesKey].entregas++;
      if (shipment.status === 'CANCELLED') meses[mesKey].cancelados++;
    });

    return Object.entries(meses)
      .map(([mes, data]) => ({ mes, entregas: data.entregas, creados: data.creados }))
      .sort((a, b) => {
        const dateA = new Date(a.mes);
        const dateB = new Date(b.mes);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6); // Últimos 6 meses
  };

  // Función helper para agrupar por ciudad
  const groupByCity = (shipments: ShipmentDTO[]) => {
    const ciudades: Record<string, number> = {};
    
    shipments.forEach(shipment => {
      const ciudad = shipment.destinationAddress?.city || 'Desconocida';
      ciudades[ciudad] = (ciudades[ciudad] || 0) + 1;
    });

    const colors = ['#8B5CF6', '#14B8A6', '#3B82F6', '#F59E0B', '#EF4444', '#10B981'];
    return Object.entries(ciudades)
      .map(([zona, entregas], index) => ({
        zona,
        entregas,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.entregas - a.entregas)
      .slice(0, 6);
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar estado del backend
      await checkBackendStatus();

      // Obtener datos de envíos
      // El servicio devuelve un array de ShipmentDTO[]
      const shipments = await shipmentService.getShipments();
      
      // Obtener datos de vehículos
      let vehicles: VehicleDTO[] = [];
      try {
        vehicles = await vehicleService.getVehicles();
      } catch (err) {
        console.warn('No se pudieron obtener vehículos:', err);
      }

      // Procesar métricas
      const metrics = processShipmentsData(shipments);
      
      // Calcular vehículos disponibles
      const vehiculosDisponibles = vehicles.filter(v => v.status === 'AVAILABLE').length;

      // Actualizar estadísticas
      setStats({
        totalPedidos: metrics.total,
        pedidosCompletados: metrics.completados,
        tiempoPromedioEntrega: metrics.tiempoPromedio,
        eficienciaRutas: metrics.tasaEntrega,
        enTransito: metrics.enTransito,
        vehiculosDisponibles
      });

      // Procesar envíos recientes (últimos 10, ordenados por fecha)
      const recentShipments = [...shipments]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(s => ({
          id: s.id,
          numeroPedido: s.trackingNumber || s.id.substring(0, 8).toUpperCase(),
          cliente: s.destinationAddress?.city || 'N/A',
          destino: `${s.destinationAddress?.city || ''}, ${s.destinationAddress?.state || ''}`.trim(),
          estado: s.status.toLowerCase().replace('_', ' '),
          fechaCreacion: new Date(s.createdAt),
          fechaEntrega: s.estimatedDeliveryDate ? new Date(s.estimatedDeliveryDate) : undefined,
          valor: s.totalCost || 0
        }));

      setPedidosRecientes(recentShipments);

      // Procesar datos para gráficos
      const entregasMensuales = groupByMonth(shipments);
      const distribucionZonas = groupByCity(shipments);

      // Envíos en proceso
      const enProceso = shipments
        .filter(s => ['CREATED', 'IN_TRANSIT'].includes(s.status))
        .slice(0, 10)
        .map(s => ({
          numeroPedido: s.trackingNumber || s.id.substring(0, 8).toUpperCase(),
          progreso: s.status === 'CREATED' ? 25 : s.status === 'IN_TRANSIT' ? 75 : 100,
          id: s.id,
          etapa: s.status === 'CREATED' ? 'Creado' : s.status === 'IN_TRANSIT' ? 'En tránsito' : 'Completado'
        }));

      // Distribución de tiempos de entrega (simplificado)
      const tiemposEntregaData = [
        { rango: '1-2 días', cantidad: Math.floor(metrics.completados * 0.3) },
        { rango: '3-5 días', cantidad: Math.floor(metrics.completados * 0.4) },
        { rango: '6-7 días', cantidad: Math.floor(metrics.completados * 0.2) },
        { rango: '8+ días', cantidad: Math.floor(metrics.completados * 0.1) }
      ];

      setDashboardData({
        entregasMensuales: entregasMensuales.map(m => ({ mes: m.mes, entregas: m.entregas })),
        distribucionZonas,
        pedidosEnProceso: enProceso,
        tiemposEntrega: tiemposEntregaData
      });

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar datos del dashboard');
      // Si falla la conexión, mostrar error
      if (!backendStatus.available) {
        setModeInfo({ mode: 'error', features: ['Error de conexión', 'Backend no disponible'] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadDashboardData();
  };

  const getEstadoColor = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('delivered') || estadoLower.includes('entregado')) {
      return 'bg-green-100 text-green-700';
    }
    if (estadoLower.includes('transit') || estadoLower.includes('tránsito')) {
      return 'bg-blue-100 text-blue-700';
    }
    if (estadoLower.includes('created') || estadoLower.includes('pendiente')) {
      return 'bg-yellow-100 text-yellow-700';
    }
    if (estadoLower.includes('cancelled') || estadoLower.includes('cancelado')) {
      return 'bg-red-100 text-red-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  const formatEstado = (estado: string) => {
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('delivered')) return 'Entregado';
    if (estadoLower.includes('transit')) return 'En Tránsito';
    if (estadoLower.includes('created')) return 'Creado';
    if (estadoLower.includes('cancelled')) return 'Cancelado';
    return estado;
  };

  // Glassmorphism styles using inline styles
  const glassStyle = {
    backdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
  };

  const BackendStatusIndicator = () => (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${backendStatus.available
      ? 'bg-green-100 text-green-700 border border-green-200'
      : 'bg-blue-100 text-blue-700 border border-blue-200'
      }`}>
      {backendStatus.available ? (
        <>
          <Route className="w-4 h-4" />
          <span>Sistema Activo</span>
        </>
      ) : (
        <>
          <Info className="w-4 h-4" />
          <span>Modo Demo</span>
          <button
            onClick={retryBackendConnection}
            className="ml-2 px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs hover:bg-blue-300 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Conectar'}
          </button>
        </>
      )}
    </div>
  );

  const ModeInfoBanner = () => (
    <div className={`rounded-2xl p-6 shadow-xl ${modeInfo.mode === 'backend'
      ? 'bg-green-50/50 border-green-200'
      : 'bg-blue-50/50 border-blue-200'
      }`} style={glassStyle}>
      <div className="flex items-start gap-4">
        {modeInfo.mode === 'backend' ? (
          <Route className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
        ) : (
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
        )}
        <div className="flex-1">
          <h3 className={`text-lg mb-2 ${modeInfo.mode === 'backend' ? 'text-green-800' : 'text-blue-800'
            }`}>
            {modeInfo.mode === 'backend' ? 'Sistema de Logística Conectado' : 'Modo Demo Activo'}
          </h3>
          <p className={`text-sm mb-3 ${modeInfo.mode === 'backend' ? 'text-green-700' : 'text-blue-700'
            }`}>
            {modeInfo.mode === 'backend'
              ? 'Sistema completo de gestión logística con optimización de rutas y seguimiento en tiempo real.'
              : 'Estás experimentando la interfaz completa de PEPACK con datos realistas. Todas las funcionalidades están disponibles para pruebas de BOCA'
            }
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {modeInfo.features.slice(0, 4).map((feature, index) => (
              <div key={index} className={`flex items-center gap-2 text-xs ${modeInfo.mode === 'backend' ? 'text-green-700' : 'text-blue-700'
                }`}>
                <CheckCircle className="w-3 h-3" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          {modeInfo.mode === 'demo' && (
            <div className="mt-4 pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">
                  Modo Demo Frontend - Datos guardados localmente →
                </span>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm">
                    Modo Frontend - Datos Locales
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-8 shadow-xl text-center" style={glassStyle}>
          <div className="text-red-500 mb-4">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl mb-2">Dashboard Error</h2>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Backend Status */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            PEPACK - Gestión Logística y de BOCA
          </h1>
          <p className="text-gray-600 mt-1">Sistema inteligente de gestión logística y seguimiento de entregas de BOCA.</p>
        </div>
        <div className="flex items-center gap-4">
          <BackendStatusIndicator />
          <button
            onClick={refreshData}
            className="p-2 rounded-xl hover:bg-white/30 transition-colors border border-white/30"
            style={glassStyle}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 text-gray-700 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="rounded-xl px-6 py-3 shadow-lg border border-white/30" style={glassStyle}>
            <span className="text-sm text-gray-700">
              Actualizado: {lastUpdate}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Information Banner */}
      <ModeInfoBanner />

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style={glassStyle}>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">+12%</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl text-gray-800">{stats.totalPedidos.toLocaleString()}</h3>
            <p className="text-sm text-gray-600 mt-1">Total Pedidos</p>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style={glassStyle}>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">+8%</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl text-gray-800">{stats.pedidosCompletados}</h3>
            <p className="text-sm text-gray-600 mt-1">Pedidos Completados</p>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style={glassStyle}>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">+5%</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl text-gray-800">{stats.tiempoPromedioEntrega} días</h3>
            <p className="text-sm text-gray-600 mt-1">Tiempo Promedio Entrega</p>
          </div>
        </div>

        <div className="rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105" style={glassStyle}>
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Route className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">{stats.enTransito}</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl text-gray-800">{stats.enTransito}</h3>
            <p className="text-sm text-gray-600 mt-1">En Tránsito</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Applications */}
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg text-gray-800">Entregas Mensuales</h3>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dashboardData.entregasMensuales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="entregas"
                stroke="#8B5CF6"
                fill="url(#gradient1)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por Zonas */}
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg text-gray-800">Distribución por Zonas</h3>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={dashboardData.distribucionZonas as unknown as Array<{ name: string; value: number }>}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={75}
                dataKey="entregas"
              >
                {dashboardData.distribucionZonas.map((entry, index) => {
                  const colors = ['#8B5CF6', '#14B8A6', '#3B82F6', '#F59E0B'];
                  return <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-4">
            {dashboardData.distribucionZonas.map((zona, index) => {
              const colors = ['#8B5CF6', '#14B8A6', '#3B82F6', '#F59E0B'];
              return (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zona.color || colors[index % colors.length] }}></div>
                  <span className="text-sm text-gray-700">{zona.zona} ({zona.entregas})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pedidos en Proceso & Pedidos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos en Proceso */}
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg text-gray-800">Pedidos en Proceso</h3>
            <span className="text-sm text-gray-600">{dashboardData.pedidosEnProceso.length} activos</span>
          </div>
          {dashboardData.pedidosEnProceso.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.pedidosEnProceso.slice(0, 4).map((pedido, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-700 truncate max-w-48">{pedido.numeroPedido}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-300"
                        style={{ width: `${pedido.progreso}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{Math.round(pedido.progreso)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay pedidos en proceso</p>
            </div>
          )}
        </div>

        {/* Pedidos Recientes */}
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg text-gray-800">Pedidos Recientes</h3>
            <button className="text-sm text-purple-600 hover:text-purple-700 transition-colors">
              Ver Todos
            </button>
          </div>
          <div className="space-y-4">
            {pedidosRecientes.map((pedido, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-gray-800 truncate max-w-32">{pedido.numeroPedido}</h4>
                    <p className="text-sm text-gray-600">
                      {pedido.cliente} - {pedido.destino}
                    </p>
                    <p className="text-xs text-gray-500">
                      {pedido.fechaCreacion.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-800">${pedido.valor.toLocaleString()}</p>
                    <span className={`px-3 py-1 rounded-full text-xs ${getEstadoColor(pedido.estado)}`}>
                      {formatEstado(pedido.estado)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distribución de Tiempos de Entrega */}
      {dashboardData.tiemposEntrega.some(item => (item.cantidad || 0) > 0) && (
        <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
          <h3 className="text-lg text-gray-800 mb-6">Distribución de Tiempos de Entrega</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dashboardData.tiemposEntrega}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="rango" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Bar dataKey="cantidad" fill="url(#tiempoGradient)" radius={8} />
              <defs>
                <linearGradient id="tiempoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#14B8A6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
