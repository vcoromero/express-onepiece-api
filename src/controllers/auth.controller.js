const bcrypt = require('bcryptjs');
const JWTUtil = require('../utils/jwt.util');
const logger = require('../utils/logger');

/**
 * Authentication Controller
 * Handles login and JWT token generation
 */
class AuthController {
  /**
   * User login
   * POST /api/auth/login
   * Body: { username: string, password: string }
   */
  static async login(req, res) {
    const ip = req.ip || req.connection.remoteAddress;
    
    try {
      const { username, password } = req.body;

      // Validate that username and password are provided
      if (!username || !password) {
        logger.security.loginFailed(username || 'unknown', ip, 'Missing credentials');
        
        return res.status(400).json({
          success: false,
          message: 'Incomplete credentials',
          error: 'Username and password are required'
        });
      }

      // Get admin credentials from environment variables
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

      if (!adminUsername || !adminPasswordHash) {
        logger.error('Authentication configuration error', {
          missingVars: {
            username: !adminUsername,
            passwordHash: !adminPasswordHash
          }
        });
        
        return res.status(500).json({
          success: false,
          message: 'Authentication configuration error',
          error: 'Environment variables not configured'
        });
      }

      // Verify username
      if (username !== adminUsername) {
        logger.security.loginFailed(username, ip, 'Invalid username');
        
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          error: 'Incorrect username or password'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, adminPasswordHash);

      if (!isPasswordValid) {
        logger.security.loginFailed(username, ip, 'Invalid password');
        
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          error: 'Incorrect username or password'
        });
      }

      // Generate JWT token
      const token = JWTUtil.generateToken({
        username: adminUsername,
        role: 'admin',
        timestamp: Date.now()
      });

      // Log successful login
      logger.security.loginSuccess(adminUsername, ip, {
        userAgent: req.get('user-agent')
      });

      // Respond with the token
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h',
          user: {
            username: adminUsername,
            role: 'admin'
          }
        }
      });
    } catch (error) {
      logger.error('Error processing login', {
        error: error.message,
        stack: error.stack,
        ip
      });
      
      return res.status(500).json({
        success: false,
        message: 'Error processing login',
        error: error.message
      });
    }
  }

  /**
   * Verify if a token is valid
   * GET /api/auth/verify
   * Header: Authorization: Bearer <token>
   */
  static async verifyToken(req, res) {
    try {
      // If we got here, the middleware already verified the token
      return res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error verifying token',
        error: error.message
      });
    }
  }

  /**
   * Utility to generate password hash
   * For development only - DO NOT expose in production
   */
  static async generatePasswordHash(req, res) {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required',
          error: 'The password field is required'
        });
      }

      const hash = await bcrypt.hash(password, 10);

      return res.status(200).json({
        success: true,
        message: 'Hash generated successfully',
        data: {
          hash,
          note: 'Save this hash in the ADMIN_PASSWORD_HASH variable in your .env file'
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error generating hash',
        error: error.message
      });
    }
  }
}

module.exports = AuthController;
