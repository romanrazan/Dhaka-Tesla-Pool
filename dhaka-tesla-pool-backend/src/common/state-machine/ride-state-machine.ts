import { BadRequestException } from '@nestjs/common';
import { RideStatus } from '../enums/domain.enums';

const TRANSITIONS: Record<RideStatus, readonly RideStatus[]> = {
  REQUESTED: [RideStatus.MATCHED, RideStatus.CANCELLED],
  MATCHED: [RideStatus.ACCEPTED, RideStatus.CANCELLED],
  ACCEPTED: [RideStatus.DRIVER_ARRIVED, RideStatus.CANCELLED],
  DRIVER_ARRIVED: [RideStatus.STARTED],
  STARTED: [RideStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
};

export function assertRideTransition(from: RideStatus, to: RideStatus): void {
  if (!TRANSITIONS[from].includes(to)) {
    throw new BadRequestException(`Invalid ride transition: ${from} → ${to}`);
  }
}

export function canCancelRide(status: RideStatus): boolean {
  return [
    RideStatus.REQUESTED,
    RideStatus.MATCHED,
    RideStatus.ACCEPTED,
  ].includes(status);
}
