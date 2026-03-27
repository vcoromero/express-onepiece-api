const prisma = require('../config/prisma.config');
const { serviceSuccess, serviceFailure } = require('../utils/service-result.helper');

class CharacterTypeService {
  async getAllCharacterTypes(options = {}) {
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

      const characterTypes = await prisma.characterType.findMany({
        where,
        orderBy: { [sortField]: orderDirection }
      });

      return serviceSuccess({
        characterTypes,
        total: characterTypes.length
      });
    } catch (error) {
      return serviceFailure('Failed to fetch character types', 'INTERNAL_ERROR', error, 'characterType.getAll');
    }
  }

  async getCharacterTypeById(id) {
    try {
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return serviceFailure('Invalid character type ID', 'INVALID_ID');
      }

      const characterType = await prisma.characterType.findUnique({
        where: { id: Number.parseInt(id) }
      });

      if (!characterType) {
        return serviceFailure(`Character type with ID ${id} not found`, 'NOT_FOUND');
      }

      return serviceSuccess({ data: characterType });
    } catch (error) {
      return serviceFailure('Failed to fetch character type', 'INTERNAL_ERROR', error, 'characterType.getById');
    }
  }

  async updateCharacterType(id, updateData) {
    try {
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return serviceFailure('Invalid character type ID', 'INVALID_ID');
      }

      const characterType = await prisma.characterType.findUnique({
        where: { id: Number.parseInt(id) }
      });

      if (!characterType) {
        return serviceFailure(`Character type with ID ${id} not found`, 'NOT_FOUND');
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

      if (updateData.name !== undefined && updateData.name !== characterType.name) {
        const existing = await prisma.characterType.findUnique({
          where: { name: updateData.name }
        });
        if (existing) {
          return serviceFailure('A character type with this name already exists', 'DUPLICATE_NAME');
        }
      }

      const updated = await prisma.characterType.update({
        where: { id: Number.parseInt(id) },
        data: updateData
      });

      return serviceSuccess({
        data: updated,
        message: 'Character type updated successfully'
      });
    } catch (error) {
      return serviceFailure('Failed to update character type', 'INTERNAL_ERROR', error, 'characterType.update');
    }
  }

  async nameExists(name, excludeId = null) {
    try {
      const where = { name };
      if (excludeId) {
        where.id = { not: Number.parseInt(excludeId) };
      }

      const characterType = await prisma.characterType.findFirst({ where });
      return !!characterType;
    } catch (error) {
      serviceFailure('Failed to check character type name', 'INTERNAL_ERROR', error, 'characterType.nameExists');
      return false;
    }
  }

  async idExists(id) {
    try {
      const characterType = await prisma.characterType.findUnique({
        where: { id: Number.parseInt(id) }
      });
      return !!characterType;
    } catch (error) {
      serviceFailure('Failed to check character type id', 'INTERNAL_ERROR', error, 'characterType.idExists');
      return false;
    }
  }

  async isCharacterTypeInUse(id) {
    try {
      const count = await prisma.characterCharacterType.count({
        where: { characterTypeId: Number.parseInt(id) }
      });
      return count > 0;
    } catch (error) {
      serviceFailure('Failed to check character type usage', 'INTERNAL_ERROR', error, 'characterType.isInUse');
      return false;
    }
  }
}

module.exports = new CharacterTypeService();
