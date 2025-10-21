const { Character, Race, HakiType, CharacterHaki, DevilFruit, CharacterDevilFruit, CharacterType, CharacterCharacterType, Organization, CharacterOrganization } = require('../models');
const { Op } = require('sequelize');

/**
 * @class CharacterService
 * @description Service layer for Character business logic
 */
class CharacterService {
  /**
   * Get all characters with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Service response
   */
  async getAllCharacters(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        race_id,
        min_bounty,
        max_bounty,
        status,
        devil_fruit_id,
        character_type_id,
        organization_id,
        haki_type_id,
        sortBy = 'name',
        sortOrder = 'asc'
      } = options;

      // Validate pagination parameters
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      // Build where clause
      const whereClause = {};
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { alias: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      if (race_id) {
        whereClause.race_id = race_id;
      }

      if (status) {
        whereClause.status = status;
      }

      if (min_bounty !== undefined || max_bounty !== undefined) {
        whereClause.bounty = {};
        if (min_bounty !== undefined) {
          whereClause.bounty[Op.gte] = min_bounty;
        }
        if (max_bounty !== undefined) {
          whereClause.bounty[Op.lte] = max_bounty;
        }
      }

      // Build include conditions for filtering
      const includeConditions = [];
      
      if (devil_fruit_id) {
        includeConditions.push({
          model: DevilFruit,
          as: 'devil_fruits',
          where: { id: devil_fruit_id },
          through: { where: { is_current: true } },
          required: true
        });
      }

      if (character_type_id) {
        includeConditions.push({
          model: CharacterType,
          as: 'character_types',
          where: { id: character_type_id },
          through: { where: { is_current: true } },
          required: true
        });
      }

      if (organization_id) {
        includeConditions.push({
          model: Organization,
          as: 'organizations',
          where: { id: organization_id },
          through: { where: { is_current: true } },
          required: true
        });
      }

      if (haki_type_id) {
        includeConditions.push({
          model: HakiType,
          as: 'haki_types',
          where: { id: haki_type_id },
          required: true
        });
      }

      // Validate sort parameters
      const validSortFields = ['name', 'alias', 'bounty', 'age', 'status', 'created_at', 'updated_at'];
      const validSortBy = validSortFields.includes(sortBy) ? sortBy : 'name';
      const validSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'asc';

      // Get total count (without includes for better performance)
      const total = await Character.count({ 
        where: whereClause,
        distinct: true,
        col: 'id'
      });

      // Build base includes
      const baseIncludes = [
        {
          model: Race,
          as: 'race',
          attributes: ['id', 'name']
        },
        {
          model: DevilFruit,
          as: 'devil_fruits',
          through: {
            model: CharacterDevilFruit,
            attributes: ['acquired_date', 'is_current'],
            where: { is_current: true }
          },
          attributes: ['id', 'name', 'japanese_name'],
          required: false
        },
        {
          model: CharacterType,
          as: 'character_types',
          through: {
            model: CharacterCharacterType,
            attributes: ['acquired_date', 'is_current'],
            where: { is_current: true }
          },
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Organization,
          as: 'organizations',
          through: {
            model: CharacterOrganization,
            attributes: ['role', 'is_current'],
            where: { is_current: true }
          },
          attributes: ['id', 'name', 'status'],
          required: false
        }
      ];

      // Add HakiType include if filtering by haki
      if (haki_type_id) {
        baseIncludes.push({
          model: HakiType,
          as: 'haki_types',
          where: { id: haki_type_id },
          required: true
        });
      }

      // Merge include conditions
      const allIncludes = [...baseIncludes, ...includeConditions];

      // Get characters with pagination
      const characters = await Character.findAll({
        where: whereClause,
        include: allIncludes,
        order: [[validSortBy, validSortOrder]],
        limit: limitNum,
        offset: offset,
        distinct: true
      });

      const totalPages = Math.ceil(total / limitNum);

      return {
        success: true,
        characters,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      };
    } catch (error) {
      console.error('Error in getAllCharacters:', error);
      return {
        success: false,
        message: 'Failed to fetch characters',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Get character by ID
   * @param {number} id - Character ID
   * @returns {Promise<Object>} Service response
   */
  async getCharacterById(id) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid character ID',
          error: 'INVALID_ID'
        };
      }

      const character = await Character.findByPk(id, {
        include: [
          {
            model: Race,
            as: 'race',
            attributes: ['id', 'name', 'description']
          },
          {
            model: HakiType,
            as: 'haki_types',
            through: {
              model: CharacterHaki,
              attributes: ['mastery_level', 'awakened', 'notes']
            },
            attributes: ['id', 'name', 'description', 'color']
          },
          {
            model: DevilFruit,
            as: 'devil_fruits',
            through: {
              model: CharacterDevilFruit,
              attributes: ['acquired_date', 'is_current', 'notes']
            },
            attributes: ['id', 'name', 'japanese_name', 'description', 'abilities', 'weaknesses', 'awakening_description', 'image_url']
          },
          {
            model: CharacterType,
            as: 'character_types',
            through: {
              model: CharacterCharacterType,
              attributes: ['acquired_date', 'is_current']
            },
            attributes: ['id', 'name', 'description']
          },
          {
            model: Organization,
            as: 'organizations',
            through: {
              model: CharacterOrganization,
              attributes: ['role', 'joined_date', 'left_date', 'is_current']
            },
            attributes: ['id', 'name', 'status', 'description']
          }
        ]
      });
      
      if (!character) {
        return {
          success: false,
          message: `Character with ID ${id} not found`,
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data: character
      };
    } catch (error) {
      console.error('Error in getCharacterById:', error);
      return {
        success: false,
        message: 'Failed to fetch character',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Create new character
   * @param {Object} characterData - Character data
   * @returns {Promise<Object>} Service response
   */
  async createCharacter(characterData) {
    try {
      const {
        name,
        alias,
        race_id,
        bounty,
        age,
        birthday,
        height,
        origin,
        status = 'alive',
        description,
        debut
      } = characterData;

      // Validate required fields
      if (!name || name.trim() === '') {
        return {
          success: false,
          message: 'Name is required',
          error: 'MISSING_NAME'
        };
      }

      // Check if name already exists
      const existingCharacter = await Character.findOne({
        where: { name: name.trim() }
      });
      if (existingCharacter) {
        return {
          success: false,
          message: 'A character with this name already exists',
          error: 'DUPLICATE_NAME'
        };
      }

      // Validate race_id if provided
      if (race_id && !(await this.raceExists(race_id))) {
        return {
          success: false,
          message: 'Invalid race ID',
          error: 'INVALID_RACE'
        };
      }

      // Create character
      const newCharacter = await Character.create({
        name: name.trim(),
        alias: alias ? alias.trim() : null,
        race_id: race_id || null,
        bounty: bounty || null,
        age: age || null,
        birthday: birthday ? birthday.trim() : null,
        height: height ? height.trim() : null,
        origin: origin ? origin.trim() : null,
        status: status,
        description: description ? description.trim() : null,
        debut: debut ? debut.trim() : null
      });

      // Reload with associations
      await newCharacter.reload({
        include: [
          {
            model: Race,
            as: 'race',
            attributes: ['id', 'name']
          }
        ]
      });

      return {
        success: true,
        data: newCharacter,
        message: 'Character created successfully'
      };
    } catch (error) {
      console.error('Error in createCharacter:', error);
      return {
        success: false,
        message: 'Failed to create character',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Update character
   * @param {number} id - Character ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Service response
   */
  async updateCharacter(id, updateData) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid character ID',
          error: 'INVALID_ID'
        };
      }

      const character = await Character.findByPk(id);
      if (!character) {
        return {
          success: false,
          message: `Character with ID ${id} not found`,
          error: 'NOT_FOUND'
        };
      }

      // Validate at least one field is provided
      if (!updateData || Object.keys(updateData).length === 0) {
        return {
          success: false,
          message: 'At least one field must be provided for update',
          error: 'NO_FIELDS_PROVIDED'
        };
      }

      // Validate name if provided
      if (updateData.name !== undefined) {
        if (!updateData.name || updateData.name.trim() === '') {
          return {
            success: false,
            message: 'Name cannot be empty',
            error: 'INVALID_NAME'
          };
        }
        if (updateData.name !== character.name) {
          const existingCharacter = await Character.findOne({
            where: { name: updateData.name.trim() }
          });
          if (existingCharacter) {
            return {
              success: false,
              message: 'A character with this name already exists',
              error: 'DUPLICATE_NAME'
            };
          }
        }
      }

      // Validate race_id if provided
      if (updateData.race_id !== undefined && updateData.race_id !== null && !(await this.raceExists(updateData.race_id))) {
        return {
          success: false,
          message: 'Invalid race ID',
          error: 'INVALID_RACE'
        };
      }

      // Update character
      await character.update(updateData);
      await character.reload({
        include: [
          {
            model: Race,
            as: 'race',
            attributes: ['id', 'name']
          }
        ]
      });

      return {
        success: true,
        data: character,
        message: 'Character updated successfully'
      };
    } catch (error) {
      console.error('Error in updateCharacter:', error);
      return {
        success: false,
        message: 'Failed to update character',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Delete character
   * @param {number} id - Character ID
   * @returns {Promise<Object>} Service response
   */
  async deleteCharacter(id) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid character ID',
          error: 'INVALID_ID'
        };
      }

      const character = await Character.findByPk(id);
      if (!character) {
        return {
          success: false,
          message: `Character with ID ${id} not found`,
          error: 'NOT_FOUND'
        };
      }

      // Check if character has associated devil fruits
      const hasDevilFruits = await this.characterHasDevilFruits(id);
      if (hasDevilFruits) {
        return {
          success: false,
          message: 'Cannot delete character with associated devil fruits',
          error: 'HAS_ASSOCIATIONS'
        };
      }

      await character.destroy();

      return {
        success: true,
        message: 'Character deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteCharacter:', error);
      return {
        success: false,
        message: 'Failed to delete character',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Check if race exists
   * @param {number} raceId - Race ID
   * @returns {Promise<boolean>} True if race exists
   */
  async raceExists(raceId) {
    try {
      const race = await Race.findByPk(raceId);
      return !!race;
    } catch (error) {
      console.error('Error in raceExists:', error);
      return false;
    }
  }

  /**
   * Check if character has associated devil fruits
   * @param {number} characterId - Character ID
   * @returns {Promise<boolean>} True if character has devil fruits
   */
  async characterHasDevilFruits(characterId) {
    try {
      const { sequelize } = require('../config/sequelize.config');
      const [results] = await sequelize.query(
        'SELECT COUNT(*) as count FROM devil_fruits WHERE current_user_id = ?',
        {
          replacements: [characterId],
          type: require('sequelize').QueryTypes.SELECT
        }
      );
      return results.count > 0;
    } catch (error) {
      console.error('Error in characterHasDevilFruits:', error);
      return false;
    }
  }

  /**
   * Search characters by name
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Service response
   */
  async searchCharacters(searchTerm, options = {}) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return {
          success: false,
          message: 'Search term is required',
          error: 'MISSING_SEARCH_TERM'
        };
      }

      const searchOptions = {
        ...options,
        search: searchTerm.trim()
      };

      return await this.getAllCharacters(searchOptions);
    } catch (error) {
      console.error('Error in searchCharacters:', error);
      return {
        success: false,
        message: 'Failed to search characters',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }
}

module.exports = new CharacterService();
