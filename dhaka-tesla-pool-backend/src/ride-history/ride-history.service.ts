import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RideStatus } from '../common/enums/domain.enums';
import { RideStatusHistory } from './entities/ride-status-history.entity';

@Injectable()
export class RideHistoryService {
  constructor(
    @InjectRepository(RideStatusHistory)
    private readonly history: Repository<RideStatusHistory>,
  ) {}

  record(
    manager: EntityManager,
    values: {
      rideRequestId: string;
      poolId?: string | null;
      previousStatus: RideStatus | null;
      newStatus: RideStatus;
      changedBy: string;
    },
  ) {
    return manager
      .getRepository(RideStatusHistory)
      .save(
        manager
          .getRepository(RideStatusHistory)
          .create({ ...values, poolId: values.poolId ?? null }),
      );
  }

  listMine(passengerId: string) {
    return this.history
      .createQueryBuilder('history')
      .innerJoin(
        'history.rideRequest',
        'ride',
        'ride.passengerId = :passengerId',
        { passengerId },
      )
      .select([
        'history.id',
        'history.rideRequestId',
        'history.poolId',
        'history.previousStatus',
        'history.newStatus',
        'history.changedAt',
        'ride.pickupZone',
        'ride.destinationZone',
      ])
      .orderBy('history.changedAt', 'DESC')
      .getMany();
  }
}
