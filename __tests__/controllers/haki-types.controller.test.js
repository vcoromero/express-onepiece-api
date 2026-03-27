jest.mock('../../src/services/haki-type.service');

const request = require('supertest');
const app = require('../../src/app');
const hakiTypeService = require('../../src/services/haki-type.service');
const JWTUtil = require('../../src/utils/jwt.util');

const token = JWTUtil.generateToken({ username: 'testadmin', role: 'admin' });
const mockHaki = { id: 1, name: 'Observation Haki', description: 'Sense others', color: 'yellow' };

describe('HakiType Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/haki-types', () => {
    it('returns 200 with list', async () => {
      hakiTypeService.getAllHakiTypes.mockResolvedValue({ success: true, hakiTypes: [mockHaki], total: 1 });
      const res = await request(app).get('/api/haki-types');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('returns 500 on service failure', async () => {
      hakiTypeService.getAllHakiTypes.mockResolvedValue({ success: false, message: 'error' });
      const res = await request(app).get('/api/haki-types');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/haki-types/:id', () => {
    it('returns 200 for valid ID', async () => {
      hakiTypeService.getHakiTypeById.mockResolvedValue({ success: true, data: mockHaki });
      const res = await request(app).get('/api/haki-types/1');
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      const res = await request(app).get('/api/haki-types/abc');
      expect(res.status).toBe(400);
    });

    it('returns 404 when not found', async () => {
      hakiTypeService.getHakiTypeById.mockResolvedValue({ success: false, error: 'NOT_FOUND' });
      const res = await request(app).get('/api/haki-types/999');
      expect(res.status).toBe(404);
    });

    it('returns 500 on generic error', async () => {
      hakiTypeService.getHakiTypeById.mockResolvedValue({ success: false, error: 'DB_ERROR' });
      const res = await request(app).get('/api/haki-types/1');
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/haki-types/:id', () => {
    it('returns 200 on successful update', async () => {
      hakiTypeService.updateHakiType.mockResolvedValue({ success: true, data: { hakiType: mockHaki }, message: 'Updated' });
      const res = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Conqueror Haki' });
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      const res = await request(app)
        .put('/api/haki-types/abc')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when no fields provided', async () => {
      const res = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns 400 when name is empty string', async () => {
      const res = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when description is not a string', async () => {
      const res = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 123 });
      expect(res.status).toBe(400);
    });

    it('returns 400 when color is not a string', async () => {
      const res = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ color: 999 });
      expect(res.status).toBe(400);
    });

    it('returns 404 when not found', async () => {
      hakiTypeService.updateHakiType.mockResolvedValue({ success: false, error: 'NOT_FOUND' });
      const res = await request(app)
        .put('/api/haki-types/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Updated description' });
      expect(res.status).toBe(404);
    });

    it('returns 409 for DUPLICATE_NAME', async () => {
      hakiTypeService.updateHakiType.mockResolvedValue({ success: false, error: 'DUPLICATE_NAME' });
      const res = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Armament Haki' });
      expect(res.status).toBe(409);
    });

    it('returns 500 for unknown error', async () => {
      hakiTypeService.updateHakiType.mockResolvedValue({ success: false, error: 'UNKNOWN' });
      const res = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Test' });
      expect(res.status).toBe(500);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).put('/api/haki-types/1').send({ name: 'Test' });
      expect(res.status).toBe(401);
    });
  });
});
