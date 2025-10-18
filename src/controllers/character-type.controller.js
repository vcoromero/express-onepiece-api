const characterTypeService = require('../services/character-type.service');
const { createListResponse, createItemResponse } = require('../utils/response.helper');

/**
 * @class CharacterTypeController
 * @description Controller for CharacterType HTTP requests
 */
class CharacterTypeController {
  /**
   * Get all character types
   * @route GET /api/character-types
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async getAllCharacterTypes(req, res) {
    try {
      const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;
      
      const result = await characterTypeService.getAllCharacterTypes({ search, sortBy, sortOrder });
      
      if (!result.success) {
        return res.status(500).json(result);
      }

      res.status(200).json(createListResponse(
        result.characterTypes,
        'Character types retrieved successfully'
      ));
    } catch (error) {
      console.error('Error in getAllCharacterTypes controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get character type by ID
   * @route GET /api/character-types/:id
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async getCharacterTypeById(req, res) {
    try {
      const { id } = req.params;

      // Validate ID is a valid number
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid character type ID',
          error: 'INVALID_ID'
        });
      }

      const result = await characterTypeService.getCharacterTypeById(parseInt(id));

      if (!result.success) {
        if (result.error === 'NOT_FOUND') {
          return res.status(404).json(result);
        }
        return res.status(500).json(result);
      }

      res.status(200).json(createItemResponse(
        result.data,
        'Character type retrieved successfully'
      ));
    } catch (error) {
      console.error('Error in getCharacterTypeById controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update character type
   * @route PUT /api/character-types/:id
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async updateCharacterType(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate ID is a valid number
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid character type ID',
          error: 'INVALID_ID'
        });
      }

      // Validate request body
      if (!updateData || typeof updateData !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Request body must be a valid JSON object',
          error: 'INVALID_BODY'
        });
      }

      const result = await characterTypeService.updateCharacterType(parseInt(id), updateData);

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
        'Character type updated successfully'
      ));
    } catch (error) {
      console.error('Error in updateCharacterType controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new CharacterTypeController();
