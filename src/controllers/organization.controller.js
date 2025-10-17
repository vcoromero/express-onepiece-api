const OrganizationService = require('../services/organization.service');

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
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be active, disbanded, or destroyed',
          error: 'VALIDATION_ERROR'
        });
      }

      // Validate organization type ID if provided
      if (organizationTypeId && isNaN(parseInt(organizationTypeId))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid organization type ID',
          error: 'VALIDATION_ERROR'
        });
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

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAllOrganizations:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving organizations',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
        return res.status(400).json({
          success: false,
          message: 'Valid organization ID is required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Call service
      const result = await OrganizationService.getOrganizationById(parseInt(id));

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getOrganizationById:', error);
            
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
          error: 'NOT_FOUND'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving organization',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be active, disbanded, or destroyed',
          error: 'VALIDATION_ERROR'
        });
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

      res.status(201).json(result);
    } catch (error) {
      console.error('Error in createOrganization:', error);
            
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          error: 'DUPLICATE_ERROR'
        });
      }

      if (error.message.includes('Invalid') || error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while creating organization',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
        return res.status(400).json({
          success: false,
          message: 'Valid organization ID is required',
          error: 'VALIDATION_ERROR'
        });
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
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be active, disbanded, or destroyed',
          error: 'VALIDATION_ERROR'
        });
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

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in updateOrganization:', error);
            
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
          error: 'NOT_FOUND'
        });
      }

      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          error: 'DUPLICATE_ERROR'
        });
      }

      if (error.message.includes('Invalid') || error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: 'VALIDATION_ERROR'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while updating organization',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
        return res.status(400).json({
          success: false,
          message: 'Valid organization ID is required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Call service
      const result = await OrganizationService.deleteOrganization(parseInt(id));

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in deleteOrganization:', error);
            
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
          error: 'NOT_FOUND'
        });
      }

      if (error.message.includes('active members')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          error: 'CONFLICT_ERROR'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting organization',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getOrganizationsByType:', error);
            
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Organization type not found',
          error: 'NOT_FOUND'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving organizations by type',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
        return res.status(400).json({
          success: false,
          message: 'Valid organization ID is required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Call service
      const result = await OrganizationService.getOrganizationMembers(parseInt(id));

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getOrganizationMembers:', error);
            
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found',
          error: 'NOT_FOUND'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving organization members',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = OrganizationController;
