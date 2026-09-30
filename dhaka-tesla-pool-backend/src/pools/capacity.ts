import { ConflictException } from '@nestjs/common';

export function assertSeatCapacity(
  capacity: number,
  occupiedSeats: number,
  requestedSeats: number,
): void {
  if (occupiedSeats + requestedSeats > capacity) {
    throw new ConflictException(
      'The pool no longer has enough available seats',
    );
  }
}
