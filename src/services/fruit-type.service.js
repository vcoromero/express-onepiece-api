const FruitType = require('../models/fruit-type.model');
const { Op } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * FruitTypeService
 * 
 * Business logic layer for Devil Fruit Types
 * Handles all operations related to fruit types
 */
class FruitTypeService {
  /**
   * Get all fruit types
   * @returns {Promise<Array>} Array of fruit types
   */
  async getAllTypes() {
    return await FruitType.findAll({
      order: [['id', 'ASC']],
      attributes: ['id', 'name', 'description', 'created_at', 'updated_at']
    });
  }

  /**
   * Get a fruit type by ID
   * @param {number} id - The fruit type ID
   * @returns {Promise<Object|null>} Fruit type or null if not found
   */
  async getTypeById(id) {
    return await FruitType.findOne({
      where: { id },
      attributes: ['id', 'name', 'description', 'created_at', 'updated_at']
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
    
    const existing = await FruitType.findOne({ where });
    return existing !== null;
  }

  /**
   * Check if a fruit type has associated devil fruits
   * @param {number} id - The fruit type ID
   * @returns {Promise<boolean>} True if has associated fruits, false otherwise
   */
  async hasAssociatedFruits(id) {
    // Using raw query until we have the DevilFruit model
    const [results] = await sequelize.query(
      'SELECT COUNT(*) as count FROM devil_fruits WHERE type_id = ?',
      {
        replacements: [id],
        type: require('sequelize').QueryTypes.SELECT
      }
    );
    return results.count > 0;
  }

  /**
   * Get count of associated devil fruits for a type
   * @param {number} id - The fruit type ID
   * @returns {Promise<number>} Count of associated fruits
   */
  async getAssociatedFruitsCount(id) {
    const [results] = await sequelize.query(
      'SELECT COUNT(*) as count FROM devil_fruits WHERE type_id = ?',
      {
        replacements: [id],
        type: require('sequelize').QueryTypes.SELECT
      }
    );
    return results.count;
  }

  /**
   * Create a new fruit type
   * @param {Object} data - Fruit type data
   * @param {string} data.name - Name of the fruit type
   * @param {string} [data.description] - Description of the fruit type
   * @returns {Promise<Object>} Created fruit type
   * @throws {Error} If validation fails or name already exists
   */
  async createType(data) {
    const { name, description } = data;

    // Check if name already exists
    const exists = await this.nameExists(name);
    if (exists) {
      const error = new Error('A fruit type with this name already exists');
      error.code = 'DUPLICATE_NAME';
      throw error;
    }

    // Prepare description: convert empty/whitespace strings to null
    const trimmedDescription = description ? description.trim() : null;
    const finalDescription = trimmedDescription === '' ? null : trimmedDescription;

    // Create the fruit type
    const newFruitType = await FruitType.create({
      name: name.trim(),
      description: finalDescription
    });

    return {
      id: newFruitType.id,
      name: newFruitType.name,
      description: newFruitType.description,
      created_at: newFruitType.created_at,
      updated_at: newFruitType.updated_at
    };
  }

  /**
   * Update an existing fruit type
   * @param {number} id - Fruit type ID
   * @param {Object} data - Update data
   * @param {string} [data.name] - New name
   * @param {string} [data.description] - New description
   * @returns {Promise<Object>} Updated fruit type
   * @throws {Error} If type not found or validation fails
   */
  async updateType(id, data) {
    const { name, description } = data;

    // Check if fruit type exists
    const fruitType = await this.getTypeById(id);
    if (!fruitType) {
      const error = new Error(`Fruit type with ID ${id} not found`);
      error.code = 'NOT_FOUND';
      throw error;
    }

    // If name is being updated, check for duplicates
    if (name !== undefined) {
      const exists = await this.nameExists(name, id);
      if (exists) {
        const error = new Error('Another fruit type with this name already exists');
        error.code = 'DUPLICATE_NAME';
        throw error;
      }
    }

    // Build update object
    const updates = {};
    if (name !== undefined) {
      updates.name = name.trim();
    }
    if (description !== undefined) {
      // Convert empty/whitespace strings to null
      const trimmedDescription = description ? description.trim() : null;
      updates.description = trimmedDescription === '' ? null : trimmedDescription;
    }

    // Update the record
    await FruitType.update(updates, { where: { id } });

    // Return updated record
    return await this.getTypeById(id);
  }

  /**
   * Delete a fruit type
   * @param {number} id - Fruit type ID
   * @returns {Promise<Object>} Deleted fruit type data
   * @throws {Error} If type not found or has associated fruits
   */
  async deleteType(id) {
    // Check if fruit type exists
    const fruitType = await this.getTypeById(id);
    if (!fruitType) {
      const error = new Error(`Fruit type with ID ${id} not found`);
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Check if there are associated fruits
    const hasAssociated = await this.hasAssociatedFruits(id);
    if (hasAssociated) {
      const count = await this.getAssociatedFruitsCount(id);
      const error = new Error('Cannot delete fruit type because it has associated devil fruits');
      error.code = 'HAS_ASSOCIATIONS';
      error.associatedCount = count;
      throw error;
    }

    // Delete the fruit type
    await FruitType.destroy({ where: { id } });

    return {
      id: fruitType.id,
      name: fruitType.name
    };
  }
}

module.exports = new FruitTypeService();

