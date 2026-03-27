const prisma = require('../config/prisma.config');
const { serviceSuccess, serviceFailure } = require('../utils/service-result.helper');

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

      return serviceSuccess({
        organizationTypes,
        total: organizationTypes.length
      });
    } catch (error) {
      return serviceFailure('Failed to fetch organization types', 'INTERNAL_ERROR', error, 'organizationType.getAll');
    }
  }

  async getOrganizationTypeById(id) {
    try {
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return serviceFailure('Invalid organization type ID', 'INVALID_ID');
      }

      const organizationType = await prisma.organizationType.findUnique({
        where: { id: Number.parseInt(id) }
      });

      if (!organizationType) {
        return serviceFailure(`Organization type with ID ${id} not found`, 'NOT_FOUND');
      }

      return serviceSuccess({ data: organizationType });
    } catch (error) {
      return serviceFailure('Failed to fetch organization type', 'INTERNAL_ERROR', error, 'organizationType.getById');
    }
  }

  async updateOrganizationType(id, updateData) {
    try {
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return serviceFailure('Invalid organization type ID', 'INVALID_ID');
      }

      const organizationType = await prisma.organizationType.findUnique({
        where: { id: Number.parseInt(id) }
      });

      if (!organizationType) {
        return serviceFailure(`Organization type with ID ${id} not found`, 'NOT_FOUND');
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        return serviceFailure('At least one field must be provided for update', 'NO_FIELDS_PROVIDED');
      }

      if (updateData.name !== undefined && (!updateData.name || updateData.name.trim() === '')) {
        return serviceFailure('Name cannot be empty', 'INVALID_NAME');
      }
      if (updateData.name !== undefined && updateData.name.length > 50) {
        return serviceFailure('Name cannot exceed 50 characters', 'INVALID_NAME');
      }

      if (updateData.name !== undefined && updateData.name !== organizationType.name) {
        const existing = await prisma.organizationType.findUnique({
          where: { name: updateData.name }
        });
        if (existing) {
          return serviceFailure('An organization type with this name already exists', 'DUPLICATE_NAME');
        }
      }

      const updated = await prisma.organizationType.update({
        where: { id: Number.parseInt(id) },
        data: updateData
      });

      return serviceSuccess({
        data: updated,
        message: 'Organization type updated successfully'
      });
    } catch (error) {
      return serviceFailure('Failed to update organization type', 'INTERNAL_ERROR', error, 'organizationType.update');
    }
  }

  async nameExists(name, excludeId = null) {
    try {
      const where = { name };
      if (excludeId) {
        where.id = { not: Number.parseInt(excludeId) };
      }

      const organizationType = await prisma.organizationType.findFirst({ where });
      return !!organizationType;
    } catch (error) {
      serviceFailure('Failed to check organization type name', 'INTERNAL_ERROR', error, 'organizationType.nameExists');
      return false;
    }
  }

  async idExists(id) {
    try {
      const organizationType = await prisma.organizationType.findUnique({
        where: { id: Number.parseInt(id) }
      });
      return !!organizationType;
    } catch (error) {
      serviceFailure('Failed to check organization type id', 'INTERNAL_ERROR', error, 'organizationType.idExists');
      return false;
    }
  }

  async isOrganizationTypeInUse(id) {
    try {
      const count = await prisma.organization.count({
        where: { organizationTypeId: Number.parseInt(id) }
      });
      return count > 0;
    } catch (error) {
      serviceFailure('Failed to check organization type usage', 'INTERNAL_ERROR', error, 'organizationType.isInUse');
      return false;
    }
  }
}

module.exports = new OrganizationTypeService();
