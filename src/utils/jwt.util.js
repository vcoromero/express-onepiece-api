const jwt = require('jsonwebtoken');

/**
 * Utility class for handling JSON Web Token operations
 */
class JWTUtil {
  /**
   * Generates a new JWT token
   * @param {Object} payload - Data to include in the token
   * @param {string} expiresIn - Expiration time (e.g., '24h', '7d')
   * @returns {string} Signed JWT token
   */
  static generateToken(payload, expiresIn = null) {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error('JWT_SECRET is not configured in environment variables');
    }

    const options = {};
    if (expiresIn || process.env.JWT_EXPIRES_IN) {
      options.expiresIn = expiresIn || process.env.JWT_EXPIRES_IN;
    }

    return jwt.sign(payload, secret, options);
  }

  /**
   * Verifies and decodes a JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   * @throws {Error} If the token is invalid or expired
   */
  static verifyToken(token) {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error('JWT_SECRET is not configured in environment variables');
    }

    try {
      return jwt.verify(token, secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Decodes a token without verifying the signature (useful for debugging)
   * @param {string} token - JWT token to decode
   * @returns {Object} Decoded payload (unverified)
   */
  static decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = JWTUtil;

