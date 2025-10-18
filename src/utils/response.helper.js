/**
 * Response Helper
 * Provides standardized response structures for the API
 */

/**
 * Creates a standardized success response for paginated data
 * @param {Array} data - Array of data items
 * @param {Object} pagination - Pagination information
 * @param {string} message - Success message
 * @returns {Object} Standardized response object
 */
const createPaginatedResponse = (data, pagination, message = 'Data retrieved successfully') => {
  return {
    success: true,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || 0,
      totalPages: pagination.totalPages || 0,
      hasNext: pagination.hasNext || false,
      hasPrev: pagination.hasPrev || false
    },
    message
  };
};

/**
 * Creates a standardized success response for non-paginated data
 * @param {Array} data - Array of data items
 * @param {string} message - Success message
 * @returns {Object} Standardized response object
 */
const createListResponse = (data, message = 'Data retrieved successfully') => {
  return {
    success: true,
    data,
    count: data.length,
    message
  };
};

/**
 * Creates a standardized success response for single item
 * @param {Object} data - Single data item
 * @param {string} message - Success message
 * @returns {Object} Standardized response object
 */
const createItemResponse = (data, message = 'Data retrieved successfully') => {
  return {
    success: true,
    data,
    message
  };
};

module.exports = {
  createPaginatedResponse,
  createListResponse,
  createItemResponse
};
