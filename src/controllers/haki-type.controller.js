const hakiTypeService = require('../services/haki-type.service');
const { createListResponse, createItemResponse, createErrorResponse } = require('../utils/response.helper');

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
      res.status(500).json(createErrorResponse(
        'Internal server error',
        'INTERNAL_SERVER_ERROR',
        500
      ));
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
        return res.status(400).json(createErrorResponse(
          'Invalid Haki type ID',
          'INVALID_ID',
          400
        ));
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
      res.status(500).json(createErrorResponse(
        'Internal server error',
        'INTERNAL_SERVER_ERROR',
        500
      ));
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
        return res.status(400).json(createErrorResponse(
          'Invalid Haki type ID',
          'INVALID_ID',
          400
        ));
      }

      // Validate that at least one field is provided for update
      if (!name && description === undefined && color === undefined) {
        return res.status(400).json(createErrorResponse(
          'At least one field (name, description, color) must be provided for update',
          'NO_FIELDS_PROVIDED',
          400
        ));
      }

      // Validate field types if provided
      if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
        return res.status(400).json(createErrorResponse(
          'Name must be a non-empty string',
          'INVALID_NAME',
          400
        ));
      }

      if (description !== undefined && typeof description !== 'string') {
        return res.status(400).json(createErrorResponse(
          'Description must be a string',
          'INVALID_DESCRIPTION',
          400
        ));
      }

      if (color !== undefined && typeof color !== 'string') {
        return res.status(400).json(createErrorResponse(
          'Color must be a string',
          'INVALID_COLOR',
          400
        ));
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
        result.data,
        'Haki type updated successfully'
      ));
    } catch (error) {
      console.error('Error in updateHakiType controller:', error);
      res.status(500).json(createErrorResponse(
        'Internal server error',
        'INTERNAL_SERVER_ERROR',
        500
      ));
    }
  }

}

module.exports = new HakiTypeController();
