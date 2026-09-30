import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoreSchema1727300000000 implements MigrationInterface {
  name = 'CreateCoreSchema1727300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(
      `CREATE TYPE "users_role_enum" AS ENUM ('PASSENGER', 'DRIVER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "ride_requests_pickup_zone_enum" AS ENUM ('BANANI','GULSHAN_1','GULSHAN_2','MOHAKHALI','DHANMONDI','MIRPUR','UTTARA','FARMGATE','BASHUNDHARA')`,
    );
    await queryRunner.query(
      `CREATE TYPE "ride_requests_destination_zone_enum" AS ENUM ('BANANI','GULSHAN_1','GULSHAN_2','MOHAKHALI','DHANMONDI','MIRPUR','UTTARA','FARMGATE','BASHUNDHARA')`,
    );
    await queryRunner.query(
      `CREATE TYPE "ride_requests_status_enum" AS ENUM ('REQUESTED','MATCHED','ACCEPTED','DRIVER_ARRIVED','STARTED','COMPLETED','CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "pools_status_enum" AS ENUM ('MATCHING','ACCEPTED','DRIVER_ARRIVED','STARTED','COMPLETED','CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "pools_pickup_zone_enum" AS ENUM ('BANANI','GULSHAN_1','GULSHAN_2','MOHAKHALI','DHANMONDI','MIRPUR','UTTARA','FARMGATE','BASHUNDHARA')`,
    );
    await queryRunner.query(
      `CREATE TYPE "ride_status_history_previous_status_enum" AS ENUM ('REQUESTED','MATCHED','ACCEPTED','DRIVER_ARRIVED','STARTED','COMPLETED','CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "ride_status_history_new_status_enum" AS ENUM ('REQUESTED','MATCHED','ACCEPTED','DRIVER_ARRIVED','STARTED','COMPLETED','CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "payments_method_enum" AS ENUM ('CASH','TESLA_PAY')`,
    );
    await queryRunner.query(
      `CREATE TYPE "payments_status_enum" AS ENUM ('PENDING','PAID','FAILED')`,
    );

    await queryRunner.query(`CREATE TABLE "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "name" varchar(100) NOT NULL,
      "email" varchar(180) NOT NULL UNIQUE, "phone" varchar(30), "password_hash" varchar NOT NULL,
      "role" users_role_enum NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now())`);
    await queryRunner.query(`CREATE TABLE "vehicles" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "driver_id" uuid NOT NULL UNIQUE,
      "name" varchar(80) NOT NULL, "registration_number" varchar(40) NOT NULL UNIQUE,
      "capacity" integer NOT NULL, "is_online" boolean NOT NULL DEFAULT false,
      "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_vehicle_capacity_positive" CHECK (capacity > 0),
      CONSTRAINT "FK_vehicle_driver" FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE)`);
    await queryRunner.query(`CREATE TABLE "ride_requests" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "passenger_id" uuid NOT NULL,
      "pickup_zone" ride_requests_pickup_zone_enum NOT NULL,
      "destination_zone" ride_requests_destination_zone_enum NOT NULL,
      "requested_seats" integer NOT NULL, "pickup_latitude" decimal(9,6), "pickup_longitude" decimal(9,6),
      "destination_latitude" decimal(9,6), "destination_longitude" decimal(9,6),
      "estimated_distance_km" decimal(6,2) NOT NULL, "base_fare_poisha" integer NOT NULL,
      "distance_charge_poisha" integer NOT NULL, "pool_discount_poisha" integer NOT NULL,
      "estimated_fare_poisha" integer NOT NULL, "final_fare_poisha" integer,
      "status" ride_requests_status_enum NOT NULL DEFAULT 'REQUESTED',
      "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_ride_requested_seats" CHECK (requested_seats > 0 AND requested_seats <= 3),
      CONSTRAINT "FK_ride_passenger" FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE RESTRICT)`);
    await queryRunner.query(
      `CREATE INDEX "IDX_ride_passenger_status" ON "ride_requests" ("passenger_id", "status")`,
    );
    await queryRunner.query(`CREATE TABLE "pools" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "vehicle_id" uuid NOT NULL, "driver_id" uuid NOT NULL,
      "capacity" integer NOT NULL, "occupied_seats" integer NOT NULL DEFAULT 0,
      "status" pools_status_enum NOT NULL DEFAULT 'MATCHING', "pickup_zone" pools_pickup_zone_enum NOT NULL,
      "corridor" varchar(40) NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_pool_capacity" CHECK (capacity > 0 AND occupied_seats >= 0 AND occupied_seats <= capacity),
      CONSTRAINT "FK_pool_vehicle" FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
      CONSTRAINT "FK_pool_driver" FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE RESTRICT)`);
    await queryRunner.query(
      `CREATE INDEX "IDX_pool_matching" ON "pools" ("status", "pickup_zone", "corridor")`,
    );
    await queryRunner.query(`CREATE TABLE "pool_members" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "pool_id" uuid NOT NULL,
      "ride_request_id" uuid NOT NULL UNIQUE, "passenger_id" uuid NOT NULL,
      "seats_booked" integer NOT NULL, "individual_fare_poisha" integer NOT NULL,
      "joined_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "CHK_member_seats_positive" CHECK (seats_booked > 0),
      CONSTRAINT "FK_member_pool" FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE CASCADE,
      CONSTRAINT "FK_member_ride" FOREIGN KEY (ride_request_id) REFERENCES ride_requests(id) ON DELETE CASCADE,
      CONSTRAINT "FK_member_passenger" FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE RESTRICT)`);
    await queryRunner.query(
      `CREATE INDEX "IDX_member_pool" ON "pool_members" ("pool_id")`,
    );
    await queryRunner.query(`CREATE TABLE "ride_status_history" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "ride_request_id" uuid NOT NULL, "pool_id" uuid,
      "previous_status" ride_status_history_previous_status_enum,
      "new_status" ride_status_history_new_status_enum NOT NULL, "changed_by" uuid NOT NULL,
      "changed_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "FK_history_ride" FOREIGN KEY (ride_request_id) REFERENCES ride_requests(id) ON DELETE CASCADE,
      CONSTRAINT "FK_history_pool" FOREIGN KEY (pool_id) REFERENCES pools(id) ON DELETE SET NULL,
      CONSTRAINT "FK_history_actor" FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT)`);
    await queryRunner.query(
      `CREATE INDEX "IDX_history_ride" ON "ride_status_history" ("ride_request_id", "changed_at")`,
    );
    await queryRunner.query(`CREATE TABLE "payments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "ride_request_id" uuid NOT NULL UNIQUE,
      "passenger_id" uuid NOT NULL, "amount_poisha" integer NOT NULL,
      "method" payments_method_enum NOT NULL, "status" payments_status_enum NOT NULL,
      "transaction_reference" varchar(80), "paid_at" timestamptz,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "FK_payment_ride" FOREIGN KEY (ride_request_id) REFERENCES ride_requests(id) ON DELETE RESTRICT,
      CONSTRAINT "FK_payment_passenger" FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE RESTRICT)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "ride_status_history" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "pool_members" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pools" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ride_requests" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vehicles" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    for (const type of [
      'payments_status_enum',
      'payments_method_enum',
      'ride_status_history_new_status_enum',
      'ride_status_history_previous_status_enum',
      'pools_pickup_zone_enum',
      'pools_status_enum',
      'ride_requests_status_enum',
      'ride_requests_destination_zone_enum',
      'ride_requests_pickup_zone_enum',
      'users_role_enum',
    ]) {
      await queryRunner.query(`DROP TYPE IF EXISTS "${type}"`);
    }
  }
}
