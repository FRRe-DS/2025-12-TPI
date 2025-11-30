import React, { useState } from 'react';
import { Search, Package, Truck, MapPin, List, ArrowLeft } from 'lucide-react';
import { ShipmentDetail } from './types/shipment';
import { getShipmentDetails, getShipmentsList, ShipmentListItem } from './services/api';
import { formatDate, formatCurrency, getStatusLabel, getStatusColor, getTransportTypeLabel } from './utils/formatters';

function App() {
  const [searchInput, setSearchInput] = useState('');
  const [shipment, setShipment] = useState<ShipmentDetail | null>(null);
  const [shipmentsList, setShipmentsList] = useState<ShipmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'search' | 'details' | 'list'>('search');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getShipmentDetails(searchInput.trim());
      setShipment(data);
      setCurrentView('details');
    } catch (err: any) {
      setError(err.message || 'No se pudo encontrar el envío. Verifica el código e intenta nuevamente.');
      setShipment(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setShipment(null);
    setShipmentsList([]);
    setError(null);
    setSearchInput('');
  };

  const handleViewShipmentsList = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getShipmentsList({ limit: 50 }); // Obtener hasta 50 envíos para testing
      setShipmentsList(data.shipments);
      setCurrentView('list');
    } catch (err: any) {
      setError(err.message || 'Error al cargar la lista de envíos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectShipment = (shippingId: number) => {
    setSearchInput(shippingId.toString());
    setCurrentView('search');
  };

  const getStatusTimeline = (currentStatus: string, logStatus: string) => {
    const statusOrder = ['created', 'reserved', 'in_transit', 'arrived', 'in_distribution', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const logIndex = statusOrder.indexOf(logStatus);

    if (logIndex < currentIndex || currentStatus === 'delivered') {
      return 'completed';
    } else if (logIndex === currentIndex) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-slate-900">
                Seguimiento de Envío
              </h1>
            </div>
            {currentView === 'details' && (
              <button
                onClick={handleBackToSearch}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Nueva búsqueda
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {currentView === 'search' ? (
          /* Search View */
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                Rastrea tu envío
              </h2>
              <p className="text-slate-600">
                Ingresa tu número de seguimiento para conocer el estado actual de tu pedido
              </p>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label htmlFor="tracking" className="block text-sm font-medium text-slate-700 mb-2">
                    Código de Envío
                  </label>
                  <input
                    id="tracking"
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Ej: 12345 o LOG-AR-123456789"
                    className="input-field"
                    autoFocus
                  />
                </div>

            <button
              type="submit"
              disabled={!searchInput.trim() || isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Buscando...' : 'Rastrear Envío'}
            </button>
          </form>

          {/* List Available Shipments Button */}
          <div className="mt-4 text-center">
            <button
              onClick={handleViewShipmentsList}
              disabled={isLoading}
              className="btn-secondary text-sm"
            >
              <List className="w-4 h-4 inline mr-2" />
              {isLoading ? 'Cargando...' : 'Ver Envíos Disponibles'}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-base font-semibold text-red-900 mb-2">
                  Envío no encontrado
                </h3>
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card p-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Búsqueda Rápida
                </h3>
                <p className="text-xs text-slate-600">
                  Encuentra tu envío en segundos con nuestro sistema de búsqueda
                </p>
              </div>

              <div className="card p-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                  <Truck className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Seguimiento en Tiempo Real
                </h3>
                <p className="text-xs text-slate-600">
                  Consulta el estado actualizado de tu envío en cualquier momento
                </p>
              </div>

              <div className="card p-6">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Información Detallada
                </h3>
                <p className="text-xs text-slate-600">
                  Visualiza toda la información de tu envío y su historial completo
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Details View */
          <div className="space-y-6">
            {/* Loading State */}
            {isLoading && (
              <div className="card p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-20 bg-slate-200 rounded"></div>
                </div>
              </div>
            )}

            {/* Shipment Details */}
            {shipment && !isLoading && (
              <>
                {/* Status Card */}
                <div className="card p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(shipment.status)}`}>
                          {getStatusLabel(shipment.status)}
                        </span>
                      </div>
                      <h2 className="text-2xl font-semibold text-slate-900">
                        {shipment.tracking_number || `Envío #${shipment.shipping_id}`}
                      </h2>
                      {shipment.carrier_name && (
                        <p className="text-sm text-slate-600">
                          Transportista: {shipment.carrier_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Destino</p>
                      <p className="text-sm font-medium text-slate-900">
                        {shipment.delivery_address.city}, {shipment.delivery_address.state}
                      </p>
                      <p className="text-xs text-slate-600">
                        CP: {shipment.delivery_address.postal_code}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 mb-1">Tipo de Transporte</p>
                      <p className="text-sm font-medium text-slate-900">
                        {getTransportTypeLabel(shipment.transport_type)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 mb-1">
                        {shipment.status === 'delivered' ? 'Fecha de Entrega' : 'ETA Estimado'}
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate(shipment.estimated_delivery_at)}
                      </p>
                    </div>
                  </div>

                  {/* Cost Info */}
                  {shipment.total_cost && (
                    <div className="pt-4 border-t border-slate-200 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Costo total:</span>
                        <span className="text-lg font-semibold text-slate-900">
                          {formatCurrency(shipment.total_cost, shipment.currency)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="card p-6">
                  <h3 className="text-base font-semibold text-slate-900 mb-6">
                    Historial de Seguimiento
                  </h3>

                  <div className="space-y-6">
                    {shipment.logs.map((log, index) => {
                      const timelineStatus = getStatusTimeline(shipment.status, log.status);

                      return (
                        <div key={index} className="relative flex gap-4">
                          {/* Timeline Line */}
                          {index < shipment.logs.length - 1 && (
                            <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-slate-200" />
                          )}

                          {/* Timeline Dot */}
                          <div className="relative flex-shrink-0">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                timelineStatus === 'completed'
                                  ? 'bg-emerald-500 border-emerald-500'
                                  : timelineStatus === 'current'
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'bg-white border-slate-300'
                              }`}
                            />
                          </div>

                          {/* Event Details */}
                          <div className="flex-1 pb-6">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-1">
                              <h4 className={`text-sm font-medium ${
                                timelineStatus === 'pending' ? 'text-slate-500' : 'text-slate-900'
                              }`}>
                                {log.message}
                              </h4>
                              <span className={`text-xs ${
                                timelineStatus === 'pending' ? 'text-slate-400' : 'text-slate-600'
                              }`}>
                                {formatDate(log.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Shipments List View */}
        {currentView === 'list' && !isLoading && !error && (
          <div className="space-y-6">
            {/* Back Button */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <button
                onClick={handleBackToSearch}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a búsqueda
              </button>
            </div>

            {/* Shipments List */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">
                  Envíos Disponibles para Consulta
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Selecciona un envío para ver sus detalles completos
                </p>
              </div>

              <div className="divide-y divide-slate-200">
                {shipmentsList.length === 0 ? (
                  <div className="px-6 py-8 text-center text-slate-500">
                    No hay envíos disponibles
                  </div>
                ) : (
                  shipmentsList.map((item) => (
                    <div
                      key={item.shipping_id}
                      className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => handleSelectShipment(item.shipping_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Package className="w-5 h-5 text-slate-400" />
                            <span className="font-medium text-slate-900">
                              Envío #{item.shipping_id}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status as any)}`}>
                              {getStatusLabel(item.status as any)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-600">
                            <div>
                              <span className="font-medium">Pedido:</span> {item.order_id}
                            </div>
                            <div>
                              <span className="font-medium">Transporte:</span> {getTransportTypeLabel(item.transport_type)}
                            </div>
                            <div>
                              <span className="font-medium">Creado:</span> {formatDate(item.created_at)}
                            </div>
                          </div>

                          <div className="mt-2 text-sm text-slate-600">
                            <span className="font-medium">Productos:</span> {item.products.length} ítem(s)
                          </div>
                        </div>

                        <div className="ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectShipment(item.shipping_id);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Ver Detalles
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {shipmentsList.length > 0 && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    Mostrando {shipmentsList.length} envío(s). Haz clic en cualquier envío para ver sus detalles completos.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
