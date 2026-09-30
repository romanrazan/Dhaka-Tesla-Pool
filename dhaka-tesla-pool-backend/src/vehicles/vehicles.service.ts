import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PoolStatus } from '../common/enums/domain.enums';
import { Pool } from '../pools/entities/pool.entity';
import { Vehicle } from './entities/vehicle.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle) private readonly vehicles: Repository<Vehicle>,
    @InjectRepository(Pool) private readonly pools: Repository<Pool>,
  ) {}

  async mine(driverId: string) {
    const vehicle = await this.vehicles.findOne({ where: { driverId } });
    if (!vehicle)
      throw new NotFoundException('No vehicle is assigned to this driver');
    return vehicle;
  }

  async setOnline(driverId: string, isOnline: boolean) {
    const vehicle = await this.mine(driverId);
    if (!isOnline) {
      const active = await this.pools.exists({
        where: {
          vehicleId: vehicle.id,
          status: In([
            PoolStatus.MATCHING,
            PoolStatus.ACCEPTED,
            PoolStatus.DRIVER_ARRIVED,
            PoolStatus.STARTED,
          ]),
        },
      });
      if (active)
        throw new ConflictException(
          'Complete or cancel the active pool before going offline',
        );
    }
    vehicle.isOnline = isOnline;
    return this.vehicles.save(vehicle);
  }
}
