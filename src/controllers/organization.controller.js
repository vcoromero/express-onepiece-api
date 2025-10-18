const OrganizationService = require('../services/organization.service');
const { createPaginatedResponse, createItemResponse, createListResponse, createErrorResponse } = require('../utils/response.helper');

/**
 * Organization Controller
 * HTTP request handlers for organization operations
 * @description Handles HTTP requests, validates parameters, calls services,
 * and formats responses for organization endpoints
 * @author Database Expert
 * @version 1.0.0
 */
class OrganizationController {
  /**
     * Get all organizations with pagination and filtering
     * @route GET /api/organizations
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
  static async getAllOrganizations(req, res) {
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
      const pageNum = page ? Math.max(1, parseInt(page)) : 1;
      const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit))) : 10;

      // Validate status if provided
      if (status && !['active', 'disbanded', 'destroyed'].includes(status)) {
        return res.status(400).json(createErrorResponse(
          'Invalid status. Must be active, disbanded, or destroyed',
          'INVALID_STATUS',
          400
        ));
      }

      // Validate organization type ID if provided
      if (organizationTypeId && isNaN(parseInt(organizationTypeId))) {
        return res.status(400).json(createErrorResponse(
          'Invalid organization type ID',
          'INVALID_ORGANIZATION_TYPE_ID',
          400
        ));
      }

      // Validate sort parameters
      const allowedSortFields = ['name', 'totalBounty', 'status', 'createdAt'];
      const sortField = sortBy && allowedSortFields.includes(sortBy) ? sortBy : 'name';
      const sortDirection = sortOrder && sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      // Call service
      const result = await OrganizationService.getAllOrganizations({
        page: pageNum,
        limit: limitNum,
        search,
        status,
        organizationTypeId: organizationTypeId ? parseInt(organizationTypeId) : undefined,
        sortBy: sortField,
        sortOrder: sortDirection
      });

      res.status(200).json(createPaginatedResponse(
        result.organizations,
        result.pagination,
        'Organizations retrieved successfully'
      ));
    } catch (error) {
      console.error('Error in getAllOrganizations:', error);
      res.status(500).json(createErrorResponse(
        'Internal server error while retrieving organizations',
        'INTERNAL_SERVER_ERROR',
        500
      ));
    }
  }

  /**
     * Get organization by ID
     * @route GET /api/organizations/:id
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
  static async getOrganizationById(req, res) {
    try {
      const { id } = req.params;

      // Validate ID parameter
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(createErrorResponse(
          'Valid organization ID is required',
          'INVALID_ID',
          400
        ));
      }

      // Call service
      const result = await OrganizationService.getOrganizationById(parseInt(id));

      res.status(200).json(createItemResponse(
        result.data,
        'Organization retrieved successfully'
      ));
    } catch (error) {
      console.error('Error in getOrganizationById:', error);
            
      if (error.message.includes('not found')) {
        return res.status(404).json(createErrorResponse(
          'Organization not found',
          'NOT_FOUND',
          404
        ));
      }

      res.status(500).json(createErrorResponse(
        'Internal server error while retrieving organization',
        'INTERNAL_SERVER_ERROR',
        500
      ));
    }
  }

  /**
     * Create new organization
     * @route POST /api/organizations
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
  static async createOrganization(req, res) {
    try {
      const organizationData = req.body;

      // Validate required fields
      if (!organizationData.name || !organizationData.organizationTypeId) {
        return res.status(400).json({
          success: false,
          message: 'Name and organization type are required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Validate name length
      if (organizationData.name.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Organization name must be 100 characters or less',
          error: 'VALIDATION_ERROR'
        });
      }

      // Validate organization type ID
      if (isNaN(parseInt(organizationData.organizationTypeId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid organization type ID is required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Validate leader ID if provided
      if (organizationData.leaderId && isNaN(parseInt(organizationData.leaderId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid leader ID is required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Validate ship ID if provided
      if (organizationData.shipId && isNaN(parseInt(organizationData.shipId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid ship ID is required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Validate status if provided
      if (organizationData.status && !['active', 'disbanded', 'destroyed'].includes(organizationData.status)) {
        return res.status(400).json(createErrorResponse(
          'Invalid status. Must be active, disbanded, or destroyed',
          'INVALID_STATUS',
          400
        ));
      }

      // Validate total bounty if provided
      if (organizationData.totalBounty !== undefined) {
        const bounty = parseInt(organizationData.totalBounty);
        if (isNaN(bounty) || bounty < 0) {
          return res.status(400).json({
            success: false,
            message: 'Total bounty must be a non-negative number',
            error: 'VALIDATION_ERROR'
          });
        }
      }

      // Validate URL if provided
      if (organizationData.jollyRogerUrl) {
        try {
          new URL(organizationData.jollyRogerUrl);
        } catch (urlError) {
          return res.status(400).json({
            success: false,
            message: 'Invalid Jolly Roger URL format',
            error: 'VALIDATION_ERROR'
          });
        }
      }

      // Call service
      const result = await OrganizationService.createOrganization(organizationData);

      res.status(201).json(createItemResponse(
        result.data,
        'Organization created successfully'
      ));
    } catch (error) {
      console.error('Error in createOrganization:', error);
            
      if (error.message.includes('already exists')) {
        return res.status(409).json(createErrorResponse(
          error.message,
          'DUPLICATE_ERROR',
          409
        ));
      }

      if (error.message.includes('Invalid') || error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR'
        });
      }

      res.status(500).json(createErrorResponse(
        'Internal server error while creating organization',
        'INTERNAL_SERVER_ERROR',
        500
      ));
    }
  }

  /**
     * Update organization
     * @route PUT /api/organizations/:id
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
  static async updateOrganization(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate ID parameter
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(createErrorResponse(
          'Valid organization ID is required',
          'INVALID_ID',
          400
        ));
      }

      // Validate name length if provided
      if (updateData.name && updateData.name.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Organization name must be 100 characters or less',
          error: 'VALIDATION_ERROR'
        });
      }

      // Validate organization type ID if provided
      if (updateData.organizationTypeId && isNaN(parseInt(updateData.organizationTypeId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid organization type ID is required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Validate leader ID if provided
      if (updateData.leaderId && isNaN(parseInt(updateData.leaderId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid leader ID is required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Validate ship ID if provided
      if (updateData.shipId && isNaN(parseInt(updateData.shipId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid ship ID is required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Validate status if provided
      if (updateData.status && !['active', 'disbanded', 'destroyed'].includes(updateData.status)) {
        return res.status(400).json(createErrorResponse(
          'Invalid status. Must be active, disbanded, or destroyed',
          'INVALID_STATUS',
          400
        ));
      }

      // Validate total bounty if provided
      if (updateData.totalBounty !== undefined) {
        const bounty = parseInt(updateData.totalBounty);
        if (isNaN(bounty) || bounty < 0) {
          return res.status(400).json({
            success: false,
            message: 'Total bounty must be a non-negative number',
            error: 'VALIDATION_ERROR'
          });
        }
      }

      // Validate URL if provided
      if (updateData.jollyRogerUrl) {
        try {
          new URL(updateData.jollyRogerUrl);
        } catch (urlError) {
          return res.status(400).json({
            success: false,
            message: 'Invalid Jolly Roger URL format',
            error: 'VALIDATION_ERROR'
          });
        }
      }

      // Call service
      const result = await OrganizationService.updateOrganization(parseInt(id), updateData);

      res.status(200).json(createItemResponse(
        result.data,
        'Organization updated successfully'
      ));
    } catch (error) {
      console.error('Error in updateOrganization:', error);
            
      if (error.message.includes('not found')) {
        return res.status(404).json(createErrorResponse(
          'Organization not found',
          'NOT_FOUND',
          404
        ));
      }

      if (error.message.includes('already exists')) {
        return res.status(409).json(createErrorResponse(
          error.message,
          'DUPLICATE_ERROR',
          409
        ));
      }

      if (error.message.includes('Invalid') || error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR'
        });
      }

      res.status(500).json(createErrorResponse(
        'Internal server error while updating organization',
        'INTERNAL_SERVER_ERROR',
        500
      ));
    }
  }

  /**
     * Delete organization
     * @route DELETE /api/organizations/:id
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
  static async deleteOrganization(req, res) {
    try {
      const { id } = req.params;

      // Validate ID parameter
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(createErrorResponse(
          'Valid organization ID is required',
          'INVALID_ID',
          400
        ));
      }

      // Call service
      const result = await OrganizationService.deleteOrganization(parseInt(id));

      res.status(200).json(createItemResponse(
        result.data,
        'Organization deleted successfully'
      ));
    } catch (error) {
      console.error('Error in deleteOrganization:', error);
            
      if (error.message.includes('not found')) {
        return res.status(404).json(createErrorResponse(
          'Organization not found',
          'NOT_FOUND',
          404
        ));
      }

      if (error.message.includes('active members')) {
        return res.status(409).json(createErrorResponse(
          error.message,
          'CONFLICT_ERROR',
          409
        ));
      }

      res.status(500).json(createErrorResponse(
        'Internal server error while deleting organization',
        'INTERNAL_SERVER_ERROR',
        500
      ));
    }
  }

  /**
     * Get organizations by type
     * @route GET /api/organizations/type/:organizationTypeId
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
  static async getOrganizationsByType(req, res) {
    try {
      const { organizationTypeId } = req.params;

      // Validate organization type ID
      if (!organizationTypeId || isNaN(parseInt(organizationTypeId))) {
        return res.status(400).json({
          success: false,
          message: 'Valid organization type ID is required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Call service
      const result = await OrganizationService.getOrganizationsByType(parseInt(organizationTypeId));

      res.status(200).json(createListResponse(
        result.data,
        'Organizations by type retrieved successfully'
      ));
    } catch (error) {
      console.error('Error in getOrganizationsByType:', error);
            
      if (error.message.includes('not found')) {
        return res.status(404).json(createErrorResponse(
          'Organization type not found',
          'NOT_FOUND',
          404
        ));
      }

      res.status(500).json(createErrorResponse(
        'Internal server error while retrieving organizations by type',
        'INTERNAL_SERVER_ERROR',
        500
      ));
    }
  }

  /**
     * Get organization members
     * @route GET /api/organizations/:id/members
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
  static async getOrganizationMembers(req, res) {
    try {
      const { id } = req.params;

      // Validate ID parameter
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(createErrorResponse(
          'Valid organization ID is required',
          'INVALID_ID',
          400
        ));
      }

      // Call service
      const result = await OrganizationService.getOrganizationMembers(parseInt(id));

      res.status(200).json(createListResponse(
        result.data,
        'Organization members retrieved successfully'
      ));
    } catch (error) {
      console.error('Error in getOrganizationMembers:', error);
            
      if (error.message.includes('not found')) {
        return res.status(404).json(createErrorResponse(
          'Organization not found',
          'NOT_FOUND',
          404
        ));
      }

      res.status(500).json(createErrorResponse(
        'Internal server error while retrieving organization members',
        'INTERNAL_SERVER_ERROR',
        500
      ));
    }
  }
}

module.exports = OrganizationController;
