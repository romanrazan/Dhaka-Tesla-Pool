# Finalized Requirements

## Scope

The MVP supports two roles: `PASSENGER` and `DRIVER`. Passengers authenticate, estimate fares, request/cancel rides, wait for driver selection, see only their own fare, status, and sanitized pool association, simulate payment, and review history. Drivers authenticate, take their vehicle online/offline, inspect waiting requests, manually accept compatible requests into their pool, mark arrival, start and complete it, and review history.

## Core rules

- JWT authentication protects private endpoints; role and resource ownership are enforced by the API.
- Passwords are bcrypt hashes and are never serialized.
- Dhaka geography uses predefined zones and deterministic corridor compatibility rather than a map provider.
- Money is stored as integer poisha. Fare logic is centralized and auditable.
- Pool membership is relational (`PoolMember`), not an embedded array.
- Requests stay `REQUESTED` until driver acceptance. An online driver can accept multiple waiting requests only when pickup zone and corridor match the active pool and seats remain; a `STARTED` pool is closed to new members.
- Capacity allocation uses a PostgreSQL transaction and pessimistic row lock.
- Ride status changes use one central transition policy and append audit history.
- Passenger APIs never expose another passenger's individual fare.
- Payments are simulated (`CASH`, `TESLA_PAY`); no external gateway is integrated.
- TypeORM synchronization is disabled; schema changes use migrations.
- Local development and verification are supported directly and through Docker Compose.

## Delivery constraints

No public deployment, microservices, Redis, queues, Kubernetes, map API, real payment provider, or global client-state library is included. Swagger documents the REST API. The seed story consistently uses Jashim, Bullet, Nusrat, Rafiq, and Shirin.

## API surface

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a passenger account |
| POST | `/auth/login` | Public | Authenticate and issue JWT |
| GET | `/auth/me` | Authenticated | Current user profile |
| GET | `/vehicles/me` | Driver | Driver's vehicle |
| PATCH | `/vehicles/me/online` | Driver | Make vehicle available |
| PATCH | `/vehicles/me/offline` | Driver | Make vehicle unavailable when idle |
| POST | `/fares/estimate` | Passenger | Calculate transparent estimate |
| POST | `/ride-requests` | Passenger | Create a waiting request |
| GET | `/ride-requests/my` | Passenger | Own current and past requests |
| GET | `/ride-requests/dashboard/summary` | Passenger | Own ride counts and recent rides |
| GET | `/ride-requests/:id` | Passenger | Own request details |
| PATCH | `/ride-requests/:id/cancel` | Passenger | Cancel before driver arrival |
| GET | `/driver/requests` | Driver | Waiting requests with availability reasons |
| POST | `/driver/requests/:id/accept` | Driver | Select a request for a compatible pool |
| GET | `/driver/pools/active` | Driver | Active assigned pool |
| GET | `/driver/history` | Driver | Completed ride history |
| GET | `/driver/dashboard/summary` | Driver | Own completed-pool statistics |
| GET | `/pools/:id` | Member/owner | Sanitized pool detail |
| GET | `/pools/:id/passengers` | Driver | Passenger and seat manifest |
| POST | `/pools/:id/accept` | Driver | Transition a legacy `MATCHING` pool to `ACCEPTED` |
| PATCH | `/pools/:id/arrived` | Driver | `ACCEPTED → DRIVER_ARRIVED` |
| PATCH | `/pools/:id/start` | Driver | `DRIVER_ARRIVED → STARTED` |
| PATCH | `/pools/:id/complete` | Driver | `STARTED → COMPLETED` |
| POST | `/payments` | Passenger | Record simulated payment |
| GET | `/payments/my` | Passenger | Own payments |
| GET | `/ride-history/my` | Passenger | Own immutable status history |

## Enums

- `UserRole`: `PASSENGER`, `DRIVER`
- `DhakaZone`: `BANANI`, `GULSHAN_1`, `GULSHAN_2`, `MOHAKHALI`, `DHANMONDI`, `MIRPUR`, `UTTARA`, `FARMGATE`, `BASHUNDHARA`
- `RideStatus`: `REQUESTED`, `MATCHED`, `ACCEPTED`, `DRIVER_ARRIVED`, `STARTED`, `COMPLETED`, `CANCELLED`
- `PoolStatus`: `MATCHING`, `ACCEPTED`, `DRIVER_ARRIVED`, `STARTED`, `COMPLETED`, `CANCELLED`
- `PaymentMethod`: `CASH`, `TESLA_PAY`
- `PaymentStatus`: `PENDING`, `PAID`, `FAILED`

## Planned migrations

1. `CreateCoreSchema`: enum types, users, vehicles, ride requests, pools, pool members, status history, payments, foreign keys, uniqueness rules, capacity checks, and query indexes.
2. Future schema changes receive new forward migrations; the initial migration is never edited after release.

## Implementation phases

1. Requirements, assumptions, architecture, ERD, folders, endpoints, enums, and migrations.
2. Scaffold Next.js/NestJS and shared tooling.
3. PostgreSQL/TypeORM configuration and core migration.
4. Users, authentication, roles, ownership, and vehicle availability.
5. Fare calculation, waiting requests, driver-selected compatible pool membership, and transactional seat allocation.
6. State machine, driver lifecycle, cancellation, audit history, and payment simulation.
7. Seed story and Swagger.
8. Frontend authentication, passenger experience, driver experience, validation, and resilient UI states.
9. Unit/integration/e2e tests, including concurrent final-seat allocation.
10. Docker images, Compose, clean-start verification, complete documentation, audit, pre-release, and release branches.
