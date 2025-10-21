// JWT Utility Tests
// These are unit tests for the JWT utility functions

const jwt = require('jsonwebtoken');
const JWTUtil = require('../../src/utils/jwt.util');

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('JWTUtil', () => {
  const mockPayload = { username: 'testuser', role: 'admin' };
  const mockToken = 'mock.jwt.token';
  const mockSecret = 'test-secret';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = mockSecret;
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('generateToken', () => {
    it('should generate a token with correct payload', () => {
      jwt.sign.mockReturnValue(mockToken);

      const result = JWTUtil.generateToken(mockPayload);

      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        mockSecret,
        { expiresIn: '24h' }
      );
      expect(result).toBe(mockToken);
    });

    it('should use custom expiresIn when provided', () => {
      jwt.sign.mockReturnValue(mockToken);

      const result = JWTUtil.generateToken(mockPayload, '2h');

      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        mockSecret,
        { expiresIn: '2h' }
      );
      expect(result).toBe(mockToken);
    });

    it('should throw error if JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;

      expect(() => JWTUtil.generateToken(mockPayload)).toThrow('JWT_SECRET is not configured in environment variables');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      jwt.verify.mockReturnValue(mockPayload);

      const result = JWTUtil.verifyToken(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, mockSecret);
      expect(result).toEqual(mockPayload);
    });

    it('should throw error for invalid token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => JWTUtil.verifyToken('invalid-token')).toThrow('Invalid token');
    });

    it('should throw error if JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;

      expect(() => JWTUtil.verifyToken(mockToken)).toThrow('JWT_SECRET is not configured in environment variables');
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      jwt.decode.mockReturnValue(mockPayload);

      const result = JWTUtil.decodeToken(mockToken);

      expect(jwt.decode).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual(mockPayload);
    });

    it('should return null for invalid token', () => {
      jwt.decode.mockReturnValue(null);

      const result = JWTUtil.decodeToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle jwt.sign errors', () => {
      jwt.sign.mockImplementation(() => {
        throw new Error('Sign error');
      });

      expect(() => JWTUtil.generateToken(mockPayload)).toThrow('Sign error');
    });

    it('should handle jwt.verify errors', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Verify error');
      });

      expect(() => JWTUtil.verifyToken(mockToken)).toThrow('Verify error');
    });
  });
});
