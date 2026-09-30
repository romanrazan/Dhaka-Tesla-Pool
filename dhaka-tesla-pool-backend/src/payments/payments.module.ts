import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RideRequest } from '../ride-requests/entities/ride-request.entity';
import { Payment } from './entities/payment.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, RideRequest])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
