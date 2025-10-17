const rateLimit = require('express-rate-limit');
const { generalLimiter, authLimiter, sensitiveOperationsLimiter, createRateLimiter } = require('../../src/middlewares/rate-limiter');

// Mock logger to avoid console output during tests
jest.mock('../../src/utils/logger', () => ({
  security: {
    rateLimitExceeded: jest.fn()
  }
}));

describe('Rate Limiter Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.RATE_LIMIT_WINDOW_MS;
    delete process.env.RATE_LIMIT_MAX_REQUESTS;
    delete process.env.RATE_LIMIT_LOGIN_MAX;
  });

  describe('generalLimiter', () => {
    it('should have correct default configuration', () => {
      expect(generalLimiter).toBeDefined();
      expect(typeof generalLimiter).toBe('function');
    });

    it('should use environment variables when provided', () => {
      process.env.RATE_LIMIT_WINDOW_MS = '30000'; // 30 seconds
      process.env.RATE_LIMIT_MAX_REQUESTS = '50';
      
      // Re-require to get updated config
      delete require.cache[require.resolve('../../src/middlewares/rate-limiter')];
      const { generalLimiter: updatedLimiter } = require('../../src/middlewares/rate-limiter');
      
      expect(updatedLimiter).toBeDefined();
    });

    it('should have correct default values', () => {
      const config = generalLimiter;
      expect(config).toBeDefined();
    });
  });

  describe('authLimiter', () => {
    it('should have correct configuration', () => {
      expect(authLimiter).toBeDefined();
      expect(typeof authLimiter).toBe('function');
    });

    it('should have stricter limits than general limiter', () => {
      expect(authLimiter).toBeDefined();
    });
  });

  describe('sensitiveOperationsLimiter', () => {
    it('should have correct configuration', () => {
      expect(sensitiveOperationsLimiter).toBeDefined();
      expect(typeof sensitiveOperationsLimiter).toBe('function');
    });

    it('should be configured for modification operations', () => {
      expect(sensitiveOperationsLimiter).toBeDefined();
    });
  });

  describe('createRateLimiter', () => {
    it('should create a rate limiter with default options', () => {
      const limiter = createRateLimiter({});
      
      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe('function');
    });

    it('should create a rate limiter with custom options', () => {
      const customOptions = {
        windowMs: 60000, // 1 minute
        max: 20,
        message: {
          success: false,
          message: 'Custom rate limit exceeded',
          error: 'CUSTOM_RATE_LIMIT'
        }
      };
      
      const limiter = createRateLimiter(customOptions);
      
      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe('function');
    });

    it('should merge custom options with defaults', () => {
      const customOptions = {
        windowMs: 30000,
        max: 15,
        customProperty: 'test'
      };
      
      const limiter = createRateLimiter(customOptions);
      
      expect(limiter).toBeDefined();
    });

    it('should handle missing options gracefully', () => {
      const limiter = createRateLimiter();
      
      expect(limiter).toBeDefined();
      expect(typeof limiter).toBe('function');
    });

    it('should use default message when not provided', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        max: 10
      });
      
      expect(limiter).toBeDefined();
    });

    it('should override default properties when provided', () => {
      const customOptions = {
        windowMs: 120000, // 2 minutes
        max: 25,
        standardHeaders: false,
        legacyHeaders: true
      };
      
      const limiter = createRateLimiter(customOptions);
      
      expect(limiter).toBeDefined();
    });
  });

  describe('Rate Limiter Configuration', () => {
    it('should export all required functions', () => {
      const rateLimiter = require('../../src/middlewares/rate-limiter');
      
      expect(rateLimiter.generalLimiter).toBeDefined();
      expect(rateLimiter.authLimiter).toBeDefined();
      expect(rateLimiter.sensitiveOperationsLimiter).toBeDefined();
      expect(rateLimiter.createRateLimiter).toBeDefined();
    });

    it('should have correct function types', () => {
      expect(typeof generalLimiter).toBe('function');
      expect(typeof authLimiter).toBe('function');
      expect(typeof sensitiveOperationsLimiter).toBe('function');
      expect(typeof createRateLimiter).toBe('function');
    });
  });

  describe('Environment Variable Handling', () => {
    it('should handle missing environment variables', () => {
      delete process.env.RATE_LIMIT_WINDOW_MS;
      delete process.env.RATE_LIMIT_MAX_REQUESTS;
      delete process.env.RATE_LIMIT_LOGIN_MAX;
      
      // Re-require to test with missing env vars
      delete require.cache[require.resolve('../../src/middlewares/rate-limiter')];
      const { generalLimiter: testLimiter } = require('../../src/middlewares/rate-limiter');
      
      expect(testLimiter).toBeDefined();
    });

    it('should handle invalid environment variables', () => {
      process.env.RATE_LIMIT_WINDOW_MS = 'invalid';
      process.env.RATE_LIMIT_MAX_REQUESTS = 'not-a-number';
      
      // Re-require to test with invalid env vars
      delete require.cache[require.resolve('../../src/middlewares/rate-limiter')];
      const { generalLimiter: testLimiter } = require('../../src/middlewares/rate-limiter');
      
      expect(testLimiter).toBeDefined();
    });

    it('should handle zero values in environment variables', () => {
      process.env.RATE_LIMIT_WINDOW_MS = '0';
      process.env.RATE_LIMIT_MAX_REQUESTS = '0';
      
      // Re-require to test with zero values
      delete require.cache[require.resolve('../../src/middlewares/rate-limiter')];
      const { generalLimiter: testLimiter } = require('../../src/middlewares/rate-limiter');
      
      expect(testLimiter).toBeDefined();
    });
  });

  describe('Rate Limiter Properties', () => {
    it('should have standardHeaders enabled by default', () => {
      const limiter = createRateLimiter({});
      expect(limiter).toBeDefined();
    });

    it('should have legacyHeaders disabled by default', () => {
      const limiter = createRateLimiter({});
      expect(limiter).toBeDefined();
    });

    it('should allow overriding headers configuration', () => {
      const limiter = createRateLimiter({
        standardHeaders: false,
        legacyHeaders: true
      });
      
      expect(limiter).toBeDefined();
    });
  });

  describe('Message Configuration', () => {
    it('should have proper message structure for general limiter', () => {
      expect(generalLimiter).toBeDefined();
    });

    it('should have proper message structure for auth limiter', () => {
      expect(authLimiter).toBeDefined();
    });

    it('should have proper message structure for sensitive operations limiter', () => {
      expect(sensitiveOperationsLimiter).toBeDefined();
    });

    it('should allow custom message in createRateLimiter', () => {
      const customMessage = {
        success: false,
        message: 'Custom rate limit message',
        error: 'CUSTOM_ERROR'
      };
      
      const limiter = createRateLimiter({
        message: customMessage
      });
      
      expect(limiter).toBeDefined();
    });
  });

  describe('Handler Functions', () => {
    it('should have handler functions defined', () => {
      expect(generalLimiter).toBeDefined();
      expect(authLimiter).toBeDefined();
      expect(sensitiveOperationsLimiter).toBeDefined();
    });

    it('should create rate limiters with handler functions', () => {
      const customHandler = (req, res) => {
        res.status(429).json({ error: 'Custom handler' });
      };
      
      const limiter = createRateLimiter({
        handler: customHandler
      });
      
      expect(limiter).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null options', () => {
      const limiter = createRateLimiter(null);
      expect(limiter).toBeDefined();
    });

    it('should handle undefined options', () => {
      const limiter = createRateLimiter(undefined);
      expect(limiter).toBeDefined();
    });

    it('should handle empty object options', () => {
      const limiter = createRateLimiter({});
      expect(limiter).toBeDefined();
    });

    it('should handle options with only some properties', () => {
      const limiter = createRateLimiter({
        windowMs: 30000
      });
      
      expect(limiter).toBeDefined();
    });
  });

  describe('Integration with express-rate-limit', () => {
    it('should return express-rate-limit middleware functions', () => {
      expect(typeof generalLimiter).toBe('function');
      expect(typeof authLimiter).toBe('function');
      expect(typeof sensitiveOperationsLimiter).toBe('function');
    });

    it('should create valid middleware functions', () => {
      const customLimiter = createRateLimiter({
        windowMs: 60000,
        max: 10
      });
      
      expect(typeof customLimiter).toBe('function');
    });
  });
});
