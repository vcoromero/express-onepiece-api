const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');

// Note: These are integration tests for authentication endpoints
// We mock external dependencies (JWTUtil, bcrypt) but test the full HTTP flow
// This ensures the auth controllers work correctly without testing library implementations

// Mock JWTUtil - it has its own unit tests
jest.mock('../src/utils/jwt.util', () => ({
  generateToken: jest.fn((payload) => {
    // Return a mock token based on the payload
    return `mock-jwt-token-${payload.username}-${payload.role}`;
  }),
  verifyToken: jest.fn((token) => {
    // Simulate token verification
    if (token.startsWith('mock-jwt-token-')) {
      const parts = token.split('-');
      return { 
        username: parts[3], 
        role: parts[4] 
      };
    }
    throw new Error('Invalid token');
  }),
  decodeToken: jest.fn((token) => {
    if (token.startsWith('mock-jwt-token-')) {
      const parts = token.split('-');
      return { 
        username: parts[3], 
        role: parts[4] 
      };
    }
    return null;
  })
}));

// Mock bcrypt - password hashing is tested separately
jest.mock('bcryptjs', () => ({
  compare: jest.fn((password, hash) => {
    // Simulate password comparison
    // Accept 'testpassword123' with the test hash, or match password with its own hash
    if (password === 'testpassword123') {
      return Promise.resolve(true);
    }
    // For generated hashes, check if password matches the hash pattern
    if (hash.includes(`mock.hash.${password}`)) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }),
  hash: jest.fn((password, rounds) => {
    // Return a mock hash
    return Promise.resolve(`$2a$10$mock.hash.${password}`);
  })
}));

// Use credentials from configs/.env.test
const mockAdminUsername = process.env.ADMIN_USERNAME || 'testadmin';
const mockAdminPassword = 'testpassword123';

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    // Environment variables are already loaded from configs/.env.test via jest.setup.js
    // Just verify they exist
    if (!process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD_HASH) {
      throw new Error('Environment variables not loaded. Check jest.setup.js and configs/.env.test');
    }
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
      // Use a predefined mock token
      validToken = `mock-jwt-token-${mockAdminUsername}-admin`;
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
});
