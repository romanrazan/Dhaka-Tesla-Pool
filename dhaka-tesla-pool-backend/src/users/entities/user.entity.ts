import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../common/enums/domain.enums';
import { RideRequest } from '../../ride-requests/entities/ride-request.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 180 })
  email: string;

  @Column({ type: 'varchar', nullable: true, length: 30 })
  phone: string | null;

  @Exclude()
  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @OneToOne(() => Vehicle, (vehicle) => vehicle.driver)
  vehicle?: Vehicle;

  @OneToMany(() => RideRequest, (ride) => ride.passenger)
  rideRequests?: RideRequest[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
