const devilFruitService = require('../services/devil-fruit.service');
const { createPaginatedResponse, createItemResponse } = require('../utils/response.helper');

const getKnownDevilFruitErrorStatus = (errorCode) => {
  const statusByCode = {
    NOT_FOUND: 404,
    DUPLICATE_NAME: 409,
    INVALID_TYPE: 400,
    INVALID_JSON: 400
  };

  return statusByCode[errorCode] || null;
};

const validateUpdateDevilFruitPayload = (payload) => {
  const { name, type_id } = payload;

  if (name !== undefined && name.trim() === '') {
    return 'Name cannot be empty';
  }

  if (name !== undefined && name.length > 100) {
    return 'Name cannot exceed 100 characters';
  }

  if (type_id !== undefined && (Number.isNaN(type_id) || type_id < 1)) {
    return 'Valid type_id is required';
  }

  const hasFields = Object.values(payload).some((field) => field !== undefined);
  if (!hasFields) {
    return 'No fields provided to update';
  }

  return null;
};

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
    const pageNum = Number.parseInt(page);
    const limitNum = Number.parseInt(limit);

    if (pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be greater than 0'
      });
    }

    if (limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }

    // Validate sort parameters
    const allowedSortFields = ['id', 'name', 'rarity', 'power_level', 'created_at'];
    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sort field'
      });
    }

    if (!['ASC', 'DESC'].includes(sortOrder.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Sort order must be ASC or DESC'
      });
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
    res.status(500).json({
      success: false,
      message: 'Error fetching devil fruits',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    const fruit = await devilFruitService.getFruitById(id);

    if (!fruit) {
      return res.status(404).json({
        success: false,
        message: `Devil fruit with ID ${id} not found`
      });
    }

    res.status(200).json(createItemResponse(
      fruit,
      'Devil fruit retrieved successfully'
    ));
  } catch (error) {
    console.error('Error fetching devil fruit:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching devil fruit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot exceed 100 characters'
      });
    }

    if (!type_id || Number.isNaN(type_id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid type_id is required'
      });
    }

    // Create via service
    const newFruit = await devilFruitService.createFruit({
      name,
      type_id: Number.parseInt(type_id),
      japanese_name,
      description,
      abilities,
      weaknesses,
      awakening_description,
      current_user_id: current_user_id ? Number.parseInt(current_user_id) : undefined,
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
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    if (error.code === 'INVALID_TYPE') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.code === 'INVALID_JSON') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating devil fruit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    const validationMessage = validateUpdateDevilFruitPayload({
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
    });
    if (validationMessage) {
      return res.status(400).json({
        success: false,
        message: validationMessage
      });
    }

    // Update via service
    const updatedFruit = await devilFruitService.updateFruit(id, {
      name,
      type_id: type_id ? Number.parseInt(type_id) : undefined,
      japanese_name,
      description,
      abilities,
      weaknesses,
      awakening_description,
      current_user_id: current_user_id ? Number.parseInt(current_user_id) : undefined,
      previous_users,
      image_url
    });

    res.status(200).json(createItemResponse(
      updatedFruit,
      'Devil fruit updated successfully'
    ));
  } catch (error) {
    console.error('Error updating devil fruit:', error);

    const knownStatus = getKnownDevilFruitErrorStatus(error.code);
    if (knownStatus) {
      return res.status(knownStatus).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating devil fruit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
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
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting devil fruit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    if (!typeId || Number.isNaN(typeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type ID'
      });
    }

    // Validate pagination parameters
    const pageNum = Number.parseInt(page);
    const limitNum = Number.parseInt(limit);

    if (pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be greater than 0'
      });
    }

    if (limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }

    // Validate sort parameters
    const allowedSortFields = ['id', 'name', 'rarity', 'power_level', 'created_at'];
    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sort field'
      });
    }

    if (!['ASC', 'DESC'].includes(sortOrder.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Sort order must be ASC or DESC'
      });
    }

    const result = await devilFruitService.getFruitsByType(Number.parseInt(typeId), {
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
    res.status(500).json({
      success: false,
      message: 'Error fetching devil fruits by type',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
