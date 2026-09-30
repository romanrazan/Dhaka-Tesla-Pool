import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pool } from '../../pools/entities/pool.entity';
import { RideRequest } from '../../ride-requests/entities/ride-request.entity';
import { User } from '../../users/entities/user.entity';

@Entity('pool_members')
@Check('CHK_member_seats_positive', 'seats_booked > 0')
export class PoolMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pool_id', type: 'uuid' })
  poolId: string;

  @ManyToOne(() => Pool, (pool) => pool.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pool_id' })
  pool: Pool;

  @Column({ name: 'ride_request_id', type: 'uuid', unique: true })
  rideRequestId: string;

  @OneToOne(() => RideRequest, (ride) => ride.poolMember, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ride_request_id' })
  rideRequest: RideRequest;

  @Column({ name: 'passenger_id', type: 'uuid' })
  passengerId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'passenger_id' })
  passenger: User;

  @Column({ name: 'seats_booked', type: 'int' })
  seatsBooked: number;

  @Column({ name: 'individual_fare_poisha', type: 'int' })
  individualFarePoisha: number;

  @CreateDateColumn({ name: 'joined_at', type: 'timestamptz' })
  joinedAt: Date;
}
