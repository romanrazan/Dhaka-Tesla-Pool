export type UserRole = 'PASSENGER' | 'DRIVER';
export type RideStatus = 'REQUESTED' | 'MATCHED' | 'ACCEPTED' | 'DRIVER_ARRIVED' | 'STARTED' | 'COMPLETED' | 'CANCELLED';
export type PoolStatus = 'MATCHING' | 'ACCEPTED' | 'DRIVER_ARRIVED' | 'STARTED' | 'COMPLETED' | 'CANCELLED';
export type DhakaZone = 'BANANI' | 'GULSHAN_1' | 'GULSHAN_2' | 'MOHAKHALI' | 'DHANMONDI' | 'MIRPUR' | 'UTTARA' | 'FARMGATE' | 'BASHUNDHARA';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
}

export interface AuthResponse { accessToken: string; user: User }
export interface FareEstimate {
  distanceKm: number;
  baseFarePoisha: number;
  distanceChargePoisha: number;
  poolDiscountPoisha: number;
  estimatedFarePoisha: number;
}
export interface RideRequest {
  id: string;
  pickupZone: DhakaZone;
  destinationZone: DhakaZone;
  requestedSeats: number;
  estimatedDistanceKm: string;
  estimatedFarePoisha: number;
  finalFarePoisha: number | null;
  status: RideStatus;
  createdAt: string;
  poolMember?: { poolId: string };
  poolAssociation?: { vehicleName: string; status: PoolStatus; bookedSeats: number } | null;
  poolId?: string | null;
}
export interface Vehicle {
  id: string;
  name: string;
  registrationNumber: string;
  capacity: number;
  isOnline: boolean;
}
export interface Pool {
  id: string;
  capacity: number;
  occupiedSeats: number;
  availableSeats?: number;
  status: PoolStatus;
  pickupZone: DhakaZone;
  corridor: string;
  memberCount?: number;
  vehicle?: Vehicle;
}
export interface Manifest {
  poolId?: string;
  capacity?: number;
  occupiedSeats?: number;
  passengers: Array<{
    passengerId: string;
    name: string;
    seatsBooked: number;
    pickupZone: DhakaZone;
    destinationZone: DhakaZone;
    status: RideStatus;
  }>;
}
export type DashboardRide = Pick<RideRequest, 'id' | 'pickupZone' | 'destinationZone' | 'requestedSeats' | 'estimatedFarePoisha' | 'finalFarePoisha' | 'status' | 'createdAt'>;
export interface PassengerDashboardSummary {
  totalRides: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
  recentRides: DashboardRide[];
}
export interface DriverDashboardSummary {
  todayRides: number;
  totalCompleted: number;
  passengersServed: number;
  dailyRides: Array<{ date: string; label: string; rides: number }>;
}
export interface AvailableRideRequest {
  id: string;
  passengerName: string;
  pickupZone: DhakaZone;
  destinationZone: DhakaZone;
  requestedSeats: number;
  createdAt: string;
  canAccept: boolean;
  unavailableReason: string | null;
}
export interface HistoryItem {
  id: string;
  rideRequestId: string;
  previousStatus: RideStatus | null;
  newStatus: RideStatus;
  changedAt: string;
  rideRequest?: { pickupZone: DhakaZone; destinationZone: DhakaZone };
}

