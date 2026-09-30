import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DhakaZone, RideStatus } from '../../common/enums/domain.enums';
import { PoolMember } from '../../pool-members/entities/pool-member.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ride_requests')
@Check(
  'CHK_ride_requested_seats',
  'requested_seats > 0 AND requested_seats <= 3',
)
@Index('IDX_ride_passenger_status', ['passengerId', 'status'])
export class RideRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'passenger_id', type: 'uuid' })
  passengerId: string;

  @ManyToOne(() => User, (user) => user.rideRequests, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'passenger_id' })
  passenger: User;

  @Column({ name: 'pickup_zone', type: 'enum', enum: DhakaZone })
  pickupZone: DhakaZone;

  @Column({ name: 'destination_zone', type: 'enum', enum: DhakaZone })
  destinationZone: DhakaZone;

  @Column({ name: 'requested_seats', type: 'int' })
  requestedSeats: number;

  @Column({
    name: 'pickup_latitude',
    type: 'decimal',
    precision: 9,
    scale: 6,
    nullable: true,
  })
  pickupLatitude: string | null;

  @Column({
    name: 'pickup_longitude',
    type: 'decimal',
    precision: 9,
    scale: 6,
    nullable: true,
  })
  pickupLongitude: string | null;

  @Column({
    name: 'destination_latitude',
    type: 'decimal',
    precision: 9,
    scale: 6,
    nullable: true,
  })
  destinationLatitude: string | null;

  @Column({
    name: 'destination_longitude',
    type: 'decimal',
    precision: 9,
    scale: 6,
    nullable: true,
  })
  destinationLongitude: string | null;

  @Column({
    name: 'estimated_distance_km',
    type: 'decimal',
    precision: 6,
    scale: 2,
  })
  estimatedDistanceKm: string;

  @Column({ name: 'base_fare_poisha', type: 'int' })
  baseFarePoisha: number;

  @Column({ name: 'distance_charge_poisha', type: 'int' })
  distanceChargePoisha: number;

  @Column({ name: 'pool_discount_poisha', type: 'int' })
  poolDiscountPoisha: number;

  @Column({ name: 'estimated_fare_poisha', type: 'int' })
  estimatedFarePoisha: number;

  @Column({ name: 'final_fare_poisha', type: 'int', nullable: true })
  finalFarePoisha: number | null;

  @Column({ type: 'enum', enum: RideStatus, default: RideStatus.REQUESTED })
  status: RideStatus;

  @OneToOne(() => PoolMember, (member) => member.rideRequest)
  poolMember?: PoolMember;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
