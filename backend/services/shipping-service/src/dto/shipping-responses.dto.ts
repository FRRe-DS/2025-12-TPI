import { ApiProperty } from '@nestjs/swagger';

export class ProductQtyDto {
  @ApiProperty({ name: 'product_id' })
  product_id: number;

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
  
  @ApiProperty({ name: 'postal_code' })
  postal_code: string;
  
  country: string;
}

export class ShippingDetailDto {
  @ApiProperty({ name: 'shipping_id' })
  shipping_id: string;

  @ApiProperty({ name: 'order_id' })
  order_id: string;

  @ApiProperty({ name: 'user_id' })
  user_id: string;

  @ApiProperty({ name: 'delivery_address' })
  delivery_address: AddressResponseDto;

  @ApiProperty({ name: 'departure_address' })
  departure_address?: AddressResponseDto;

  products: ProductQtyDto[];
  status: string;

  @ApiProperty({ name: 'transport_type' })
  transport_type: string;

  @ApiProperty({ name: 'tracking_number' })
  tracking_number?: string;

  @ApiProperty({ name: 'carrier_name' })
  carrier_name?: string;

  @ApiProperty({ name: 'total_cost' })
  total_cost: number;

  currency: string;

  @ApiProperty({ name: 'estimated_delivery_at' })
  estimated_delivery_at: string;

  @ApiProperty({ name: 'created_at' })
  created_at: string;

  @ApiProperty({ name: 'updated_at' })
  updated_at: string;

  logs: ShippingLogDto[];
}

export class ShippingSummaryDto {
  @ApiProperty({ name: 'shipping_id' })
  shipping_id: string;

  @ApiProperty({ name: 'order_id' })
  order_id: string;

  @ApiProperty({ name: 'user_id' })
  user_id: string;

  status: string;

  @ApiProperty({ name: 'transport_type' })
  transport_type: string;

  @ApiProperty({ name: 'estimated_delivery_at' })
  estimated_delivery_at: string;

  @ApiProperty({ name: 'created_at' })
  created_at: string;

  products: ProductQtyDto[];
}

export class ListShippingResponseDto {
  shipments: ShippingSummaryDto[];
  total: number;
  page: number;
  limit: number;
}

export class CancelShippingResponseDto {
  @ApiProperty({ name: 'shipping_id' })
  shipping_id: string;

  status: string;

  @ApiProperty({ name: 'cancelled_at' })
  cancelled_at: string;

  message?: string;
}
