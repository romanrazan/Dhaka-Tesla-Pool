# Assumptions

- The MVP supports one vehicle per driver. A database uniqueness constraint enforces this.
- A vehicle can have at most one non-terminal pool at a time.
- A passenger can have at most one non-terminal ride request at a time; the service enforces it transactionally.
- All selected zones have fixed representative distances. This is intentionally not turn-by-turn routing.
- New requests remain `REQUESTED` until an online driver selects them. The driver sees waiting requests with an acceptability flag and reason when one cannot currently be accepted.
- Acceptance creates an `ACCEPTED` pool for the driver's vehicle or adds the rider to that driver's compatible active pool. The ride passes through `MATCHED` and `ACCEPTED` (and `DRIVER_ARRIVED` if joining after arrival).
- Requests are compatible with an active pool when pickup zones and corridor keys are equal. `BANANI` to `MOHAKHALI`, `GULSHAN_1`, or `GULSHAN_2` uses `BANANI_CENTRAL`; configured `NORTH_LINK` and `WEST_CENTRAL` destinations also share their respective keys. Other pairs use an exact-route key, so only the same pickup and destination match. A driver may add compatible passengers while the pool is `ACCEPTED` or `DRIVER_ARRIVED`, subject to available seats; no passenger can join once it is `STARTED`.
- Cancellation is allowed in `REQUESTED`, `MATCHED`, or `ACCEPTED`, but not after `DRIVER_ARRIVED`. A cancellation removes the membership and decrements occupied seats inside the same locked transaction.
- When the last member cancels, its pool is cancelled. The vehicle remains online unless the driver explicitly takes it offline.
- Estimated and final fare are equal for the MVP. The final fare is set when the driver accepts the request, not when the request is created.
- Fare formula: BDT 50 base + BDT 15/km, followed by a 20% pool discount. All intermediate/result values are integer poisha and percentage rounding uses nearest integer.
- One payment per ride request is permitted after completion. Both `CASH` and `TESLA_PAY` are recorded as `PAID`; TeslaPay receives a generated reference.
- Passenger pool detail includes aggregate seats and only the caller's membership/fare. The passenger ride list includes only that passenger's sanitized Tesla name, pool status, and booked seats. Other member identities/fares are not returned there.
- Seed credentials are development-only and documented. Seed execution is idempotent.
