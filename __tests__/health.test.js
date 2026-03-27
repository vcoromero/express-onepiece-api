const request = require('supertest');
const app = require('../src/app');

describe('Health endpoint', () => {
  describe('GET /api/health', () => {
    it('returns 200 with status OK', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.message).toBe('One Piece API is running');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /unknown-route', () => {
    it('returns 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
