import request from 'supertest';

type PoolBody = {
  id: string;
  status: string;
  occupiedSeats: number;
  capacity: number;
};
type RideBody = {
  id: string;
  status: string;
  poolId: string | null;
  poolMember?: { poolId: string };
  poolAssociation?: {
    vehicleName: string;
    status: string;
    bookedSeats: number;
  } | null;
};
type ManifestBody = { passengers: Array<{ name: string }> };

function jsonBody<T>(response: { body: unknown }): T {
  return response.body as T;
}

// Run against a separately migrated and seeded database via DRIVER_ACCEPT_TEST_API_URL.
const testUrl = process.env.DRIVER_ACCEPT_TEST_API_URL;
const api = request(testUrl ?? 'http://localhost:4000');
const describeDriverAccept = testUrl ? describe : describe.skip;

describeDriverAccept('manual driver ride acceptance (e2e)', () => {
  const password = 'Pool123!';
  const route = { pickupZone: 'MOHAKHALI', destinationZone: 'BASHUNDHARA' };
  const tokens: Record<string, string> = {};
  let driverToken: string;
  let poolId: string;
  let twoSeatRideId: string;
  let unique = 0;

  async function login(email: string) {
    const response = await api
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);
    return jsonBody<{ accessToken: string }>(response).accessToken;
  }

  async function register(name: string) {
    const email = `driver-accept-${Date.now()}-${unique++}@example.com`;
    const response = await api
      .post('/api/auth/register')
      .send({ name, email, password })
      .expect(201);
    return jsonBody<{ accessToken: string }>(response).accessToken;
  }

  async function createRide(
    token: string,
    requestedSeats = 1,
    pickupZone = route.pickupZone,
    destinationZone = route.destinationZone,
  ) {
    const response = await api
      .post('/api/ride-requests')
      .auth(token, { type: 'bearer' })
      .send({ pickupZone, destinationZone, requestedSeats })
      .expect(201);
    const ride = jsonBody<RideBody>(response);
    expect(ride.status).toBe('REQUESTED');
    expect(ride.poolId).toBeNull();
    return ride.id;
  }

  async function available() {
    const response = await api
      .get('/api/driver/requests')
      .auth(driverToken, { type: 'bearer' })
      .expect(200);
    return jsonBody<
      Array<{
        id: string;
        passengerName: string;
        canAccept: boolean;
        unavailableReason: string | null;
      }>
    >(response);
  }

  async function accept(id: string) {
    const response = await api
      .post(`/api/driver/requests/${id}/accept`)
      .auth(driverToken, { type: 'bearer' })
      .expect(201);
    return jsonBody<PoolBody>(response);
  }

  beforeAll(async () => {
    driverToken = await login('jashim@dhakapool.local');
    for (const name of ['Nusrat', 'Rafiq', 'Shirin']) {
      tokens[name] = await login(`${name.toLowerCase()}@dhakapool.local`);
    }
    await api
      .patch('/api/vehicles/me/online')
      .auth(driverToken, { type: 'bearer' })
      .expect(200);
  });

  it('lists all waiting rides and lets the driver fill a compatible pool', async () => {
    const ids: Record<string, string> = {};
    for (const name of ['Nusrat', 'Rafiq', 'Shirin']) {
      ids[name] = await createRide(tokens[name]);
    }
    const initial = await available();
    expect(initial.map((ride) => ride.id)).toEqual([
      ids.Nusrat,
      ids.Rafiq,
      ids.Shirin,
    ]);
    expect(initial.every((ride) => ride.canAccept)).toBe(true);
    expect(initial[0]).not.toHaveProperty('estimatedFarePoisha');
    expect(initial[0]).not.toHaveProperty('email');

    await api
      .patch(`/api/ride-requests/${ids.Rafiq}/cancel`)
      .auth(tokens.Nusrat, { type: 'bearer' })
      .expect(403);

    await api
      .post(`/api/driver/requests/${ids.Nusrat}/accept`)
      .auth(tokens.Nusrat, { type: 'bearer' })
      .expect(403);

    const first = await accept(ids.Nusrat);
    poolId = first.id;
    expect(first.status).toBe('ACCEPTED');
    expect(first.occupiedSeats).toBe(1);
    expect((await available()).map((ride) => ride.id)).toEqual([
      ids.Rafiq,
      ids.Shirin,
    ]);

    const incompatibleToken = await register('Incompatible Rider');
    const incompatibleId = await createRide(
      incompatibleToken,
      1,
      'MIRPUR',
      'GULSHAN_2',
    );
    const incompatible = (await available()).find(
      (ride) => ride.id === incompatibleId,
    );
    expect(incompatible?.canAccept).toBe(false);
    await api
      .post(`/api/driver/requests/${incompatibleId}/accept`)
      .auth(driverToken, { type: 'bearer' })
      .expect(409);

    const second = await accept(ids.Rafiq);
    expect(second.id).toBe(poolId);
    expect(second.occupiedSeats).toBe(2);
    const afterSecond = await available();
    expect(afterSecond.map((ride) => ride.id)).toEqual([
      ids.Shirin,
      incompatibleId,
    ]);

    const twoSeatToken = await register('Two Seat Rider');
    twoSeatRideId = await createRide(twoSeatToken, 2);
    expect(
      (await available()).find((ride) => ride.id === twoSeatRideId)?.canAccept,
    ).toBe(false);
    await api
      .post(`/api/driver/requests/${twoSeatRideId}/accept`)
      .auth(driverToken, { type: 'bearer' })
      .expect(409);

    const third = await accept(ids.Shirin);
    expect(third.id).toBe(poolId);
    expect(third.occupiedSeats).toBe(3);
    expect(third.occupiedSeats).toBeLessThanOrEqual(third.capacity);
    const manifestResponse = await api
      .get(`/api/pools/${poolId}/passengers`)
      .auth(driverToken, { type: 'bearer' })
      .expect(200);
    const manifest = jsonBody<ManifestBody>(manifestResponse);
    expect(manifest.passengers.map((person) => person.name)).toEqual([
      'Nusrat',
      'Rafiq',
      'Shirin',
    ]);
    expect(manifest.passengers[0]).not.toHaveProperty('individualFarePoisha');
    expect((await available()).map((ride) => ride.id)).toEqual([
      incompatibleId,
      twoSeatRideId,
    ]);
    await api
      .post(`/api/driver/requests/${ids.Nusrat}/accept`)
      .auth(driverToken, { type: 'bearer' })
      .expect(409);

    await api
      .patch(`/api/pools/${poolId}/arrived`)
      .auth(driverToken, { type: 'bearer' })
      .expect(200);
    await api
      .patch(`/api/pools/${poolId}/start`)
      .auth(driverToken, { type: 'bearer' })
      .expect(200);
    const lateToken = await register('Late Rider');
    const lateId = await createRide(lateToken);
    await api
      .post(`/api/driver/requests/${lateId}/accept`)
      .auth(driverToken, { type: 'bearer' })
      .expect(409);
    await api
      .patch(`/api/pools/${poolId}/complete`)
      .auth(driverToken, { type: 'bearer' })
      .expect(200);

    for (const name of ['Nusrat', 'Rafiq', 'Shirin']) {
      const response = await api
        .get('/api/ride-requests/my')
        .auth(tokens[name], { type: 'bearer' })
        .expect(200);
      const rides = jsonBody<RideBody[]>(response);
      expect(rides.find((ride) => ride.id === ids[name])).toMatchObject({
        status: 'COMPLETED',
        poolMember: { poolId },
        poolAssociation: {
          vehicleName: 'Bullet',
          status: 'COMPLETED',
          bookedSeats: 1,
        },
      });
      expect(rides.find((ride) => ride.id === ids[name])?.poolMember).toEqual({
        poolId,
      });
      expect(rides).not.toContainEqual(
        expect.objectContaining({
          id: ids[name === 'Nusrat' ? 'Rafiq' : 'Nusrat'],
        }),
      );
    }
  });

  it('allows exactly one simultaneous claim of the final seat', async () => {
    const twoSeatPool = await accept(twoSeatRideId);
    expect(twoSeatPool.occupiedSeats).toBe(2);
    const firstToken = await register('Final Seat A');
    const secondToken = await register('Final Seat B');
    const firstId = await createRide(firstToken);
    const secondId = await createRide(secondToken);
    const results = await Promise.all(
      [firstId, secondId].map((id) =>
        api
          .post(`/api/driver/requests/${id}/accept`)
          .auth(driverToken, { type: 'bearer' }),
      ),
    );
    expect(results.map((result) => result.status).sort()).toEqual([201, 409]);
    const activeResponse = await api
      .get('/api/driver/pools/active')
      .auth(driverToken, { type: 'bearer' })
      .expect(200);
    const active = jsonBody<PoolBody>(activeResponse);
    expect(active.occupiedSeats).toBe(3);
    const manifestResponse = await api
      .get(`/api/pools/${active.id}/passengers`)
      .auth(driverToken, { type: 'bearer' })
      .expect(200);
    expect(jsonBody<ManifestBody>(manifestResponse).passengers).toHaveLength(2);
    const remaining = await available();
    expect(
      remaining.some((ride) => ride.id === firstId || ride.id === secondId),
    ).toBe(true);
  });

  it('allows compatible joining after arrival and rejects cancelled rides', async () => {
    const currentResponse = await api
      .get('/api/driver/pools/active')
      .auth(driverToken, { type: 'bearer' })
      .expect(200);
    const current = jsonBody<PoolBody>(currentResponse);
    for (const action of ['arrived', 'start', 'complete']) {
      await api
        .patch(`/api/pools/${current.id}/${action}`)
        .auth(driverToken, { type: 'bearer' })
        .expect(200);
    }

    const firstToken = await register('Arrival Rider A');
    const secondToken = await register('Arrival Rider B');
    const firstId = await createRide(firstToken, 1, 'BANANI', 'MOHAKHALI');
    const secondId = await createRide(secondToken, 1, 'BANANI', 'GULSHAN_1');
    const firstPool = await accept(firstId);
    expect(firstPool.occupiedSeats).toBe(1);
    await api
      .patch(`/api/pools/${firstPool.id}/arrived`)
      .auth(driverToken, { type: 'bearer' })
      .expect(200);
    const joined = await accept(secondId);
    expect(joined.id).toBe(firstPool.id);
    expect(joined.status).toBe('DRIVER_ARRIVED');
    expect(joined.occupiedSeats).toBe(2);
    const secondRideResponse = await api
      .get('/api/ride-requests/my')
      .auth(secondToken, { type: 'bearer' })
      .expect(200);
    const secondRides = jsonBody<RideBody[]>(secondRideResponse);
    expect(secondRides.find((ride) => ride.id === secondId)?.status).toBe(
      'DRIVER_ARRIVED',
    );

    const cancelledToken = await register('Cancelled Rider');
    const cancelledId = await createRide(cancelledToken);
    await api
      .patch(`/api/ride-requests/${cancelledId}/cancel`)
      .auth(cancelledToken, { type: 'bearer' })
      .expect(200);
    expect((await available()).some((ride) => ride.id === cancelledId)).toBe(
      false,
    );
    await api
      .post(`/api/driver/requests/${cancelledId}/accept`)
      .auth(driverToken, { type: 'bearer' })
      .expect(409);

    await api
      .patch(`/api/pools/${firstPool.id}/start`)
      .auth(driverToken, { type: 'bearer' })
      .expect(200);
    await api
      .patch(`/api/pools/${firstPool.id}/complete`)
      .auth(driverToken, { type: 'bearer' })
      .expect(200);
    await api
      .post(`/api/driver/requests/${firstId}/accept`)
      .auth(driverToken, { type: 'bearer' })
      .expect(409);
  });

  it('releases a cancelled member’s seat before the pool starts', async () => {
    const firstToken = await register('Seat Release A');
    const secondToken = await register('Seat Release B');
    const firstId = await createRide(firstToken);
    const secondId = await createRide(secondToken);
    const firstPool = await accept(firstId);
    const secondPool = await accept(secondId);
    expect(secondPool.id).toBe(firstPool.id);
    expect(secondPool.occupiedSeats).toBe(2);

    await api
      .patch(`/api/ride-requests/${firstId}/cancel`)
      .auth(firstToken, { type: 'bearer' })
      .expect(200);
    const detailResponse = await api
      .get(`/api/pools/${firstPool.id}`)
      .auth(driverToken, { type: 'bearer' })
      .expect(200);
    const detail = jsonBody<
      PoolBody & { availableSeats: number; memberCount: number }
    >(detailResponse);
    expect(detail.occupiedSeats).toBe(1);
    expect(detail.availableSeats).toBe(2);
    expect(detail.memberCount).toBe(1);

    const replacementToken = await register('Seat Release Replacement');
    const replacementId = await createRide(replacementToken, 2);
    const filled = await accept(replacementId);
    expect(filled.id).toBe(firstPool.id);
    expect(filled.occupiedSeats).toBe(3);
    expect(filled.occupiedSeats).toBeLessThanOrEqual(filled.capacity);
  });
});
