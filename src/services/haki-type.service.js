const { HakiType } = require('../models');
const { Op } = require('sequelize');

/**
 * HakiType Service
 * Contains all business logic for HakiType operations
 */
class HakiTypeService {
  /**
   * Get all Haki types
   * @param {Object} options - Query options
   * @param {string} options.search - Search term for name/description
   * @param {string} options.sortBy - Field to sort by (default: 'name')
   * @param {string} options.sortOrder - Sort order (asc/desc, default: 'asc')
   * @returns {Promise<Object>} Result with Haki types
   */
  async getAllHakiTypes(options = {}) {
    try {
      const {
        search,
        sortBy = 'name',
        sortOrder = 'asc'
      } = options;

      // Build where clause for search
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      // Validate sort parameters
      const validSortFields = ['name', 'color', 'created_at', 'updated_at'];
      const validSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
      const validSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

      const hakiTypes = await HakiType.findAll({
        where: whereClause,
        order: [[validSortBy, validSortOrder]]
      });

      return {
        success: true,
        hakiTypes,
        total: hakiTypes.length
      };
    } catch (error) {
      console.error('Error in getAllHakiTypes:', error);
      return {
        success: false,
        message: 'Failed to retrieve Haki types',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Get a Haki type by ID
   * @param {number} id - Haki type ID
   * @returns {Promise<Object>} Haki type data or error
   */
  async getHakiTypeById(id) {
    try {
      // Validate ID
      if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid Haki type ID',
          error: 'INVALID_ID'
        };
      }

      const hakiType = await HakiType.findByPk(parseInt(id));

      if (!hakiType) {
        return {
          success: false,
          message: 'Haki type not found',
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data: { hakiType }
      };
    } catch (error) {
      console.error('Error in getHakiTypeById:', error);
      return {
        success: false,
        message: 'Failed to retrieve Haki type',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Update a Haki type
   * @param {number} id - Haki type ID
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.name] - New name
   * @param {string} [updateData.description] - New description
   * @param {string} [updateData.color] - New color
   * @returns {Promise<Object>} Updated Haki type or error
   */
  async updateHakiType(id, updateData) {
    try {
      // Validate ID
      if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid Haki type ID',
          error: 'INVALID_ID'
        };
      }

      const { name, description, color } = updateData;

      // Find the Haki type
      const hakiType = await HakiType.findByPk(parseInt(id));
      if (!hakiType) {
        return {
          success: false,
          message: 'Haki type not found',
          error: 'NOT_FOUND'
        };
      }

      // Check for duplicate name if name is being updated
      if (name && name.trim() !== hakiType.name) {
        const existingHakiType = await HakiType.findOne({
          where: { 
            name: name.trim(),
            id: { [Op.ne]: parseInt(id) }
          }
        });

        if (existingHakiType) {
          return {
            success: false,
            message: 'A Haki type with this name already exists',
            error: 'DUPLICATE_NAME'
          };
        }
      }

      // Update the Haki type
      const updatedHakiType = await hakiType.update({
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(color !== undefined && { color: color?.trim() || null })
      });

      return {
        success: true,
        data: { hakiType: updatedHakiType },
        message: 'Haki type updated successfully'
      };
    } catch (error) {
      console.error('Error in updateHakiType:', error);
      
      // Handle Sequelize validation errors
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => err.message).join(', ');
        return {
          success: false,
          message: `Validation error: ${validationErrors}`,
          error: 'VALIDATION_ERROR'
        };
      }

      // Handle unique constraint errors
      if (error.name === 'SequelizeUniqueConstraintError') {
        return {
          success: false,
          message: 'A Haki type with this name already exists',
          error: 'DUPLICATE_NAME'
        };
      }

      return {
        success: false,
        message: 'Failed to update Haki type',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

}

module.exports = new HakiTypeService();
