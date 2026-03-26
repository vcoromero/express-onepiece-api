const prisma = require('../config/prisma.config');

class OrganizationTypeService {
  async getAllOrganizationTypes(options = {}) {
    try {
      const { search, sortBy = 'name', sortOrder = 'asc' } = options;

      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const validSortFields = ['name', 'createdAt', 'updatedAt'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
      const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

      const organizationTypes = await prisma.organizationType.findMany({
        where,
        orderBy: { [sortField]: orderDirection }
      });

      return {
        success: true,
        organizationTypes,
        total: organizationTypes.length
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

  async getOrganizationTypeById(id) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid organization type ID',
          error: 'INVALID_ID'
        };
      }

      const organizationType = await prisma.organizationType.findUnique({
        where: { id: parseInt(id) }
      });

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

  async updateOrganizationType(id, updateData) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid organization type ID',
          error: 'INVALID_ID'
        };
      }

      const organizationType = await prisma.organizationType.findUnique({
        where: { id: parseInt(id) }
      });

      if (!organizationType) {
        return {
          success: false,
          message: `Organization type with ID ${id} not found`,
          error: 'NOT_FOUND'
        };
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        return {
          success: false,
          message: 'At least one field must be provided for update',
          error: 'NO_FIELDS_PROVIDED'
        };
      }

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

        if (updateData.name !== organizationType.name) {
          const existing = await prisma.organizationType.findUnique({
            where: { name: updateData.name }
          });
          if (existing) {
            return {
              success: false,
              message: 'An organization type with this name already exists',
              error: 'DUPLICATE_NAME'
            };
          }
        }
      }

      const updated = await prisma.organizationType.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      return {
        success: true,
        data: updated,
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

  async nameExists(name, excludeId = null) {
    try {
      const where = { name };
      if (excludeId) {
        where.id = { not: parseInt(excludeId) };
      }

      const organizationType = await prisma.organizationType.findFirst({ where });
      return !!organizationType;
    } catch (error) {
      console.error('Error in nameExists:', error);
      return false;
    }
  }

  async idExists(id) {
    try {
      const organizationType = await prisma.organizationType.findUnique({
        where: { id: parseInt(id) }
      });
      return !!organizationType;
    } catch (error) {
      console.error('Error in idExists:', error);
      return false;
    }
  }

  async isOrganizationTypeInUse(id) {
    try {
      const count = await prisma.organization.count({
        where: { organizationTypeId: parseInt(id) }
      });
      return count > 0;
    } catch (error) {
      console.error('Error in isOrganizationTypeInUse:', error);
      return false;
    }
  }
}

module.exports = new OrganizationTypeService();
