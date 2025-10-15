const { OrganizationType } = require('../models');
const { Op } = require('sequelize');

/**
 * @class OrganizationTypeService
 * @description Service layer for OrganizationType business logic
 */
class OrganizationTypeService {
  /**
   * Get all organization types
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Service response
   */
  async getAllOrganizationTypes(options = {}) {
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

      const organizationTypes = await OrganizationType.findAll({
        where: whereClause,
        order: [[validSortBy, validSortOrder]]
      });

      return {
        success: true,
        data: {
          organizationTypes,
          total: organizationTypes.length
        }
      };
    } catch (error) {
      console.error('Error in getAllOrganizationTypes:', error);
      return {
        success: false,
        message: 'Failed to fetch organization types',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Get organization type by ID
   * @param {number} id - Organization type ID
   * @returns {Promise<Object>} Service response
   */
  async getOrganizationTypeById(id) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid organization type ID',
          error: 'INVALID_ID'
        };
      }

      const organizationType = await OrganizationType.findByPk(id);
      
      if (!organizationType) {
        return {
          success: false,
          message: `Organization type with ID ${id} not found`,
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data: organizationType
      };
    } catch (error) {
      console.error('Error in getOrganizationTypeById:', error);
      return {
        success: false,
        message: 'Failed to fetch organization type',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Update organization type
   * @param {number} id - Organization type ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Service response
   */
  async updateOrganizationType(id, updateData) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid organization type ID',
          error: 'INVALID_ID'
        };
      }

      const organizationType = await OrganizationType.findByPk(id);
      if (!organizationType) {
        return {
          success: false,
          message: `Organization type with ID ${id} not found`,
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
      if (updateData.name && updateData.name !== organizationType.name) {
        const existingOrganizationType = await OrganizationType.findOne({
          where: { name: updateData.name }
        });
        if (existingOrganizationType) {
          return {
            success: false,
            message: 'An organization type with this name already exists',
            error: 'DUPLICATE_NAME'
          };
        }
      }

      await organizationType.update(updateData);
      await organizationType.reload();

      return {
        success: true,
        data: organizationType,
        message: 'Organization type updated successfully'
      };
    } catch (error) {
      console.error('Error in updateOrganizationType:', error);
      return {
        success: false,
        message: 'Failed to update organization type',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Check if organization type name exists
   * @param {string} name - Organization type name
   * @param {number} excludeId - ID to exclude from check
   * @returns {Promise<boolean>} True if name exists
   */
  async nameExists(name, excludeId = null) {
    try {
      const whereClause = { name };
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }
      
      const organizationType = await OrganizationType.findOne({ where: whereClause });
      return !!organizationType;
    } catch (error) {
      console.error('Error in nameExists:', error);
      return false;
    }
  }

  /**
   * Check if organization type ID exists
   * @param {number} id - Organization type ID
   * @returns {Promise<boolean>} True if ID exists
   */
  async idExists(id) {
    try {
      const organizationType = await OrganizationType.findByPk(id);
      return !!organizationType;
    } catch (error) {
      console.error('Error in idExists:', error);
      return false;
    }
  }

  /**
   * Check if organization type is in use by organizations
   * @param {number} id - Organization type ID
   * @returns {Promise<boolean>} True if organization type is in use
   */
  async isOrganizationTypeInUse(id) {
    try {
      const organizationType = await OrganizationType.findByPk(id, {
        include: [{
          association: 'organizations',
          required: false
        }]
      });
      
      return !!(organizationType && organizationType.organizations && organizationType.organizations.length > 0);
    } catch (error) {
      console.error('Error in isOrganizationTypeInUse:', error);
      return false;
    }
  }
}

module.exports = new OrganizationTypeService();
