import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RideStatusHistory } from './entities/ride-status-history.entity';
import { RideHistoryController } from './ride-history.controller';
import { RideHistoryService } from './ride-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([RideStatusHistory])],
  controllers: [RideHistoryController],
  providers: [RideHistoryService],
  exports: [RideHistoryService, TypeOrmModule],
})
export class RideHistoryModule {}
