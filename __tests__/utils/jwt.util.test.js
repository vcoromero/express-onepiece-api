const JWTUtil = require('../../src/utils/jwt.util');

describe('JWTUtil', () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
    process.env.JWT_EXPIRES_IN = '24h';
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  describe('generateToken', () => {
    it('generates a token string for a given payload', () => {
      const token = JWTUtil.generateToken({ username: 'admin', role: 'admin' });
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('throws if JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;
      expect(() => JWTUtil.generateToken({ username: 'admin' })).toThrow(
        'JWT_SECRET is not configured in environment variables'
      );
    });

    it('accepts a custom expiresIn option', () => {
      const token = JWTUtil.generateToken({ username: 'admin' }, '1h');
      const decoded = JWTUtil.decodeToken(token);
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('decodes a valid token correctly', () => {
      const payload = { username: 'admin', role: 'admin' };
      const token = JWTUtil.generateToken(payload);
      const decoded = JWTUtil.verifyToken(token);
      expect(decoded.username).toBe('admin');
      expect(decoded.role).toBe('admin');
    });

    it('throws "Invalid token" for a malformed token', () => {
      expect(() => JWTUtil.verifyToken('invalid.token.here')).toThrow('Invalid token');
    });

    it('throws "Token expired" for an expired token', () => {
      const token = JWTUtil.generateToken({ username: 'admin' }, '-1s');
      expect(() => JWTUtil.verifyToken(token)).toThrow('Token expired');
    });

    it('throws if JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;
      expect(() => JWTUtil.verifyToken('any.token.here')).toThrow(
        'JWT_SECRET is not configured in environment variables'
      );
    });
  });

  describe('decodeToken', () => {
    it('decodes without verifying signature', () => {
      const payload = { username: 'admin' };
      const token = JWTUtil.generateToken(payload);
      const decoded = JWTUtil.decodeToken(token);
      expect(decoded.username).toBe('admin');
    });

    it('returns null for an invalid token', () => {
      const result = JWTUtil.decodeToken('not-a-jwt');
      expect(result).toBeNull();
    });
  });
});
