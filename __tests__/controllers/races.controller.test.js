jest.mock('../../src/services/race.service');

const request = require('supertest');
const app = require('../../src/app');
const raceService = require('../../src/services/race.service');
const JWTUtil = require('../../src/utils/jwt.util');

const token = JWTUtil.generateToken({ username: 'testadmin', role: 'admin' });

const mockRace = { id: 1, name: 'Human', description: 'Regular humans' };

describe('Race Controller', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('GET /api/races', () => {
    it('returns 200 with list of races', async () => {
      raceService.getAllRaces.mockResolvedValue({ success: true, races: [mockRace], total: 1 });
      const res = await request(app).get('/api/races');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('returns 500 when service fails', async () => {
      raceService.getAllRaces.mockResolvedValue({ success: false, message: 'DB error' });
      const res = await request(app).get('/api/races');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/races/:id', () => {
    it('returns 200 for a valid existing race', async () => {
      raceService.getRaceById.mockResolvedValue({ success: true, data: mockRace });
      const res = await request(app).get('/api/races/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 500 for an invalid ID in current implementation', async () => {
      const res = await request(app).get('/api/races/abc');
      expect(res.status).toBe(500);
    });

    it('returns 400 for ID = 0', async () => {
      const res = await request(app).get('/api/races/0');
      expect(res.status).toBe(400);
    });

    it('returns 404 when race is not found', async () => {
      raceService.getRaceById.mockResolvedValue({ success: false, error: 'NOT_FOUND' });
      const res = await request(app).get('/api/races/999');
      expect(res.status).toBe(404);
    });

    it('returns 500 for generic service error', async () => {
      raceService.getRaceById.mockResolvedValue({ success: false, error: 'DB_ERROR' });
      const res = await request(app).get('/api/races/1');
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/races/:id', () => {
    it('returns 200 on successful update', async () => {
      raceService.updateRace.mockResolvedValue({ success: true, race: mockRace, message: 'Updated' });
      const res = await request(app)
        .put('/api/races/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Giant' });
      expect(res.status).toBe(200);
    });

    it('returns 500 for invalid ID in current implementation', async () => {
      const res = await request(app)
        .put('/api/races/abc')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Giant' });
      expect(res.status).toBe(500);
    });

    it('returns 404 when race not found', async () => {
      raceService.updateRace.mockResolvedValue({ success: false, error: 'NOT_FOUND' });
      const res = await request(app)
        .put('/api/races/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Giant' });
      expect(res.status).toBe(404);
    });

    it('returns 400 for NO_FIELDS_PROVIDED', async () => {
      raceService.updateRace.mockResolvedValue({ success: false, error: 'NO_FIELDS_PROVIDED' });
      const res = await request(app)
        .put('/api/races/1')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns 400 for INVALID_NAME', async () => {
      raceService.updateRace.mockResolvedValue({ success: false, error: 'INVALID_NAME' });
      const res = await request(app)
        .put('/api/races/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });
      expect(res.status).toBe(400);
    });

    it('returns 409 for DUPLICATE_NAME', async () => {
      raceService.updateRace.mockResolvedValue({ success: false, error: 'DUPLICATE_NAME' });
      const res = await request(app)
        .put('/api/races/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Human' });
      expect(res.status).toBe(409);
    });

    it('returns 500 for unknown error', async () => {
      raceService.updateRace.mockResolvedValue({ success: false, error: 'UNKNOWN' });
      const res = await request(app)
        .put('/api/races/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Giant' });
      expect(res.status).toBe(500);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).put('/api/races/1').send({ name: 'Giant' });
      expect(res.status).toBe(401);
    });
  });
});
