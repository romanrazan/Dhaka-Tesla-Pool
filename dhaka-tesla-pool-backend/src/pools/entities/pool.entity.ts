import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DhakaZone, PoolStatus } from '../../common/enums/domain.enums';
import { PoolMember } from '../../pool-members/entities/pool-member.entity';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity('pools')
@Check(
  'CHK_pool_capacity',
  'capacity > 0 AND occupied_seats >= 0 AND occupied_seats <= capacity',
)
@Index('IDX_pool_matching', ['status', 'pickupZone', 'corridor'])
export class Pool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehicleId: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.pools, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ name: 'driver_id', type: 'uuid' })
  driverId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'driver_id' })
  driver: User;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ name: 'occupied_seats', type: 'int', default: 0 })
  occupiedSeats: number;

  @Column({ type: 'enum', enum: PoolStatus, default: PoolStatus.MATCHING })
  status: PoolStatus;

  @Column({ name: 'pickup_zone', type: 'enum', enum: DhakaZone })
  pickupZone: DhakaZone;

  @Column({ length: 40 })
  corridor: string;

  @OneToMany(() => PoolMember, (member) => member.pool)
  members?: PoolMember[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
