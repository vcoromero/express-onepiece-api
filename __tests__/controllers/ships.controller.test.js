jest.mock('../../src/services/ship.service');

const request = require('supertest');
const app = require('../../src/app');
const shipService = require('../../src/services/ship.service');
const JWTUtil = require('../../src/utils/jwt.util');

const token = JWTUtil.generateToken({ username: 'testadmin', role: 'admin' });
const mockShip = { id: 1, name: 'Going Merry', status: 'active', description: 'Straw Hat ship' };
const mockPagination = { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false };

describe('Ship Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/ships', () => {
    it('returns 200 with paginated list', async () => {
      shipService.getAllShips.mockResolvedValue({ success: true, data: [mockShip], pagination: mockPagination });
      const res = await request(app).get('/api/ships');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('returns 400 for invalid page param', async () => {
      const res = await request(app).get('/api/ships?page=abc');
      expect(res.status).toBe(400);
    });

    it('returns 400 for page < 1', async () => {
      const res = await request(app).get('/api/ships?page=0');
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid limit param', async () => {
      const res = await request(app).get('/api/ships?limit=0');
      expect(res.status).toBe(400);
    });

    it('returns 400 for limit > 100', async () => {
      const res = await request(app).get('/api/ships?limit=101');
      expect(res.status).toBe(400);
    });

    it('returns 400 when service throws SHIP_INVALID_STATUS', async () => {
      shipService.getAllShips.mockRejectedValue(new Error('SHIP_INVALID_STATUS'));
      const res = await request(app).get('/api/ships');
      expect(res.status).toBe(400);
    });

    it('returns 500 when service throws generic error', async () => {
      shipService.getAllShips.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/ships');
      expect(res.status).toBe(500);
    });

    it('returns 500 when service fails', async () => {
      shipService.getAllShips.mockResolvedValue({ success: false, message: 'error' });
      const res = await request(app).get('/api/ships');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/ships/status/:status', () => {
    it('returns 200 for valid status', async () => {
      shipService.getShipsByStatus.mockResolvedValue([mockShip]);
      const res = await request(app).get('/api/ships/status/active');
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid status', async () => {
      const res = await request(app).get('/api/ships/status/sunk');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/ships/:id', () => {
    it('returns 200 for a valid ID', async () => {
      shipService.getShipById.mockResolvedValue({ success: true, data: mockShip });
      const res = await request(app).get('/api/ships/1');
      expect(res.status).toBe(200);
    });

    it('returns 400 for an invalid ID', async () => {
      const res = await request(app).get('/api/ships/abc');
      expect(res.status).toBe(400);
    });

    it('returns 404 when not found', async () => {
      shipService.getShipById.mockResolvedValue({ success: false, error: 'NOT_FOUND' });
      const res = await request(app).get('/api/ships/999');
      expect(res.status).toBe(404);
    });

    it('returns 500 on generic error', async () => {
      shipService.getShipById.mockResolvedValue({ success: false, error: 'DB_ERROR' });
      const res = await request(app).get('/api/ships/1');
      expect(res.status).toBe(500);
    });

    it('returns 500 when service throws exception', async () => {
      shipService.getShipById.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/ships/1');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/ships', () => {
    it('returns 201 on successful creation', async () => {
      shipService.createShip.mockResolvedValue({ success: true, data: mockShip });
      const res = await request(app)
        .post('/api/ships')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Going Merry' });
      expect(res.status).toBe(201);
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/ships')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid status', async () => {
      const res = await request(app)
        .post('/api/ships')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Ship', status: 'sunk' });
      expect(res.status).toBe(400);
    });

    it('returns 409 when name already exists (SHIP_NAME_EXISTS)', async () => {
      shipService.createShip.mockRejectedValue(new Error('SHIP_NAME_EXISTS'));
      const res = await request(app)
        .post('/api/ships')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Going Merry' });
      expect(res.status).toBe(409);
    });

    it('returns 400 when SHIP_INVALID_STATUS thrown by service', async () => {
      shipService.createShip.mockRejectedValue(new Error('SHIP_INVALID_STATUS'));
      const res = await request(app)
        .post('/api/ships')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Ship', status: 'active' });
      expect(res.status).toBe(400);
    });

    it('returns 500 on unexpected service error', async () => {
      shipService.createShip.mockRejectedValue(new Error('unexpected'));
      const res = await request(app)
        .post('/api/ships')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Ship' });
      expect(res.status).toBe(500);
    });

    it('returns 400 when SHIP_NAME_REQUIRED thrown by service', async () => {
      shipService.createShip.mockRejectedValue(new Error('SHIP_NAME_REQUIRED'));
      const res = await request(app)
        .post('/api/ships')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Ship' });
      expect(res.status).toBe(400);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/ships').send({ name: 'New Ship' });
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/ships/:id', () => {
    it('returns 200 on successful update', async () => {
      shipService.updateShip.mockResolvedValue({ success: true, data: mockShip });
      const res = await request(app)
        .put('/api/ships/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'retired' });
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      const res = await request(app)
        .put('/api/ships/abc')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'retired' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when no fields provided', async () => {
      const res = await request(app)
        .put('/api/ships/1')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid status value', async () => {
      const res = await request(app)
        .put('/api/ships/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'sunk' });
      expect(res.status).toBe(400);
    });

    it('returns 404 when ship not found (SHIP_NOT_FOUND thrown)', async () => {
      shipService.updateShip.mockRejectedValue(new Error('SHIP_NOT_FOUND'));
      const res = await request(app)
        .put('/api/ships/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'retired' });
      expect(res.status).toBe(404);
    });

    it('returns 400 for empty name string', async () => {
      const res = await request(app)
        .put('/api/ships/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });
      expect(res.status).toBe(400);
    });

    it('returns 404 when service returns NOT_FOUND result', async () => {
      shipService.updateShip.mockResolvedValue({ success: false, error: 'NOT_FOUND' });
      const res = await request(app)
        .put('/api/ships/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'retired' });
      expect(res.status).toBe(404);
    });

    it('returns 500 when service returns failure result', async () => {
      shipService.updateShip.mockResolvedValue({ success: false, error: 'DB_ERROR' });
      const res = await request(app)
        .put('/api/ships/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'retired' });
      expect(res.status).toBe(500);
    });

    it('returns 400 when service throws SHIP_INVALID_ID', async () => {
      shipService.updateShip.mockRejectedValue(new Error('SHIP_INVALID_ID'));
      const res = await request(app)
        .put('/api/ships/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'retired' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when service throws SHIP_INVALID_STATUS', async () => {
      shipService.updateShip.mockRejectedValue(new Error('SHIP_INVALID_STATUS'));
      const res = await request(app)
        .put('/api/ships/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'retired' });
      expect(res.status).toBe(400);
    });

    it('returns 500 for generic service error in update', async () => {
      shipService.updateShip.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .put('/api/ships/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'retired' });
      expect(res.status).toBe(500);
    });

    it('returns 409 when SHIP_NAME_EXISTS thrown', async () => {
      shipService.updateShip.mockRejectedValue(new Error('SHIP_NAME_EXISTS'));
      const res = await request(app)
        .put('/api/ships/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Thousand Sunny' });
      expect(res.status).toBe(409);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).put('/api/ships/1').send({ status: 'retired' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/ships/:id', () => {
    it('returns 200 on successful delete', async () => {
      shipService.deleteShip.mockResolvedValue({ success: true, message: 'Deleted' });
      const res = await request(app)
        .delete('/api/ships/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      const res = await request(app)
        .delete('/api/ships/abc')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });

    it('returns 404 when SHIP_NOT_FOUND thrown', async () => {
      shipService.deleteShip.mockRejectedValue(new Error('SHIP_NOT_FOUND'));
      const res = await request(app)
        .delete('/api/ships/999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('returns 409 when SHIP_IN_USE thrown', async () => {
      shipService.deleteShip.mockRejectedValue(new Error('SHIP_IN_USE'));
      const res = await request(app)
        .delete('/api/ships/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(409);
    });

    it('returns 404 when service returns NOT_FOUND result', async () => {
      shipService.deleteShip.mockResolvedValue({ success: false, error: 'NOT_FOUND' });
      const res = await request(app)
        .delete('/api/ships/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('returns 500 when service returns failure result', async () => {
      shipService.deleteShip.mockResolvedValue({ success: false, error: 'DB_ERROR' });
      const res = await request(app)
        .delete('/api/ships/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(500);
    });

    it('returns 400 when service throws SHIP_INVALID_ID', async () => {
      shipService.deleteShip.mockRejectedValue(new Error('SHIP_INVALID_ID'));
      const res = await request(app)
        .delete('/api/ships/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });

    it('returns 500 for generic service error in delete', async () => {
      shipService.deleteShip.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .delete('/api/ships/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(500);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).delete('/api/ships/1');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/ships/status/:status (error cases)', () => {
    it('returns 400 when service throws SHIP_INVALID_STATUS', async () => {
      shipService.getShipsByStatus.mockRejectedValue(new Error('SHIP_INVALID_STATUS'));
      const res = await request(app).get('/api/ships/status/active');
      expect(res.status).toBe(400);
    });

    it('returns 500 when service throws generic error', async () => {
      shipService.getShipsByStatus.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/ships/status/active');
      expect(res.status).toBe(500);
    });
  });
});
