import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pool } from '../pools/entities/pool.entity';
import { Vehicle } from './entities/vehicle.entity';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Pool])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService, TypeOrmModule],
})
export class VehiclesModule {}
