const bcrypt = require('bcryptjs');

jest.mock('../src/config/prisma.config', () => ({
  user: {
    findUnique: jest.fn()
  }
}));

const prisma = require('../src/config/prisma.config');
const authService = require('../src/services/auth.service');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginWithCredentials', () => {
    it('returns success when password matches', async () => {
      const hash = await bcrypt.hash('secret123', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'alice',
        passwordHash: hash,
        role: 'admin',
        isActive: true
      });

      const result = await authService.loginWithCredentials('alice', 'secret123');

      expect(result.success).toBe(true);
      expect(result.user).toEqual({
        id: 1,
        username: 'alice',
        role: 'admin'
      });
    });

    it('returns failure when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await authService.loginWithCredentials('nobody', 'x');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_CREDENTIALS');
    });

    it('returns failure when account inactive', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'bob',
        passwordHash: 'x',
        role: 'editor',
        isActive: false
      });

      const result = await authService.loginWithCredentials('bob', 'x');

      expect(result.success).toBe(false);
      expect(result.error).toBe('ACCOUNT_DISABLED');
    });

    it('returns failure when password wrong', async () => {
      const hash = await bcrypt.hash('right', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'carol',
        passwordHash: hash,
        role: 'editor',
        isActive: true
      });

      const result = await authService.loginWithCredentials('carol', 'wrong');

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_CREDENTIALS');
    });

    it('returns failure for empty username', async () => {
      const result = await authService.loginWithCredentials('   ', 'p');

      expect(result.success).toBe(false);
      expect(result.error).toBe('MISSING_CREDENTIALS');
    });
  });
});
