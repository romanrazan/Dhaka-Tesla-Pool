import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoolMember } from '../pool-members/entities/pool-member.entity';
import { RideHistoryModule } from '../ride-history/ride-history.module';
import { Pool } from './entities/pool.entity';
import { PoolsController } from './pools.controller';
import { PoolsService } from './pools.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pool, PoolMember]), RideHistoryModule],
  controllers: [PoolsController],
  providers: [PoolsService],
  exports: [PoolsService, TypeOrmModule],
})
export class PoolsModule {}
