const prisma = require('../config/prisma.config');

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

      return {
        success: true,
        characterTypes,
        total: characterTypes.length
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

  async getCharacterTypeById(id) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid character type ID',
          error: 'INVALID_ID'
        };
      }

      const characterType = await prisma.characterType.findUnique({
        where: { id: parseInt(id) }
      });

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

  async updateCharacterType(id, updateData) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid character type ID',
          error: 'INVALID_ID'
        };
      }

      const characterType = await prisma.characterType.findUnique({
        where: { id: parseInt(id) }
      });

      if (!characterType) {
        return {
          success: false,
          message: `Character type with ID ${id} not found`,
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

        if (updateData.name !== characterType.name) {
          const existing = await prisma.characterType.findUnique({
            where: { name: updateData.name }
          });
          if (existing) {
            return {
              success: false,
              message: 'A character type with this name already exists',
              error: 'DUPLICATE_NAME'
            };
          }
        }
      }

      const updated = await prisma.characterType.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      return {
        success: true,
        data: updated,
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

  async nameExists(name, excludeId = null) {
    try {
      const where = { name };
      if (excludeId) {
        where.id = { not: parseInt(excludeId) };
      }

      const characterType = await prisma.characterType.findFirst({ where });
      return !!characterType;
    } catch (error) {
      console.error('Error in nameExists:', error);
      return false;
    }
  }

  async idExists(id) {
    try {
      const characterType = await prisma.characterType.findUnique({
        where: { id: parseInt(id) }
      });
      return !!characterType;
    } catch (error) {
      console.error('Error in idExists:', error);
      return false;
    }
  }

  async isCharacterTypeInUse(id) {
    try {
      const count = await prisma.characterCharacterType.count({
        where: { characterTypeId: parseInt(id) }
      });
      return count > 0;
    } catch (error) {
      console.error('Error in isCharacterTypeInUse:', error);
      return false;
    }
  }
}

module.exports = new CharacterTypeService();
