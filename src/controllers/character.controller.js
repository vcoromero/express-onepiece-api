const characterService = require('../services/character.service');
const { createPaginatedResponse, createItemResponse } = require('../utils/response.helper');

/**
 * @class CharacterController
 * @description Controller for Character HTTP requests
 */
class CharacterController {
  buildValidationError(message, error) {
    return {
      success: false,
      message,
      error
    };
  }

  validateCharacterListQuery(query) {
    const { pageNum, limitNum, race_id, character_type_id, min_bounty, max_bounty } = query;

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return this.buildValidationError(
        'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100',
        'INVALID_PAGINATION'
      );
    }

    if (race_id && (Number.isNaN(race_id) || Number.parseInt(race_id) <= 0)) {
      return this.buildValidationError('Invalid race_id parameter', 'INVALID_RACE_ID');
    }

    if (character_type_id && (Number.isNaN(character_type_id) || Number.parseInt(character_type_id) <= 0)) {
      return this.buildValidationError('Invalid character_type_id parameter', 'INVALID_CHARACTER_TYPE_ID');
    }

    if (min_bounty && (Number.isNaN(min_bounty) || Number.parseInt(min_bounty) < 0)) {
      return this.buildValidationError('Invalid min_bounty parameter', 'INVALID_MIN_BOUNTY');
    }

    if (max_bounty && (Number.isNaN(max_bounty) || Number.parseInt(max_bounty) < 0)) {
      return this.buildValidationError('Invalid max_bounty parameter', 'INVALID_MAX_BOUNTY');
    }

    if (min_bounty && max_bounty && Number.parseInt(min_bounty) > Number.parseInt(max_bounty)) {
      return this.buildValidationError('min_bounty cannot be greater than max_bounty', 'INVALID_BOUNTY_RANGE');
    }

    return null;
  }

  validateCreateCharacterPayload(payload) {
    const { name, race_id, character_type_id, bounty, age, height } = payload;

    if (!name || name.trim() === '') {
      return this.buildValidationError('Name is required', 'MISSING_NAME');
    }

    if (race_id && (Number.isNaN(race_id) || Number.parseInt(race_id) <= 0)) {
      return this.buildValidationError('Invalid race_id', 'INVALID_RACE_ID');
    }

    if (character_type_id && (Number.isNaN(character_type_id) || Number.parseInt(character_type_id) <= 0)) {
      return this.buildValidationError('Invalid character_type_id', 'INVALID_CHARACTER_TYPE_ID');
    }

    if (bounty && (Number.isNaN(bounty) || Number.parseInt(bounty) < 0)) {
      return this.buildValidationError('Invalid bounty value', 'INVALID_BOUNTY');
    }

    if (age && (Number.isNaN(age) || Number.parseInt(age) < 0 || Number.parseInt(age) > 1000)) {
      return this.buildValidationError('Invalid age value (must be between 0 and 1000)', 'INVALID_AGE');
    }

    if (height && (Number.isNaN(height) || Number.parseFloat(height) < 0 || Number.parseFloat(height) > 1000)) {
      return this.buildValidationError(
        'Invalid height value (must be between 0 and 1000 cm)',
        'INVALID_HEIGHT'
      );
    }

    return null;
  }

  validateUpdateCharacterPayload(updateData) {
    if (!updateData || typeof updateData !== 'object') {
      return this.buildValidationError(
        'Request body must be a valid JSON object',
        'INVALID_BODY'
      );
    }

    if (updateData.race_id && (Number.isNaN(updateData.race_id) || Number.parseInt(updateData.race_id) <= 0)) {
      return this.buildValidationError('Invalid race_id', 'INVALID_RACE_ID');
    }

    if (
      updateData.character_type_id
      && (Number.isNaN(updateData.character_type_id) || Number.parseInt(updateData.character_type_id) <= 0)
    ) {
      return this.buildValidationError('Invalid character_type_id', 'INVALID_CHARACTER_TYPE_ID');
    }

    if (updateData.bounty && (Number.isNaN(updateData.bounty) || Number.parseInt(updateData.bounty) < 0)) {
      return this.buildValidationError('Invalid bounty value', 'INVALID_BOUNTY');
    }

    if (updateData.age && (Number.isNaN(updateData.age) || Number.parseInt(updateData.age) < 0 || Number.parseInt(updateData.age) > 1000)) {
      return this.buildValidationError('Invalid age value (must be between 0 and 1000)', 'INVALID_AGE');
    }

    if (
      updateData.height
      && (Number.isNaN(updateData.height) || Number.parseFloat(updateData.height) < 0 || Number.parseFloat(updateData.height) > 1000)
    ) {
      return this.buildValidationError(
        'Invalid height value (must be between 0 and 1000 cm)',
        'INVALID_HEIGHT'
      );
    }

    return null;
  }

  normalizeCharacterNumericFields(payload) {
    if (payload.race_id) {
      payload.race_id = Number.parseInt(payload.race_id);
    }
    if (payload.character_type_id) {
      payload.character_type_id = Number.parseInt(payload.character_type_id);
    }
    if (payload.bounty) {
      payload.bounty = Number.parseInt(payload.bounty);
    }
    if (payload.age) {
      payload.age = Number.parseInt(payload.age);
    }
    if (payload.height) {
      payload.height = Number.parseFloat(payload.height);
    }
  }

  /**
   * Get all characters with pagination and filtering
   * @route GET /api/characters
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async getAllCharacters(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        race_id,
        character_type_id,
        min_bounty,
        max_bounty,
        is_alive,
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      // Validate pagination parameters
      const pageNum = Number.parseInt(page);
      const limitNum = Number.parseInt(limit);

      const listValidationError = this.validateCharacterListQuery({
        pageNum,
        limitNum,
        race_id,
        character_type_id,
        min_bounty,
        max_bounty
      });
      if (listValidationError) {
        return res.status(400).json(listValidationError);
      }

      const result = await characterService.getAllCharacters({
        page: pageNum,
        limit: limitNum,
        search,
        race_id: race_id ? Number.parseInt(race_id) : undefined,
        character_type_id: character_type_id ? Number.parseInt(character_type_id) : undefined,
        min_bounty: min_bounty ? Number.parseInt(min_bounty) : undefined,
        max_bounty: max_bounty ? Number.parseInt(max_bounty) : undefined,
        is_alive,
        sortBy,
        sortOrder
      });

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.status(200).json(createPaginatedResponse(
        result.characters,
        result.pagination,
        'Characters retrieved successfully'
      ));
    } catch (error) {
      console.error('Error in getAllCharacters controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get character by ID
   * @route GET /api/characters/:id
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async getCharacterById(req, res) {
    try {
      const { id } = req.params;

      // Validate ID is a valid number
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid character ID',
          error: 'INVALID_ID'
        });
      }

      const result = await characterService.getCharacterById(Number.parseInt(id));

      if (!result.success) {
        return res.status(result.error === 'NOT_FOUND' ? 404 : 500).json(result);
      }

      res.status(200).json(createItemResponse(
        result.character,
        'Character retrieved successfully'
      ));
    } catch (error) {
      console.error('Error in getCharacterById controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Create new character
   * @route POST /api/characters
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async createCharacter(req, res) {
    try {
      const {
        name,
        japanese_name,
        race_id,
        character_type_id,
        bounty,
        age,
        height,
        description,
        abilities,
        image_url,
        is_alive,
        first_appearance
      } = req.body;

      const createValidationError = this.validateCreateCharacterPayload({
        name,
        race_id,
        character_type_id,
        bounty,
        age,
        height
      });
      if (createValidationError) {
        return res.status(400).json(createValidationError);
      }

      const result = await characterService.createCharacter({
        name,
        japanese_name,
        race_id: race_id ? Number.parseInt(race_id) : undefined,
        character_type_id: character_type_id ? Number.parseInt(character_type_id) : undefined,
        bounty: bounty ? Number.parseInt(bounty) : undefined,
        age: age ? Number.parseInt(age) : undefined,
        height: height ? Number.parseFloat(height) : undefined,
        description,
        abilities,
        image_url,
        is_alive: is_alive === undefined ? true : is_alive,
        first_appearance
      });

      if (!result.success) {
        switch (result.error) {
        case 'MISSING_NAME':
          return res.status(400).json(result);
        case 'DUPLICATE_NAME':
          return res.status(409).json(result);
        case 'INVALID_RACE':
        case 'INVALID_CHARACTER_TYPE':
          return res.status(400).json(result);
        default:
          return res.status(500).json(result);
        }
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Error in createCharacter controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update character
   * @route PUT /api/characters/:id
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async updateCharacter(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate ID is a valid number
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid character ID',
          error: 'INVALID_ID'
        });
      }

      const updateValidationError = this.validateUpdateCharacterPayload(updateData);
      if (updateValidationError) {
        return res.status(400).json(updateValidationError);
      }

      // Convert numeric fields
      this.normalizeCharacterNumericFields(updateData);

      const result = await characterService.updateCharacter(Number.parseInt(id), updateData);

      if (!result.success) {
        switch (result.error) {
        case 'NOT_FOUND':
          return res.status(404).json(result);
        case 'INVALID_ID':
        case 'NO_FIELDS_PROVIDED':
        case 'INVALID_NAME':
        case 'INVALID_RACE':
        case 'INVALID_CHARACTER_TYPE':
          return res.status(400).json(result);
        case 'DUPLICATE_NAME':
          return res.status(409).json(result);
        default:
          return res.status(500).json(result);
        }
      }

      res.status(200).json(createItemResponse(
        result.character,
        'Character updated successfully'
      ));
    } catch (error) {
      console.error('Error in updateCharacter controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Delete character
   * @route DELETE /api/characters/:id
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async deleteCharacter(req, res) {
    try {
      const { id } = req.params;

      // Validate ID is a valid number
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid character ID',
          error: 'INVALID_ID'
        });
      }

      const result = await characterService.deleteCharacter(Number.parseInt(id));

      if (!result.success) {
        switch (result.error) {
        case 'NOT_FOUND':
          return res.status(404).json(result);
        case 'INVALID_ID':
          return res.status(400).json(result);
        case 'HAS_ASSOCIATIONS':
          return res.status(409).json(result);
        default:
          return res.status(500).json(result);
        }
      }

      res.status(200).json(createItemResponse(
        result,
        result.message
      ));
    } catch (error) {
      console.error('Error in deleteCharacter controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Search characters
   * @route GET /api/characters/search
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async searchCharacters(req, res) {
    try {
      const { q, ...otherParams } = req.query;

      if (!q || q.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Search query parameter "q" is required',
          error: 'MISSING_SEARCH_QUERY'
        });
      }

      const result = await characterService.searchCharacters(q.trim(), otherParams);

      if (!result.success) {
        return res.status(result.error === 'MISSING_SEARCH_TERM' ? 400 : 500).json(result);
      }

      res.status(200).json(createPaginatedResponse(
        result.characters,
        result.pagination,
        'Search results retrieved successfully'
      ));
    } catch (error) {
      console.error('Error in searchCharacters controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new CharacterController();
