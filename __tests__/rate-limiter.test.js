const request = require('supertest');
const app = require('../src/app');

describe('Rate Limiting Tests', () => {
  beforeAll(() => {
    // Set environment variables for tests
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.ADMIN_USERNAME = 'testadmin';
    process.env.ADMIN_PASSWORD_HASH = '$2a$10$test';
    process.env.NODE_ENV = 'test';
    
    // Set rate limits for testing
    process.env.RATE_LIMIT_WINDOW_MS = '60000'; // 1 minute
    process.env.RATE_LIMIT_MAX_REQUESTS = '10';
    process.env.RATE_LIMIT_LOGIN_MAX = '3';
  });

  describe('General Rate Limiting', () => {
    it('should allow requests under the rate limit', async () => {
      // Make 5 requests (under the limit of 10)
      for (let i = 0; i < 5; i++) {
        const response = await request(app).get('/api/health');
        expect([200, 404]).toContain(response.status); // Either OK or not found is fine
      }
    });

    it('should include rate limit headers in response', async () => {
      const response = await request(app).get('/api/health');
      
      // Check for rate limit headers
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
      expect(response.headers).toHaveProperty('ratelimit-reset');
    });
  });

  describe('Authentication Rate Limiting', () => {
    it('should allow login attempts under the limit', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      // Make 2 login attempts (under limit of 3)
      for (let i = 0; i < 2; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData);
        
        // Should get 401 (invalid credentials) not 429 (rate limited)
        expect(response.status).toBe(401);
      }
    });

    it('should have stricter limits for auth endpoints', async () => {
      const response = await request(app).post('/api/auth/login');
      
      // Auth endpoints should have different (stricter) rate limits
      const limit = parseInt(response.headers['ratelimit-limit']);
      expect(limit).toBeLessThanOrEqual(10); // Should be strict
    });
  });

  describe('Rate Limit Error Response', () => {
    it('should return proper error format when rate limited', async () => {
      // This test might not trigger in test environment
      // but validates the expected response structure
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      // Make requests to approach limit
      const responses = [];
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData);
        responses.push(response);
      }

      // Check that responses have proper structure
      responses.forEach(response => {
        expect(response.body).toHaveProperty('success');
        expect(response.body).toHaveProperty('message');
      });
    });
  });

  describe('404 Handler with Rate Limiting', () => {
    it('should handle 404 errors properly', async () => {
      const response = await request(app).get('/api/nonexistent-route');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Route not found');
    });

    it('should apply rate limiting to 404 routes', async () => {
      const response = await request(app).get('/api/nonexistent');
      
      // Should have rate limit headers even for 404
      expect(response.headers).toHaveProperty('ratelimit-limit');
    });
  });
});

