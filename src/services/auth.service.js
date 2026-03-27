const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma.config');
const { serviceFailure, serviceSuccess } = require('../utils/service-result.helper');

class AuthService {
  /**
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ success: true, user: { id: number, username: string, role: string } } | { success: false, message: string, error: string }>}
   */
  async loginWithCredentials(username, password) {
    if (!username?.trim() || !password) {
      return serviceFailure('Incomplete credentials', 'MISSING_CREDENTIALS');
    }

    const normalized = username.trim();

    try {
      const user = await prisma.user.findUnique({
        where: { username: normalized }
      });

      if (!user) {
        return serviceFailure('Invalid credentials', 'INVALID_CREDENTIALS');
      }

      if (!user.isActive) {
        return serviceFailure('Invalid credentials', 'ACCOUNT_DISABLED');
      }

      const match = await bcrypt.compare(password, user.passwordHash);

      if (!match) {
        return serviceFailure('Invalid credentials', 'INVALID_CREDENTIALS');
      }

      return serviceSuccess({
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      return serviceFailure('Login failed', 'LOGIN_ERROR', error, 'auth.service');
    }
  }
}

module.exports = new AuthService();
