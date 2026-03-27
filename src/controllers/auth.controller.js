const JWTUtil = require('../utils/jwt.util');
const logger = require('../utils/logger');
const { authService } = require('../services');
const { getStatusForServiceError } = require('../utils/http-response.helper');

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

      if (!username || !password) {
        logger.security.loginFailed(username || 'unknown', ip, 'Missing credentials');

        return res.status(400).json({
          success: false,
          message: 'Incomplete credentials',
          error: 'Username and password are required'
        });
      }

      const result = await authService.loginWithCredentials(username, password);

      if (!result.success) {
        const status = getStatusForServiceError(result.error, {}, 401);

        if (result.error === 'INVALID_CREDENTIALS' || result.error === 'ACCOUNT_DISABLED') {
          logger.security.loginFailed(username, ip, result.error);
        }

        const message =
          result.error === 'MISSING_CREDENTIALS'
            ? 'Incomplete credentials'
            : 'Invalid credentials';
        const clientError =
          result.error === 'MISSING_CREDENTIALS'
            ? 'Username and password are required'
            : 'Incorrect username or password';

        return res.status(status).json({
          success: false,
          message,
          error: clientError
        });
      }

      const { user } = result;

      const token = JWTUtil.generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        timestamp: Date.now()
      });

      logger.security.loginSuccess(user.username, ip, {
        userAgent: req.get('user-agent')
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h',
          user: {
            id: user.id,
            username: user.username,
            role: user.role
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
}

module.exports = AuthController;
