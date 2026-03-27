jest.mock('../../src/utils/jwt.util');

const request = require('supertest');
const JWTUtil = require('../../src/utils/jwt.util');
const app = require('../../src/app');

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(app).put('/api/races/1').send({ name: 'Test' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Authentication token not provided');
  });

  it('returns 401 when Authorization header has invalid format (no Bearer prefix)', async () => {
    const res = await request(app)
      .put('/api/races/1')
      .set('Authorization', 'just-a-plain-token')
      .send({ name: 'Test' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid token format');
  });

  it('returns 401 when Authorization header has too many parts', async () => {
    const res = await request(app)
      .put('/api/races/1')
      .set('Authorization', 'Bearer token extra-part')
      .send({ name: 'Test' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid token format');
  });

  it('returns 401 when token is expired', async () => {
    JWTUtil.verifyToken.mockImplementation(() => {
      throw new Error('Token expired');
    });

    const res = await request(app)
      .put('/api/races/1')
      .set('Authorization', 'Bearer some-expired-token')
      .send({ name: 'Test' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token expired');
  });

  it('returns 401 when token signature is invalid', async () => {
    JWTUtil.verifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const res = await request(app)
      .put('/api/races/1')
      .set('Authorization', 'Bearer bad.jwt.token')
      .send({ name: 'Test' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid token');
  });

  it('returns 500 on unexpected verification error', async () => {
    JWTUtil.verifyToken.mockImplementation(() => {
      throw new Error('Unexpected crypto failure');
    });

    const res = await request(app)
      .put('/api/races/1')
      .set('Authorization', 'Bearer some-token')
      .send({ name: 'Test' });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error verifying token');
  });
});
