import { httpClient } from '../http/http-client';

export interface VehicleDTO {
  id: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  capacityKg: number;
  volumeM3: number;
  fuelType: string;
  status: string;
  transportMethodId?: string;
  driverId?: string;
  transportMethod?: {
    id: string;
    name: string;
    code: string;
  };
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateVehicleDTO {
  license_plate: string;
  make: string;
  model: string;
  year: number;
  capacityKg: number;
  volumeM3: number;
  fuelType: 'DIESEL' | 'GASOLINE' | 'ELECTRIC' | 'HYBRID';
  status: string;
  transportMethodId?: string | null;
  driverId?: string | null;
}

export interface UpdateVehicleDTO extends Partial<CreateVehicleDTO> {
  status?: string;
}

export interface VehicleFilters {
  status?: string;
}

class VehicleService {
  async getVehicles(filters?: VehicleFilters): Promise<VehicleDTO[]> {
    return httpClient.get('/fleet/vehicles', { params: filters });
  }

  async getVehicle(id: string): Promise<VehicleDTO> {
    return httpClient.get(`/fleet/vehicles/${id}`);
  }

  async createVehicle(dto: CreateVehicleDTO): Promise<VehicleDTO> {
    return httpClient.post('/fleet/vehicles', dto);
  }

  async updateVehicle(id: string, dto: UpdateVehicleDTO): Promise<VehicleDTO> {
    return httpClient.patch(`/fleet/vehicles/${id}`, dto);
  }

  async deleteVehicle(id: string): Promise<void> {
    return httpClient.delete(`/fleet/vehicles/${id}`);
  }
}

export const vehicleService = new VehicleService();
