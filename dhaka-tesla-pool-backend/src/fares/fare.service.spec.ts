import { BadRequestException } from '@nestjs/common';
import { DhakaZone } from '../common/enums/domain.enums';
import { FareService } from './fare.service';

describe('FareService', () => {
  const service = new FareService();

  it('calculates Nusrat’s Banani to Mohakhali fare in integer poisha', () => {
    expect(service.estimate(DhakaZone.BANANI, DhakaZone.MOHAKHALI, 1)).toEqual({
      distanceKm: 2.2,
      baseFarePoisha: 5_000,
      distanceChargePoisha: 3_300,
      poolDiscountPoisha: 1_660,
      estimatedFarePoisha: 6_640,
    });
  });

  it('applies the 20 percent pool discount to the full seat fare', () => {
    const fare = service.estimate(DhakaZone.BANANI, DhakaZone.GULSHAN_1, 2);
    expect(fare.poolDiscountPoisha).toBe(
      Math.round((fare.baseFarePoisha + fare.distanceChargePoisha) * 0.2),
    );
    expect(Number.isInteger(fare.estimatedFarePoisha)).toBe(true);
  });

  it('calculates Rafiq’s Banani to Gulshan 1 fare exactly', () => {
    expect(service.estimate(DhakaZone.BANANI, DhakaZone.GULSHAN_1, 1)).toEqual({
      distanceKm: 2.4,
      baseFarePoisha: 5_000,
      distanceChargePoisha: 3_600,
      poolDiscountPoisha: 1_720,
      estimatedFarePoisha: 6_880,
    });
  });

  it('rejects a trip that starts and ends in the same zone', () => {
    expect(() => service.estimate(DhakaZone.BANANI, DhakaZone.BANANI)).toThrow(
      BadRequestException,
    );
  });
});
