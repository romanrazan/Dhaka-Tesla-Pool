import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { PoolStatus, RideStatus, UserRole } from '../common/enums/domain.enums';
import { assertRideTransition } from '../common/state-machine/ride-state-machine';
import { PoolMember } from '../pool-members/entities/pool-member.entity';
import { RideHistoryService } from '../ride-history/ride-history.service';
import { RideStatusHistory } from '../ride-history/entities/ride-status-history.entity';
import { RideRequest } from '../ride-requests/entities/ride-request.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { assertSeatCapacity } from './capacity';
import { Pool } from './entities/pool.entity';
import { corridorFor } from './route-compatibility';

const ACTIVE_POOL_STATUSES = [
  PoolStatus.MATCHING,
  PoolStatus.ACCEPTED,
  PoolStatus.DRIVER_ARRIVED,
  PoolStatus.STARTED,
];

const dhakaDateKey = (value: Date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
};

@Injectable()
export class PoolsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Pool) private readonly pools: Repository<Pool>,
    @InjectRepository(PoolMember)
    private readonly members: Repository<PoolMember>,
    private readonly history: RideHistoryService,
  ) {}

  async availableRequestsForDriver(driverId: string) {
    const [rides, vehicle, pool] = await Promise.all([
      this.dataSource.getRepository(RideRequest).find({
        where: { status: RideStatus.REQUESTED },
        relations: { passenger: true },
        order: { createdAt: 'ASC', id: 'ASC' },
      }),
      this.dataSource.getRepository(Vehicle).findOne({ where: { driverId } }),
      this.activeForDriver(driverId),
    ]);

    return rides.map((ride) => {
      const corridor = corridorFor(ride.pickupZone, ride.destinationZone);
      let unavailableReason: string | null = null;
      if (!vehicle?.isOnline) {
        unavailableReason = 'Go online to accept rides.';
      } else if (pool?.status === PoolStatus.STARTED) {
        unavailableReason = 'The ride has already started.';
      } else if (
        pool &&
        (pool.pickupZone !== ride.pickupZone || pool.corridor !== corridor)
      ) {
        unavailableReason =
          'This route is not compatible with the current pool.';
      } else if (
        ride.requestedSeats >
        (pool ? pool.capacity - pool.occupiedSeats : vehicle.capacity)
      ) {
        unavailableReason = 'Not enough seats available.';
      }
      return {
        id: ride.id,
        passengerName: ride.passenger.name,
        pickupZone: ride.pickupZone,
        destinationZone: ride.destinationZone,
        requestedSeats: ride.requestedSeats,
        createdAt: ride.createdAt,
        canAccept: unavailableReason === null,
        unavailableReason,
      };
    });
  }

  acceptRideRequest(driverId: string, rideId: string) {
    return this.dataSource.transaction(async (manager) => {
      const rides = manager.getRepository(RideRequest);
      const ride = await rides.findOne({
        where: { id: rideId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!ride || ride.status !== RideStatus.REQUESTED) {
        throw new ConflictException('This ride is no longer available.');
      }

      const vehicle = await manager.getRepository(Vehicle).findOne({
        where: { driverId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!vehicle)
        throw new NotFoundException('No vehicle is assigned to this driver');
      if (!vehicle.isOnline) {
        throw new ConflictException('Go online to accept rides.');
      }

      const pools = manager.getRepository(Pool);
      let pool = await pools.findOne({
        where: { vehicleId: vehicle.id, status: In(ACTIVE_POOL_STATUSES) },
        lock: { mode: 'pessimistic_write' },
        order: { createdAt: 'DESC' },
      });
      if (pool?.status === PoolStatus.STARTED) {
        throw new ConflictException('The ride has already started.');
      }

      const corridor = corridorFor(ride.pickupZone, ride.destinationZone);
      if (
        pool &&
        (pool.pickupZone !== ride.pickupZone || pool.corridor !== corridor)
      ) {
        throw new ConflictException(
          'This route is not compatible with the current pool.',
        );
      }

      const occupiedSeats = pool
        ? await manager
            .getRepository(PoolMember)
            .createQueryBuilder('member')
            .select('COALESCE(SUM(member.seatsBooked), 0)', 'seats')
            .where('member.poolId = :poolId', { poolId: pool.id })
            .getRawOne<{ seats: string }>()
        : null;
      const currentSeats = Number(occupiedSeats?.seats ?? 0);
      assertSeatCapacity(
        pool?.capacity ?? vehicle.capacity,
        currentSeats,
        ride.requestedSeats,
      );

      if (!pool) {
        pool = await pools.save(
          pools.create({
            vehicleId: vehicle.id,
            driverId,
            capacity: vehicle.capacity,
            occupiedSeats: 0,
            status: PoolStatus.ACCEPTED,
            pickupZone: ride.pickupZone,
            corridor,
          }),
        );
      } else if (pool.status === PoolStatus.MATCHING) {
        const existingMembers = await manager.getRepository(PoolMember).find({
          where: { poolId: pool.id },
          relations: { rideRequest: true },
        });
        for (const member of existingMembers) {
          const existingRide = member.rideRequest;
          assertRideTransition(existingRide.status, RideStatus.ACCEPTED);
          existingRide.status = RideStatus.ACCEPTED;
          await rides.save(existingRide);
          await this.history.record(manager, {
            rideRequestId: existingRide.id,
            poolId: pool.id,
            previousStatus: RideStatus.MATCHED,
            newStatus: RideStatus.ACCEPTED,
            changedBy: driverId,
          });
        }
        pool.status = PoolStatus.ACCEPTED;
      }

      await manager.getRepository(PoolMember).save(
        manager.getRepository(PoolMember).create({
          poolId: pool.id,
          rideRequestId: ride.id,
          passengerId: ride.passengerId,
          seatsBooked: ride.requestedSeats,
          individualFarePoisha: ride.estimatedFarePoisha,
        }),
      );
      pool.occupiedSeats = currentSeats + ride.requestedSeats;
      await pools.save(pool);

      const statuses = [RideStatus.MATCHED, RideStatus.ACCEPTED];
      if (pool.status === PoolStatus.DRIVER_ARRIVED) {
        statuses.push(RideStatus.DRIVER_ARRIVED);
      }
      for (const status of statuses) {
        const previousStatus = ride.status;
        assertRideTransition(previousStatus, status);
        ride.status = status;
        if (status === RideStatus.MATCHED) {
          ride.finalFarePoisha = ride.estimatedFarePoisha;
        }
        await rides.save(ride);
        await this.history.record(manager, {
          rideRequestId: ride.id,
          poolId: pool.id,
          previousStatus,
          newStatus: status,
          changedBy: driverId,
        });
      }
      return pool;
    });
  }

  async releaseCancelledRide(
    manager: EntityManager,
    ride: RideRequest,
  ): Promise<string | null> {
    const member = await manager
      .getRepository(PoolMember)
      .findOne({ where: { rideRequestId: ride.id } });
    if (!member) return null;
    const pool = await manager.getRepository(Pool).findOne({
      where: { id: member.poolId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!pool) return null;
    await manager.getRepository(PoolMember).remove(member);
    pool.occupiedSeats = Math.max(0, pool.occupiedSeats - member.seatsBooked);
    if (pool.occupiedSeats === 0) pool.status = PoolStatus.CANCELLED;
    await manager.getRepository(Pool).save(pool);
    return pool.id;
  }

  async detail(id: string, user: User) {
    const pool = await this.pools.findOne({
      where: { id },
      relations: { vehicle: true, members: true },
    });
    if (!pool) throw new NotFoundException('Pool not found');
    const isDriver = user.role === UserRole.DRIVER && pool.driverId === user.id;
    const ownMember = pool.members?.find(
      (member) => member.passengerId === user.id,
    );
    if (!isDriver && !ownMember)
      throw new ForbiddenException('You cannot view this pool');
    return {
      id: pool.id,
      vehicle: {
        id: pool.vehicle.id,
        name: pool.vehicle.name,
        registrationNumber: pool.vehicle.registrationNumber,
      },
      capacity: pool.capacity,
      occupiedSeats: pool.occupiedSeats,
      availableSeats: pool.capacity - pool.occupiedSeats,
      status: pool.status,
      pickupZone: pool.pickupZone,
      corridor: pool.corridor,
      memberCount: pool.members?.length ?? 0,
      ...(ownMember
        ? {
            mySeats: ownMember.seatsBooked,
            myFarePoisha: ownMember.individualFarePoisha,
          }
        : {}),
    };
  }

  async passengerManifest(poolId: string, driverId: string) {
    const pool = await this.requireOwnedPool(poolId, driverId);
    const members = await this.members.find({
      where: { poolId },
      relations: { passenger: true, rideRequest: true },
      order: { joinedAt: 'ASC' },
    });
    return {
      poolId: pool.id,
      capacity: pool.capacity,
      occupiedSeats: pool.occupiedSeats,
      passengers: members.map((member) => ({
        passengerId: member.passengerId,
        name: member.passenger.name,
        seatsBooked: member.seatsBooked,
        pickupZone: member.rideRequest.pickupZone,
        destinationZone: member.rideRequest.destinationZone,
        status: member.rideRequest.status,
      })),
    };
  }

  transition(
    poolId: string,
    driverId: string,
    action: 'accept' | 'arrived' | 'start' | 'complete',
  ) {
    return this.dataSource.transaction(async (manager) => {
      const pool = await manager.getRepository(Pool).findOne({
        where: { id: poolId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!pool) throw new NotFoundException('Pool not found');
      if (pool.driverId !== driverId)
        throw new ForbiddenException('This pool is assigned to another driver');
      const rules = {
        accept: {
          from: PoolStatus.MATCHING,
          to: PoolStatus.ACCEPTED,
          ride: RideStatus.ACCEPTED,
        },
        arrived: {
          from: PoolStatus.ACCEPTED,
          to: PoolStatus.DRIVER_ARRIVED,
          ride: RideStatus.DRIVER_ARRIVED,
        },
        start: {
          from: PoolStatus.DRIVER_ARRIVED,
          to: PoolStatus.STARTED,
          ride: RideStatus.STARTED,
        },
        complete: {
          from: PoolStatus.STARTED,
          to: PoolStatus.COMPLETED,
          ride: RideStatus.COMPLETED,
        },
      } as const;
      const rule = rules[action];
      if (pool.status !== rule.from) {
        throw new ConflictException(
          `Pool must be ${rule.from} before ${action}`,
        );
      }
      const members = await manager.getRepository(PoolMember).find({
        where: { poolId: pool.id },
        relations: { rideRequest: true },
        order: { joinedAt: 'ASC' },
      });
      for (const member of members) {
        const ride = member.rideRequest;
        assertRideTransition(ride.status, rule.ride);
        const previousStatus = ride.status;
        ride.status = rule.ride;
        await manager.getRepository(RideRequest).save(ride);
        await this.history.record(manager, {
          rideRequestId: ride.id,
          poolId: pool.id,
          previousStatus,
          newStatus: rule.ride,
          changedBy: driverId,
        });
      }
      pool.status = rule.to;
      return manager.getRepository(Pool).save(pool);
    });
  }

  activeForDriver(driverId: string) {
    return this.pools.findOne({
      where: { driverId, status: In(ACTIVE_POOL_STATUSES) },
      relations: { vehicle: true },
      order: { createdAt: 'DESC' },
    });
  }

  historyForDriver(driverId: string) {
    return this.pools.find({
      where: {
        driverId,
        status: In([PoolStatus.COMPLETED, PoolStatus.CANCELLED]),
      },
      relations: { vehicle: true },
      order: { updatedAt: 'DESC' },
    });
  }

  async dashboardSummaryForDriver(driverId: string) {
    const completed = await this.pools.find({
      where: { driverId, status: PoolStatus.COMPLETED },
      relations: { members: true },
    });
    const completionHistory = completed.length
      ? await this.dataSource.getRepository(RideStatusHistory).find({
          where: {
            poolId: In(completed.map((pool) => pool.id)),
            newStatus: RideStatus.COMPLETED,
          },
          select: { poolId: true, changedAt: true },
          order: { changedAt: 'ASC' },
        })
      : [];
    const completedAt = new Map<string, Date>();
    for (const event of completionHistory) {
      if (event.poolId && !completedAt.has(event.poolId))
        completedAt.set(event.poolId, event.changedAt);
    }
    const counts = new Map<string, number>();
    for (const pool of completed) {
      const date = dhakaDateKey(completedAt.get(pool.id) ?? pool.updatedAt);
      counts.set(date, (counts.get(date) ?? 0) + 1);
    }
    const today = dhakaDateKey(new Date());
    const todayUtc = new Date(`${today}T00:00:00.000Z`);
    const dailyRides = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(todayUtc);
      day.setUTCDate(day.getUTCDate() - (6 - index));
      const date = day.toISOString().slice(0, 10);
      return {
        date,
        label: new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          timeZone: 'UTC',
        }).format(day),
        rides: counts.get(date) ?? 0,
      };
    });
    return {
      todayRides: counts.get(today) ?? 0,
      totalCompleted: completed.length,
      passengersServed: completed.reduce(
        (total, pool) =>
          total +
          new Set(pool.members?.map((member) => member.passengerId) ?? []).size,
        0,
      ),
      dailyRides,
    };
  }

  private async requireOwnedPool(poolId: string, driverId: string) {
    const pool = await this.pools.findOne({ where: { id: poolId } });
    if (!pool) throw new NotFoundException('Pool not found');
    if (pool.driverId !== driverId)
      throw new ForbiddenException('This pool is assigned to another driver');
    return pool;
  }
}
