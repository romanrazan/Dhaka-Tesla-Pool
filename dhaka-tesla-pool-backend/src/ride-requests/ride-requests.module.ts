import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaresModule } from '../fares/fares.module';
import { PoolsModule } from '../pools/pools.module';
import { RideHistoryModule } from '../ride-history/ride-history.module';
import { User } from '../users/entities/user.entity';
import { RideRequest } from './entities/ride-request.entity';
import { RideRequestsController } from './ride-requests.controller';
import { RideRequestsService } from './ride-requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RideRequest, User]),
    FaresModule,
    PoolsModule,
    RideHistoryModule,
  ],
  controllers: [RideRequestsController],
  providers: [RideRequestsService],
  exports: [RideRequestsService, TypeOrmModule],
})
export class RideRequestsModule {}
