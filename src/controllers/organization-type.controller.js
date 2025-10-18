const organizationTypeService = require('../services/organization-type.service');
const { createListResponse, createItemResponse, createErrorResponse } = require('../utils/response.helper');

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
        return res.status(500).json(result);
      }

      res.status(200).json(createListResponse(
        result.organizationTypes,
        'Organization types retrieved successfully'
      ));
    } catch (error) {
      console.error('Error in getAllOrganizationTypes controller:', error);
      res.status(500).json(createErrorResponse(
        'Internal server error',
        'INTERNAL_SERVER_ERROR',
        500
      ));
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
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json(createErrorResponse(
          'Invalid organization type ID',
          'INVALID_ID',
          400
        ));
      }

      const result = await organizationTypeService.getOrganizationTypeById(parseInt(id));

      if (!result.success) {
        if (result.error === 'NOT_FOUND') {
          return res.status(404).json(result);
        }
        return res.status(500).json(result);
      }

      res.status(200).json(createItemResponse(
        result.data,
        'Organization type retrieved successfully'
      ));
    } catch (error) {
      console.error('Error in getOrganizationTypeById controller:', error);
      res.status(500).json(createErrorResponse(
        'Internal server error',
        'INTERNAL_SERVER_ERROR',
        500
      ));
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
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json(createErrorResponse(
          'Invalid organization type ID',
          'INVALID_ID',
          400
        ));
      }

      // Validate request body
      if (!updateData || typeof updateData !== 'object') {
        return res.status(400).json(createErrorResponse(
          'Request body must be a valid JSON object',
          'INVALID_BODY',
          400
        ));
      }

      const result = await organizationTypeService.updateOrganizationType(parseInt(id), updateData);

      if (!result.success) {
        switch (result.error) {
        case 'NOT_FOUND':
          return res.status(404).json(result);
        case 'INVALID_ID':
        case 'NO_FIELDS_PROVIDED':
        case 'INVALID_NAME':
          return res.status(400).json(result);
        case 'DUPLICATE_NAME':
          return res.status(409).json(result);
        default:
          return res.status(500).json(result);
        }
      }

      res.status(200).json(createItemResponse(
        result.data,
        'Organization type updated successfully'
      ));
    } catch (error) {
      console.error('Error in updateOrganizationType controller:', error);
      res.status(500).json(createErrorResponse(
        'Internal server error',
        'INTERNAL_SERVER_ERROR',
        500
      ));
    }
  }
}

module.exports = new OrganizationTypeController();
