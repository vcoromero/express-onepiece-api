const winston = require('winston');
const path = require('path');

/**
 * Logger configuration using Winston
 * Supports multiple transports: Console, File, and CloudWatch (AWS)
 */

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Tell winston about our colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (prettier for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

// Define transports
const transports = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: consoleFormat
  })
);

// File transports (disabled in test environment)
if (process.env.NODE_ENV !== 'test') {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      format
    })
  );

  // Security log file (for authentication and authorization events)
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'security.log'),
      level: 'warn',
      format
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false
});

/**
 * Security-specific logging methods
 */
logger.security = {
  loginSuccess: (username, ip, metadata = {}) => {
    logger.info('LOGIN_SUCCESS', {
      event: 'authentication',
      action: 'login_success',
      username,
      ip,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  },

  loginFailed: (username, ip, reason, metadata = {}) => {
    logger.warn('LOGIN_FAILED', {
      event: 'authentication',
      action: 'login_failed',
      username,
      ip,
      reason,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  },

  tokenVerified: (username, ip, metadata = {}) => {
    logger.info('TOKEN_VERIFIED', {
      event: 'authorization',
      action: 'token_verified',
      username,
      ip,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  },

  tokenInvalid: (ip, reason, metadata = {}) => {
    logger.warn('TOKEN_INVALID', {
      event: 'authorization',
      action: 'token_invalid',
      ip,
      reason,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  },

  rateLimitExceeded: (ip, endpoint, metadata = {}) => {
    logger.warn('RATE_LIMIT_EXCEEDED', {
      event: 'security',
      action: 'rate_limit_exceeded',
      ip,
      endpoint,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  },

  unauthorizedAccess: (ip, endpoint, metadata = {}) => {
    logger.warn('UNAUTHORIZED_ACCESS', {
      event: 'security',
      action: 'unauthorized_access',
      ip,
      endpoint,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }
};

/**
 * HTTP request logging helper
 */
logger.httpRequest = (req, res, responseTime) => {
  logger.http('HTTP_REQUEST', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
};

module.exports = logger;

