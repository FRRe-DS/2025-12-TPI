export class ProductQtyDto {
  productId: number;
  quantity: number;
  reference?: string;
}

export class ShippingLogDto {
  timestamp: string;
  status: string;
  message: string;
}

export class AddressResponseDto {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export class ShippingDetailDto {
  shipmentId: string;
  orderId: string;
  userId: string;
  destination: AddressResponseDto;
  origin?: AddressResponseDto;
  products: ProductQtyDto[];
  status: string;
  transportType: string;
  trackingNumber?: string;
  carrierName?: string;
  totalCost: number;
  currency: string;
  estimatedDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
  logs: ShippingLogDto[];
}

export class ShippingSummaryDto {
  shipmentId: string;
  orderId: string;
  userId: string;
  status: string;
  transportType: string;
  estimatedDeliveryDate: string;
  createdAt: string;
  products: ProductQtyDto[];
}

export class ListShippingResponseDto {
  shipments: ShippingSummaryDto[];
  total: number;
  page: number;
  limit: number;
}

export class CancelShippingResponseDto {
  shipmentId: string;
  status: string;
  cancelledAt: string;
  message?: string;
}
