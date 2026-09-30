import 'dotenv/config';
import { DataSource } from 'typeorm';
import { CreateCoreSchema1727300000000 } from './database/migrations/1727300000000-CreateCoreSchema';
import { Payment } from './payments/entities/payment.entity';
import { PoolMember } from './pool-members/entities/pool-member.entity';
import { Pool } from './pools/entities/pool.entity';
import { RideStatusHistory } from './ride-history/entities/ride-status-history.entity';
import { RideRequest } from './ride-requests/entities/ride-request.entity';
import { User } from './users/entities/user.entity';
import { Vehicle } from './vehicles/entities/vehicle.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'dhaka_tesla_pool',
  entities: [
    User,
    Vehicle,
    RideRequest,
    Pool,
    PoolMember,
    RideStatusHistory,
    Payment,
  ],
  migrations: [CreateCoreSchema1727300000000],
  synchronize: false,
});

export default dataSource;
