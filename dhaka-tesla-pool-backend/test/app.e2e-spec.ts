import request from 'supertest';

const api = request(process.env.E2E_API_URL ?? 'http://localhost:4000');

describe('running API security smoke (e2e)', () => {
  it('exposes the public health endpoint', () =>
    api.get('/api').expect(200).expect({
      status: 'ok',
      service: 'dhaka-tesla-pool-api',
    }));

  it('protects passenger ride data', () =>
    api.get('/api/ride-requests/my').expect(401));
});
