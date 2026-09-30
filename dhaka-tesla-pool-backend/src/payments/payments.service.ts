import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import {
  PaymentMethod,
  PaymentStatus,
  RideStatus,
} from '../common/enums/domain.enums';
import { RideRequest } from '../ride-requests/entities/ride-request.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(RideRequest)
    private readonly rides: Repository<RideRequest>,
  ) {}

  async create(passengerId: string, dto: CreatePaymentDto) {
    const ride = await this.rides.findOne({ where: { id: dto.rideRequestId } });
    if (!ride) throw new NotFoundException('Ride request not found');
    if (ride.passengerId !== passengerId)
      throw new ForbiddenException('You cannot pay for this ride');
    if (ride.status !== RideStatus.COMPLETED)
      throw new ConflictException('Payment is available after ride completion');
    if (await this.payments.exists({ where: { rideRequestId: ride.id } })) {
      throw new ConflictException('Payment is already recorded for this ride');
    }
    return this.payments.save(
      this.payments.create({
        rideRequestId: ride.id,
        passengerId,
        amountPoisha: ride.finalFarePoisha ?? ride.estimatedFarePoisha,
        method: dto.method,
        status: PaymentStatus.PAID,
        transactionReference:
          dto.method === PaymentMethod.TESLA_PAY
            ? `TP-${randomUUID().slice(0, 8).toUpperCase()}`
            : null,
        paidAt: new Date(),
      }),
    );
  }

  listMine(passengerId: string) {
    return this.payments.find({
      where: { passengerId },
      order: { createdAt: 'DESC' },
    });
  }
}
