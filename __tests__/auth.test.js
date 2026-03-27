const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');

describe('Auth endpoints', () => {
  const validPassword = 'testpassword123';
  let validHash;

  beforeAll(async () => {
    validHash = await bcrypt.hash(validPassword, 10);
    process.env.ADMIN_USERNAME = 'testadmin';
    process.env.ADMIN_PASSWORD_HASH = validHash;
    process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
    process.env.JWT_EXPIRES_IN = '24h';
  });

  describe('POST /api/auth/login', () => {
    it('returns 200 and a token for valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testadmin', password: validPassword });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.username).toBe('testadmin');
      expect(response.body.data.user.role).toBe('admin');
    });

    it('returns 400 when credentials are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('returns 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testadmin' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('returns 401 for an incorrect username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'wronguser', password: validPassword });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('returns 401 for an incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testadmin', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/verify', () => {
    it('returns 200 for a valid token', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testadmin', password: validPassword });

      const { token } = loginResponse.body.data;

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('returns 401 when no token is provided', async () => {
      const response = await request(app).get('/api/auth/verify');
      expect(response.status).toBe(401);
    });

    it('returns 401 for an invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
    });
  });
});
