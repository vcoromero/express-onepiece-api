const hakiTypeService = require('../services/haki-type.service');
const { createListResponse, createItemResponse } = require('../utils/response.helper');

/**
 * HakiType Controller
 * Handles HTTP requests for HakiType operations
 */
class HakiTypeController {
  /**
   * Get all Haki types
   * @route GET /api/haki-types
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async getAllHakiTypes(req, res) {
    try {
      const {
        search,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      const result = await hakiTypeService.getAllHakiTypes({
        search,
        sortBy,
        sortOrder
      });

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.status(200).json(createListResponse(
        result.hakiTypes,
        'Haki types retrieved successfully'
      ));
    } catch (error) {
      console.error('Error in getAllHakiTypes controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get a Haki type by ID
   * @route GET /api/haki-types/:id
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async getHakiTypeById(req, res) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Haki type ID',
          error: 'INVALID_ID'
        });
      }

      const result = await hakiTypeService.getHakiTypeById(id);

      if (!result.success) {
        if (result.error === 'NOT_FOUND') {
          return res.status(404).json(result);
        }
        return res.status(500).json(result);
      }

      res.status(200).json(createItemResponse(
        result.data,
        'Haki type retrieved successfully'
      ));
    } catch (error) {
      console.error('Error in getHakiTypeById controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update a Haki type
   * @route PUT /api/haki-types/:id
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async updateHakiType(req, res) {
    try {
      const { id } = req.params;
      const { name, description, color } = req.body;

      if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Haki type ID',
          error: 'INVALID_ID'
        });
      }

      // Validate that at least one field is provided for update
      if (!name && description === undefined && color === undefined) {
        return res.status(400).json({
          success: false,
          message: 'At least one field (name, description, color) must be provided for update',
          error: 'VALIDATION_ERROR'
        });
      }

      // Validate field types if provided
      if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'Name must be a non-empty string',
          error: 'VALIDATION_ERROR'
        });
      }

      if (description !== undefined && typeof description !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Description must be a string',
          error: 'VALIDATION_ERROR'
        });
      }

      if (color !== undefined && typeof color !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Color must be a string',
          error: 'VALIDATION_ERROR'
        });
      }

      const result = await hakiTypeService.updateHakiType(id, {
        name,
        description,
        color
      });

      if (!result.success) {
        if (result.error === 'NOT_FOUND') {
          return res.status(404).json(result);
        }
        if (result.error === 'DUPLICATE_NAME') {
          return res.status(409).json(result);
        }
        if (result.error === 'VALIDATION_ERROR') {
          return res.status(400).json(result);
        }
        return res.status(500).json(result);
      }

      res.status(200).json(createItemResponse(
        result.hakiType,
        'Haki type updated successfully'
      ));
    } catch (error) {
      console.error('Error in updateHakiType controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

}

module.exports = new HakiTypeController();
