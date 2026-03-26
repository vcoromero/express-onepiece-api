const prisma = require('../config/prisma.config');

const serializeBigInt = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));
};

class CharacterService {
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
        sortBy = 'name',
        sortOrder = 'asc'
      } = options;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      const where = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { alias: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (race_id) {
        where.raceId = parseInt(race_id);
      }

      if (status) {
        where.status = status;
      }

      if (min_bounty !== undefined || max_bounty !== undefined) {
        where.bounty = {};
        if (min_bounty !== undefined) {
          where.bounty.gte = BigInt(min_bounty);
        }
        if (max_bounty !== undefined) {
          where.bounty.lte = BigInt(max_bounty);
        }
      }

      const validSortFields = ['name', 'alias', 'bounty', 'age', 'status', 'createdAt'];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
      const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

      const [characters, total] = await Promise.all([
        prisma.character.findMany({
          where,
          include: {
            race: { select: { id: true, name: true } },
            devilFruits: {
              where: { isCurrent: true },
              include: {
                devilFruit: { select: { id: true, name: true, japaneseName: true } }
              }
            },
            characterTypes: {
              where: { isCurrent: true },
              include: {
                characterType: { select: { id: true, name: true } }
              }
            },
            organizations: {
              where: { isCurrent: true },
              include: {
                organization: { select: { id: true, name: true, status: true } }
              }
            }
          },
          orderBy: { [sortField]: orderDirection },
          skip: offset,
          take: limitNum
        }),
        prisma.character.count({ where })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        success: true,
        characters: serializeBigInt(characters),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
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

  async getCharacterById(id) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid character ID',
          error: 'INVALID_ID'
        };
      }

      const character = await prisma.character.findUnique({
        where: { id: parseInt(id) },
        include: {
          race: { select: { id: true, name: true, description: true } },
          hakiTypes: {
            include: {
              hakiType: { select: { id: true, name: true, description: true, color: true } }
            }
          },
          devilFruits: {
            include: {
              devilFruit: { select: { id: true, name: true, japaneseName: true, description: true, abilities: true } }
            }
          },
          characterTypes: {
            include: {
              characterType: { select: { id: true, name: true, description: true } }
            }
          },
          organizations: {
            include: {
              organization: { select: { id: true, name: true, status: true, description: true } }
            }
          }
        }
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
        data: serializeBigInt(character)
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

  async createCharacter(characterData) {
    try {
      const {
        name,
        alias,
        raceId,
        bounty,
        age,
        birthday,
        height,
        origin,
        status = 'alive',
        description,
        debut
      } = characterData;

      if (!name || name.trim() === '') {
        return {
          success: false,
          message: 'Name is required',
          error: 'MISSING_NAME'
        };
      }

      const existingCharacter = await prisma.character.findUnique({
        where: { name: name.trim() }
      });

      if (existingCharacter) {
        return {
          success: false,
          message: 'A character with this name already exists',
          error: 'DUPLICATE_NAME'
        };
      }

      if (raceId && !(await this.raceExists(raceId))) {
        return {
          success: false,
          message: 'Invalid race ID',
          error: 'INVALID_RACE'
        };
      }

      const newCharacter = await prisma.character.create({
        data: {
          name: name.trim(),
          alias: alias ? alias.trim() : null,
          raceId: raceId || null,
          bounty: bounty ? BigInt(bounty) : null,
          age: age || null,
          birthday: birthday ? birthday.trim() : null,
          height: height ? height.trim() : null,
          origin: origin ? origin.trim() : null,
          status,
          description: description ? description.trim() : null,
          debut: debut ? debut.trim() : null
        },
        include: {
          race: { select: { id: true, name: true } }
        }
      });

      return {
        success: true,
        data: serializeBigInt(newCharacter),
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

  async updateCharacter(id, updateData) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid character ID',
          error: 'INVALID_ID'
        };
      }

      const character = await prisma.character.findUnique({
        where: { id: parseInt(id) }
      });

      if (!character) {
        return {
          success: false,
          message: `Character with ID ${id} not found`,
          error: 'NOT_FOUND'
        };
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        return {
          success: false,
          message: 'At least one field must be provided for update',
          error: 'NO_FIELDS_PROVIDED'
        };
      }

      if (updateData.name !== undefined) {
        if (!updateData.name || updateData.name.trim() === '') {
          return {
            success: false,
            message: 'Name cannot be empty',
            error: 'INVALID_NAME'
          };
        }

        if (updateData.name !== character.name) {
          const existingCharacter = await prisma.character.findUnique({
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

      if (updateData.raceId !== undefined && updateData.raceId !== null) {
        if (!(await this.raceExists(updateData.raceId))) {
          return {
            success: false,
            message: 'Invalid race ID',
            error: 'INVALID_RACE'
          };
        }
      }

      const dataToUpdate = { ...updateData };
      if (dataToUpdate.bounty !== undefined) {
        dataToUpdate.bounty = BigInt(dataToUpdate.bounty);
      }

      const updatedCharacter = await prisma.character.update({
        where: { id: parseInt(id) },
        data: dataToUpdate,
        include: {
          race: { select: { id: true, name: true } }
        }
      });

      return {
        success: true,
        data: serializeBigInt(updatedCharacter),
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

  async deleteCharacter(id) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid character ID',
          error: 'INVALID_ID'
        };
      }

      const character = await prisma.character.findUnique({
        where: { id: parseInt(id) }
      });

      if (!character) {
        return {
          success: false,
          message: `Character with ID ${id} not found`,
          error: 'NOT_FOUND'
        };
      }

      const hasDevilFruits = await prisma.characterDevilFruit.count({
        where: { characterId: parseInt(id), isCurrent: true }
      });

      if (hasDevilFruits > 0) {
        return {
          success: false,
          message: 'Cannot delete character with associated devil fruits',
          error: 'HAS_ASSOCIATIONS'
        };
      }

      await prisma.character.delete({
        where: { id: parseInt(id) }
      });

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

  async raceExists(raceId) {
    try {
      const race = await prisma.race.findUnique({
        where: { id: parseInt(raceId) }
      });
      return !!race;
    } catch (error) {
      console.error('Error in raceExists:', error);
      return false;
    }
  }

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