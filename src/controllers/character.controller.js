const characterService = require('../services/character.service');

/**
 * @class CharacterController
 * @description Controller for Character HTTP requests
 */
class CharacterController {
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
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100',
          error: 'INVALID_PAGINATION'
        });
      }

      // Validate numeric filters
      if (race_id && (isNaN(race_id) || parseInt(race_id) <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid race_id parameter',
          error: 'INVALID_RACE_ID'
        });
      }

      if (character_type_id && (isNaN(character_type_id) || parseInt(character_type_id) <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid character_type_id parameter',
          error: 'INVALID_CHARACTER_TYPE_ID'
        });
      }

      if (min_bounty && (isNaN(min_bounty) || parseInt(min_bounty) < 0)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid min_bounty parameter',
          error: 'INVALID_MIN_BOUNTY'
        });
      }

      if (max_bounty && (isNaN(max_bounty) || parseInt(max_bounty) < 0)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid max_bounty parameter',
          error: 'INVALID_MAX_BOUNTY'
        });
      }

      if (min_bounty && max_bounty && parseInt(min_bounty) > parseInt(max_bounty)) {
        return res.status(400).json({
          success: false,
          message: 'min_bounty cannot be greater than max_bounty',
          error: 'INVALID_BOUNTY_RANGE'
        });
      }

      const result = await characterService.getAllCharacters({
        page: pageNum,
        limit: limitNum,
        search,
        race_id: race_id ? parseInt(race_id) : undefined,
        character_type_id: character_type_id ? parseInt(character_type_id) : undefined,
        min_bounty: min_bounty ? parseInt(min_bounty) : undefined,
        max_bounty: max_bounty ? parseInt(max_bounty) : undefined,
        is_alive,
        sortBy,
        sortOrder
      });

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.status(200).json(result);
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
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid character ID',
          error: 'INVALID_ID'
        });
      }

      const result = await characterService.getCharacterById(parseInt(id));

      if (!result.success) {
        if (result.error === 'NOT_FOUND') {
          return res.status(404).json(result);
        }
        return res.status(500).json(result);
      }

      res.status(200).json(result);
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

      // Validate required fields
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Name is required',
          error: 'MISSING_NAME'
        });
      }

      // Validate numeric fields
      if (race_id && (isNaN(race_id) || parseInt(race_id) <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid race_id',
          error: 'INVALID_RACE_ID'
        });
      }

      if (character_type_id && (isNaN(character_type_id) || parseInt(character_type_id) <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid character_type_id',
          error: 'INVALID_CHARACTER_TYPE_ID'
        });
      }

      if (bounty && (isNaN(bounty) || parseInt(bounty) < 0)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid bounty value',
          error: 'INVALID_BOUNTY'
        });
      }

      if (age && (isNaN(age) || parseInt(age) < 0 || parseInt(age) > 1000)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid age value (must be between 0 and 1000)',
          error: 'INVALID_AGE'
        });
      }

      if (height && (isNaN(height) || parseFloat(height) < 0 || parseFloat(height) > 1000)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid height value (must be between 0 and 1000 cm)',
          error: 'INVALID_HEIGHT'
        });
      }

      const result = await characterService.createCharacter({
        name,
        japanese_name,
        race_id: race_id ? parseInt(race_id) : undefined,
        character_type_id: character_type_id ? parseInt(character_type_id) : undefined,
        bounty: bounty ? parseInt(bounty) : undefined,
        age: age ? parseInt(age) : undefined,
        height: height ? parseFloat(height) : undefined,
        description,
        abilities,
        image_url,
        is_alive: is_alive !== undefined ? is_alive : true,
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
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid character ID',
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

      // Validate numeric fields if provided
      if (updateData.race_id && (isNaN(updateData.race_id) || parseInt(updateData.race_id) <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid race_id',
          error: 'INVALID_RACE_ID'
        });
      }

      if (updateData.character_type_id && (isNaN(updateData.character_type_id) || parseInt(updateData.character_type_id) <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid character_type_id',
          error: 'INVALID_CHARACTER_TYPE_ID'
        });
      }

      if (updateData.bounty && (isNaN(updateData.bounty) || parseInt(updateData.bounty) < 0)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid bounty value',
          error: 'INVALID_BOUNTY'
        });
      }

      if (updateData.age && (isNaN(updateData.age) || parseInt(updateData.age) < 0 || parseInt(updateData.age) > 1000)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid age value (must be between 0 and 1000)',
          error: 'INVALID_AGE'
        });
      }

      if (updateData.height && (isNaN(updateData.height) || parseFloat(updateData.height) < 0 || parseFloat(updateData.height) > 1000)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid height value (must be between 0 and 1000 cm)',
          error: 'INVALID_HEIGHT'
        });
      }

      // Convert numeric fields
      if (updateData.race_id) {
        updateData.race_id = parseInt(updateData.race_id);
      }
      if (updateData.character_type_id) {
        updateData.character_type_id = parseInt(updateData.character_type_id);
      }
      if (updateData.bounty) {
        updateData.bounty = parseInt(updateData.bounty);
      }
      if (updateData.age) {
        updateData.age = parseInt(updateData.age);
      }
      if (updateData.height) {
        updateData.height = parseFloat(updateData.height);
      }

      const result = await characterService.updateCharacter(parseInt(id), updateData);

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

      res.status(200).json(result);
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
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid character ID',
          error: 'INVALID_ID'
        });
      }

      const result = await characterService.deleteCharacter(parseInt(id));

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

      res.status(200).json(result);
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
        if (result.error === 'MISSING_SEARCH_TERM') {
          return res.status(400).json(result);
        }
        return res.status(500).json(result);
      }

      res.status(200).json(result);
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
