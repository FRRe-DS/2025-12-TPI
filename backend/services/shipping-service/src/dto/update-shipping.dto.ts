import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShippingStatus } from '../enums/shipping-status.enum';

export class UpdateShippingRequestDto {
  @ApiProperty({
    description: 'Nuevo estado del envío',
    enum: ShippingStatus,
    required: false,
    example: 'in_transit',
  })
  @IsOptional()
  @IsEnum(ShippingStatus)
  status?: ShippingStatus;

  @ApiProperty({
    description: 'Usuario o sistema que realiza la actualización',
    required: false,
    example: 'operator',
  })
  @IsOptional()
  @IsString()
  updated_by?: string;
}

