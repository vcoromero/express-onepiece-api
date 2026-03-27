const prisma = require('../config/prisma.config');

class RaceService {
  async getAllRaces(options = {}) {
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

      const races = await prisma.race.findMany({
        where,
        orderBy: { [sortField]: orderDirection }
      });

      return {
        success: true,
        races,
        total: races.length
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

  async getRaceById(id) {
    try {
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid race ID',
          error: 'INVALID_ID'
        };
      }

      const race = await prisma.race.findUnique({
        where: { id: Number.parseInt(id) }
      });

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

  async updateRace(id, updateData) {
    try {
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid race ID',
          error: 'INVALID_ID'
        };
      }

      const race = await prisma.race.findUnique({
        where: { id: Number.parseInt(id) }
      });

      if (!race) {
        return {
          success: false,
          message: `Race with ID ${id} not found`,
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

      if (updateData.name !== undefined && (!updateData.name || updateData.name.trim() === '')) {
        return {
          success: false,
          message: 'Name cannot be empty',
          error: 'INVALID_NAME'
        };
      }
      if (updateData.name !== undefined && updateData.name.length > 50) {
        return {
          success: false,
          message: 'Name cannot exceed 50 characters',
          error: 'INVALID_NAME'
        };
      }

      if (updateData.name !== undefined && updateData.name !== race.name) {
        const existingRace = await prisma.race.findUnique({
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

      const updatedRace = await prisma.race.update({
        where: { id: Number.parseInt(id) },
        data: updateData
      });

      return {
        success: true,
        data: updatedRace,
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

  async nameExists(name, excludeId = null) {
    try {
      const where = { name };
      if (excludeId) {
        where.id = { not: Number.parseInt(excludeId) };
      }

      const race = await prisma.race.findFirst({ where });
      return !!race;
    } catch (error) {
      console.error('Error in nameExists:', error);
      return false;
    }
  }

  async idExists(id) {
    try {
      const race = await prisma.race.findUnique({
        where: { id: Number.parseInt(id) }
      });
      return !!race;
    } catch (error) {
      console.error('Error in idExists:', error);
      return false;
    }
  }

  async isRaceInUse(id) {
    try {
      const count = await prisma.character.count({
        where: { raceId: Number.parseInt(id) }
      });
      return count > 0;
    } catch (error) {
      console.error('Error in isRaceInUse:', error);
      return false;
    }
  }
}

module.exports = new RaceService();
