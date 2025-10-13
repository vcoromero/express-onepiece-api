const fruitTypeService = require('../services/fruit-type.service');

/**
 * Get all fruit types
 * @route GET /api/fruit-types
 */
const getAllFruitTypes = async (req, res) => {
  try {
    const fruitTypes = await fruitTypeService.getAllTypes();

    res.status(200).json({
      success: true,
      count: fruitTypes.length,
      data: fruitTypes
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

    const fruitType = await fruitTypeService.getTypeById(id);

    if (!fruitType) {
      return res.status(404).json({
        success: false,
        message: `Fruit type with ID ${id} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: fruitType
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

    // Create via service
    const newFruitType = await fruitTypeService.createType({ name, description });

    res.status(201).json({
      success: true,
      message: 'Fruit type created successfully',
      data: newFruitType
    });
  } catch (error) {
    console.error('Error creating fruit type:', error);

    // Handle known service errors
    if (error.code === 'DUPLICATE_NAME') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

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
    }

    // Check if any fields are provided
    if (name === undefined && description === undefined) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update'
      });
    }

    // Update via service
    const updatedFruitType = await fruitTypeService.updateType(id, { name, description });

    res.status(200).json({
      success: true,
      message: 'Fruit type updated successfully',
      data: updatedFruitType
    });
  } catch (error) {
    console.error('Error updating fruit type:', error);

    // Handle known service errors
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.code === 'DUPLICATE_NAME') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

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

    // Delete via service
    const deleted = await fruitTypeService.deleteType(id);

    res.status(200).json({
      success: true,
      message: `Fruit type "${deleted.name}" deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting fruit type:', error);

    // Handle known service errors
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.code === 'HAS_ASSOCIATIONS') {
      return res.status(409).json({
        success: false,
        message: error.message,
        associatedFruits: error.associatedCount
      });
    }

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
