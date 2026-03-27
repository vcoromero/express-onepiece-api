const prisma = require('../config/prisma.config');

class FruitTypeService {
  async getAllTypes() {
    try {
      const fruitTypes = await prisma.fruitType.findMany({
        orderBy: { id: 'asc' }
      });

      return {
        success: true,
        data: fruitTypes,
        count: fruitTypes.length
      };
    } catch (error) {
      console.error('Error in getAllTypes:', error);
      return {
        success: false,
        message: 'Failed to fetch fruit types',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  async getTypeById(id) {
    try {
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid fruit type ID',
          error: 'INVALID_ID'
        };
      }

      const fruitType = await prisma.fruitType.findUnique({
        where: { id: Number.parseInt(id) }
      });

      if (!fruitType) {
        return {
          success: false,
          message: `Fruit type with ID ${id} not found`,
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data: fruitType
      };
    } catch (error) {
      console.error('Error in getTypeById:', error);
      return {
        success: false,
        message: 'Failed to fetch fruit type',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  async nameExists(name, excludeId = null) {
    try {
      const where = { name: name.trim() };
      if (excludeId) {
        where.id = { not: Number.parseInt(excludeId) };
      }

      const existing = await prisma.fruitType.findFirst({ where });
      return !!existing;
    } catch (error) {
      console.error('Error in nameExists:', error);
      return false;
    }
  }

  async hasAssociatedFruits(id) {
    try {
      const count = await prisma.devilFruit.count({
        where: { typeId: Number.parseInt(id) }
      });
      return count > 0;
    } catch (error) {
      console.error('Error in hasAssociatedFruits:', error);
      return false;
    }
  }

  async getAssociatedFruitsCount(id) {
    try {
      return await prisma.devilFruit.count({
        where: { typeId: Number.parseInt(id) }
      });
    } catch (error) {
      console.error('Error in getAssociatedFruitsCount:', error);
      return 0;
    }
  }

  async createType(data) {
    try {
      const { name, description } = data;

      const exists = await this.nameExists(name);
      if (exists) {
        const error = new Error('A fruit type with this name already exists');
        error.code = 'DUPLICATE_NAME';
        throw error;
      }

      const trimmedDescription = description ? description.trim() : null;
      const finalDescription = trimmedDescription === '' ? null : trimmedDescription;

      const newFruitType = await prisma.fruitType.create({
        data: {
          name: name.trim(),
          description: finalDescription
        }
      });

      return {
        id: newFruitType.id,
        name: newFruitType.name,
        description: newFruitType.description,
        createdAt: newFruitType.createdAt,
        updatedAt: newFruitType.updatedAt
      };
    } catch (error) {
      console.error('Error in createType:', error);
      throw error;
    }
  }

  async updateType(id, data) {
    try {
      const { name, description } = data;

      const fruitType = await this.getTypeById(id);
      if (!fruitType.success) {
        const error = new Error(`Fruit type with ID ${id} not found`);
        error.code = 'NOT_FOUND';
        throw error;
      }

      if (name !== undefined && await this.nameExists(name, id)) {
        const error = new Error('Another fruit type with this name already exists');
        error.code = 'DUPLICATE_NAME';
        throw error;
      }

      const updates = {};
      if (name !== undefined) updates.name = name.trim();
      if (description !== undefined) {
        const trimmedDescription = description ? description.trim() : null;
        updates.description = trimmedDescription === '' ? null : trimmedDescription;
      }

      await prisma.fruitType.update({
        where: { id: Number.parseInt(id) },
        data: updates
      });

      return await this.getTypeById(id);
    } catch (error) {
      console.error('Error in updateType:', error);
      throw error;
    }
  }

  async deleteType(id) {
    try {
      const fruitType = await this.getTypeById(id);
      if (!fruitType.success) {
        const error = new Error(`Fruit type with ID ${id} not found`);
        error.code = 'NOT_FOUND';
        throw error;
      }

      const hasAssociated = await this.hasAssociatedFruits(id);
      if (hasAssociated) {
        const count = await this.getAssociatedFruitsCount(id);
        const error = new Error('Cannot delete fruit type because it has associated devil fruits');
        error.code = 'HAS_ASSOCIATIONS';
        error.associatedCount = count;
        throw error;
      }

      await prisma.fruitType.delete({
        where: { id: Number.parseInt(id) }
      });

      return {
        id: fruitType.data.id,
        name: fruitType.data.name
      };
    } catch (error) {
      console.error('Error in deleteType:', error);
      throw error;
    }
  }
}

module.exports = new FruitTypeService();
