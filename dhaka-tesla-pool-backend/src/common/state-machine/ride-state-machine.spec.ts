import { BadRequestException } from '@nestjs/common';
import { RideStatus } from '../enums/domain.enums';
import { assertRideTransition, canCancelRide } from './ride-state-machine';

describe('ride state machine', () => {
  it('allows the documented forward lifecycle', () => {
    expect(() =>
      assertRideTransition(RideStatus.REQUESTED, RideStatus.MATCHED),
    ).not.toThrow();
    expect(() =>
      assertRideTransition(RideStatus.STARTED, RideStatus.COMPLETED),
    ).not.toThrow();
  });

  it('prevents STARTED from jumping backward to REQUESTED', () => {
    expect(() =>
      assertRideTransition(RideStatus.STARTED, RideStatus.REQUESTED),
    ).toThrow(BadRequestException);
  });

  it('prevents REQUESTED from jumping directly to COMPLETED', () => {
    expect(() =>
      assertRideTransition(RideStatus.REQUESTED, RideStatus.COMPLETED),
    ).toThrow(BadRequestException);
  });

  it('enforces the cancellation cutoff', () => {
    expect(canCancelRide(RideStatus.ACCEPTED)).toBe(true);
    expect(canCancelRide(RideStatus.DRIVER_ARRIVED)).toBe(false);
    expect(canCancelRide(RideStatus.COMPLETED)).toBe(false);
  });
});
