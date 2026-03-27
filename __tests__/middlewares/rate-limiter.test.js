const {
  generalLimiter,
  authLimiter,
  sensitiveOperationsLimiter,
  createRateLimiter
} = require('../../src/middlewares/rate-limiter');

describe('Rate Limiter middleware', () => {
  describe('exported limiters', () => {
    it('generalLimiter is a middleware function', () => {
      expect(typeof generalLimiter).toBe('function');
    });

    it('authLimiter is a middleware function', () => {
      expect(typeof authLimiter).toBe('function');
    });

    it('sensitiveOperationsLimiter is a middleware function', () => {
      expect(typeof sensitiveOperationsLimiter).toBe('function');
    });
  });

  describe('createRateLimiter', () => {
    it('returns a middleware function with default options', () => {
      const limiter = createRateLimiter();
      expect(typeof limiter).toBe('function');
    });

    it('returns a middleware function with custom options', () => {
      const limiter = createRateLimiter({ windowMs: 5000, max: 10 });
      expect(typeof limiter).toBe('function');
    });

    it('handles null options gracefully', () => {
      const limiter = createRateLimiter(null);
      expect(typeof limiter).toBe('function');
    });

    it('handles undefined options gracefully', () => {
      const limiter = createRateLimiter(undefined);
      expect(typeof limiter).toBe('function');
    });
  });
});
