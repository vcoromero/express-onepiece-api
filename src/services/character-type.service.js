const { CharacterType } = require('../models');
const { Op } = require('sequelize');

/**
 * @class CharacterTypeService
 * @description Service layer for CharacterType business logic
 */
class CharacterTypeService {
  /**
   * Get all character types
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Service response
   */
  async getAllCharacterTypes(options = {}) {
    try {
      const { search, sortBy = 'name', sortOrder = 'asc' } = options;
      
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      const validSortFields = ['name', 'created_at', 'updated_at'];
      const validSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
      const validSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

      const characterTypes = await CharacterType.findAll({
        where: whereClause,
        order: [[validSortBy, validSortOrder]]
      });

      return {
        success: true,
        data: {
          characterTypes,
          total: characterTypes.length
        }
      };
    } catch (error) {
      console.error('Error in getAllCharacterTypes:', error);
      return {
        success: false,
        message: 'Failed to fetch character types',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Get character type by ID
   * @param {number} id - Character type ID
   * @returns {Promise<Object>} Service response
   */
  async getCharacterTypeById(id) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid character type ID',
          error: 'INVALID_ID'
        };
      }

      const characterType = await CharacterType.findByPk(id);
      
      if (!characterType) {
        return {
          success: false,
          message: `Character type with ID ${id} not found`,
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data: characterType
      };
    } catch (error) {
      console.error('Error in getCharacterTypeById:', error);
      return {
        success: false,
        message: 'Failed to fetch character type',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Update character type
   * @param {number} id - Character type ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Service response
   */
  async updateCharacterType(id, updateData) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid character type ID',
          error: 'INVALID_ID'
        };
      }

      const characterType = await CharacterType.findByPk(id);
      if (!characterType) {
        return {
          success: false,
          message: `Character type with ID ${id} not found`,
          error: 'NOT_FOUND'
        };
      }

      // Validate at least one field is provided
      if (!updateData || Object.keys(updateData).length === 0) {
        return {
          success: false,
          message: 'At least one field must be provided for update',
          error: 'NO_FIELDS_PROVIDED'
        };
      }

      // Validate name if provided
      if (updateData.name !== undefined) {
        if (!updateData.name || updateData.name.trim() === '') {
          return {
            success: false,
            message: 'Name cannot be empty',
            error: 'INVALID_NAME'
          };
        }
        if (updateData.name.length > 50) {
          return {
            success: false,
            message: 'Name cannot exceed 50 characters',
            error: 'INVALID_NAME'
          };
        }
      }

      // Check for duplicate name if name is being updated
      if (updateData.name && updateData.name !== characterType.name) {
        const existingCharacterType = await CharacterType.findOne({
          where: { name: updateData.name }
        });
        if (existingCharacterType) {
          return {
            success: false,
            message: 'A character type with this name already exists',
            error: 'DUPLICATE_NAME'
          };
        }
      }

      await characterType.update(updateData);
      await characterType.reload();

      return {
        success: true,
        data: characterType,
        message: 'Character type updated successfully'
      };
    } catch (error) {
      console.error('Error in updateCharacterType:', error);
      return {
        success: false,
        message: 'Failed to update character type',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Check if character type name exists
   * @param {string} name - Character type name
   * @param {number} excludeId - ID to exclude from check
   * @returns {Promise<boolean>} True if name exists
   */
  async nameExists(name, excludeId = null) {
    try {
      const whereClause = { name };
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }
      
      const characterType = await CharacterType.findOne({ where: whereClause });
      return !!characterType;
    } catch (error) {
      console.error('Error in nameExists:', error);
      return false;
    }
  }

  /**
   * Check if character type ID exists
   * @param {number} id - Character type ID
   * @returns {Promise<boolean>} True if ID exists
   */
  async idExists(id) {
    try {
      const characterType = await CharacterType.findByPk(id);
      return !!characterType;
    } catch (error) {
      console.error('Error in idExists:', error);
      return false;
    }
  }

  /**
   * Check if character type is in use by characters
   * @param {number} id - Character type ID
   * @returns {Promise<boolean>} True if character type is in use
   */
  async isCharacterTypeInUse(id) {
    try {
      const characterType = await CharacterType.findByPk(id, {
        include: [{
          association: 'characters',
          required: false
        }]
      });
      
      return !!(characterType && characterType.characters && characterType.characters.length > 0);
    } catch (error) {
      console.error('Error in isCharacterTypeInUse:', error);
      return false;
    }
  }
}

module.exports = new CharacterTypeService();
