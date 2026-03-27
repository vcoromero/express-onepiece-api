const logger = require('./logger');

const DEFAULT_ERROR_STATUS_MAP = {
  INVALID_ID: 400,
  INVALID_BODY: 400,
  VALIDATION_ERROR: 400,
  MISSING_NAME: 400,
  MISSING_SEARCH_QUERY: 400,
  MISSING_SEARCH_TERM: 400,
  INVALID_NAME: 400,
  INVALID_RACE: 400,
  INVALID_CHARACTER_TYPE: 400,
  INVALID_TYPE: 400,
  NO_FIELDS_PROVIDED: 400,
  NOT_FOUND: 404,
  DUPLICATE_NAME: 409,
  HAS_ASSOCIATIONS: 409,
  HAS_MEMBERS: 409,
  MISSING_CREDENTIALS: 400,
  INVALID_CREDENTIALS: 401,
  ACCOUNT_DISABLED: 401,
  LOGIN_ERROR: 500
};

const buildValidationError = (message, error = 'VALIDATION_ERROR') => ({
  success: false,
  message,
  error
});

const getStatusForServiceError = (errorCode, overrides = {}, fallbackStatus = 500) => {
  if (!errorCode) return fallbackStatus;
  if (overrides[errorCode]) return overrides[errorCode];
  return DEFAULT_ERROR_STATUS_MAP[errorCode] || fallbackStatus;
};

const sendServiceResultError = (res, result, options = {}) => {
  const status = getStatusForServiceError(result.error, options.overrides, options.fallbackStatus);
  return res.status(status).json(result);
};

const sendUnexpectedError = (res, error, context) => {
  logger.error('Controller unexpected error', {
    context,
    error: error.message,
    stack: error.stack
  });

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

module.exports = {
  buildValidationError,
  getStatusForServiceError,
  sendServiceResultError,
  sendUnexpectedError
};
