import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RideStatus } from '../../common/enums/domain.enums';
import { Pool } from '../../pools/entities/pool.entity';
import { RideRequest } from '../../ride-requests/entities/ride-request.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ride_status_history')
export class RideStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ride_request_id', type: 'uuid' })
  rideRequestId: string;

  @ManyToOne(() => RideRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ride_request_id' })
  rideRequest: RideRequest;

  @Column({ name: 'pool_id', type: 'uuid', nullable: true })
  poolId: string | null;

  @ManyToOne(() => Pool, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pool_id' })
  pool: Pool | null;

  @Column({
    name: 'previous_status',
    type: 'enum',
    enum: RideStatus,
    nullable: true,
  })
  previousStatus: RideStatus | null;

  @Column({ name: 'new_status', type: 'enum', enum: RideStatus })
  newStatus: RideStatus;

  @Column({ name: 'changed_by', type: 'uuid' })
  changedBy: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'changed_by' })
  actor: User;

  @CreateDateColumn({ name: 'changed_at', type: 'timestamptz' })
  changedAt: Date;
}
