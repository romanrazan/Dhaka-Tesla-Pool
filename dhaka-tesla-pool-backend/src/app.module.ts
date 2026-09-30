import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { DriverModule } from './driver/driver.module';
import { FaresModule } from './fares/fares.module';
import { PaymentsModule } from './payments/payments.module';
import { PoolsModule } from './pools/pools.module';
import { RideHistoryModule } from './ride-history/ride-history.module';
import { RideRequestsModule } from './ride-requests/ride-requests.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', 'localhost'),
        port: Number(config.get('DATABASE_PORT', 5432)),
        username: config.get('DATABASE_USER', 'postgres'),
        password: config.get('DATABASE_PASSWORD', 'postgres'),
        database: config.get('DATABASE_NAME', 'dhaka_tesla_pool'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    UsersModule,
    AuthModule,
    VehiclesModule,
    FaresModule,
    PoolsModule,
    RideRequestsModule,
    RideHistoryModule,
    PaymentsModule,
    DriverModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
