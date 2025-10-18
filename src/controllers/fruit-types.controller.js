const fruitTypeService = require('../services/fruit-type.service');
const { createListResponse, createItemResponse, createErrorResponse } = require('../utils/response.helper');

/**
 * Get all fruit types
 * @route GET /api/fruit-types
 */
const getAllFruitTypes = async (req, res) => {
  try {
    const fruitTypes = await fruitTypeService.getAllTypes();

    res.status(200).json(createListResponse(
      fruitTypes,
      'Fruit types retrieved successfully'
    ));
  } catch (error) {
    console.error('Error fetching fruit types:', error);
    res.status(500).json(createErrorResponse(
      'Error fetching fruit types',
      'INTERNAL_SERVER_ERROR',
      500
    ));
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
      return res.status(400).json(createErrorResponse(
        'Invalid ID',
        'INVALID_ID',
        400
      ));
    }

    const fruitType = await fruitTypeService.getTypeById(id);

    if (!fruitType) {
      return res.status(404).json(createErrorResponse(
        `Fruit type with ID ${id} not found`,
        'NOT_FOUND',
        404
      ));
    }

    res.status(200).json(createItemResponse(
      fruitType,
      'Fruit type retrieved successfully'
    ));
  } catch (error) {
    console.error('Error fetching fruit type:', error);
    res.status(500).json(createErrorResponse(
      'Error fetching fruit type',
      'INTERNAL_SERVER_ERROR',
      500
    ));
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
      return res.status(400).json(createErrorResponse(
        'Invalid ID',
        'INVALID_ID',
        400
      ));
    }

    // Validate name if provided
    if (name !== undefined) {
      if (name.trim() === '') {
        return res.status(400).json(createErrorResponse(
          'Name cannot be empty',
          'EMPTY_NAME',
          400
        ));
      }

      if (name.length > 50) {
        return res.status(400).json(createErrorResponse(
          'Name cannot exceed 50 characters',
          'NAME_TOO_LONG',
          400
        ));
      }
    }

    // Check if any fields are provided
    if (name === undefined && description === undefined) {
      return res.status(400).json(createErrorResponse(
        'No fields provided to update',
        'NO_FIELDS_PROVIDED',
        400
      ));
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
      return res.status(404).json(createErrorResponse(
        error.message,
        'NOT_FOUND',
        404
      ));
    }

    if (error.code === 'DUPLICATE_NAME') {
      return res.status(409).json(createErrorResponse(
        error.message,
        'DUPLICATE_NAME',
        409
      ));
    }

    res.status(500).json(createErrorResponse(
      'Error updating fruit type',
      'INTERNAL_SERVER_ERROR',
      500
    ));
  }
};

module.exports = {
  getAllFruitTypes,
  getFruitTypeById,
  updateFruitType
};
