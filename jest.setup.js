// Jest setup file
// Load test environment variables from configs/.env.test

require('dotenv').config({
  path: './configs/.env.test'
});

// Mock console methods globally to suppress noise in test output
// These are already tested or not relevant to test
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'info').mockImplementation(() => {});

// Mock logger globally - it has its own tests and we don't want logging during tests
jest.mock('./src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  http: jest.fn(),
  security: {
    loginSuccess: jest.fn(),
    loginFailed: jest.fn(),
    tokenVerified: jest.fn(),
    tokenInvalid: jest.fn(),
    rateLimitExceeded: jest.fn(),
    unauthorizedAccess: jest.fn()
  },
  httpRequest: jest.fn()
}));
