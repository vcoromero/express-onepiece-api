const raceService = require('../services/race.service');

/**
 * @class RaceController
 * @description Controller for Race HTTP requests
 */
class RaceController {
  /**
   * Get all races
   * @route GET /api/races
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async getAllRaces(req, res) {
    try {
      const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;
      
      const result = await raceService.getAllRaces({ search, sortBy, sortOrder });
      
      if (!result.success) {
        return res.status(500).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAllRaces controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get race by ID
   * @route GET /api/races/:id
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async getRaceById(req, res) {
    try {
      const { id } = req.params;

      // Validate ID is a valid number
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid race ID',
          error: 'INVALID_ID'
        });
      }

      const result = await raceService.getRaceById(parseInt(id));

      if (!result.success) {
        if (result.error === 'NOT_FOUND') {
          return res.status(404).json(result);
        }
        return res.status(500).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getRaceById controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update race
   * @route PUT /api/races/:id
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {Promise<void>}
   */
  async updateRace(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validate ID is a valid number
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid race ID',
          error: 'INVALID_ID'
        });
      }

      // Validate request body
      if (!updateData || typeof updateData !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Request body must be a valid JSON object',
          error: 'INVALID_BODY'
        });
      }

      const result = await raceService.updateRace(parseInt(id), updateData);

      if (!result.success) {
        switch (result.error) {
        case 'NOT_FOUND':
          return res.status(404).json(result);
        case 'INVALID_ID':
        case 'NO_FIELDS_PROVIDED':
        case 'INVALID_NAME':
          return res.status(400).json(result);
        case 'DUPLICATE_NAME':
          return res.status(409).json(result);
        default:
          return res.status(500).json(result);
        }
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in updateRace controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new RaceController();
