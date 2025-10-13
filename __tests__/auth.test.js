const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const JWTUtil = require('../src/utils/jwt.util');

// Mock environment variables
const mockAdminUsername = 'testadmin';
const mockAdminPassword = 'testpassword123';
let mockAdminPasswordHash;

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    // Generate password hash for tests
    mockAdminPasswordHash = await bcrypt.hash(mockAdminPassword, 10);
    
    // Set environment variables for tests
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.ADMIN_USERNAME = mockAdminUsername;
    process.env.ADMIN_PASSWORD_HASH = mockAdminPasswordHash;
    process.env.NODE_ENV = 'development';
  });

  describe('POST /api/auth/login', () => {
    it('should return a token when credentials are correct', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: mockAdminUsername,
          password: mockAdminPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('expiresIn');
      expect(response.body.data.user.username).toBe(mockAdminUsername);
      expect(response.body.data.user.role).toBe('admin');
    });

    it('should return 400 error when credentials are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: mockAdminUsername
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Incomplete credentials');
    });

    it('should return 401 error when username is incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'wrongusername',
          password: mockAdminPassword
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 error when password is incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: mockAdminUsername,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/verify', () => {
    let validToken;

    beforeAll(() => {
      // Generate a valid token for tests
      validToken = JWTUtil.generateToken({
        username: mockAdminUsername,
        role: 'admin'
      });
    });

    it('should verify a valid token correctly', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Token is valid');
      expect(response.body.data.user.username).toBe(mockAdminUsername);
    });

    it('should return 401 error when token is not provided', async () => {
      const response = await request(app)
        .get('/api/auth/verify');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication token not provided');
    });

    it('should return 401 error when token format is incorrect', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', validToken); // Without "Bearer "

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token format');
    });

    it('should return 401 error when token is invalid', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('POST /api/auth/generate-hash (Development only)', () => {
    it('should generate a password hash in development mode', async () => {
      const testPassword = 'myNewPassword123';
      const response = await request(app)
        .post('/api/auth/generate-hash')
        .send({
          password: testPassword
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Hash generated successfully');
      expect(response.body.data).toHaveProperty('hash');

      // Verify that the generated hash is valid
      const isValid = await bcrypt.compare(testPassword, response.body.data.hash);
      expect(isValid).toBe(true);
    });

    it('should return 400 error when password is not provided', async () => {
      const response = await request(app)
        .post('/api/auth/generate-hash')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Password is required');
    });
  });

  describe('JWT Utility Tests', () => {
    it('should generate and verify a token correctly', () => {
      const payload = { username: 'testuser', role: 'admin' };
      const token = JWTUtil.generateToken(payload);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      const decoded = JWTUtil.verifyToken(token);
      expect(decoded.username).toBe(payload.username);
      expect(decoded.role).toBe(payload.role);
    });

    it('should decode a token without verifying', () => {
      const payload = { username: 'testuser', role: 'admin' };
      const token = JWTUtil.generateToken(payload);

      const decoded = JWTUtil.decodeToken(token);
      expect(decoded.username).toBe(payload.username);
      expect(decoded.role).toBe(payload.role);
    });

    it('should throw error when token is invalid', () => {
      expect(() => {
        JWTUtil.verifyToken('invalid.token.here');
      }).toThrow('Invalid token');
    });
  });
});
