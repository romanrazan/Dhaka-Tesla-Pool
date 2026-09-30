import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pool } from '../../pools/entities/pool.entity';
import { User } from '../../users/entities/user.entity';

@Entity('vehicles')
@Check('CHK_vehicle_capacity_positive', 'capacity > 0')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'driver_id', type: 'uuid', unique: true })
  driverId: string;

  @ManyToOne(() => User, (user) => user.vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_id' })
  driver: User;

  @Column({ length: 80 })
  name: string;

  @Column({ name: 'registration_number', unique: true, length: 40 })
  registrationNumber: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ name: 'is_online', default: false })
  isOnline: boolean;

  @OneToMany(() => Pool, (pool) => pool.vehicle)
  pools?: Pool[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
