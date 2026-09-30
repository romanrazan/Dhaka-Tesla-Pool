import { BadRequestException, Injectable } from '@nestjs/common';
import { DhakaZone } from '../common/enums/domain.enums';

export const FARE_CONFIG = {
  baseFarePoisha: 5_000,
  perKmPoisha: 1_500,
  poolDiscountPercent: 20,
} as const;

const ZONE_DISTANCE_KM: Record<DhakaZone, Record<DhakaZone, number>> = {
  BANANI: {
    BANANI: 0,
    GULSHAN_1: 2.4,
    GULSHAN_2: 2.9,
    MOHAKHALI: 2.2,
    DHANMONDI: 8.1,
    MIRPUR: 9.4,
    UTTARA: 10.8,
    FARMGATE: 5.8,
    BASHUNDHARA: 6.3,
  },
  GULSHAN_1: {
    BANANI: 2.4,
    GULSHAN_1: 0,
    GULSHAN_2: 1.4,
    MOHAKHALI: 3.2,
    DHANMONDI: 8.8,
    MIRPUR: 10.2,
    UTTARA: 11.4,
    FARMGATE: 6.6,
    BASHUNDHARA: 5.2,
  },
  GULSHAN_2: {
    BANANI: 2.9,
    GULSHAN_1: 1.4,
    GULSHAN_2: 0,
    MOHAKHALI: 4.0,
    DHANMONDI: 9.5,
    MIRPUR: 10.9,
    UTTARA: 10.6,
    FARMGATE: 7.3,
    BASHUNDHARA: 4.3,
  },
  MOHAKHALI: {
    BANANI: 2.2,
    GULSHAN_1: 3.2,
    GULSHAN_2: 4.0,
    MOHAKHALI: 0,
    DHANMONDI: 6.6,
    MIRPUR: 7.7,
    UTTARA: 12.2,
    FARMGATE: 3.8,
    BASHUNDHARA: 8.1,
  },
  DHANMONDI: {
    BANANI: 8.1,
    GULSHAN_1: 8.8,
    GULSHAN_2: 9.5,
    MOHAKHALI: 6.6,
    DHANMONDI: 0,
    MIRPUR: 7.2,
    UTTARA: 16.2,
    FARMGATE: 4.1,
    BASHUNDHARA: 12.8,
  },
  MIRPUR: {
    BANANI: 9.4,
    GULSHAN_1: 10.2,
    GULSHAN_2: 10.9,
    MOHAKHALI: 7.7,
    DHANMONDI: 7.2,
    MIRPUR: 0,
    UTTARA: 12.1,
    FARMGATE: 7.5,
    BASHUNDHARA: 14.2,
  },
  UTTARA: {
    BANANI: 10.8,
    GULSHAN_1: 11.4,
    GULSHAN_2: 10.6,
    MOHAKHALI: 12.2,
    DHANMONDI: 16.2,
    MIRPUR: 12.1,
    UTTARA: 0,
    FARMGATE: 14.4,
    BASHUNDHARA: 10.2,
  },
  FARMGATE: {
    BANANI: 5.8,
    GULSHAN_1: 6.6,
    GULSHAN_2: 7.3,
    MOHAKHALI: 3.8,
    DHANMONDI: 4.1,
    MIRPUR: 7.5,
    UTTARA: 14.4,
    FARMGATE: 0,
    BASHUNDHARA: 11.0,
  },
  BASHUNDHARA: {
    BANANI: 6.3,
    GULSHAN_1: 5.2,
    GULSHAN_2: 4.3,
    MOHAKHALI: 8.1,
    DHANMONDI: 12.8,
    MIRPUR: 14.2,
    UTTARA: 10.2,
    FARMGATE: 11.0,
    BASHUNDHARA: 0,
  },
};

@Injectable()
export class FareService {
  estimate(pickupZone: DhakaZone, destinationZone: DhakaZone, seats = 1) {
    if (pickupZone === destinationZone) {
      throw new BadRequestException('Pickup and destination must be different');
    }
    const distanceKm = ZONE_DISTANCE_KM[pickupZone][destinationZone];
    const baseFarePoisha = FARE_CONFIG.baseFarePoisha * seats;
    const distanceChargePoisha =
      Math.round(distanceKm * FARE_CONFIG.perKmPoisha) * seats;
    const fareBeforeDiscountPoisha = baseFarePoisha + distanceChargePoisha;
    const poolDiscountPoisha = Math.round(
      (fareBeforeDiscountPoisha * FARE_CONFIG.poolDiscountPercent) / 100,
    );
    return {
      distanceKm,
      baseFarePoisha,
      distanceChargePoisha,
      poolDiscountPoisha,
      estimatedFarePoisha: fareBeforeDiscountPoisha - poolDiscountPoisha,
    };
  }
}
