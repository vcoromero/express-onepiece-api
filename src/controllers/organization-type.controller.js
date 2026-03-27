const organizationTypeService = require('../services/organization-type.service');
const { createListResponse, createItemResponse } = require('../utils/response.helper');
const {
  buildValidationError,
  sendServiceResultError,
  sendUnexpectedError
} = require('../utils/http-response.helper');

/**
 * @class OrganizationTypeController
 * @description Controller for OrganizationType HTTP requests
 */
class OrganizationTypeController {
  /**
   * Get all organization types
   * @route GET /api/organization-types
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async getAllOrganizationTypes(req, res) {
    try {
      const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;
      
      const result = await organizationTypeService.getAllOrganizationTypes({ search, sortBy, sortOrder });
      
      if (!result.success) {
        return sendServiceResultError(res, result);
      }

      res.status(200).json(createListResponse(
        result.organizationTypes,
        'Organization types retrieved successfully'
      ));
    } catch (error) {
      return sendUnexpectedError(res, error, 'organizationType.getAllOrganizationTypes');
    }
  }

  /**
   * Get organization type by ID
   * @route GET /api/organization-types/:id
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async getOrganizationTypeById(req, res) {
    try {
      const { id } = req.params;

      // Validate ID is a valid number
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return res.status(400).json(buildValidationError('Invalid organization type ID', 'INVALID_ID'));
      }

      const result = await organizationTypeService.getOrganizationTypeById(Number.parseInt(id));

      if (!result.success) {
        return sendServiceResultError(res, result);
      }

      res.status(200).json(createItemResponse(
        result.data,
        'Organization type retrieved successfully'
      ));
    } catch (error) {
      return sendUnexpectedError(res, error, 'organizationType.getOrganizationTypeById');
    }
  }

  /**
   * Update organization type
   * @route PUT /api/organization-types/:id
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async updateOrganizationType(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate ID is a valid number
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return res.status(400).json(buildValidationError('Invalid organization type ID', 'INVALID_ID'));
      }

      // Validate request body
      if (!updateData || typeof updateData !== 'object') {
        return res.status(400).json(buildValidationError('Request body must be a valid JSON object', 'INVALID_BODY'));
      }

      const result = await organizationTypeService.updateOrganizationType(Number.parseInt(id), updateData);

      if (!result.success) {
        return sendServiceResultError(res, result);
      }

      res.status(200).json(createItemResponse(
        result.organizationType,
        'Organization type updated successfully'
      ));
    } catch (error) {
      return sendUnexpectedError(res, error, 'organizationType.updateOrganizationType');
    }
  }
}

module.exports = new OrganizationTypeController();
