const OrganizationService = require('../services/organization.service');
const { createPaginatedResponse, createItemResponse, createListResponse } = require('../utils/response.helper');
const {
  sendServiceResultError,
  sendUnexpectedError
} = require('../utils/http-response.helper');

/**
 * Organization Controller
 * HTTP request handlers for organization operations
 * @description Handles HTTP requests, validates parameters, calls services,
 * and formats responses for organization endpoints
 * @author Database Expert
 * @version 1.0.0
 */
class OrganizationController {
  buildValidationError(message) {
    return {
      success: false,
      message,
      error: 'VALIDATION_ERROR'
    };
  }

  validateOrganizationData(data, options = {}) {
    const { requireNameAndType = false } = options;
    const hasValue = (value) => value !== undefined && value !== null && value !== '';
    const statusValues = ['active', 'disbanded', 'destroyed'];

    if (requireNameAndType && (!data.name || !hasValue(data.organizationTypeId))) {
      return this.buildValidationError('Name and organization type are required');
    }

    const parsedOrganizationTypeId = Number.parseInt(data.organizationTypeId);
    const parsedLeaderId = Number.parseInt(data.leaderId);
    const parsedShipId = Number.parseInt(data.shipId);
    const parsedBounty = Number.parseInt(data.totalBounty);
    const validationRules = [
      {
        condition: data.name && data.name.length > 100,
        message: 'Organization name must be 100 characters or less'
      },
      {
        condition: hasValue(data.organizationTypeId) && Number.isNaN(parsedOrganizationTypeId),
        message: 'Valid organization type ID is required'
      },
      {
        condition: hasValue(data.leaderId) && Number.isNaN(parsedLeaderId),
        message: 'Valid leader ID is required'
      },
      {
        condition: hasValue(data.shipId) && Number.isNaN(parsedShipId),
        message: 'Valid ship ID is required'
      },
      {
        condition: hasValue(data.status) && !statusValues.includes(data.status),
        message: 'Invalid status. Must be active, disbanded, or destroyed'
      },
      {
        condition: hasValue(data.totalBounty) && (Number.isNaN(parsedBounty) || parsedBounty < 0),
        message: 'Total bounty must be a non-negative number'
      }
    ];

    for (const rule of validationRules) {
      if (rule.condition) {
        return this.buildValidationError(rule.message);
      }
    }

    if (data.jollyRogerUrl) {
      try {
        new URL(data.jollyRogerUrl);
      } catch (urlError) {
        return this.buildValidationError(`Invalid Jolly Roger URL format: ${urlError.message}`);
      }
    }

    return null;
  }

  getOrganizationErrorResponse(error) {
    if (error.message.includes('not found')) {
      return {
        status: 404,
        body: {
          success: false,
          message: 'Organization not found',
          error: 'NOT_FOUND'
        }
      };
    }

    if (error.message.includes('already exists')) {
      return {
        status: 409,
        body: {
          success: false,
          message: error.message,
          error: 'DUPLICATE_ERROR'
        }
      };
    }

    if (error.message.includes('Invalid') || error.message.includes('required')) {
      return {
        status: 400,
        body: {
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR'
        }
      };
    }

    return null;
  }

  validateOrganizationListQuery(query) {
    const { status, organizationTypeId } = query;

    if (status && !['active', 'disbanded', 'destroyed'].includes(status)) {
      return this.buildValidationError('Invalid status. Must be active, disbanded, or destroyed');
    }

    if (organizationTypeId && Number.isNaN(Number.parseInt(organizationTypeId))) {
      return this.buildValidationError('Invalid organization type ID');
    }

    return null;
  }

  /**
     * Get all organizations with pagination and filtering
     * @route GET /api/organizations
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
  async getAllOrganizations(req, res) {
    try {
      // Extract query parameters
      const {
        page,
        limit,
        search,
        status,
        organizationTypeId,
        sortBy,
        sortOrder
      } = req.query;

      // Validate pagination parameters
      const pageNum = page ? Math.max(1, Number.parseInt(page)) : 1;
      const limitNum = limit ? Math.min(100, Math.max(1, Number.parseInt(limit))) : 10;

      const validationError = this.validateOrganizationListQuery({ status, organizationTypeId });
      if (validationError) {
        return res.status(400).json(validationError);
      }

      // Validate sort parameters
      const allowedSortFields = ['name', 'totalBounty', 'status', 'createdAt'];
      const sortField = sortBy && allowedSortFields.includes(sortBy) ? sortBy : 'name';
      const sortDirection = sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      // Call service
      const result = await OrganizationService.getAllOrganizations({
        page: pageNum,
        limit: limitNum,
        search,
        status,
        organizationTypeId: organizationTypeId ? Number.parseInt(organizationTypeId) : undefined,
        sortBy: sortField,
        sortOrder: sortDirection
      });

      if (!result.success) {
        return sendServiceResultError(res, result);
      }

      res.status(200).json(createPaginatedResponse(
        result.organizations,
        result.pagination,
        'Organizations retrieved successfully'
      ));
    } catch (error) {
      return sendUnexpectedError(res, error, 'organization.getAllOrganizations');
    }
  }

  /**
     * Get organization by ID
     * @route GET /api/organizations/:id
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
  async getOrganizationById(req, res) {
    try {
      const { id } = req.params;

      // Validate ID parameter
      if (!id || Number.isNaN(Number.parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid organization ID is required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Call service
      const result = await OrganizationService.getOrganizationById(Number.parseInt(id));

      if (!result.success) {
        return sendServiceResultError(res, result);
      }

      res.status(200).json(createItemResponse(
        result.data,
        'Organization retrieved successfully'
      ));
    } catch (error) {
      return sendUnexpectedError(res, error, 'organization.getOrganizationById');
    }
  }

  /**
     * Create new organization
     * @route POST /api/organizations
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
  async createOrganization(req, res) {
    try {
      const organizationData = req.body;

      const validationError = this.validateOrganizationData(organizationData, {
        requireNameAndType: true
      });
      if (validationError) {
        return res.status(400).json(validationError);
      }

      // Call service
      const result = await OrganizationService.createOrganization(organizationData);

      if (!result.success) {
        return sendServiceResultError(res, result);
      }

      res.status(201).json(result);
    } catch (error) {
      const knownError = this.getOrganizationErrorResponse(error);
      if (knownError) {
        return res.status(knownError.status).json(knownError.body);
      }

      return sendUnexpectedError(res, error, 'organization.createOrganization');
    }
  }

  /**
     * Update organization
     * @route PUT /api/organizations/:id
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
  async updateOrganization(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate ID parameter
      if (!id || Number.isNaN(Number.parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid organization ID is required',
          error: 'VALIDATION_ERROR'
        });
      }

      const validationError = this.validateOrganizationData(updateData);
      if (validationError) {
        return res.status(400).json(validationError);
      }

      // Call service
      const result = await OrganizationService.updateOrganization(Number.parseInt(id), updateData);

      if (!result.success) {
        return sendServiceResultError(res, result);
      }

      res.status(200).json(createItemResponse(
        result.data,
        'Organization updated successfully'
      ));
    } catch (error) {
      const knownError = this.getOrganizationErrorResponse(error);
      if (knownError) {
        return res.status(knownError.status).json(knownError.body);
      }

      return sendUnexpectedError(res, error, 'organization.updateOrganization');
    }
  }

  /**
     * Delete organization
     * @route DELETE /api/organizations/:id
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
  async deleteOrganization(req, res) {
    try {
      const { id } = req.params;

      // Validate ID parameter
      if (!id || Number.isNaN(Number.parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid organization ID is required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Call service
      const result = await OrganizationService.deleteOrganization(Number.parseInt(id));

      if (!result.success) {
        return sendServiceResultError(res, result);
      }

      res.status(200).json(createItemResponse(
        result.data,
        'Organization deleted successfully'
      ));
    } catch (error) {
      return sendUnexpectedError(res, error, 'organization.deleteOrganization');
    }
  }

  /**
     * Get organizations by type
     * @route GET /api/organizations/type/:organizationTypeId
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
  async getOrganizationsByType(req, res) {
    try {
      const { organizationTypeId } = req.params;

      // Validate organization type ID
      if (!organizationTypeId || Number.isNaN(Number.parseInt(organizationTypeId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid organization type ID is required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Call service
      const result = await OrganizationService.getOrganizationsByType(Number.parseInt(organizationTypeId));

      if (!result.success) {
        return sendServiceResultError(res, result);
      }

      res.status(200).json(createListResponse(
        result.data,
        result.message
      ));
    } catch (error) {
      return sendUnexpectedError(res, error, 'organization.getOrganizationsByType');
    }
  }

  /**
     * Get organization members
     * @route GET /api/organizations/:id/members
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
  async getOrganizationMembers(req, res) {
    try {
      const { id } = req.params;

      // Validate ID parameter
      if (!id || Number.isNaN(Number.parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Valid organization ID is required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Call service
      const result = await OrganizationService.getOrganizationMembers(Number.parseInt(id));

      if (!result.success) {
        return sendServiceResultError(res, result);
      }

      res.status(200).json(createItemResponse(
        result.data,
        result.message
      ));
    } catch (error) {
      return sendUnexpectedError(res, error, 'organization.getOrganizationMembers');
    }
  }
}

const organizationController = new OrganizationController();

module.exports = {
  getAllOrganizations: organizationController.getAllOrganizations.bind(organizationController),
  getOrganizationById: organizationController.getOrganizationById.bind(organizationController),
  createOrganization: organizationController.createOrganization.bind(organizationController),
  updateOrganization: organizationController.updateOrganization.bind(organizationController),
  deleteOrganization: organizationController.deleteOrganization.bind(organizationController),
  getOrganizationsByType: organizationController.getOrganizationsByType.bind(organizationController),
  getOrganizationMembers: organizationController.getOrganizationMembers.bind(organizationController)
};
