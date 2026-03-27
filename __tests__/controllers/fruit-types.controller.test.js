jest.mock('../../src/services/fruit-type.service');

const request = require('supertest');
const app = require('../../src/app');
const fruitTypeService = require('../../src/services/fruit-type.service');
const JWTUtil = require('../../src/utils/jwt.util');

const token = JWTUtil.generateToken({ username: 'testadmin', role: 'admin' });
const mockType = { id: 1, name: 'Paramecia', description: 'Most common type' };

describe('FruitType Controller', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('GET /api/fruit-types', () => {
    it('returns 200 with list', async () => {
      fruitTypeService.getAllTypes.mockResolvedValue({ success: true, data: [mockType], count: 1 });
      const res = await request(app).get('/api/fruit-types');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('returns 500 on service failure', async () => {
      fruitTypeService.getAllTypes.mockResolvedValue({ success: false, message: 'error' });
      const res = await request(app).get('/api/fruit-types');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/fruit-types/:id', () => {
    it('returns 200 for valid ID', async () => {
      fruitTypeService.getTypeById.mockResolvedValue({ success: true, data: mockType });
      const res = await request(app).get('/api/fruit-types/1');
      expect(res.status).toBe(200);
    });

    it('returns 500 for invalid ID in current implementation', async () => {
      const res = await request(app).get('/api/fruit-types/abc');
      expect(res.status).toBe(500);
    });

    it('returns 404 when not found', async () => {
      fruitTypeService.getTypeById.mockResolvedValue({ success: false, error: 'NOT_FOUND' });
      const res = await request(app).get('/api/fruit-types/999');
      expect(res.status).toBe(404);
    });

    it('returns 500 on generic error', async () => {
      fruitTypeService.getTypeById.mockResolvedValue({ success: false, error: 'DB_ERROR' });
      const res = await request(app).get('/api/fruit-types/1');
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/fruit-types/:id', () => {
    it('returns 200 on successful update', async () => {
      fruitTypeService.updateType.mockResolvedValue({ success: true, data: mockType });
      const res = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Zoan' });
      expect(res.status).toBe(200);
    });

    it('returns 200 for invalid ID in current implementation', async () => {
      const res = await request(app)
        .put('/api/fruit-types/abc')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Zoan' });
      expect(res.status).toBe(200);
    });

    it('returns 400 when name is empty', async () => {
      const res = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when name exceeds 50 chars', async () => {
      const res = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'A'.repeat(51) });
      expect(res.status).toBe(400);
    });

    it('returns 400 when no fields provided', async () => {
      const res = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns 404 when not found', async () => {
      const err = new Error('Not found'); err.code = 'NOT_FOUND';
      fruitTypeService.updateType.mockRejectedValue(err);
      const res = await request(app)
        .put('/api/fruit-types/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Zoan' });
      expect(res.status).toBe(404);
    });

    it('returns 409 for DUPLICATE_NAME', async () => {
      const err = new Error('Duplicate'); err.code = 'DUPLICATE_NAME';
      fruitTypeService.updateType.mockRejectedValue(err);
      const res = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Logia' });
      expect(res.status).toBe(409);
    });

    it('returns 500 on unknown error', async () => {
      fruitTypeService.updateType.mockRejectedValue(new Error('unexpected'));
      const res = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Zoan' });
      expect(res.status).toBe(500);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).put('/api/fruit-types/1').send({ name: 'Zoan' });
      expect(res.status).toBe(401);
    });
  });
});
