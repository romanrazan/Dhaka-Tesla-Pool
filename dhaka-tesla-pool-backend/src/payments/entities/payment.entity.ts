import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentMethod, PaymentStatus } from '../../common/enums/domain.enums';
import { RideRequest } from '../../ride-requests/entities/ride-request.entity';
import { User } from '../../users/entities/user.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ride_request_id', type: 'uuid', unique: true })
  rideRequestId: string;

  @OneToOne(() => RideRequest, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ride_request_id' })
  rideRequest: RideRequest;

  @Column({ name: 'passenger_id', type: 'uuid' })
  passengerId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'passenger_id' })
  passenger: User;

  @Column({ name: 'amount_poisha', type: 'int' })
  amountPoisha: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;

  @Column({
    name: 'transaction_reference',
    type: 'varchar',
    nullable: true,
    length: 80,
  })
  transactionReference: string | null;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
