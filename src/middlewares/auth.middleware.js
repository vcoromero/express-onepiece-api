const JWTUtil = require('../utils/jwt.util');

/**
 * JWT Authentication Middleware
 * Verifies that the user has a valid token before accessing protected routes
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token not provided',
        error: 'Authorization header not found'
      });
    }

    // Verify the format is "Bearer <token>"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
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

    // Continue to the next function
    next();
  } catch (error) {
    // Handle token errors
    if (error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: 'The token has expired. Please login again.'
      });
    }

    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: 'The provided token is not valid'
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      message: 'Error verifying token',
      error: error.message
    });
  }
};

module.exports = authMiddleware;

