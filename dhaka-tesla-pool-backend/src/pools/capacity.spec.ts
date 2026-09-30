import { ConflictException } from '@nestjs/common';
import { assertSeatCapacity } from './capacity';

describe('transactional seat capacity invariant', () => {
  it('allows one claimant and rejects the competing claimant after locked-state recalculation', () => {
    const capacity = 3;
    let occupiedSeats = 2;
    expect(() => assertSeatCapacity(capacity, occupiedSeats, 1)).not.toThrow();
    occupiedSeats += 1;
    expect(() => assertSeatCapacity(capacity, occupiedSeats, 1)).toThrow(
      ConflictException,
    );
    expect(occupiedSeats).toBe(3);
  });

  it('rejects requests larger than remaining capacity', () => {
    expect(() => assertSeatCapacity(3, 1, 3)).toThrow(ConflictException);
  });
});
