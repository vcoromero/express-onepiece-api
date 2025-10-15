const { Race } = require('../models');
const { Op } = require('sequelize');

/**
 * @class RaceService
 * @description Service layer for Race business logic
 */
class RaceService {
  /**
   * Get all races
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Service response
   */
  async getAllRaces(options = {}) {
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

      const races = await Race.findAll({
        where: whereClause,
        order: [[validSortBy, validSortOrder]]
      });

      return {
        success: true,
        data: {
          races,
          total: races.length
        }
      };
    } catch (error) {
      console.error('Error in getAllRaces:', error);
      return {
        success: false,
        message: 'Failed to fetch races',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Get race by ID
   * @param {number} id - Race ID
   * @returns {Promise<Object>} Service response
   */
  async getRaceById(id) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid race ID',
          error: 'INVALID_ID'
        };
      }

      const race = await Race.findByPk(id);
      
      if (!race) {
        return {
          success: false,
          message: `Race with ID ${id} not found`,
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data: race
      };
    } catch (error) {
      console.error('Error in getRaceById:', error);
      return {
        success: false,
        message: 'Failed to fetch race',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Update race
   * @param {number} id - Race ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Service response
   */
  async updateRace(id, updateData) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid race ID',
          error: 'INVALID_ID'
        };
      }

      const race = await Race.findByPk(id);
      if (!race) {
        return {
          success: false,
          message: `Race with ID ${id} not found`,
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
      if (updateData.name && updateData.name !== race.name) {
        const existingRace = await Race.findOne({
          where: { name: updateData.name }
        });
        if (existingRace) {
          return {
            success: false,
            message: 'A race with this name already exists',
            error: 'DUPLICATE_NAME'
          };
        }
      }

      await race.update(updateData);
      await race.reload();

      return {
        success: true,
        data: race,
        message: 'Race updated successfully'
      };
    } catch (error) {
      console.error('Error in updateRace:', error);
      return {
        success: false,
        message: 'Failed to update race',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Check if race name exists
   * @param {string} name - Race name
   * @param {number} excludeId - ID to exclude from check
   * @returns {Promise<boolean>} True if name exists
   */
  async nameExists(name, excludeId = null) {
    try {
      const whereClause = { name };
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }
      
      const race = await Race.findOne({ where: whereClause });
      return !!race;
    } catch (error) {
      console.error('Error in nameExists:', error);
      return false;
    }
  }

  /**
   * Check if race ID exists
   * @param {number} id - Race ID
   * @returns {Promise<boolean>} True if ID exists
   */
  async idExists(id) {
    try {
      const race = await Race.findByPk(id);
      return !!race;
    } catch (error) {
      console.error('Error in idExists:', error);
      return false;
    }
  }

  /**
   * Check if race is in use by characters
   * @param {number} id - Race ID
   * @returns {Promise<boolean>} True if race is in use
   */
  async isRaceInUse(id) {
    try {
      const race = await Race.findByPk(id, {
        include: [{
          association: 'characters',
          required: false
        }]
      });
      
      return !!(race && race.characters && race.characters.length > 0);
    } catch (error) {
      console.error('Error in isRaceInUse:', error);
      return false;
    }
  }
}

module.exports = new RaceService();
