const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Rate limiting configurations for different endpoints
 * Prevents abuse and reduces costs in cloud environments like AWS
 */

/**
 * General API rate limiter
 * Applied to all routes by default
 */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    error: 'Rate limit exceeded'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.security.rateLimitExceeded(req.ip, req.path, {
      limit: req.rateLimit.limit,
      current: req.rateLimit.current
    });

    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later',
      error: 'Rate limit exceeded',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * Much stricter to prevent brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX) || 5, // Limit each IP to 5 login attempts per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    error: 'Authentication rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security.rateLimitExceeded(req.ip, req.path, {
      limit: req.rateLimit.limit,
      current: req.rateLimit.current,
      username: req.body.username || 'unknown'
    });

    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again after 15 minutes',
      error: 'Authentication rate limit exceeded',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Moderate rate limiter for sensitive operations
 * Applied to POST, PUT, DELETE endpoints
 */
const sensitiveOperationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    message: 'Too many modification requests, please try again later',
    error: 'Operation rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security.rateLimitExceeded(req.ip, req.path, {
      method: req.method,
      limit: req.rateLimit.limit,
      current: req.rateLimit.current
    });

    res.status(429).json({
      success: false,
      message: 'Too many modification requests, please try again later',
      error: 'Operation rate limit exceeded',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Create custom rate limiter with specific configuration
 */
const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || {
      success: false,
      message: 'Rate limit exceeded',
      error: 'Too many requests'
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...options
  });
};

module.exports = {
  generalLimiter,
  authLimiter,
  sensitiveOperationsLimiter,
  createRateLimiter
};

