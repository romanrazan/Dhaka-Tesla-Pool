import { Module } from '@nestjs/common';
import { PoolsModule } from '../pools/pools.module';
import { DriverController } from './driver.controller';

@Module({ imports: [PoolsModule], controllers: [DriverController] })
export class DriverModule {}
