const devilFruitService = require('../services/devil-fruit.service');
const { createPaginatedResponse, createItemResponse, createErrorResponse } = require('../utils/response.helper');

/**
 * Get all devil fruits with optional filtering and pagination
 * @route GET /api/devil-fruits
 */
const getAllDevilFruits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type_id,
      sortBy = 'id',
      sortOrder = 'ASC'
    } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1) {
      return res.status(400).json(createErrorResponse(
        'Page must be greater than 0',
        'INVALID_PAGE',
        400
      ));
    }

    if (limitNum < 1 || limitNum > 100) {
      return res.status(400).json(createErrorResponse(
        'Limit must be between 1 and 100',
        'INVALID_LIMIT',
        400
      ));
    }

    // Validate sort parameters
    const allowedSortFields = ['id', 'name', 'rarity', 'power_level', 'created_at'];
    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json(createErrorResponse(
        'Invalid sort field',
        'INVALID_SORT_FIELD',
        400
      ));
    }

    if (!['ASC', 'DESC'].includes(sortOrder.toUpperCase())) {
      return res.status(400).json(createErrorResponse(
        'Sort order must be ASC or DESC',
        'INVALID_SORT_ORDER',
        400
      ));
    }

    const result = await devilFruitService.getAllFruits({
      page: pageNum,
      limit: limitNum,
      search,
      type_id,
      sortBy,
      sortOrder: sortOrder.toUpperCase()
    });

    res.status(200).json(createPaginatedResponse(
      result.fruits,
      result.pagination,
      'Devil fruits retrieved successfully'
    ));
  } catch (error) {
    console.error('Error fetching devil fruits:', error);
    res.status(500).json(createErrorResponse(
      'Error fetching devil fruits',
      'INTERNAL_SERVER_ERROR',
      500
    ));
  }
};

/**
 * Get a devil fruit by ID
 * @route GET /api/devil-fruits/:id
 */
const getDevilFruitById = async (req, res) => {
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

    const fruit = await devilFruitService.getFruitById(id);

    if (!fruit) {
      return res.status(404).json(createErrorResponse(
        `Devil fruit with ID ${id} not found`,
        'NOT_FOUND',
        404
      ));
    }

    res.status(200).json(createItemResponse(
      fruit,
      'Devil fruit retrieved successfully'
    ));
  } catch (error) {
    console.error('Error fetching devil fruit:', error);
    res.status(500).json(createErrorResponse(
      'Error fetching devil fruit',
      'INTERNAL_SERVER_ERROR',
      500
    ));
  }
};

/**
 * Create a new devil fruit
 * @route POST /api/devil-fruits
 */
const createDevilFruit = async (req, res) => {
  try {
    const {
      name,
      type_id,
      japanese_name,
      description,
      abilities,
      weaknesses,
      awakening_description,
      current_user_id,
      previous_users,
      image_url
    } = req.body;

    // Validations
    if (!name || name.trim() === '') {
      return res.status(400).json(createErrorResponse(
        'Name is required',
        'MISSING_NAME',
        400
      ));
    }

    if (name.length > 100) {
      return res.status(400).json(createErrorResponse(
        'Name cannot exceed 100 characters',
        'NAME_TOO_LONG',
        400
      ));
    }

    if (!type_id || isNaN(type_id)) {
      return res.status(400).json(createErrorResponse(
        'Valid type_id is required',
        'INVALID_TYPE_ID',
        400
      ));
    }

    // Create via service
    const newFruit = await devilFruitService.createFruit({
      name,
      type_id: parseInt(type_id),
      japanese_name,
      description,
      abilities,
      weaknesses,
      awakening_description,
      current_user_id: current_user_id ? parseInt(current_user_id) : undefined,
      previous_users,
      image_url
    });

    res.status(201).json(createItemResponse(
      newFruit,
      'Devil fruit created successfully'
    ));
  } catch (error) {
    console.error('Error creating devil fruit:', error);

    // Handle known service errors
    if (error.code === 'DUPLICATE_NAME') {
      return res.status(409).json(createErrorResponse(
        error.message,
        'DUPLICATE_NAME',
        409
      ));
    }

    if (error.code === 'INVALID_TYPE') {
      return res.status(400).json(createErrorResponse(
        error.message,
        'INVALID_TYPE',
        400
      ));
    }

    if (error.code === 'INVALID_JSON') {
      return res.status(400).json(createErrorResponse(
        error.message,
        'INVALID_TYPE',
        400
      ));
    }

    res.status(500).json(createErrorResponse(
      'Error creating devil fruit',
      'INTERNAL_SERVER_ERROR',
      500
    ));
  }
};

/**
 * Update an existing devil fruit
 * @route PUT /api/devil-fruits/:id
 */
const updateDevilFruit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type_id,
      japanese_name,
      description,
      abilities,
      weaknesses,
      awakening_description,
      current_user_id,
      previous_users,
      image_url
    } = req.body;

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

      if (name.length > 100) {
      return res.status(400).json(createErrorResponse(
        'Name cannot exceed 100 characters',
        'NAME_TOO_LONG',
        400
      ));
      }
    }

    // Validate type_id if provided
    if (type_id !== undefined && (isNaN(type_id) || type_id < 1)) {
      return res.status(400).json(createErrorResponse(
        'Valid type_id is required',
        'INVALID_TYPE_ID',
        400
      ));
    }

    // Check if any fields are provided
    const hasFields = [
      name, type_id, japanese_name, description, abilities, weaknesses,
      awakening_description, current_user_id, previous_users, image_url
    ].some(field => field !== undefined);

    if (!hasFields) {
      return res.status(400).json(createErrorResponse(
        'No fields provided to update',
        'NO_FIELDS_PROVIDED',
        400
      ));
    }

    // Update via service
    const updatedFruit = await devilFruitService.updateFruit(id, {
      name,
      type_id: type_id ? parseInt(type_id) : undefined,
      japanese_name,
      description,
      abilities,
      weaknesses,
      awakening_description,
      current_user_id: current_user_id ? parseInt(current_user_id) : undefined,
      previous_users,
      image_url
    });

    res.status(200).json(createItemResponse(
      updatedFruit,
      'Devil fruit updated successfully'
    ));
  } catch (error) {
    console.error('Error updating devil fruit:', error);

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

    if (error.code === 'INVALID_TYPE') {
      return res.status(400).json(createErrorResponse(
        error.message,
        'INVALID_TYPE',
        400
      ));
    }

    if (error.code === 'INVALID_JSON') {
      return res.status(400).json(createErrorResponse(
        error.message,
        'INVALID_TYPE',
        400
      ));
    }

    res.status(500).json(createErrorResponse(
      'Error updating devil fruit',
      'INTERNAL_SERVER_ERROR',
      500
    ));
  }
};

/**
 * Delete a devil fruit
 * @route DELETE /api/devil-fruits/:id
 */
const deleteDevilFruit = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json(createErrorResponse(
        'Invalid ID',
        'INVALID_ID',
        400
      ));
    }

    // Delete via service
    const deleted = await devilFruitService.deleteFruit(id);

    res.status(200).json(createItemResponse(
      { deletedFruit: deleted.name },
      `Devil fruit "${deleted.name}" deleted successfully`
    ));
  } catch (error) {
    console.error('Error deleting devil fruit:', error);

    // Handle known service errors
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json(createErrorResponse(
        error.message,
        'NOT_FOUND',
        404
      ));
    }

    res.status(500).json(createErrorResponse(
      'Error deleting devil fruit',
      'INTERNAL_SERVER_ERROR',
      500
    ));
  }
};

/**
 * Get devil fruits by type
 * @route GET /api/devil-fruits/type/:typeId
 */
const getDevilFruitsByType = async (req, res) => {
  try {
    const { typeId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'ASC'
    } = req.query;

    // Validate typeId
    if (!typeId || isNaN(typeId)) {
      return res.status(400).json(createErrorResponse(
        'Invalid type ID',
        'INVALID_TYPE_ID',
        400
      ));
    }

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1) {
      return res.status(400).json(createErrorResponse(
        'Page must be greater than 0',
        'INVALID_PAGE',
        400
      ));
    }

    if (limitNum < 1 || limitNum > 100) {
      return res.status(400).json(createErrorResponse(
        'Limit must be between 1 and 100',
        'INVALID_LIMIT',
        400
      ));
    }

    // Validate sort parameters
    const allowedSortFields = ['id', 'name', 'rarity', 'power_level', 'created_at'];
    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json(createErrorResponse(
        'Invalid sort field',
        'INVALID_SORT_FIELD',
        400
      ));
    }

    if (!['ASC', 'DESC'].includes(sortOrder.toUpperCase())) {
      return res.status(400).json(createErrorResponse(
        'Sort order must be ASC or DESC',
        'INVALID_SORT_ORDER',
        400
      ));
    }

    const result = await devilFruitService.getFruitsByType(parseInt(typeId), {
      page: pageNum,
      limit: limitNum,
      sortBy,
      sortOrder: sortOrder.toUpperCase()
    });

    res.status(200).json(createPaginatedResponse(
      result.fruits,
      result.pagination,
      'Devil fruits by type retrieved successfully'
    ));
  } catch (error) {
    console.error('Error fetching devil fruits by type:', error);
    res.status(500).json(createErrorResponse(
      'Error fetching devil fruits by type',
      'INTERNAL_SERVER_ERROR',
      500
    ));
  }
};

module.exports = {
  getAllDevilFruits,
  getDevilFruitById,
  createDevilFruit,
  updateDevilFruit,
  deleteDevilFruit,
  getDevilFruitsByType
};
