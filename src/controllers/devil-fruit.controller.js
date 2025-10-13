const devilFruitService = require('../services/devil-fruit.service');

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

    res.status(200).json({
      success: true,
      count: result.pagination.totalItems,
      pagination: result.pagination,
      data: result.fruits
    });
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
    if (!id || isNaN(id)) {
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

    res.status(200).json({
      success: true,
      data: fruit
    });
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

    if (!type_id || isNaN(type_id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid type_id is required'
      });
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

    res.status(201).json({
      success: true,
      message: 'Devil fruit created successfully',
      data: newFruit
    });
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

      if (name.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot exceed 100 characters'
        });
      }
    }

    // Validate type_id if provided
    if (type_id !== undefined && (isNaN(type_id) || type_id < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Valid type_id is required'
      });
    }

    // Check if any fields are provided
    const hasFields = [
      name, type_id, japanese_name, description, abilities, weaknesses,
      awakening_description, current_user_id, previous_users, image_url
    ].some(field => field !== undefined);

    if (!hasFields) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided to update'
      });
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

    res.status(200).json({
      success: true,
      message: 'Devil fruit updated successfully',
      data: updatedFruit
    });
  } catch (error) {
    console.error('Error updating devil fruit:', error);

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
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    // Delete via service
    const deleted = await devilFruitService.deleteFruit(id);

    res.status(200).json({
      success: true,
      message: `Devil fruit "${deleted.name}" deleted successfully`
    });
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
    if (!typeId || isNaN(typeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type ID'
      });
    }

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

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

    const result = await devilFruitService.getFruitsByType(parseInt(typeId), {
      page: pageNum,
      limit: limitNum,
      sortBy,
      sortOrder: sortOrder.toUpperCase()
    });

    res.status(200).json({
      success: true,
      count: result.pagination.totalItems,
      pagination: result.pagination,
      data: result.fruits
    });
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
