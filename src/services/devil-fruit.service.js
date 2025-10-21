const DevilFruit = require('../models/devil-fruit.model');
const { FruitType } = require('../models');
const { Op } = require('sequelize');

/**
 * DevilFruitService
 * 
 * Business logic layer for Devil Fruits
 * Handles all operations related to devil fruits
 */
class DevilFruitService {
  /**
   * Get all devil fruits with optional filtering and pagination
   * @param {Object} options - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=10] - Items per page
   * @param {string} [options.search] - Search term for name
   * @param {string} [options.type_id] - Filter by type ID
   * @param {string} [options.sortBy='id'] - Sort field
   * @param {string} [options.sortOrder='ASC'] - Sort order
   * @returns {Promise<Object>} Paginated results with devil fruits
   */
  async getAllFruits(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      type_id,
      sortBy = 'id',
      sortOrder = 'ASC'
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (search) {
      where.name = {
        [Op.like]: `%${search}%`
      };
    }

    if (type_id) {
      where.type_id = type_id;
    }

    const { count, rows } = await DevilFruit.findAndCountAll({
      where,
      include: [
        {
          model: FruitType,
          as: 'type',
          attributes: ['id', 'name', 'description']
        }
      ],
      attributes: [
        'id', 'name', 'japanese_name', 'type_id', 'description', 'current_user_id',
        'created_at', 'updated_at'
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      success: true,
      fruits: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
        hasNext: parseInt(page) < Math.ceil(count / limit),
        hasPrev: parseInt(page) > 1
      }
    };
  }

  /**
   * Get a devil fruit by ID
   * @param {number} id - The devil fruit ID
   * @returns {Promise<Object|null>} Devil fruit or null if not found
   */
  async getFruitById(id) {
    return await DevilFruit.findOne({
      where: { id },
      include: [
        {
          model: FruitType,
          as: 'type',
          attributes: ['id', 'name', 'description']
        }
      ],
      attributes: [
        'id', 'name', 'japanese_name', 'type_id', 'description', 'current_user_id',
        'created_at', 'updated_at'
      ]
    });
  }

  /**
   * Check if a name already exists
   * @param {string} name - The name to check
   * @param {number} excludeId - ID to exclude from the check (for updates)
   * @returns {Promise<boolean>} True if name exists, false otherwise
   */
  async nameExists(name, excludeId = null) {
    const where = { name: name.trim() };
    
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    
    const existing = await DevilFruit.findOne({ where });
    return existing !== null;
  }

  /**
   * Validate type_id exists
   * @param {number} typeId - The type ID to validate
   * @returns {Promise<boolean>} True if type exists, false otherwise
   */
  async typeExists(typeId) {
    const type = await FruitType.findByPk(typeId);
    return type !== null;
  }

  /**
   * Create a new devil fruit
   * @param {Object} data - Devil fruit data
   * @param {string} data.name - Name of the devil fruit
   * @param {number} data.type_id - Type ID
   * @param {string} [data.japanese_name] - Japanese name
   * @param {string} [data.description] - Description
   * @param {number} [data.current_user_id] - Current user ID
   * @returns {Promise<Object>} Created devil fruit
   * @throws {Error} If validation fails or name already exists
   */
  async createFruit(data) {
    const {
      name,
      type_id,
      japanese_name,
      description,
      current_user_id
    } = data;

    // Check if name already exists
    const nameExists = await this.nameExists(name);
    if (nameExists) {
      const error = new Error('A devil fruit with this name already exists');
      error.code = 'DUPLICATE_NAME';
      throw error;
    }

    // Check if type exists
    const typeExists = await this.typeExists(type_id);
    if (!typeExists) {
      const error = new Error('Invalid type ID');
      error.code = 'INVALID_TYPE';
      throw error;
    }

    // Create the devil fruit
    const newFruit = await DevilFruit.create({
      name: name.trim(),
      type_id,
      japanese_name: japanese_name ? japanese_name.trim() : null,
      description: description ? description.trim() : null,
      current_user_id: current_user_id ? parseInt(current_user_id) : null
    });

    // Return with type information
    return await this.getFruitById(newFruit.id);
  }

  /**
   * Update an existing devil fruit
   * @param {number} id - Devil fruit ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated devil fruit
   * @throws {Error} If fruit not found or validation fails
   */
  async updateFruit(id, data) {
    const {
      name,
      type_id,
      japanese_name,
      description,
      current_user_id
    } = data;

    // Check if devil fruit exists
    const fruit = await this.getFruitById(id);
    if (!fruit) {
      const error = new Error(`Devil fruit with ID ${id} not found`);
      error.code = 'NOT_FOUND';
      throw error;
    }

    // If name is being updated, check for duplicates
    if (name !== undefined) {
      const nameExists = await this.nameExists(name, id);
      if (nameExists) {
        const error = new Error('Another devil fruit with this name already exists');
        error.code = 'DUPLICATE_NAME';
        throw error;
      }
    }

    // If type_id is being updated, check if type exists
    if (type_id !== undefined) {
      const typeExists = await this.typeExists(type_id);
      if (!typeExists) {
        const error = new Error('Invalid type ID');
        error.code = 'INVALID_TYPE';
        throw error;
      }
    }

    // Build update object
    const updates = {};
    if (name !== undefined) {
      updates.name = name.trim();
    }
    if (type_id !== undefined) {
      updates.type_id = type_id;
    }
    if (japanese_name !== undefined) {
      updates.japanese_name = japanese_name ? japanese_name.trim() : null;
    }
    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }
    if (current_user_id !== undefined) {
      updates.current_user_id = current_user_id ? parseInt(current_user_id) : null;
    }

    // Update the record
    await DevilFruit.update(updates, { where: { id } });

    // Return updated record
    return await this.getFruitById(id);
  }

  /**
   * Delete a devil fruit
   * @param {number} id - Devil fruit ID
   * @returns {Promise<Object>} Deleted devil fruit data
   * @throws {Error} If fruit not found
   */
  async deleteFruit(id) {
    // Check if devil fruit exists
    const fruit = await this.getFruitById(id);
    if (!fruit) {
      const error = new Error(`Devil fruit with ID ${id} not found`);
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Delete the devil fruit
    await DevilFruit.destroy({ where: { id } });

    return {
      id: fruit.id,
      name: fruit.name
    };
  }

  /**
   * Get devil fruits by type
   * @param {number} typeId - Type ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Devil fruits of the specified type
   */
  async getFruitsByType(typeId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC'
    } = options;

    const offset = (page - 1) * limit;

    const { count, rows } = await DevilFruit.findAndCountAll({
      where: { type_id: typeId },
      include: [
        {
          model: FruitType,
          as: 'type',
          attributes: ['id', 'name', 'description']
        }
      ],
      attributes: [
        'id', 'name', 'japanese_name', 'type_id', 'description', 'current_user_id',
        'created_at', 'updated_at'
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      success: true,
      fruits: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
        hasNext: parseInt(page) < Math.ceil(count / limit),
        hasPrev: parseInt(page) > 1
      }
    };
  }
}

module.exports = new DevilFruitService();
