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

export interface ShipmentListItem {
  shipping_id: number;
  order_id: string;
  user_id: string;
  products: Array<{
    product_id: number;
    quantity: number;
    reference?: string;
  }>;
  status: string;
  transport_type: string;
  estimated_delivery_at: string;
  created_at: string;
}

export interface ShipmentListResponse {
  shipments: ShipmentListItem[];
  total: number;
  page: number;
  limit: number;
}

export const getShipmentsList = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<ShipmentListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);

  const url = `/shipping${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get<ShipmentListResponse>(url);
  return response.data;
};
