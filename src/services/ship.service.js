const prisma = require('../config/prisma.config');

const serializeBigInt = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));
};

class ShipService {
  async getAllShips(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search
      } = options;

      const pageNum = Math.max(1, Number.parseInt(page));
      const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      const where = {};

      if (status) {
        if (!['active', 'destroyed', 'retired'].includes(status)) {
          throw new Error('SHIP_INVALID_STATUS');
        }
        where.status = status;
      }

      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }

      const [ships, total] = await Promise.all([
        prisma.ship.findMany({
          where,
          include: {
            organization: { select: { id: true, name: true, status: true, totalBounty: true } }
          },
          orderBy: { name: 'asc' },
          skip: offset,
          take: limitNum
        }),
        prisma.ship.count({ where })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        success: true,
        data: serializeBigInt(ships),
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
      console.error('Error in getAllShips:', error);
      return {
        success: false,
        message: 'Failed to fetch ships',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  async getShipById(id) {
    try {
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid ship ID',
          error: 'INVALID_ID'
        };
      }

      const ship = await prisma.ship.findUnique({
        where: { id: Number.parseInt(id) },
        include: {
          organization: { select: { id: true, name: true, status: true, totalBounty: true } }
        }
      });

      if (!ship) {
        return {
          success: false,
          message: `Ship with ID ${id} not found`,
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data: serializeBigInt(ship)
      };
    } catch (error) {
      console.error('Error in getShipById:', error);
      return {
        success: false,
        message: 'Failed to fetch ship',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  async createShip(shipData) {
    try {
      const { name, description, status = 'active' } = shipData;

      if (!name || name.trim().length === 0) {
        throw new Error('SHIP_NAME_REQUIRED');
      }

      if (status && !['active', 'destroyed', 'retired'].includes(status)) {
        throw new Error('SHIP_INVALID_STATUS');
      }

      const existingShip = await prisma.ship.findUnique({
        where: { name: name.trim() }
      });

      if (existingShip) {
        throw new Error('SHIP_NAME_EXISTS');
      }

      const ship = await prisma.ship.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          status
        }
      });

      return await this.getShipById(ship.id);
    } catch (error) {
      if (['SHIP_NAME_REQUIRED', 'SHIP_INVALID_STATUS', 'SHIP_NAME_EXISTS'].includes(error.message)) {
        throw error;
      }
      throw new Error(`SHIP_CREATE_ERROR: ${error.message}`);
    }
  }

  async updateShip(id, updateData) {
    try {
      if (!id || Number.isNaN(id) || id <= 0) {
        throw new Error('SHIP_INVALID_ID');
      }

      const { name, description, status } = updateData;

      const existingShip = await prisma.ship.findUnique({
        where: { id: Number.parseInt(id) }
      });

      if (!existingShip) {
        throw new Error('SHIP_NOT_FOUND');
      }

      if (status && !['active', 'destroyed', 'retired'].includes(status)) {
        throw new Error('SHIP_INVALID_STATUS');
      }

      if (
        name
        && name.trim() !== existingShip.name
        && await prisma.ship.findFirst({
          where: {
            name: name.trim(),
            id: { not: Number.parseInt(id) }
          }
        })
      ) {
        throw new Error('SHIP_NAME_EXISTS');
      }

      const updateFields = {};
      if (name !== undefined) updateFields.name = name.trim();
      if (description !== undefined) updateFields.description = description?.trim() || null;
      if (status !== undefined) updateFields.status = status;

      await prisma.ship.update({
        where: { id: Number.parseInt(id) },
        data: updateFields
      });

      return await this.getShipById(id);
    } catch (error) {
      if (['SHIP_INVALID_ID', 'SHIP_NOT_FOUND', 'SHIP_INVALID_STATUS', 'SHIP_NAME_EXISTS'].includes(error.message)) {
        throw error;
      }
      throw new Error(`SHIP_UPDATE_ERROR: ${error.message}`);
    }
  }

  async deleteShip(id) {
    try {
      if (!id || Number.isNaN(id) || id <= 0) {
        throw new Error('SHIP_INVALID_ID');
      }

      const ship = await prisma.ship.findUnique({
        where: { id: Number.parseInt(id) }
      });

      if (!ship) {
        throw new Error('SHIP_NOT_FOUND');
      }

      const organizationsUsingShip = await prisma.organization.count({
        where: { shipId: Number.parseInt(id) }
      });

      if (organizationsUsingShip > 0) {
        throw new Error('SHIP_IN_USE');
      }

      await prisma.ship.delete({
        where: { id: Number.parseInt(id) }
      });

      return {
        success: true,
        message: 'Ship deleted successfully'
      };
    } catch (error) {
      if (['SHIP_INVALID_ID', 'SHIP_NOT_FOUND', 'SHIP_IN_USE'].includes(error.message)) {
        throw error;
      }
      throw new Error(`SHIP_DELETE_ERROR: ${error.message}`);
    }
  }

  async getShipsByStatus(status) {
    try {
      if (!['active', 'destroyed', 'retired'].includes(status)) {
        throw new Error('SHIP_INVALID_STATUS');
      }

      const ships = await prisma.ship.findMany({
        where: { status },
        include: {
          organization: { select: { id: true, name: true, status: true } }
        },
        orderBy: { name: 'asc' }
      });

      return ships;
    } catch (error) {
      if (error.message === 'SHIP_INVALID_STATUS') {
        throw error;
      }
      throw new Error(`SHIP_GET_BY_STATUS_ERROR: ${error.message}`);
    }
  }
}

module.exports = new ShipService();
