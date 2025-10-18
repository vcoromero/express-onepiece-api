const shipService = require('../services/ship.service');
const { createPaginatedResponse, createItemResponse, createListResponse } = require('../utils/response.helper');

/**
 * Ship Controller
 * Handles HTTP requests for ship management
 */
class ShipController {
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
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Page must be a positive integer',
          error: 'Invalid page parameter'
        });
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
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
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ship ID',
          error: 'ID must be a positive integer'
        });
      }

      const result = await shipService.getShipById(parseInt(id));

      if (!result.success) {
        if (result.error === 'NOT_FOUND') {
          return res.status(404).json(result);
        }
        return res.status(500).json(result);
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

      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Ship name is required',
          error: 'Name field is missing or invalid'
        });
      }

      // Validate optional fields
      if (description && typeof description !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Description must be a string',
          error: 'Invalid description field'
        });
      }

      if (status && !['active', 'destroyed', 'retired'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be active, destroyed, or retired',
          error: 'Invalid status value'
        });
      }

      if (image_url && typeof image_url !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Image URL must be a string',
          error: 'Invalid image_url field'
        });
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
            
      if (error.message === 'SHIP_NAME_REQUIRED') {
        return res.status(400).json({
          success: false,
          message: 'Ship name is required',
          error: 'Name field is missing'
        });
      }

      if (error.message === 'SHIP_INVALID_STATUS') {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value',
          error: 'Status must be active, destroyed, or retired'
        });
      }

      if (error.message === 'SHIP_NAME_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'A ship with this name already exists',
          error: 'Ship name must be unique'
        });
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
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ship ID',
          error: 'ID must be a positive integer'
        });
      }

      // Validate request body
      if (!name && !description && !status && !image_url) {
        return res.status(400).json({
          success: false,
          message: 'At least one field must be provided for update',
          error: 'Empty request body'
        });
      }

      // Validate field types
      if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'Name must be a non-empty string',
          error: 'Invalid name field'
        });
      }

      if (description !== undefined && typeof description !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Description must be a string',
          error: 'Invalid description field'
        });
      }

      if (status !== undefined && !['active', 'destroyed', 'retired'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be active, destroyed, or retired',
          error: 'Invalid status value'
        });
      }

      if (image_url !== undefined && typeof image_url !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Image URL must be a string',
          error: 'Invalid image_url field'
        });
      }

      const result = await shipService.updateShip(parseInt(id), {
        name,
        description,
        status,
        image_url
      });

      if (!result.success) {
        if (result.error === 'NOT_FOUND') {
          return res.status(404).json(result);
        }
        return res.status(500).json(result);
      }

      res.status(200).json(createItemResponse(
        result.data,
        'Ship updated successfully'
      ));
    } catch (error) {
      console.error('Update ship error:', error);
            
      if (error.message === 'SHIP_INVALID_ID') {
        return res.status(400).json({
          success: false,
          message: 'Invalid ship ID',
          error: 'ID must be a positive integer'
        });
      }

      if (error.message === 'SHIP_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Ship not found',
          error: 'No ship exists with the provided ID'
        });
      }

      if (error.message === 'SHIP_INVALID_STATUS') {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value',
          error: 'Status must be active, destroyed, or retired'
        });
      }

      if (error.message === 'SHIP_NAME_EXISTS') {
        return res.status(409).json({
          success: false,
          message: 'A ship with this name already exists',
          error: 'Ship name must be unique'
        });
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
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ship ID',
          error: 'ID must be a positive integer'
        });
      }

      const result = await shipService.deleteShip(parseInt(id));

      if (!result.success) {
        if (result.error === 'NOT_FOUND') {
          return res.status(404).json(result);
        }
        return res.status(500).json(result);
      }

      res.status(200).json(createItemResponse(
        result,
        result.message
      ));
    } catch (error) {
      console.error('Delete ship error:', error);
            
      if (error.message === 'SHIP_INVALID_ID') {
        return res.status(400).json({
          success: false,
          message: 'Invalid ship ID',
          error: 'ID must be a positive integer'
        });
      }

      if (error.message === 'SHIP_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: 'Ship not found',
          error: 'No ship exists with the provided ID'
        });
      }

      if (error.message === 'SHIP_IN_USE') {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete ship that is currently in use by an organization',
          error: 'Ship is associated with one or more organizations'
        });
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
      if (!['active', 'destroyed', 'retired'].includes(status)) {
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
