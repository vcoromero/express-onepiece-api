const logger = require('./logger');

const serviceSuccess = (payload = {}) => ({
  success: true,
  ...payload
});

const serviceFailure = (message, errorCode, originalError = null, context = 'service') => {
  if (originalError) {
    logger.error('Service execution error', {
      context,
      error: originalError.message,
      stack: originalError.stack
    });
  }

  return {
    success: false,
    message,
    error: errorCode || 'INTERNAL_ERROR',
    details: process.env.NODE_ENV === 'development' && originalError ? originalError.message : undefined
  };
};

module.exports = {
  serviceSuccess,
  serviceFailure
};
