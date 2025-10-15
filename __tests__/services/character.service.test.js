const CharacterService = require('../../src/services/character.service');

// Mock all dependencies
jest.mock('../../src/models', () => ({
  Character: {
    count: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
  },
  Race: {
    findByPk: jest.fn()
  },
  HakiType: {},
  CharacterHaki: {},
  DevilFruit: {},
  CharacterDevilFruit: {
    findOne: jest.fn()
  },
  CharacterType: {},
  CharacterCharacterType: {},
  Organization: {},
  CharacterOrganization: {}
}));

jest.mock('sequelize', () => ({
  Op: {
    or: Symbol('or'),
    like: Symbol('like'),
    gte: Symbol('gte'),
    lte: Symbol('lte')
  }
}));

jest.mock('../../src/config/sequelize.config', () => ({
  sequelize: {
    query: jest.fn()
  }
}));

// Mock console to avoid noise in tests
jest.spyOn(console, 'error').mockImplementation(() => {});

const { Character, Race, CharacterDevilFruit } = require('../../src/models');
const { sequelize } = require('../../src/config/sequelize.config');

describe('CharacterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCharacters', () => {
    it('should return all characters with default parameters', async () => {
      const mockCharacters = [
        { id: 1, name: 'Luffy', race_id: 1 },
        { id: 2, name: 'Zoro', race_id: 1 }
      ];

      Character.count.mockResolvedValue(2);
      Character.findAll.mockResolvedValue(mockCharacters);

      const result = await CharacterService.getAllCharacters();

      expect(result.success).toBe(true);
      expect(result.data.characters).toEqual(mockCharacters);
      expect(result.data.pagination.totalItems).toBe(2);
      expect(Character.count).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      Character.count.mockRejectedValue(error);

      const result = await CharacterService.getAllCharacters();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch characters');
      expect(result.error).toBeUndefined(); // In test environment
    });
  });

  describe('getCharacterById', () => {
    it('should return character when found', async () => {
      const mockCharacter = {
        id: 1,
        name: 'Luffy',
        race: { id: 1, name: 'Human' }
      };

      Character.findByPk.mockResolvedValue(mockCharacter);

      const result = await CharacterService.getCharacterById(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCharacter);
      expect(Character.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should return error for invalid ID (string)', async () => {
      const result = await CharacterService.getCharacterById('invalid');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid character ID');
      expect(result.error).toBe('INVALID_ID');
      expect(Character.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for invalid ID (negative)', async () => {
      const result = await CharacterService.getCharacterById(-1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid character ID');
      expect(result.error).toBe('INVALID_ID');
      expect(Character.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for invalid ID (zero)', async () => {
      const result = await CharacterService.getCharacterById(0);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid character ID');
      expect(result.error).toBe('INVALID_ID');
      expect(Character.findByPk).not.toHaveBeenCalled();
    });

    it('should return error when character not found', async () => {
      Character.findByPk.mockResolvedValue(null);

      const result = await CharacterService.getCharacterById(999);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Character with ID 999 not found');
      expect(result.error).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      Character.findByPk.mockRejectedValue(error);

      const result = await CharacterService.getCharacterById(1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch character');
      expect(result.error).toBeUndefined(); // In test environment
    });
  });

  describe('createCharacter', () => {
    it('should return error for missing name', async () => {
      const result = await CharacterService.createCharacter({});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Name is required');
      expect(result.error).toBe('MISSING_NAME');
    });

    it('should return error for empty name', async () => {
      const result = await CharacterService.createCharacter({ name: '' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Name is required');
      expect(result.error).toBe('MISSING_NAME');
    });

    it('should return error for invalid race_id', async () => {
      const characterData = {
        name: 'Luffy',
        race_id: 999
      };

      Character.findOne.mockResolvedValue(null); // No duplicate name
      Race.findByPk.mockResolvedValue(null); // Race doesn't exist

      const result = await CharacterService.createCharacter(characterData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid race ID');
      expect(result.error).toBe('INVALID_RACE');
    });

    it('should handle database errors gracefully', async () => {
      const characterData = { name: 'Luffy' };
      const error = new Error('Database connection failed');

      Character.findOne.mockResolvedValue(null);
      Character.create.mockRejectedValue(error);

      const result = await CharacterService.createCharacter(characterData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create character');
      expect(result.error).toBeUndefined(); // In test environment
    });
  });

  describe('updateCharacter', () => {
    const mockCharacter = {
      id: 1,
      name: 'Luffy',
      update: jest.fn(),
      reload: jest.fn()
    };

    it('should return error for invalid ID (string)', async () => {
      const result = await CharacterService.updateCharacter('invalid', {});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid character ID');
      expect(result.error).toBe('INVALID_ID');
      expect(Character.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for invalid ID (negative)', async () => {
      const result = await CharacterService.updateCharacter(-1, {});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid character ID');
      expect(result.error).toBe('INVALID_ID');
      expect(Character.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for invalid ID (zero)', async () => {
      const result = await CharacterService.updateCharacter(0, {});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid character ID');
      expect(result.error).toBe('INVALID_ID');
      expect(Character.findByPk).not.toHaveBeenCalled();
    });

    it('should return error when character not found', async () => {
      Character.findByPk.mockResolvedValue(null);

      const result = await CharacterService.updateCharacter(999, { name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Character with ID 999 not found');
      expect(result.error).toBe('NOT_FOUND');
    });

    it('should return error when no fields provided', async () => {
      Character.findByPk.mockResolvedValue(mockCharacter);

      const result = await CharacterService.updateCharacter(1, {});

      expect(result.success).toBe(false);
      expect(result.message).toBe('At least one field must be provided for update');
      expect(result.error).toBe('NO_FIELDS_PROVIDED');
    });

    it('should return error for empty name', async () => {
      Character.findByPk.mockResolvedValue(mockCharacter);

      const result = await CharacterService.updateCharacter(1, { name: '' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Name cannot be empty');
      expect(result.error).toBe('INVALID_NAME');
    });

    it('should return error for whitespace-only name', async () => {
      Character.findByPk.mockResolvedValue(mockCharacter);

      const result = await CharacterService.updateCharacter(1, { name: '   ' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Name cannot be empty');
      expect(result.error).toBe('INVALID_NAME');
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      Character.findByPk.mockResolvedValue(mockCharacter);
      mockCharacter.update.mockRejectedValue(error);

      const result = await CharacterService.updateCharacter(1, { name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update character');
      expect(result.error).toBeUndefined(); // In test environment
    });
  });

  describe('deleteCharacter', () => {
    const mockCharacter = {
      id: 1,
      name: 'Luffy',
      destroy: jest.fn()
    };

    it('should return error for invalid ID (string)', async () => {
      const result = await CharacterService.deleteCharacter('invalid');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid character ID');
      expect(result.error).toBe('INVALID_ID');
      expect(Character.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for invalid ID (negative)', async () => {
      const result = await CharacterService.deleteCharacter(-1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid character ID');
      expect(result.error).toBe('INVALID_ID');
      expect(Character.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for invalid ID (zero)', async () => {
      const result = await CharacterService.deleteCharacter(0);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid character ID');
      expect(result.error).toBe('INVALID_ID');
      expect(Character.findByPk).not.toHaveBeenCalled();
    });

    it('should return error when character not found', async () => {
      Character.findByPk.mockResolvedValue(null);

      const result = await CharacterService.deleteCharacter(999);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Character with ID 999 not found');
      expect(result.error).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      Character.findByPk.mockResolvedValue(mockCharacter);
      CharacterDevilFruit.findOne.mockResolvedValue(null);
      mockCharacter.destroy.mockRejectedValue(error);

      const result = await CharacterService.deleteCharacter(1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to delete character');
      expect(result.error).toBeUndefined(); // In test environment
    });
  });

  describe('raceExists', () => {
    it('should return true when race exists', async () => {
      Race.findByPk.mockResolvedValue({ id: 1, name: 'Human' });

      const result = await CharacterService.raceExists(1);

      expect(result).toBe(true);
      expect(Race.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return false when race does not exist', async () => {
      Race.findByPk.mockResolvedValue(null);

      const result = await CharacterService.raceExists(999);

      expect(result).toBe(false);
      expect(Race.findByPk).toHaveBeenCalledWith(999);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      Race.findByPk.mockRejectedValue(error);

      const result = await CharacterService.raceExists(1);

      expect(result).toBe(false);
    });
  });

  describe('characterHasDevilFruits', () => {
    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      sequelize.query.mockRejectedValue(error);

      const result = await CharacterService.characterHasDevilFruits(1);

      expect(result).toBe(false);
    });
  });

  describe('searchCharacters', () => {
    it('should handle empty search term', async () => {
      const result = await CharacterService.searchCharacters('');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Search term is required');
      expect(result.error).toBe('MISSING_SEARCH_TERM');
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      Character.count.mockRejectedValue(error);

      const result = await CharacterService.searchCharacters('Luffy');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch characters');
      expect(result.error).toBeUndefined(); // In test environment
    });
  });
});
