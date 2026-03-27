jest.mock('../../src/services/character-type.service');

const request = require('supertest');
const app = require('../../src/app');
const characterTypeService = require('../../src/services/character-type.service');
const JWTUtil = require('../../src/utils/jwt.util');

const token = JWTUtil.generateToken({ username: 'testadmin', role: 'admin' });
const mockType = { id: 1, name: 'Pirate', description: 'Pirates' };

describe('CharacterType Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/character-types', () => {
    it('returns 200 with list', async () => {
      characterTypeService.getAllCharacterTypes.mockResolvedValue({ success: true, characterTypes: [mockType], total: 1 });
      const res = await request(app).get('/api/character-types');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('returns 500 on service failure', async () => {
      characterTypeService.getAllCharacterTypes.mockResolvedValue({ success: false, message: 'error' });
      const res = await request(app).get('/api/character-types');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/character-types/:id', () => {
    it('returns 200 for valid ID', async () => {
      characterTypeService.getCharacterTypeById.mockResolvedValue({ success: true, data: mockType });
      const res = await request(app).get('/api/character-types/1');
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      characterTypeService.getCharacterTypeById.mockResolvedValue({ success: false, error: 'INVALID_ID' });
      const res = await request(app).get('/api/character-types/abc');
      expect(res.status).toBe(400);
    });

    it('returns 404 when not found', async () => {
      characterTypeService.getCharacterTypeById.mockResolvedValue({ success: false, error: 'NOT_FOUND' });
      const res = await request(app).get('/api/character-types/999');
      expect(res.status).toBe(404);
    });

    it('returns 500 on generic service error', async () => {
      characterTypeService.getCharacterTypeById.mockResolvedValue({ success: false, error: 'DB_ERROR' });
      const res = await request(app).get('/api/character-types/1');
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/character-types/:id', () => {
    it('returns 200 on successful update', async () => {
      characterTypeService.updateCharacterType.mockResolvedValue({ success: true, data: mockType, message: 'Updated' });
      const res = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Marine' });
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      characterTypeService.updateCharacterType.mockResolvedValue({ success: false, error: 'INVALID_ID' });
      const res = await request(app)
        .put('/api/character-types/abc')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Marine' });
      expect(res.status).toBe(400);
    });

    it('returns 404 when not found', async () => {
      characterTypeService.updateCharacterType.mockResolvedValue({ success: false, error: 'NOT_FOUND' });
      const res = await request(app)
        .put('/api/character-types/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Marine' });
      expect(res.status).toBe(404);
    });

    it('returns 400 for NO_FIELDS_PROVIDED', async () => {
      characterTypeService.updateCharacterType.mockResolvedValue({ success: false, error: 'NO_FIELDS_PROVIDED' });
      const res = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns 400 for INVALID_NAME', async () => {
      characterTypeService.updateCharacterType.mockResolvedValue({ success: false, error: 'INVALID_NAME' });
      const res = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });
      expect(res.status).toBe(400);
    });

    it('returns 409 for DUPLICATE_NAME', async () => {
      characterTypeService.updateCharacterType.mockResolvedValue({ success: false, error: 'DUPLICATE_NAME' });
      const res = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Pirate' });
      expect(res.status).toBe(409);
    });

    it('returns 500 for unknown error', async () => {
      characterTypeService.updateCharacterType.mockResolvedValue({ success: false, error: 'UNKNOWN' });
      const res = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Marine' });
      expect(res.status).toBe(500);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).put('/api/character-types/1').send({ name: 'Marine' });
      expect(res.status).toBe(401);
    });
  });
});
