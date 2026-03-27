const prisma = require('../config/prisma.config');

class DevilFruitService {
  buildUpdateFruitPayload(data) {
    const updates = {};

    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.typeId !== undefined) updates.typeId = Number.parseInt(data.typeId);
    if (data.japaneseName !== undefined) updates.japaneseName = data.japaneseName ? data.japaneseName.trim() : null;
    if (data.description !== undefined) updates.description = data.description ? data.description.trim() : null;
    if (data.currentUserId !== undefined) updates.currentUserId = data.currentUserId ? Number.parseInt(data.currentUserId) : null;

    return updates;
  }

  async getAllFruits(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        type_id,
        sortBy = 'name',
        sortOrder = 'asc'
      } = options;

      const pageNum = Math.max(1, Number.parseInt(page));
      const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { japaneseName: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (type_id) {
        where.typeId = Number.parseInt(type_id);
      }

      const validSortFields = ['name', 'createdAt', 'updatedAt'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
      const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

      const [fruits, total] = await Promise.all([
        prisma.devilFruit.findMany({
          where,
          include: {
            fruitType: { select: { id: true, name: true, description: true } }
          },
          orderBy: { [sortField]: orderDirection },
          skip: offset,
          take: limitNum
        }),
        prisma.devilFruit.count({ where })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        success: true,
        fruits,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      };
    } catch (error) {
      console.error('Error in getAllFruits:', error);
      return {
        success: false,
        message: 'Failed to fetch devil fruits',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  async getFruitById(id) {
    try {
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return null;
      }

      const fruit = await prisma.devilFruit.findUnique({
        where: { id: Number.parseInt(id) },
        include: {
          fruitType: { select: { id: true, name: true, description: true } }
        }
      });

      return fruit;
    } catch (error) {
      console.error('Error in getFruitById:', error);
      return null;
    }
  }

  async nameExists(name, excludeId = null) {
    try {
      const where = { name: name.trim() };
      if (excludeId) {
        where.id = { not: Number.parseInt(excludeId) };
      }

      const existing = await prisma.devilFruit.findFirst({ where });
      return !!existing;
    } catch (error) {
      console.error('Error in nameExists:', error);
      return false;
    }
  }

  async typeExists(typeId) {
    try {
      const type = await prisma.fruitType.findUnique({
        where: { id: Number.parseInt(typeId) }
      });
      return !!type;
    } catch (error) {
      console.error('Error in typeExists:', error);
      return false;
    }
  }

  async createFruit(data) {
    try {
      const {
        name,
        typeId,
        japaneseName,
        description,
        currentUserId
      } = data;

      const exists = await this.nameExists(name);
      if (exists) {
        const error = new Error('A devil fruit with this name already exists');
        error.code = 'DUPLICATE_NAME';
        throw error;
      }

      const typeValid = await this.typeExists(typeId);
      if (!typeValid) {
        const error = new Error('Invalid type ID');
        error.code = 'INVALID_TYPE';
        throw error;
      }

      const newFruit = await prisma.devilFruit.create({
        data: {
          name: name.trim(),
          typeId: Number.parseInt(typeId),
          japaneseName: japaneseName ? japaneseName.trim() : null,
          description: description ? description.trim() : null,
          currentUserId: currentUserId ? Number.parseInt(currentUserId) : null
        }
      });

      return await this.getFruitById(newFruit.id);
    } catch (error) {
      console.error('Error in createFruit:', error);
      throw error;
    }
  }

  async updateFruit(id, data) {
    try {
      const fruit = await this.getFruitById(id);
      if (!fruit) {
        const error = new Error(`Devil fruit with ID ${id} not found`);
        error.code = 'NOT_FOUND';
        throw error;
      }

      if (data.name !== undefined && await this.nameExists(data.name, id)) {
        const error = new Error('Another devil fruit with this name already exists');
        error.code = 'DUPLICATE_NAME';
        throw error;
      }

      if (data.typeId !== undefined && !(await this.typeExists(data.typeId))) {
        const error = new Error('Invalid type ID');
        error.code = 'INVALID_TYPE';
        throw error;
      }

      const updates = this.buildUpdateFruitPayload(data);

      await prisma.devilFruit.update({
        where: { id: Number.parseInt(id) },
        data: updates
      });

      return await this.getFruitById(id);
    } catch (error) {
      console.error('Error in updateFruit:', error);
      throw error;
    }
  }

  async deleteFruit(id) {
    try {
      const fruit = await this.getFruitById(id);
      if (!fruit) {
        const error = new Error(`Devil fruit with ID ${id} not found`);
        error.code = 'NOT_FOUND';
        throw error;
      }

      await prisma.devilFruit.delete({
        where: { id: Number.parseInt(id) }
      });

      return {
        id: fruit.id,
        name: fruit.name
      };
    } catch (error) {
      console.error('Error in deleteFruit:', error);
      throw error;
    }
  }

  async getFruitsByType(typeId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc'
      } = options;

      const pageNum = Math.max(1, Number.parseInt(page));
      const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      const validSortFields = ['name', 'createdAt', 'updatedAt'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
      const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

      const [fruits, total] = await Promise.all([
        prisma.devilFruit.findMany({
          where: { typeId: Number.parseInt(typeId) },
          include: {
            fruitType: { select: { id: true, name: true, description: true } }
          },
          orderBy: { [sortField]: orderDirection },
          skip: offset,
          take: limitNum
        }),
        prisma.devilFruit.count({ where: { typeId: Number.parseInt(typeId) } })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        success: true,
        fruits,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      };
    } catch (error) {
      console.error('Error in getFruitsByType:', error);
      return {
        success: false,
        message: 'Failed to fetch devil fruits by type',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }
}

module.exports = new DevilFruitService();
