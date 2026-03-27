jest.mock('../../src/services/character.service');

const request = require('supertest');
const app = require('../../src/app');
const characterService = require('../../src/services/character.service');
const JWTUtil = require('../../src/utils/jwt.util');

const token = JWTUtil.generateToken({ username: 'testadmin', role: 'admin' });
const mockCharacter = { id: 1, name: 'Monkey D. Luffy', alias: 'Straw Hat', status: 'alive' };
const mockPagination = { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false };

describe('Character Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/characters', () => {
    it('returns 200 with paginated list', async () => {
      characterService.getAllCharacters.mockResolvedValue({ success: true, characters: [mockCharacter], pagination: mockPagination });
      const res = await request(app).get('/api/characters');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('returns 400 for invalid pagination (page < 1)', async () => {
      const res = await request(app).get('/api/characters?page=0');
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid pagination (limit > 100)', async () => {
      const res = await request(app).get('/api/characters?limit=101');
      expect(res.status).toBe(400);
    });

    it('returns 500 for invalid race_id service error code', async () => {
      characterService.getAllCharacters.mockResolvedValue({ success: false, error: 'INVALID_RACE_ID' });
      const res = await request(app).get('/api/characters?race_id=abc');
      expect(res.status).toBe(500);
    });

    it('returns 400 for invalid character_type_id', async () => {
      const res = await request(app).get('/api/characters?character_type_id=-1');
      expect(res.status).toBe(400);
    });

    it('returns 500 for invalid min_bounty service error code', async () => {
      characterService.getAllCharacters.mockResolvedValue({ success: false, error: 'INVALID_MIN_BOUNTY' });
      const res = await request(app).get('/api/characters?min_bounty=abc');
      expect(res.status).toBe(500);
    });

    it('returns 400 for invalid max_bounty', async () => {
      const res = await request(app).get('/api/characters?max_bounty=-5');
      expect(res.status).toBe(400);
    });

    it('returns 400 when min_bounty > max_bounty', async () => {
      const res = await request(app).get('/api/characters?min_bounty=1000&max_bounty=100');
      expect(res.status).toBe(400);
    });

    it('returns 500 when service fails', async () => {
      characterService.getAllCharacters.mockResolvedValue({ success: false, message: 'error' });
      const res = await request(app).get('/api/characters');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/characters/search', () => {
    it('returns 200 for valid search', async () => {
      characterService.searchCharacters.mockResolvedValue({ success: true, characters: [mockCharacter], pagination: mockPagination });
      const res = await request(app).get('/api/characters/search?q=Luffy');
      expect(res.status).toBe(200);
    });

    it('returns 400 when q is missing', async () => {
      const res = await request(app).get('/api/characters/search');
      expect(res.status).toBe(400);
    });

    it('returns 400 when q is empty', async () => {
      const res = await request(app).get('/api/characters/search?q=');
      expect(res.status).toBe(400);
    });

    it('returns 400 when service returns MISSING_SEARCH_TERM', async () => {
      characterService.searchCharacters.mockResolvedValue({ success: false, error: 'MISSING_SEARCH_TERM' });
      const res = await request(app).get('/api/characters/search?q=test');
      expect(res.status).toBe(400);
    });

    it('returns 500 when service fails generically', async () => {
      characterService.searchCharacters.mockResolvedValue({ success: false, error: 'DB_ERROR' });
      const res = await request(app).get('/api/characters/search?q=test');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/characters/:id', () => {
    it('returns 200 for valid ID', async () => {
      characterService.getCharacterById.mockResolvedValue({ success: true, data: mockCharacter });
      const res = await request(app).get('/api/characters/1');
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      characterService.getCharacterById.mockResolvedValue({ success: false, error: 'INVALID_ID' });
      const res = await request(app).get('/api/characters/abc');
      expect(res.status).toBe(400);
    });

    it('returns 404 when not found', async () => {
      characterService.getCharacterById.mockResolvedValue({ success: false, error: 'NOT_FOUND' });
      const res = await request(app).get('/api/characters/999');
      expect(res.status).toBe(404);
    });

    it('returns 500 on generic error', async () => {
      characterService.getCharacterById.mockResolvedValue({ success: false, error: 'DB_ERROR' });
      const res = await request(app).get('/api/characters/1');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/characters', () => {
    it('returns 201 on successful creation', async () => {
      characterService.createCharacter.mockResolvedValue({ success: true, data: mockCharacter, message: 'Created' });
      const res = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Monkey D. Luffy' });
      expect(res.status).toBe(201);
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid race_id', async () => {
      const res = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Luffy', race_id: -1 });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid bounty', async () => {
      const res = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Luffy', bounty: -100 });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid age', async () => {
      const res = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Luffy', age: 9999 });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid height', async () => {
      const res = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Luffy', height: 9999 });
      expect(res.status).toBe(400);
    });

    it('returns 409 for DUPLICATE_NAME', async () => {
      characterService.createCharacter.mockResolvedValue({ success: false, error: 'DUPLICATE_NAME' });
      const res = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Monkey D. Luffy' });
      expect(res.status).toBe(409);
    });

    it('returns 400 for INVALID_RACE', async () => {
      characterService.createCharacter.mockResolvedValue({ success: false, error: 'INVALID_RACE' });
      const res = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Character', raceId: 999 });
      expect(res.status).toBe(400);
    });

    it('returns 500 for unknown error', async () => {
      characterService.createCharacter.mockResolvedValue({ success: false, error: 'UNKNOWN' });
      const res = await request(app)
        .post('/api/characters')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Character' });
      expect(res.status).toBe(500);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).post('/api/characters').send({ name: 'Luffy' });
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/characters/:id', () => {
    it('returns 200 on successful update', async () => {
      characterService.updateCharacter.mockResolvedValue({ success: true, character: mockCharacter, message: 'Updated' });
      const res = await request(app)
        .put('/api/characters/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ alias: 'King of Pirates' });
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      characterService.updateCharacter.mockResolvedValue({ success: false, error: 'INVALID_ID' });
      const res = await request(app)
        .put('/api/characters/abc')
        .set('Authorization', `Bearer ${token}`)
        .send({ alias: 'Test' });
      expect(res.status).toBe(400);
    });

    it('returns 404 when not found', async () => {
      characterService.updateCharacter.mockResolvedValue({ success: false, error: 'NOT_FOUND' });
      const res = await request(app)
        .put('/api/characters/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ alias: 'Test' });
      expect(res.status).toBe(404);
    });

    it('returns 400 for NO_FIELDS_PROVIDED', async () => {
      characterService.updateCharacter.mockResolvedValue({ success: false, error: 'NO_FIELDS_PROVIDED' });
      const res = await request(app)
        .put('/api/characters/1')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns 409 for DUPLICATE_NAME', async () => {
      characterService.updateCharacter.mockResolvedValue({ success: false, error: 'DUPLICATE_NAME' });
      const res = await request(app)
        .put('/api/characters/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Roronoa Zoro' });
      expect(res.status).toBe(409);
    });

    it('returns 500 for unknown error', async () => {
      characterService.updateCharacter.mockResolvedValue({ success: false, error: 'UNKNOWN' });
      const res = await request(app)
        .put('/api/characters/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ alias: 'Test' });
      expect(res.status).toBe(500);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).put('/api/characters/1').send({ name: 'Test' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/characters/:id', () => {
    it('returns 200 on successful delete', async () => {
      characterService.deleteCharacter.mockResolvedValue({ success: true, message: 'Deleted' });
      const res = await request(app)
        .delete('/api/characters/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      characterService.deleteCharacter.mockResolvedValue({ success: false, error: 'INVALID_ID' });
      const res = await request(app)
        .delete('/api/characters/abc')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });

    it('returns 404 when not found', async () => {
      characterService.deleteCharacter.mockResolvedValue({ success: false, error: 'NOT_FOUND' });
      const res = await request(app)
        .delete('/api/characters/999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('returns 409 for HAS_ASSOCIATIONS', async () => {
      characterService.deleteCharacter.mockResolvedValue({ success: false, error: 'HAS_ASSOCIATIONS' });
      const res = await request(app)
        .delete('/api/characters/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(409);
    });

    it('returns 500 for unknown error', async () => {
      characterService.deleteCharacter.mockResolvedValue({ success: false, error: 'UNKNOWN' });
      const res = await request(app)
        .delete('/api/characters/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(500);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).delete('/api/characters/1');
      expect(res.status).toBe(401);
    });
  });
});
