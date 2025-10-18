const fruitTypeService = require('../services/fruit-type.service');
const { createListResponse, createItemResponse } = require('../utils/response.helper');

/**
 * Get all fruit types
 * @route GET /api/fruit-types
 */
const getAllFruitTypes = async (req, res) => {
  try {
    const result = await fruitTypeService.getAllTypes();

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.status(200).json(createListResponse(
      result.data,
      'Fruit types retrieved successfully'
    ));
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

    const result = await fruitTypeService.getTypeById(id);

    if (!result.success) {
      if (result.error === 'NOT_FOUND') {
        return res.status(404).json(result);
      }
      return res.status(500).json(result);
    }

    res.status(200).json(createItemResponse(
      result.data,
      'Fruit type retrieved successfully'
    ));
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

    res.status(200).json(createItemResponse(
      updatedFruitType,
      'Fruit type updated successfully'
    ));
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

module.exports = {
  getAllFruitTypes,
  getFruitTypeById,
  updateFruitType
};
