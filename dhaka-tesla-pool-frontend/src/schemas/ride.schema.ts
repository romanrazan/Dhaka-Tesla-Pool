import { z } from 'zod';
export const rideSchema = z.object({
  pickupZone: z.string().min(1),
  destinationZone: z.string().min(1),
  requestedSeats: z.number().int().min(1).max(3),
}).refine((value) => value.pickupZone !== value.destinationZone, {
  message: 'Pickup and destination must be different', path: ['destinationZone'],
});
export type RideValues = z.infer<typeof rideSchema>;
