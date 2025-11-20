import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { MockDataService } from './services/mock-data.service';
import { DistanceCalculationService } from './services/distance-calculation.service';
import { TariffCalculationService } from './services/tariff-calculation.service';
import { PostalCodeValidationService } from './services/postal-code-validation.service';
import { TransportMethod } from '@logistics/database';
import { LoggerService } from '@logistics/utils';
import {
  CalculateCostRequestDto,
  CalculateCostResponseDto,
} from './dto/calculate-cost.dto';
import {
  CreateShippingRequestDto,
  CreateShippingResponseDto,
} from './dto/create-shipping.dto';
import { UpdateShippingRequestDto } from './dto/update-shipping.dto';
import {
  ShippingDetailDto,
  ListShippingResponseDto,
  CancelShippingResponseDto,
  TransportMethodsResponseDto,
  TransportMethodDto,
} from './dto/shipping-responses.dto';
import { ShippingStatus } from './enums/shipping-status.enum';

@Injectable()
export class ShippingService {
  private readonly logger = new LoggerService(ShippingService.name);
  private readonly stockServiceUrl: string;

  constructor(
    private mockData: MockDataService,
    private configService: ConfigService,
    private httpService: HttpService,
    private distanceService: DistanceCalculationService,
    private tariffService: TariffCalculationService,
    private postalValidator: PostalCodeValidationService,
  ) {
    this.stockServiceUrl = this.configService.get<string>(
      'STOCK_SERVICE_URL',
      'http://localhost:3002',
    );
  }

  // Mock storage para testing (en memoria)
  private mockShipments: any[] = [];
  private nextId = 1;

  async calculateCost(
    dto: CalculateCostRequestDto,
  ): Promise<CalculateCostResponseDto> {
    // Validate postal code
    const postal = this.postalValidator.validate(
      dto.delivery_address.postal_code,
    );
    if (!postal.isValid)
      throw new BadRequestException(postal.errors.join(', '));

    // Fetch stock info (temporary mock until stock-integration-service endpoint is wired)
    const productIds = dto.products.map((p) => p.id);
    const stockInfo = await this.mockData.getStockInfo(productIds);

    // Weight and product totals
    let totalWeight = 0;
    const productCosts: { id: number; cost: number }[] = [];
    for (const item of dto.products) {
      const stock = stockInfo.find((s) => s.id === item.id);
      if (!stock || !stock.available || !stock.weight || !stock.price) {
        throw new BadRequestException(
          `Product ${item.id} not available or missing data`,
        );
      }
      totalWeight += stock.weight * item.quantity;
      productCosts.push({ id: item.id, cost: stock.price * item.quantity });
    }

    // Distance
    const distanceRes = await this.distanceService.calculateDistance(
      dto.delivery_address.postal_code,
      'C1000ABC',
    );

    // Tariff calculation (using default transport method)
    // TODO: Get transport method from request or use default
    const defaultTransportMethodId = 'default-road-transport'; // This should be a real ID from the database
    const tariff = await this.tariffService.calculateTariff({
      transportMethodId: defaultTransportMethodId,
      billableWeight: totalWeight,
      distance: distanceRes.distance,
      environment: this.configService.get('NODE_ENV') || 'development',
    });

    const productTotal = productCosts.reduce((sum, p) => sum + p.cost, 0);
    const totalCost = productTotal + tariff.totalCost;

    return {
      currency: 'ARS',
      total_cost: Math.round(totalCost),
      transport_type: 'standard',
      products: productCosts,
      breakdown: {
        products_cost: productTotal,
        shipping_cost: tariff.totalCost,
        distance_km: distanceRes.distance,
        weight_kg: totalWeight,
      },
    };
  }

  async createShipping(
    dto: CreateShippingRequestDto,
  ): Promise<CreateShippingResponseDto> {
    // 1. Validar productos con Stock API (mock)
    const productIds = dto.products.map((p) => p.id);
    const stockInfo = await this.mockData.getStockInfo(productIds);

    for (const stock of stockInfo) {
      if (!stock.available) {
        throw new BadRequestException(`Product ${stock.id} not available`);
      }
    }

    // 2. Calcular costo final
    let totalWeight = 0;
    for (let i = 0; i < dto.products.length; i++) {
      const product = dto.products[i];
      const stock = stockInfo.find((s) => s.id === product.id);
      if (stock && stock.weight) {
        totalWeight += stock.weight * product.quantity;
      }
    }

    const distanceInfo = await this.mockData.getDistanceInfo(
      dto.delivery_address.postal_code,
      'C1000ABC',
    );

    const shippingCost = this.mockData.calculateShippingCost(
      distanceInfo.distance_km,
      totalWeight,
      dto.transport_type.toUpperCase() as any,
    );

    const productTotal = stockInfo.reduce((sum, stock) => {
      const product = dto.products.find((p) => p.id === stock.id);
      if (stock.price && product) {
        return sum + stock.price * product.quantity;
      }
      return sum;
    }, 0);

    const totalCost = productTotal + shippingCost.total_cost;

    // 3. Generar tracking number
    const trackingNumber = this.mockData.generateTrackingNumber();

    // 4. Calcular tiempo de entrega estimado
    const deliveryDays = this.mockData.getEstimatedDeliveryTime(
      dto.transport_type.toUpperCase() as any,
      distanceInfo.distance_km,
    );

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays);

    // 5. Crear registro en memoria (mock)
    const shipping = {
      id: `mock-${this.nextId++}`,
      orderId: dto.order_id,
      userId: dto.user_id,
      trackingNumber,
      deliveryStreet: dto.delivery_address.street,
      deliveryCity: dto.delivery_address.city,
      deliveryState: dto.delivery_address.state,
      deliveryPostalCode: dto.delivery_address.postal_code,
      deliveryCountry: dto.delivery_address.country,
      transportType: dto.transport_type.toUpperCase(),
      status: 'CREATED',
      totalCost,
      currency: 'ARS',
      estimatedDeliveryAt: estimatedDelivery,
      createdAt: new Date(),
      updatedAt: new Date(),
      products: dto.products.map((p) => ({
        productId: p.id,
        quantity: p.quantity,
      })),
      logs: [
        {
          timestamp: new Date(),
          status: 'CREATED',
          message: `Shipment created with tracking number: ${trackingNumber}`,
        },
      ],
    };

    // Guardar en memoria
    this.mockShipments.push(shipping);

    return {
      shipping_id: shipping.id,
      status: 'created',
      transport_type: dto.transport_type,
      tracking_number: trackingNumber,
      estimated_delivery_at: shipping.estimatedDeliveryAt.toISOString(),
    };
  }

  async listShipments(filters: {
    userId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page: number;
    limit: number;
  }): Promise<ListShippingResponseDto> {
    const { userId, status, fromDate, toDate, page, limit } = filters;

    // Filtrar en memoria
    let filteredShipments = this.mockShipments;

    if (userId) {
      filteredShipments = filteredShipments.filter((s) => s.userId === userId);
    }
    if (status) {
      filteredShipments = filteredShipments.filter(
        (s) => s.status.toLowerCase() === status.toLowerCase(),
      );
    }
    if (fromDate) {
      const fromDateObj = new Date(fromDate);
      filteredShipments = filteredShipments.filter(
        (s) => s.createdAt >= fromDateObj,
      );
    }
    if (toDate) {
      const toDateObj = new Date(toDate);
      filteredShipments = filteredShipments.filter(
        (s) => s.createdAt <= toDateObj,
      );
    }

    // Ordenar por fecha de creación (más recientes primero)
    filteredShipments = filteredShipments.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const total = filteredShipments.length;
    const skip = (page - 1) * limit;
    const shipments = filteredShipments.slice(skip, skip + limit);

    return {
      shipments: shipments.map((s) => ({
        shipping_id: s.id,
        order_id: s.orderId,
        user_id: s.userId,
        products: s.products.map((p) => ({
          product_id: p.productId,
          quantity: p.quantity,
        })),
        status: s.status.toLowerCase(),
        transport_type: s.transportType.toLowerCase(),
        estimated_delivery_at: s.estimatedDeliveryAt.toISOString(),
        created_at: s.createdAt.toISOString(),
      })),
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
      },
    };
  }

  async getShippingDetail(id: string): Promise<ShippingDetailDto> {
    const shipping = this.mockShipments.find((s) => s.id === id);

    if (!shipping) {
      throw new NotFoundException('Shipping not found');
    }

    return {
      shipping_id: shipping.id,
      order_id: shipping.orderId,
      user_id: shipping.userId,
      delivery_address: {
        street: shipping.deliveryStreet,
        city: shipping.deliveryCity,
        state: shipping.deliveryState,
        postal_code: shipping.deliveryPostalCode,
        country: shipping.deliveryCountry,
      },
      departure_address: shipping.departureStreet
        ? {
            street: shipping.departureStreet,
            city: shipping.departureCity,
            state: shipping.departureState,
            postal_code: shipping.departurePostalCode,
            country: shipping.departureCountry,
          }
        : undefined,
      products: shipping.products.map((p) => ({
        product_id: p.productId,
        quantity: p.quantity,
      })),
      status: shipping.status.toLowerCase(),
      transport_type: shipping.transportType.toLowerCase(),
      tracking_number: shipping.trackingNumber || undefined,
      carrier_name: shipping.carrierName || undefined,
      total_cost: Number(shipping.totalCost),
      currency: shipping.currency,
      estimated_delivery_at: shipping.estimatedDeliveryAt.toISOString(),
      created_at: shipping.createdAt.toISOString(),
      updated_at: shipping.updatedAt.toISOString(),
      logs: shipping.logs.map((log) => ({
        timestamp: log.timestamp.toISOString(),
        status: log.status.toLowerCase(),
        message: log.message,
      })),
    };
  }

  /**
   * Valida si una transición de estado es permitida
   */
  private isValidStatusTransition(
    currentStatus: string,
    newStatus: ShippingStatus,
  ): boolean {
    const current = currentStatus.toUpperCase();
    const next = newStatus.toUpperCase();

    // Estados finales no pueden cambiar
    if (current === 'DELIVERED' || current === 'CANCELLED') {
      return false;
    }

    // No se puede volver a estados anteriores
    const statusOrder = [
      'CREATED',
      'RESERVED',
      'IN_TRANSIT',
      'ARRIVED',
      'IN_DISTRIBUTION',
      'DELIVERED',
    ];

    const currentIndex = statusOrder.indexOf(current);
    const nextIndex = statusOrder.indexOf(next);

    // Permitir avanzar en el flujo, mantener el mismo estado, o cancelar
    if (next === 'CANCELLED') {
      return true; // Se puede cancelar desde cualquier estado (excepto finales)
    }

    // Permitir avanzar o mantener el mismo estado
    return nextIndex >= currentIndex;
  }

  async updateShipping(
    id: string,
    dto: UpdateShippingRequestDto,
  ): Promise<ShippingDetailDto> {
    const shippingIndex = this.mockShipments.findIndex((s) => s.id === id);

    if (shippingIndex === -1) {
      throw new NotFoundException('Shipping not found');
    }

    const shipping = this.mockShipments[shippingIndex];

    // Validar transición de estado si se está actualizando el status
    if (dto.status) {
      const currentStatus = shipping.status.toUpperCase();
      const newStatus = dto.status.toUpperCase();

      // No permitir actualizar si ya está en estado final
      if (currentStatus === 'DELIVERED' || currentStatus === 'CANCELLED') {
        throw new BadRequestException(
          `Cannot update shipment. Current status '${shipping.status.toLowerCase()}' is final and cannot be changed.`,
        );
      }

      // Validar transición válida
      if (!this.isValidStatusTransition(currentStatus, dto.status)) {
        throw new BadRequestException(
          `Invalid status transition from '${shipping.status.toLowerCase()}' to '${dto.status}'.`,
        );
      }

      // Si el nuevo estado es diferente, actualizar (normalizar a mayúsculas para consistencia)
      if (newStatus !== currentStatus) {
        shipping.status = newStatus;
      }
    }

    // Actualizar timestamp
    shipping.updatedAt = new Date();

    // Agregar log entry
    const logMessage = dto.status
      ? `Status updated to '${dto.status}' by ${dto.updated_by || 'system'}`
      : `Shipment updated by ${dto.updated_by || 'system'}`;

    shipping.logs = [
      ...shipping.logs,
      {
        timestamp: new Date(),
        status: dto.status?.toUpperCase() || shipping.status.toUpperCase(),
        message: logMessage,
      },
    ];

    // Guardar cambios
    this.mockShipments[shippingIndex] = shipping;

    // Retornar el envío actualizado usando el mismo mapeo que getShippingDetail
    return this.getShippingDetail(id);
  }

  async cancelShipping(id: string): Promise<CancelShippingResponseDto> {
    const shippingIndex = this.mockShipments.findIndex((s) => s.id === id);

    if (shippingIndex === -1) {
      throw new NotFoundException('Shipping not found');
    }

    const shipping = this.mockShipments[shippingIndex];

    if (!['CREATED', 'RESERVED'].includes(shipping.status)) {
      throw new BadRequestException(
        `Shipment cannot be cancelled. Current status '${shipping.status.toLowerCase()}' does not allow cancellation.`,
      );
    }

    // Actualizar en memoria
    const updated = {
      ...shipping,
      status: 'CANCELLED',
      cancelledAt: new Date(),
      updatedAt: new Date(),
      logs: [
        ...shipping.logs,
        {
          timestamp: new Date(),
          status: 'CANCELLED',
          message: 'Shipment cancelled by user',
        },
      ],
    };

    this.mockShipments[shippingIndex] = updated;

    return {
      shipping_id: updated.id,
      status: 'cancelled',
      cancelled_at: updated.cancelledAt!.toISOString(),
    };
  }

  async getTransportMethods(): Promise<TransportMethodsResponseDto> {
    // Mock transport methods - en producción esto debería consultar al config service
    const transportMethods: TransportMethodDto[] = [
      {
        type: 'road',
        name: 'Transporte Terrestre',
        estimated_days: '3-5',
      },
      {
        type: 'air',
        name: 'Transporte Aéreo',
        estimated_days: '1-2',
      },
      {
        type: 'sea',
        name: 'Transporte Marítimo',
        estimated_days: '15-30',
      },
      {
        type: 'rail',
        name: 'Transporte Ferroviario',
        estimated_days: '5-7',
      },
    ];

    return {
      transport_methods: transportMethods,
    };
  }
}
