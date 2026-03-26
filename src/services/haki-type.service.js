const prisma = require('../config/prisma.config');

class HakiTypeService {
  async getAllHakiTypes(options = {}) {
    try {
      const { search, sortBy = 'name', sortOrder = 'asc' } = options;

      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const validSortFields = ['name', 'color', 'createdAt', 'updatedAt'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
      const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

      const hakiTypes = await prisma.hakiType.findMany({
        where,
        orderBy: { [sortField]: orderDirection }
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

  async getHakiTypeById(id) {
    try {
      if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid Haki type ID',
          error: 'INVALID_ID'
        };
      }

      const hakiType = await prisma.hakiType.findUnique({
        where: { id: parseInt(id) }
      });

      if (!hakiType) {
        return {
          success: false,
          message: 'Haki type not found',
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data: hakiType
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

  async updateHakiType(id, updateData) {
    try {
      if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid Haki type ID',
          error: 'INVALID_ID'
        };
      }

      const { name, description, color } = updateData;

      const hakiType = await prisma.hakiType.findUnique({
        where: { id: parseInt(id) }
      });

      if (!hakiType) {
        return {
          success: false,
          message: 'Haki type not found',
          error: 'NOT_FOUND'
        };
      }

      if (name && name.trim() !== hakiType.name) {
        const existing = await prisma.hakiType.findFirst({
          where: {
            name: name.trim(),
            id: { not: parseInt(id) }
          }
        });

        if (existing) {
          return {
            success: false,
            message: 'A Haki type with this name already exists',
            error: 'DUPLICATE_NAME'
          };
        }
      }

      const updates = {};
      if (name) updates.name = name.trim();
      if (description !== undefined) updates.description = description?.trim() || null;
      if (color !== undefined) updates.color = color?.trim() || null;

      const updatedHakiType = await prisma.hakiType.update({
        where: { id: parseInt(id) },
        data: updates
      });

      return {
        success: true,
        data: { hakiType: updatedHakiType },
        message: 'Haki type updated successfully'
      };
    } catch (error) {
      console.error('Error in updateHakiType:', error);
      return {
        success: false,
        message: 'Failed to update Haki type',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }
}

module.exports = new HakiTypeService();