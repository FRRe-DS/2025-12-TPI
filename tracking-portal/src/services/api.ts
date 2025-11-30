import axios, { AxiosResponse } from 'axios';
import { ShipmentDetail, ApiError } from '../types/shipment';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://api.logistica-utn.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      // Error de respuesta del servidor
      const apiError: ApiError = {
        code: error.response.data?.code || 'server_error',
        message: error.response.data?.message || 'Error interno del servidor',
        details: error.response.data?.details
      };
      throw apiError;
    } else if (error.request) {
      // Error de red
      throw {
        code: 'network_error',
        message: 'Error de conexión. Verifica tu conexión a internet.',
      } as ApiError;
    } else {
      // Otro tipo de error
      throw {
        code: 'unknown_error',
        message: 'Ha ocurrido un error inesperado.',
      } as ApiError;
    }
  }
);

export const getShipmentDetails = async (shippingId: string): Promise<ShipmentDetail> => {
  const response = await apiClient.get<ShipmentDetail>(`/shipping/${shippingId}`);
  return response.data;
};
