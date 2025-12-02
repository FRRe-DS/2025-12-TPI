import { Module } from '@nestjs/common';
import { PrismaModule } from '@logistics/database';
import { DriversController } from './drivers.controller';
import { DriversService } from './services/drivers.service';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './services/vehicles.service';

@Module({
  imports: [PrismaModule],
  controllers: [DriversController, VehiclesController],
  providers: [DriversService, VehiclesService],
})
export class FleetModule {}
