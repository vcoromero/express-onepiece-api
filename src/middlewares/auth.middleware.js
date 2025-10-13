const JWTUtil = require('../utils/jwt.util');
const logger = require('../utils/logger');

/**
 * JWT Authentication Middleware
 * Verifies that the user has a valid token before accessing protected routes
 */
const authMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.security.unauthorizedAccess(ip, req.path, {
        reason: 'No authorization header'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Authentication token not provided',
        error: 'Authorization header not found'
      });
    }

    // Verify the format is "Bearer <token>"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      logger.security.tokenInvalid(ip, 'Invalid token format');
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
        error: 'Format must be: Bearer <token>'
      });
    }

    const token = parts[1];

    // Verify and decode the token
    const decoded = JWTUtil.verifyToken(token);

    // Add the decoded user information to the request
    req.user = decoded;

    // Log successful token verification
    logger.security.tokenVerified(decoded.username, ip, {
      endpoint: req.path,
      method: req.method
    });

    // Continue to the next function
    next();
  } catch (error) {
    // Handle token errors
    if (error.message === 'Token expired') {
      logger.security.tokenInvalid(ip, 'Token expired', {
        endpoint: req.path
      });
      
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: 'The token has expired. Please login again.'
      });
    }

    if (error.message === 'Invalid token') {
      logger.security.tokenInvalid(ip, 'Invalid token signature', {
        endpoint: req.path
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: 'The provided token is not valid'
      });
    }

    // Generic error
    logger.error('Error verifying token', {
      error: error.message,
      stack: error.stack,
      ip,
      endpoint: req.path
    });
    
    return res.status(500).json({
      success: false,
      message: 'Error verifying token',
      error: error.message
    });
  }
};

module.exports = authMiddleware;

