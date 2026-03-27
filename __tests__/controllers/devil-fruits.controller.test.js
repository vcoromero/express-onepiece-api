jest.mock('../../src/services/devil-fruit.service');

const request = require('supertest');
const app = require('../../src/app');
const devilFruitService = require('../../src/services/devil-fruit.service');
const JWTUtil = require('../../src/utils/jwt.util');

const token = JWTUtil.generateToken({ username: 'testadmin', role: 'admin' });
const mockFruit = { id: 1, name: 'Gomu Gomu no Mi', typeId: 1, fruitType: { id: 1, name: 'Paramecia' } };
const mockPagination = { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false };

describe('DevilFruit Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/devil-fruits', () => {
    it('returns 200 with paginated list', async () => {
      devilFruitService.getAllFruits.mockResolvedValue({ success: true, fruits: [mockFruit], pagination: mockPagination });
      const res = await request(app).get('/api/devil-fruits');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('returns 400 when page < 1', async () => {
      const res = await request(app).get('/api/devil-fruits?page=0');
      expect(res.status).toBe(400);
    });

    it('returns 400 when limit < 1', async () => {
      const res = await request(app).get('/api/devil-fruits?limit=0');
      expect(res.status).toBe(400);
    });

    it('returns 400 when limit > 100', async () => {
      const res = await request(app).get('/api/devil-fruits?limit=101');
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid sortBy field', async () => {
      const res = await request(app).get('/api/devil-fruits?sortBy=invalid_field');
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid sortOrder', async () => {
      const res = await request(app).get('/api/devil-fruits?sortOrder=RANDOM');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/devil-fruits/:id', () => {
    it('returns 200 for valid ID', async () => {
      devilFruitService.getFruitById.mockResolvedValue(mockFruit);
      const res = await request(app).get('/api/devil-fruits/1');
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      const res = await request(app).get('/api/devil-fruits/abc');
      expect(res.status).toBe(400);
    });

    it('returns 404 when not found', async () => {
      devilFruitService.getFruitById.mockResolvedValue(null);
      const res = await request(app).get('/api/devil-fruits/999');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/devil-fruits/type/:typeId', () => {
    it('returns 200 for valid typeId', async () => {
      devilFruitService.getFruitsByType.mockResolvedValue({ success: true, fruits: [mockFruit], pagination: mockPagination });
      const res = await request(app).get('/api/devil-fruits/type/1');
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid typeId', async () => {
      const res = await request(app).get('/api/devil-fruits/type/abc');
      expect(res.status).toBe(400);
    });

    it('returns 400 when page < 1', async () => {
      const res = await request(app).get('/api/devil-fruits/type/1?page=0');
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid sortBy', async () => {
      const res = await request(app).get('/api/devil-fruits/type/1?sortBy=invalid');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/devil-fruits', () => {
    it('returns 201 on successful creation', async () => {
      devilFruitService.createFruit.mockResolvedValue(mockFruit);
      const res = await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Gomu Gomu no Mi', type_id: 1 });
      expect(res.status).toBe(201);
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${token}`)
        .send({ type_id: 1 });
      expect(res.status).toBe(400);
    });

    it('returns 400 when name is empty', async () => {
      const res = await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '', type_id: 1 });
      expect(res.status).toBe(400);
    });

    it('returns 400 when name exceeds 100 chars', async () => {
      const res = await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'A'.repeat(101), type_id: 1 });
      expect(res.status).toBe(400);
    });

    it('returns 400 when type_id is missing', async () => {
      const res = await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Fruit' });
      expect(res.status).toBe(400);
    });

    it('returns 409 on DUPLICATE_NAME error', async () => {
      const err = new Error('Duplicate'); err.code = 'DUPLICATE_NAME';
      devilFruitService.createFruit.mockRejectedValue(err);
      const res = await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Gomu Gomu no Mi', type_id: 1 });
      expect(res.status).toBe(409);
    });

    it('returns 400 on INVALID_TYPE error', async () => {
      const err = new Error('Invalid type'); err.code = 'INVALID_TYPE';
      devilFruitService.createFruit.mockRejectedValue(err);
      const res = await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Fruit', type_id: 99 });
      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/devil-fruits').send({ name: 'Test', type_id: 1 });
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/devil-fruits/:id', () => {
    it('returns 200 on successful update', async () => {
      devilFruitService.updateFruit.mockResolvedValue(mockFruit);
      const res = await request(app)
        .put('/api/devil-fruits/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Fruit' });
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      const res = await request(app)
        .put('/api/devil-fruits/abc')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when no fields provided', async () => {
      const res = await request(app)
        .put('/api/devil-fruits/1')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns 400 when name is empty', async () => {
      const res = await request(app)
        .put('/api/devil-fruits/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when name exceeds 100 chars', async () => {
      const res = await request(app)
        .put('/api/devil-fruits/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'A'.repeat(101) });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid type_id', async () => {
      const res = await request(app)
        .put('/api/devil-fruits/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ type_id: 0 });
      expect(res.status).toBe(400);
    });

    it('returns 404 on NOT_FOUND error', async () => {
      const err = new Error('Not found'); err.code = 'NOT_FOUND';
      devilFruitService.updateFruit.mockRejectedValue(err);
      const res = await request(app)
        .put('/api/devil-fruits/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' });
      expect(res.status).toBe(404);
    });

    it('returns 409 on DUPLICATE_NAME', async () => {
      const err = new Error('Duplicate'); err.code = 'DUPLICATE_NAME';
      devilFruitService.updateFruit.mockRejectedValue(err);
      const res = await request(app)
        .put('/api/devil-fruits/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Mera Mera no Mi' });
      expect(res.status).toBe(409);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).put('/api/devil-fruits/1').send({ name: 'Test' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/devil-fruits/:id', () => {
    it('returns 200 on successful delete', async () => {
      devilFruitService.deleteFruit.mockResolvedValue({ id: 1, name: 'Gomu Gomu no Mi' });
      const res = await request(app)
        .delete('/api/devil-fruits/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      const res = await request(app)
        .delete('/api/devil-fruits/abc')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });

    it('returns 404 when not found', async () => {
      const err = new Error('Not found'); err.code = 'NOT_FOUND';
      devilFruitService.deleteFruit.mockRejectedValue(err);
      const res = await request(app)
        .delete('/api/devil-fruits/999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).delete('/api/devil-fruits/1');
      expect(res.status).toBe(401);
    });
  });
});
