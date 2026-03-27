const prisma = require('../config/prisma.config');
const { serviceFailure, serviceSuccess } = require('../utils/service-result.helper');

const serializeBigInt = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));
};

class CharacterService {
  validateCharacterUpdateInput(id, updateData) {
    const parsedId = Number.parseInt(id);
    if (!id || Number.isNaN(parsedId) || parsedId <= 0) {
      return {
        success: false,
        message: 'Invalid character ID',
        error: 'INVALID_ID'
      };
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return {
        success: false,
        message: 'At least one field must be provided for update',
        error: 'NO_FIELDS_PROVIDED'
      };
    }

    return null;
  }

  async validateCharacterNameUpdate(updateData, currentName) {
    if (updateData.name !== undefined && (!updateData.name || updateData.name.trim() === '')) {
      return {
        success: false,
        message: 'Name cannot be empty',
        error: 'INVALID_NAME'
      };
    }

    if (updateData.name !== undefined && updateData.name !== currentName) {
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

    return null;
  }

  async validateCharacterRaceUpdate(updateData) {
    if (
      updateData.raceId !== undefined
      && updateData.raceId !== null
      && !(await this.raceExists(updateData.raceId))
    ) {
      return {
        success: false,
        message: 'Invalid race ID',
        error: 'INVALID_RACE'
      };
    }

    return null;
  }

  buildCharacterUpdatePayload(updateData) {
    const dataToUpdate = { ...updateData };
    if (dataToUpdate.bounty !== undefined) {
      dataToUpdate.bounty = Number.BigInt(dataToUpdate.bounty);
    }

    return dataToUpdate;
  }

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

      const pageNum = Math.max(1, Number.parseInt(page));
      const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit)));
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
        where.raceId = Number.parseInt(race_id);
      }

      if (status) {
        where.status = status;
      }

      if (min_bounty !== undefined || max_bounty !== undefined) {
        where.bounty = {};
        if (min_bounty !== undefined) {
          where.bounty.gte = Number.BigInt(min_bounty);
        }
        if (max_bounty !== undefined) {
          where.bounty.lte = Number.BigInt(max_bounty);
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

      return serviceSuccess({
        characters: serializeBigInt(characters),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      });
    } catch (error) {
      return serviceFailure('Failed to fetch characters', 'INTERNAL_ERROR', error, 'character.getAll');
    }
  }

  async getCharacterById(id) {
    try {
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return serviceFailure('Invalid character ID', 'INVALID_ID');
      }

      const character = await prisma.character.findUnique({
        where: { id: Number.parseInt(id) },
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
        return serviceFailure(`Character with ID ${id} not found`, 'NOT_FOUND');
      }

      return serviceSuccess({ data: serializeBigInt(character) });
    } catch (error) {
      return serviceFailure('Failed to fetch character', 'INTERNAL_ERROR', error, 'character.getById');
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
        return serviceFailure('Name is required', 'MISSING_NAME');
      }

      const existingCharacter = await prisma.character.findUnique({
        where: { name: name.trim() }
      });

      if (existingCharacter) {
        return serviceFailure('A character with this name already exists', 'DUPLICATE_NAME');
      }

      if (raceId && !(await this.raceExists(raceId))) {
        return serviceFailure('Invalid race ID', 'INVALID_RACE');
      }

      const newCharacter = await prisma.character.create({
        data: {
          name: name.trim(),
          alias: alias ? alias.trim() : null,
          raceId: raceId || null,
          bounty: bounty ? Number.BigInt(bounty) : null,
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

      return serviceSuccess({
        data: serializeBigInt(newCharacter),
        message: 'Character created successfully'
      });
    } catch (error) {
      return serviceFailure('Failed to create character', 'INTERNAL_ERROR', error, 'character.create');
    }
  }

  async updateCharacter(id, updateData) {
    try {
      const validationError = this.validateCharacterUpdateInput(id, updateData);
      if (validationError) return validationError;

      const parsedId = Number.parseInt(id);

      const character = await prisma.character.findUnique({
        where: { id: parsedId }
      });

      if (!character) {
        return serviceFailure(`Character with ID ${id} not found`, 'NOT_FOUND');
      }

      const nameValidationError = await this.validateCharacterNameUpdate(updateData, character.name);
      if (nameValidationError) return nameValidationError;

      const raceValidationError = await this.validateCharacterRaceUpdate(updateData);
      if (raceValidationError) return raceValidationError;

      const dataToUpdate = this.buildCharacterUpdatePayload(updateData);

      const updatedCharacter = await prisma.character.update({
        where: { id: parsedId },
        data: dataToUpdate,
        include: {
          race: { select: { id: true, name: true } }
        }
      });

      return serviceSuccess({
        data: serializeBigInt(updatedCharacter),
        message: 'Character updated successfully'
      });
    } catch (error) {
      return serviceFailure('Failed to update character', 'INTERNAL_ERROR', error, 'character.update');
    }
  }

  async deleteCharacter(id) {
    try {
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return serviceFailure('Invalid character ID', 'INVALID_ID');
      }

      const character = await prisma.character.findUnique({
        where: { id: Number.parseInt(id) }
      });

      if (!character) {
        return serviceFailure(`Character with ID ${id} not found`, 'NOT_FOUND');
      }

      const hasDevilFruits = await prisma.characterDevilFruit.count({
        where: { characterId: Number.parseInt(id), isCurrent: true }
      });

      if (hasDevilFruits > 0) {
        return serviceFailure('Cannot delete character with associated devil fruits', 'HAS_ASSOCIATIONS');
      }

      await prisma.character.delete({
        where: { id: Number.parseInt(id) }
      });

      return serviceSuccess({ message: 'Character deleted successfully' });
    } catch (error) {
      return serviceFailure('Failed to delete character', 'INTERNAL_ERROR', error, 'character.delete');
    }
  }

  async raceExists(raceId) {
    try {
      const race = await prisma.race.findUnique({
        where: { id: Number.parseInt(raceId) }
      });
      return !!race;
    } catch (error) {
      serviceFailure('Failed to validate race relation', 'INTERNAL_ERROR', error, 'character.raceExists');
      return false;
    }
  }

  async searchCharacters(searchTerm, options = {}) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return serviceFailure('Search term is required', 'MISSING_SEARCH_TERM');
      }

      const searchOptions = {
        ...options,
        search: searchTerm.trim()
      };

      return await this.getAllCharacters(searchOptions);
    } catch (error) {
      return serviceFailure('Failed to search characters', 'INTERNAL_ERROR', error, 'character.search');
    }
  }
}

module.exports = new CharacterService();
