const characterTypeService = require('../services/character-type.service');
const { createListResponse, createItemResponse } = require('../utils/response.helper');
const {
  buildValidationError,
  sendServiceResultError,
  sendUnexpectedError
} = require('../utils/http-response.helper');

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
        return sendServiceResultError(res, result);
      }

      res.status(200).json(createListResponse(
        result.characterTypes,
        'Character types retrieved successfully'
      ));
    } catch (error) {
      return sendUnexpectedError(res, error, 'characterType.getAllCharacterTypes');
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
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return res.status(400).json(buildValidationError('Invalid character type ID', 'INVALID_ID'));
      }

      const result = await characterTypeService.getCharacterTypeById(Number.parseInt(id));

      if (!result.success) {
        return sendServiceResultError(res, result);
      }

      res.status(200).json(createItemResponse(
        result.data,
        'Character type retrieved successfully'
      ));
    } catch (error) {
      return sendUnexpectedError(res, error, 'characterType.getCharacterTypeById');
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
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return res.status(400).json(buildValidationError('Invalid character type ID', 'INVALID_ID'));
      }

      // Validate request body
      if (!updateData || typeof updateData !== 'object') {
        return res.status(400).json(buildValidationError('Request body must be a valid JSON object', 'INVALID_BODY'));
      }

      const result = await characterTypeService.updateCharacterType(Number.parseInt(id), updateData);

      if (!result.success) {
        return sendServiceResultError(res, result);
      }

      res.status(200).json(createItemResponse(
        result.data,
        'Character type updated successfully'
      ));
    } catch (error) {
      return sendUnexpectedError(res, error, 'characterType.updateCharacterType');
    }
  }
}

module.exports = new CharacterTypeController();
