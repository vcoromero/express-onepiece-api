const shipService = require('../services/ship.service');
const { createPaginatedResponse, createItemResponse, createListResponse, createErrorResponse } = require('../utils/response.helper');

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
        return res.status(400).json(createErrorResponse(
          'Page must be a positive integer',
          'INVALID_PAGE',
          400
        ));
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json(createErrorResponse(
          'Limit must be between 1 and 100',
          'INVALID_LIMIT',
          400
        ));
      }

      const result = await shipService.getAllShips({
        page: pageNum,
        limit: limitNum,
        status,
        search
      });

      res.status(200).json(createPaginatedResponse(
        result.ships,
        result.pagination,
        'Ships retrieved successfully'
      ));
    } catch (error) {
      console.error('Get all ships error:', error);
            
      if (error.message === 'SHIP_INVALID_STATUS') {
        return res.status(400).json(createErrorResponse(
          'Invalid status filter. Must be active, destroyed, or retired',
          'INVALID_STATUS',
          400
        ));
      }

      res.status(500).json(createErrorResponse(
        'Failed to retrieve ships',
        'INTERNAL_SERVER_ERROR',
        500
      ));
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
        return res.status(400).json(createErrorResponse(
          'Invalid ship ID',
          'INVALID_ID',
          400
        ));
      }

      const ship = await shipService.getShipById(parseInt(id));

      res.status(200).json(createItemResponse(
        ship,
        'Ship retrieved successfully'
      ));
    } catch (error) {
      console.error('Get ship by ID error:', error);
            
      if (error.message === 'SHIP_INVALID_ID') {
        return res.status(400).json(createErrorResponse(
          'Invalid ship ID',
          'INVALID_ID',
          400
        ));
      }

      if (error.message === 'SHIP_NOT_FOUND') {
        return res.status(404).json(createErrorResponse(
          'Ship not found',
          'NOT_FOUND',
          404
        ));
      }

      res.status(500).json(createErrorResponse(
        'Failed to retrieve ship',
        'INTERNAL_SERVER_ERROR',
        500
      ));
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

      res.status(201).json(createItemResponse(
        ship,
        'Ship created successfully'
      ));
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
        return res.status(409).json(createErrorResponse(
          'A ship with this name already exists',
          'DUPLICATE_NAME',
          409
        ));
      }

      res.status(500).json(createErrorResponse(
        'Failed to create ship',
        'INTERNAL_SERVER_ERROR',
        500
      ));
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
        return res.status(400).json(createErrorResponse(
          'Invalid ship ID',
          'INVALID_ID',
          400
        ));
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

      const ship = await shipService.updateShip(parseInt(id), {
        name,
        description,
        status,
        image_url
      });

      res.status(200).json(createItemResponse(
        ship,
        'Ship updated successfully'
      ));
    } catch (error) {
      console.error('Update ship error:', error);
            
      if (error.message === 'SHIP_INVALID_ID') {
        return res.status(400).json(createErrorResponse(
          'Invalid ship ID',
          'INVALID_ID',
          400
        ));
      }

      if (error.message === 'SHIP_NOT_FOUND') {
        return res.status(404).json(createErrorResponse(
          'Ship not found',
          'NOT_FOUND',
          404
        ));
      }

      if (error.message === 'SHIP_INVALID_STATUS') {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value',
          error: 'Status must be active, destroyed, or retired'
        });
      }

      if (error.message === 'SHIP_NAME_EXISTS') {
        return res.status(409).json(createErrorResponse(
          'A ship with this name already exists',
          'DUPLICATE_NAME',
          409
        ));
      }

      res.status(500).json(createErrorResponse(
        'Failed to update ship',
        'INTERNAL_SERVER_ERROR',
        500
      ));
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
        return res.status(400).json(createErrorResponse(
          'Invalid ship ID',
          'INVALID_ID',
          400
        ));
      }

      const result = await shipService.deleteShip(parseInt(id));

      res.status(200).json(createItemResponse(
        result,
        'Ship deleted successfully'
      ));
    } catch (error) {
      console.error('Delete ship error:', error);
            
      if (error.message === 'SHIP_INVALID_ID') {
        return res.status(400).json(createErrorResponse(
          'Invalid ship ID',
          'INVALID_ID',
          400
        ));
      }

      if (error.message === 'SHIP_NOT_FOUND') {
        return res.status(404).json(createErrorResponse(
          'Ship not found',
          'NOT_FOUND',
          404
        ));
      }

      if (error.message === 'SHIP_IN_USE') {
        return res.status(409).json(createErrorResponse(
          'Cannot delete ship that is currently in use by an organization',
          'SHIP_IN_USE',
          409
        ));
      }

      res.status(500).json(createErrorResponse(
        'Failed to delete ship',
        'INTERNAL_SERVER_ERROR',
        500
      ));
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

      res.status(500).json(createErrorResponse(
        'Failed to retrieve ships by status',
        'INTERNAL_SERVER_ERROR',
        500
      ));
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
