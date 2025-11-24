import { Transform, Type } from 'class-transformer';
import {
  ValidateNested,
  IsArray,
  ArrayMinSize,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsInt,
  ValidateIf,
} from 'class-validator';
import { AddressDto, normalizePostalCodeInput } from '@logistics/types';

export class ShippingLocationDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  @Transform(({ value, obj }) => {
    const raw = value ?? obj?.postal_code;
    return normalizePostalCodeInput(raw);
  })
  postalCode: string;

  @IsString()
  country: string;
}

export class ProductDimensionsDto {
  @IsNumber()
  @Min(0)
  length: number;

  @IsNumber()
  @Min(0)
  width: number;

  @IsNumber()
  @Min(0)
  height: number;
}

export class FlexibleProductDto {
  @ValidateIf((o) => o.productId === undefined)
  @IsOptional()
  @IsInt()
  @Min(1)
  id?: number;

  @ValidateIf((o) => o.id === undefined)
  @IsOptional()
  @IsString()
  productId?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDimensionsDto)
  dimensions?: ProductDimensionsDto;

  @IsOptional()
  @IsString()
  name?: string;
}

export class CalculateCostRequestDto {
  @ValidateIf((o) => !o.origin)
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  delivery_address?: AddressDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FlexibleProductDto)
  products: FlexibleProductDto[];

  @ValidateIf((o) => !!o.destination || !!o.transportType)
  @ValidateNested()
  @Type(() => ShippingLocationDto)
  @IsOptional()
  origin?: ShippingLocationDto;

  @ValidateIf((o) => !!o.origin || !!o.transportType)
  @ValidateNested()
  @Type(() => ShippingLocationDto)
  @IsOptional()
  destination?: ShippingLocationDto;

  @ValidateIf((o) => !!o.origin || !!o.destination)
  @IsString()
  @IsOptional()
  transportType?: string;
}

export class CalculateCostResponseDto {
  quoteId: string;
  currency: string;
  totalCost: number;
  transportType: string;
  distance: number;
  estimatedDeliveryDays: number;
  totalWeight?: number;
  billableWeight?: number;
  breakdown?: {
    baseCost: number;
    weightCost: number;
    distanceCost: number;
    billableWeight: number;
    products_cost?: number;
    shipping_cost?: number;
    distance_km?: number;
    weight_kg?: number;
    volumetricWeight?: number;
  };
}
