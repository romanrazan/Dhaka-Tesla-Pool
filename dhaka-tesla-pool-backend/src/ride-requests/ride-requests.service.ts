import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { RideStatus } from '../common/enums/domain.enums';
import {
  assertRideTransition,
  canCancelRide,
} from '../common/state-machine/ride-state-machine';
import { FareService } from '../fares/fare.service';
import { PoolsService } from '../pools/pools.service';
import { RideHistoryService } from '../ride-history/ride-history.service';
import { User } from '../users/entities/user.entity';
import { CreateRideRequestDto } from './dto/create-ride-request.dto';
import { RideRequest } from './entities/ride-request.entity';

const ACTIVE_RIDE_STATUSES = [
  RideStatus.REQUESTED,
  RideStatus.MATCHED,
  RideStatus.ACCEPTED,
  RideStatus.DRIVER_ARRIVED,
  RideStatus.STARTED,
];

@Injectable()
export class RideRequestsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(RideRequest)
    private readonly rides: Repository<RideRequest>,
    private readonly fares: FareService,
    private readonly pools: PoolsService,
    private readonly history: RideHistoryService,
  ) {}

  create(passengerId: string, dto: CreateRideRequestDto) {
    const fare = this.fares.estimate(
      dto.pickupZone,
      dto.destinationZone,
      dto.requestedSeats,
    );
    return this.dataSource.transaction(async (manager) => {
      await manager.getRepository(User).findOne({
        where: { id: passengerId },
        lock: { mode: 'pessimistic_write' },
      });
      if (
        await manager.getRepository(RideRequest).exists({
          where: { passengerId, status: In(ACTIVE_RIDE_STATUSES) },
        })
      ) {
        throw new ConflictException('You already have an active ride request');
      }
      const ride = await manager.getRepository(RideRequest).save(
        manager.getRepository(RideRequest).create({
          passengerId,
          pickupZone: dto.pickupZone,
          destinationZone: dto.destinationZone,
          requestedSeats: dto.requestedSeats,
          pickupLatitude: null,
          pickupLongitude: null,
          destinationLatitude: null,
          destinationLongitude: null,
          estimatedDistanceKm: fare.distanceKm.toFixed(2),
          baseFarePoisha: fare.baseFarePoisha,
          distanceChargePoisha: fare.distanceChargePoisha,
          poolDiscountPoisha: fare.poolDiscountPoisha,
          estimatedFarePoisha: fare.estimatedFarePoisha,
          finalFarePoisha: null,
          status: RideStatus.REQUESTED,
        }),
      );
      await this.history.record(manager, {
        rideRequestId: ride.id,
        previousStatus: null,
        newStatus: RideStatus.REQUESTED,
        changedBy: passengerId,
      });
      return { ...ride, poolId: null };
    });
  }

  async listMine(passengerId: string) {
    const rides = await this.rides.find({
      where: { passengerId },
      relations: { poolMember: { pool: { vehicle: true } } },
      order: { createdAt: 'DESC' },
    });
    return rides.map((ride) => ({
      ...ride,
      poolMember: ride.poolMember
        ? { poolId: ride.poolMember.poolId }
        : undefined,
      poolAssociation: ride.poolMember
        ? {
            vehicleName: ride.poolMember.pool.vehicle.name,
            status: ride.poolMember.pool.status,
            bookedSeats: ride.poolMember.seatsBooked,
          }
        : null,
    }));
  }

  async dashboardSummary(passengerId: string) {
    const rides = await this.rides.find({
      where: { passengerId },
      order: { createdAt: 'DESC' },
    });
    return {
      totalRides: rides.length,
      activeRides: rides.filter((ride) =>
        ACTIVE_RIDE_STATUSES.includes(ride.status),
      ).length,
      completedRides: rides.filter(
        (ride) => ride.status === RideStatus.COMPLETED,
      ).length,
      cancelledRides: rides.filter(
        (ride) => ride.status === RideStatus.CANCELLED,
      ).length,
      recentRides: rides.slice(0, 4).map((ride) => ({
        id: ride.id,
        pickupZone: ride.pickupZone,
        destinationZone: ride.destinationZone,
        requestedSeats: ride.requestedSeats,
        estimatedFarePoisha: ride.estimatedFarePoisha,
        finalFarePoisha: ride.finalFarePoisha,
        status: ride.status,
        createdAt: ride.createdAt,
      })),
    };
  }

  async detail(id: string, passengerId: string) {
    const ride = await this.rides.findOne({
      where: { id },
      relations: { poolMember: { pool: { vehicle: true } } },
    });
    if (!ride) throw new NotFoundException('Ride request not found');
    if (ride.passengerId !== passengerId)
      throw new ForbiddenException('You cannot view this ride request');
    return ride;
  }

  cancel(id: string, passengerId: string) {
    return this.dataSource.transaction(async (manager) => {
      const ride = await manager.getRepository(RideRequest).findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!ride) throw new NotFoundException('Ride request not found');
      if (ride.passengerId !== passengerId)
        throw new ForbiddenException('You cannot cancel this ride request');
      if (!canCancelRide(ride.status))
        throw new ConflictException('This ride can no longer be cancelled');
      const previousStatus = ride.status;
      assertRideTransition(previousStatus, RideStatus.CANCELLED);
      const poolId = await this.pools.releaseCancelledRide(manager, ride);
      ride.status = RideStatus.CANCELLED;
      await manager.getRepository(RideRequest).save(ride);
      await this.history.record(manager, {
        rideRequestId: ride.id,
        poolId,
        previousStatus,
        newStatus: RideStatus.CANCELLED,
        changedBy: passengerId,
      });
      return ride;
    });
  }
}
