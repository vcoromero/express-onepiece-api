const { Ship, Organization } = require('../models');
const { Op } = require('sequelize');

/**
 * Ship Service
 * Contains all business logic for ship management
 */
class ShipService {
  /**
     * Get all ships with pagination and filtering
     * @param {Object} options - Query options
     * @param {number} options.page - Page number (default: 1)
     * @param {number} options.limit - Items per page (default: 10)
     * @param {string} options.status - Filter by status
     * @param {string} options.search - Search term for name
     * @returns {Promise<Object>} Paginated ships data
     */
  async getAllShips(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search
      } = options;

      // Validate pagination parameters
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      // Build where clause
      const whereClause = {};
            
      if (status) {
        if (!['active', 'destroyed', 'retired'].includes(status)) {
          throw new Error('SHIP_INVALID_STATUS');
        }
        whereClause.status = status;
      }

      if (search) {
        whereClause.name = {
          [Op.like]: `%${search}%`
        };
      }

      // Execute query with pagination
      const { count, rows } = await Ship.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Organization,
            as: 'organizations',
            attributes: ['id', 'name', 'status', 'total_bounty'],
            required: false
          }
        ],
        order: [['name', 'ASC']],
        limit: limitNum,
        offset: offset
      });

      const totalPages = Math.ceil(count / limitNum);

      return {
        ships: rows,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      };
    } catch (error) {
      if (error.message === 'SHIP_INVALID_STATUS') {
        throw new Error('SHIP_INVALID_STATUS');
      }
      throw new Error(`SHIP_GET_ALL_ERROR: ${error.message}`);
    }
  }

  /**
     * Get ship by ID with relationships
     * @param {number} id - Ship ID
     * @returns {Promise<Object>} Ship data
     */
  async getShipById(id) {
    try {
      if (!id || isNaN(id) || id <= 0) {
        throw new Error('SHIP_INVALID_ID');
      }

      const ship = await Ship.findByPk(id, {
        include: [
          {
            model: Organization,
            as: 'organizations',
            attributes: ['id', 'name', 'status', 'total_bounty'],
            required: false
          }
        ]
      });

      if (!ship) {
        throw new Error('SHIP_NOT_FOUND');
      }

      return ship;
    } catch (error) {
      if (error.message === 'SHIP_INVALID_ID') {
        throw new Error('SHIP_INVALID_ID');
      }
      if (error.message === 'SHIP_NOT_FOUND') {
        throw new Error('SHIP_NOT_FOUND');
      }
      throw new Error(`SHIP_GET_BY_ID_ERROR: ${error.message}`);
    }
  }

  /**
     * Create a new ship
     * @param {Object} shipData - Ship data
     * @param {string} shipData.name - Ship name
     * @param {string} shipData.description - Ship description
     * @param {string} shipData.status - Ship status
     * @param {string} shipData.image_url - Ship image URL
     * @returns {Promise<Object>} Created ship
     */
  async createShip(shipData) {
    try {
      const { name, description, status = 'active', image_url } = shipData;

      // Validate required fields
      if (!name || name.trim().length === 0) {
        throw new Error('SHIP_NAME_REQUIRED');
      }

      // Validate status
      if (status && !['active', 'destroyed', 'retired'].includes(status)) {
        throw new Error('SHIP_INVALID_STATUS');
      }

      // Check for duplicate name
      const existingShip = await Ship.findOne({
        where: { name: name.trim() }
      });

      if (existingShip) {
        throw new Error('SHIP_NAME_EXISTS');
      }

      // Create ship
      const ship = await Ship.create({
        name: name.trim(),
        description: description?.trim() || null,
        status: status,
        image_url: image_url?.trim() || null
      });

      // Return ship with relationships
      return await this.getShipById(ship.id);
    } catch (error) {
      if (['SHIP_NAME_REQUIRED', 'SHIP_INVALID_STATUS', 'SHIP_NAME_EXISTS'].includes(error.message)) {
        throw error;
      }
      throw new Error(`SHIP_CREATE_ERROR: ${error.message}`);
    }
  }

  /**
     * Update ship by ID
     * @param {number} id - Ship ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated ship
     */
  async updateShip(id, updateData) {
    try {
      if (!id || isNaN(id) || id <= 0) {
        throw new Error('SHIP_INVALID_ID');
      }

      const { name, description, status, image_url } = updateData;

      // Check if ship exists
      const existingShip = await Ship.findByPk(id);
      if (!existingShip) {
        throw new Error('SHIP_NOT_FOUND');
      }

      // Validate status if provided
      if (status && !['active', 'destroyed', 'retired'].includes(status)) {
        throw new Error('SHIP_INVALID_STATUS');
      }

      // Check for duplicate name if name is being updated
      if (name && name.trim() !== existingShip.name) {
        const duplicateShip = await Ship.findOne({
          where: { 
            name: name.trim(),
            id: { [Op.ne]: id }
          }
        });

        if (duplicateShip) {
          throw new Error('SHIP_NAME_EXISTS');
        }
      }

      // Update ship
      const updateFields = {};
      if (name !== undefined) updateFields.name = name.trim();
      if (description !== undefined) updateFields.description = description?.trim() || null;
      if (status !== undefined) updateFields.status = status;
      if (image_url !== undefined) updateFields.image_url = image_url?.trim() || null;

      await Ship.update(updateFields, {
        where: { id }
      });

      // Return updated ship with relationships
      return await this.getShipById(id);
    } catch (error) {
      if (['SHIP_INVALID_ID', 'SHIP_NOT_FOUND', 'SHIP_INVALID_STATUS', 'SHIP_NAME_EXISTS'].includes(error.message)) {
        throw error;
      }
      throw new Error(`SHIP_UPDATE_ERROR: ${error.message}`);
    }
  }

  /**
     * Delete ship by ID
     * @param {number} id - Ship ID
     * @returns {Promise<Object>} Deletion result
     */
  async deleteShip(id) {
    try {
      if (!id || isNaN(id) || id <= 0) {
        throw new Error('SHIP_INVALID_ID');
      }

      // Check if ship exists
      const ship = await Ship.findByPk(id);
      if (!ship) {
        throw new Error('SHIP_NOT_FOUND');
      }

      // Check if ship is being used by any organization
      const organizationsUsingShip = await Organization.count({
        where: { ship_id: id }
      });

      if (organizationsUsingShip > 0) {
        throw new Error('SHIP_IN_USE');
      }

      // Delete ship
      await Ship.destroy({
        where: { id }
      });

      return {
        message: 'Ship deleted successfully',
        deletedShip: {
          id: ship.id,
          name: ship.name
        }
      };
    } catch (error) {
      if (['SHIP_INVALID_ID', 'SHIP_NOT_FOUND', 'SHIP_IN_USE'].includes(error.message)) {
        throw error;
      }
      throw new Error(`SHIP_DELETE_ERROR: ${error.message}`);
    }
  }

  /**
     * Get ships by status
     * @param {string} status - Ship status
     * @returns {Promise<Array>} Ships with specified status
     */
  async getShipsByStatus(status) {
    try {
      if (!['active', 'destroyed', 'retired'].includes(status)) {
        throw new Error('SHIP_INVALID_STATUS');
      }

      const ships = await Ship.findAll({
        where: { status },
        include: [
          {
            model: Organization,
            as: 'organizations',
            attributes: ['id', 'name', 'status'],
            required: false
          }
        ],
        order: [['name', 'ASC']]
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
