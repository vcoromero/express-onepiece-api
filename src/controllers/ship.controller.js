const shipService = require('../services/ship.service');
const { createPaginatedResponse, createItemResponse, createListResponse } = require('../utils/response.helper');
const SHIP_STATUS_VALUES = new Set(['active', 'destroyed', 'retired']);

/**
 * Ship Controller
 * Handles HTTP requests for ship management
 */
class ShipController {
  buildShipValidationResponse(message, error) {
    return {
      status: 400,
      body: {
        success: false,
        message,
        error
      }
    };
  }

  getShipServiceErrorResponse(errorMessage) {
    const knownErrors = {
      SHIP_NAME_REQUIRED: {
        status: 400,
        body: {
          success: false,
          message: 'Ship name is required',
          error: 'Name field is missing'
        }
      },
      SHIP_INVALID_STATUS: {
        status: 400,
        body: {
          success: false,
          message: 'Invalid status value',
          error: 'Status must be active, destroyed, or retired'
        }
      },
      SHIP_NAME_EXISTS: {
        status: 409,
        body: {
          success: false,
          message: 'A ship with this name already exists',
          error: 'Ship name must be unique'
        }
      },
      SHIP_INVALID_ID: {
        status: 400,
        body: {
          success: false,
          message: 'Invalid ship ID',
          error: 'ID must be a positive integer'
        }
      },
      SHIP_NOT_FOUND: {
        status: 404,
        body: {
          success: false,
          message: 'Ship not found',
          error: 'No ship exists with the provided ID'
        }
      },
      SHIP_IN_USE: {
        status: 409,
        body: {
          success: false,
          message: 'Cannot delete ship that is currently in use by an organization',
          error: 'Ship is associated with one or more organizations'
        }
      }
    };

    return knownErrors[errorMessage] || null;
  }

  validateShipPayload(payload, options = {}) {
    const { requireName = false, requireAnyField = false } = options;
    const { name, description, status, image_url } = payload;

    if (requireName && (!name || typeof name !== 'string' || name.trim().length === 0)) {
      return this.buildShipValidationResponse(
        'Ship name is required',
        'Name field is missing or invalid'
      );
    }

    if (requireAnyField && !name && !description && !status && !image_url) {
      return this.buildShipValidationResponse(
        'At least one field must be provided for update',
        'Empty request body'
      );
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return this.buildShipValidationResponse(
        'Name must be a non-empty string',
        'Invalid name field'
      );
    }

    if (description !== undefined && typeof description !== 'string') {
      return this.buildShipValidationResponse(
        'Description must be a string',
        'Invalid description field'
      );
    }

    if (status !== undefined && !SHIP_STATUS_VALUES.has(status)) {
      return this.buildShipValidationResponse(
        'Status must be active, destroyed, or retired',
        'Invalid status value'
      );
    }

    if (image_url !== undefined && typeof image_url !== 'string') {
      return this.buildShipValidationResponse(
        'Image URL must be a string',
        'Invalid image_url field'
      );
    }

    return null;
  }

  /**
     * Get all ships with pagination and filtering
     * @route GET /api/ships
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @returns {Promise<void>}
     */
  async getAllShips(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search
      } = req.query;

      // Validate query parameters
      const pageNum = Number.parseInt(page);
      const limitNum = Number.parseInt(limit);

      if (Number.isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Page must be a positive integer',
          error: 'Invalid page parameter'
        });
      }

      if (Number.isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Limit must be between 1 and 100',
          error: 'Invalid limit parameter'
        });
      }

      const result = await shipService.getAllShips({
        page: pageNum,
        limit: limitNum,
        status,
        search
      });

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.status(200).json(createPaginatedResponse(
        result.data,
        result.pagination,
        'Ships retrieved successfully'
      ));
    } catch (error) {
      console.error('Get all ships error:', error);
            
      if (error.message === 'SHIP_INVALID_STATUS') {
        return res.status(400).json({
          success: false,
          message: 'Invalid status filter. Must be active, destroyed, or retired',
          error: 'Invalid status parameter'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve ships',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
     * Get ship by ID
     * @route GET /api/ships/:id
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @returns {Promise<void>}
     */
  async getShipById(req, res) {
    try {
      const { id } = req.params;

      // Validate ID parameter
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ship ID',
          error: 'ID must be a positive integer'
        });
      }

      const result = await shipService.getShipById(Number.parseInt(id));

      if (!result.success) {
        return res.status(result.error === 'NOT_FOUND' ? 404 : 500).json(result);
      }

      res.status(200).json(createItemResponse(
        result.data,
        'Ship retrieved successfully'
      ));
    } catch (error) {
      console.error('Get ship by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
     * Create a new ship
     * @route POST /api/ships
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @returns {Promise<void>}
     */
  async createShip(req, res) {
    try {
      const { name, description, status, image_url } = req.body;

      const validationError = this.validateShipPayload(
        { name, description, status, image_url },
        { requireName: true }
      );
      if (validationError) {
        return res.status(validationError.status).json(validationError.body);
      }

      const ship = await shipService.createShip({
        name,
        description,
        status,
        image_url
      });

      res.status(201).json({
        success: true,
        data: ship,
        message: 'Ship created successfully'
      });
    } catch (error) {
      console.error('Create ship error:', error);
            
      const knownError = this.getShipServiceErrorResponse(error.message);
      if (knownError) {
        return res.status(knownError.status).json(knownError.body);
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create ship',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
     * Update ship by ID
     * @route PUT /api/ships/:id
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @returns {Promise<void>}
     */
  async updateShip(req, res) {
    try {
      const { id } = req.params;
      const { name, description, status, image_url } = req.body;

      // Validate ID parameter
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ship ID',
          error: 'ID must be a positive integer'
        });
      }

      const validationError = this.validateShipPayload(
        { name, description, status, image_url },
        { requireAnyField: true }
      );
      if (validationError) {
        return res.status(validationError.status).json(validationError.body);
      }

      const result = await shipService.updateShip(Number.parseInt(id), {
        name,
        description,
        status,
        image_url
      });

      if (!result.success) {
        return res.status(result.error === 'NOT_FOUND' ? 404 : 500).json(result);
      }

      res.status(200).json(createItemResponse(
        result.data,
        'Ship updated successfully'
      ));
    } catch (error) {
      console.error('Update ship error:', error);
            
      const knownError = this.getShipServiceErrorResponse(error.message);
      if (knownError) {
        return res.status(knownError.status).json(knownError.body);
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update ship',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
     * Delete ship by ID
     * @route DELETE /api/ships/:id
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @returns {Promise<void>}
     */
  async deleteShip(req, res) {
    try {
      const { id } = req.params;

      // Validate ID parameter
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ship ID',
          error: 'ID must be a positive integer'
        });
      }

      const result = await shipService.deleteShip(Number.parseInt(id));

      if (!result.success) {
        return res.status(result.error === 'NOT_FOUND' ? 404 : 500).json(result);
      }

      res.status(200).json(createItemResponse(
        result,
        result.message
      ));
    } catch (error) {
      console.error('Delete ship error:', error);
            
      const knownError = this.getShipServiceErrorResponse(error.message);
      if (knownError) {
        return res.status(knownError.status).json(knownError.body);
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete ship',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
     * Get ships by status
     * @route GET /api/ships/status/:status
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @returns {Promise<void>}
     */
  async getShipsByStatus(req, res) {
    try {
      const { status } = req.params;

      // Validate status parameter
      if (!SHIP_STATUS_VALUES.has(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be active, destroyed, or retired',
          error: 'Invalid status parameter'
        });
      }

      const ships = await shipService.getShipsByStatus(status);

      res.status(200).json(createListResponse(
        ships,
        `Ships with status '${status}' retrieved successfully`
      ));
    } catch (error) {
      console.error('Get ships by status error:', error);
            
      if (error.message === 'SHIP_INVALID_STATUS') {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be active, destroyed, or retired',
          error: 'Invalid status parameter'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to retrieve ships by status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

const shipController = new ShipController();

module.exports = {
  getAllShips: shipController.getAllShips.bind(shipController),
  getShipById: shipController.getShipById.bind(shipController),
  createShip: shipController.createShip.bind(shipController),
  updateShip: shipController.updateShip.bind(shipController),
  deleteShip: shipController.deleteShip.bind(shipController),
  getShipsByStatus: shipController.getShipsByStatus.bind(shipController)
};
