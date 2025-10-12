const { pool } = require('../config/db.config');

/**
 * Get all fruit types
 * @route GET /api/fruit-types
 */
const getAllFruitTypes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description, created_at, updated_at FROM devil_fruit_types ORDER BY id ASC'
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching fruit types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fruit types',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a fruit type by ID
 * @route GET /api/fruit-types/:id
 */
const getFruitTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a valid number
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    const [rows] = await pool.query(
      'SELECT id, name, description, created_at, updated_at FROM devil_fruit_types WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Fruit type with ID ${id} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching fruit type:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fruit type',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new fruit type
 * @route POST /api/fruit-types
 */
const createFruitType = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validations
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (name.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot exceed 50 characters'
      });
    }

    // Check if a type with this name already exists
    const [existing] = await pool.query(
      'SELECT id FROM devil_fruit_types WHERE name = ?',
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A fruit type with this name already exists'
      });
    }

    // Insert new fruit type
    const [result] = await pool.query(
      'INSERT INTO devil_fruit_types (name, description) VALUES (?, ?)',
      [name.trim(), description ? description.trim() : null]
    );

    // Get the created record
    const [newRecord] = await pool.query(
      'SELECT id, name, description, created_at, updated_at FROM devil_fruit_types WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Fruit type created successfully',
      data: newRecord[0]
    });
  } catch (error) {
    console.error('Error creating fruit type:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating fruit type',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update an existing fruit type
 * @route PUT /api/fruit-types/:id
 */
const updateFruitType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    // Check if fruit type exists
    const [existing] = await pool.query(
      'SELECT id FROM devil_fruit_types WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Fruit type with ID ${id} not found`
      });
    }

    // Validate name if provided
    if (name !== undefined) {
      if (name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty'
        });
      }

      if (name.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot exceed 50 characters'
        });
      }

      // Check if another type with this name exists
      const [duplicate] = await pool.query(
        'SELECT id FROM devil_fruit_types WHERE name = ? AND id != ?',
        [name.trim(), id]
      );

      if (duplicate.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another fruit type with this name already exists'
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name.trim());
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description ? description.trim() : null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update'
      });
    }

    values.push(id);

    await pool.query(
      `UPDATE devil_fruit_types SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get the updated record
    const [updated] = await pool.query(
      'SELECT id, name, description, created_at, updated_at FROM devil_fruit_types WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Fruit type updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating fruit type:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating fruit type',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a fruit type
 * @route DELETE /api/fruit-types/:id
 */
const deleteFruitType = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    // Check if fruit type exists
    const [existing] = await pool.query(
      'SELECT id, name FROM devil_fruit_types WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Fruit type with ID ${id} not found`
      });
    }

    // Check if there are devil fruits associated with this type
    const [associatedFruits] = await pool.query(
      'SELECT COUNT(*) as count FROM devil_fruits WHERE type_id = ?',
      [id]
    );

    if (associatedFruits[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete fruit type because it has associated devil fruits',
        associatedFruits: associatedFruits[0].count
      });
    }

    // Delete the fruit type
    await pool.query('DELETE FROM devil_fruit_types WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: `Fruit type "${existing[0].name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting fruit type:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting fruit type',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllFruitTypes,
  getFruitTypeById,
  createFruitType,
  updateFruitType,
  deleteFruitType
};
