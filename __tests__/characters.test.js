const characterService = require('../src/services/character.service');

// Mock models to avoid database connections
jest.mock('../src/models', () => ({
  Character: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Race: {
    findByPk: jest.fn()
  },
  CharacterType: {
    findByPk: jest.fn()
  }
}));

// Mock Sequelize
jest.mock('sequelize', () => {
  const Sequelize = jest.fn(() => ({
    define: jest.fn(),
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    query: jest.fn()
  }));
  
  Sequelize.Op = {
    or: Symbol('or'),
    like: Symbol('like'),
    ne: Symbol('ne'),
    iLike: Symbol('iLike'),
    and: Symbol('and'),
    gte: Symbol('gte'),
    lte: Symbol('lte')
  };
  
  return Sequelize;
});

// Mock database configuration
jest.mock('../src/config/sequelize.config', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    query: jest.fn()
  }
}));

// Mock console to avoid logs in tests
const originalConsole = global.console;
beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
});

afterAll(() => {
  global.console = originalConsole;
});

describe('Character Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Clean up after all tests
  afterAll(async () => {
    jest.restoreAllMocks();
  });

  describe('getAllCharacters', () => {
    it('should return all characters with pagination', async () => {
      const mockCharacters = [
        {
          id: 1,
          name: 'Monkey D. Luffy',
          japanese_name: 'モンキー・D・ルフィ',
          bounty: 3000000000,
          age: 19,
          height: 174,
          is_alive: true
        },
        {
          id: 2,
          name: 'Roronoa Zoro',
          japanese_name: 'ロロノア・ゾロ',
          bounty: 1111000000,
          age: 21,
          height: 181,
          is_alive: true
        }
      ];

      const { Character } = require('../src/models');
      Character.findAll.mockResolvedValue(mockCharacters);

      const result = await characterService.getAllCharacters({
        page: 1,
        limit: 10
      });

      expect(result.success).toBe(true);
      expect(result.data.characters).toHaveLength(2);
      expect(result.data.pagination.totalItems).toBe(2);
      expect(Character.findAll).toHaveBeenCalled();
    });

    it('should handle search parameters', async () => {
      const mockCharacters = [
        {
          id: 1,
          name: 'Monkey D. Luffy',
          bounty: 3000000000
        }
      ];

      const { Character } = require('../src/models');
      Character.findAll.mockResolvedValue(mockCharacters);

      const result = await characterService.getAllCharacters({
        page: 1,
        limit: 10,
        search: 'luffy'
      });

      expect(result.success).toBe(true);
      expect(result.data.characters).toHaveLength(1);
      expect(Character.findAll).toHaveBeenCalled();
    });

    it('should handle filtering parameters', async () => {
      const mockCharacters = [
        {
          id: 1,
          name: 'Monkey D. Luffy',
          bounty: 3000000000,
          race_id: 1,
          character_type_id: 1
        }
      ];

      const { Character } = require('../src/models');
      Character.findAll.mockResolvedValue(mockCharacters);

      const result = await characterService.getAllCharacters({
        page: 1,
        limit: 10,
        race_id: 1,
        character_type_id: 1,
        min_bounty: 1000000000,
        max_bounty: 5000000000,
        is_alive: true
      });

      expect(result.success).toBe(true);
      expect(result.data.characters).toHaveLength(1);
      expect(Character.findAll).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const { Character } = require('../src/models');
      Character.findAll.mockRejectedValue(new Error('Database connection failed'));

      const result = await characterService.getAllCharacters({
        page: 1,
        limit: 10
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch characters');
    });
  });

  describe('getCharacterById', () => {
    it('should return character when found', async () => {
      const mockCharacter = {
        id: 1,
        name: 'Monkey D. Luffy',
        japanese_name: 'モンキー・D・ルフィ',
        bounty: 3000000000,
        age: 19,
        height: 174,
        is_alive: true
      };

      const { Character } = require('../src/models');
      Character.findByPk.mockResolvedValue(mockCharacter);

      const result = await characterService.getCharacterById(1);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Monkey D. Luffy');
      expect(Character.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return error for invalid ID', async () => {
      const result = await characterService.getCharacterById('invalid');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid character ID');
      expect(result.error).toBe('INVALID_ID');
    });

    it('should return error when character not found', async () => {
      const { Character } = require('../src/models');
      Character.findByPk.mockResolvedValue(null);

      const result = await characterService.getCharacterById(999);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Character with ID 999 not found');
      expect(result.error).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      const { Character } = require('../src/models');
      Character.findByPk.mockRejectedValue(new Error('Database connection failed'));

      const result = await characterService.getCharacterById(1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch character');
    });
  });

  describe('createCharacter', () => {
    it('should create character successfully', async () => {
      const characterData = {
        name: 'Monkey D. Luffy',
        japanese_name: 'モンキー・D・ルフィ',
        race_id: 1,
        character_type_id: 1,
        bounty: 3000000000,
        age: 19,
        height: 174,
        description: 'Captain of the Straw Hat Pirates',
        abilities: 'Gomu Gomu no Mi powers',
        is_alive: true,
        first_appearance: 'Chapter 1'
      };

      const createdCharacter = {
        id: 1,
        ...characterData
      };

      const { Character } = require('../src/models');
      Character.findOne.mockResolvedValue(null); // No existing character
      Character.create.mockResolvedValue(createdCharacter);
      createdCharacter.reload = jest.fn().mockResolvedValue(createdCharacter);

      const result = await characterService.createCharacter(characterData);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Monkey D. Luffy');
      expect(result.message).toBe('Character created successfully');
      expect(Character.create).toHaveBeenCalled();
    });

    it('should return error for missing name', async () => {
      const result = await characterService.createCharacter({});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Name is required');
      expect(result.error).toBe('MISSING_NAME');
    });

    it('should return error for duplicate name', async () => {
      const { Character } = require('../src/models');
      Character.findOne.mockResolvedValue({ id: 1, name: 'Monkey D. Luffy' });

      const result = await characterService.createCharacter({
        name: 'Monkey D. Luffy'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('A character with this name already exists');
      expect(result.error).toBe('DUPLICATE_NAME');
    });

    it('should handle database errors', async () => {
      const { Character } = require('../src/models');
      Character.findOne.mockRejectedValue(new Error('Database connection failed'));

      const result = await characterService.createCharacter({
        name: 'Test Character'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create character');
    });
  });

  describe('updateCharacter', () => {
    it('should update character successfully', async () => {
      const updateData = {
        name: 'Monkey D. Luffy Updated',
        bounty: 5000000000
      };

      const existingCharacter = {
        id: 1,
        name: 'Monkey D. Luffy',
        bounty: 3000000000,
        update: jest.fn().mockResolvedValue(),
        reload: jest.fn().mockResolvedValue({
          id: 1,
          name: 'Monkey D. Luffy Updated',
          bounty: 5000000000
        })
      };

      const { Character } = require('../src/models');
      Character.findByPk.mockResolvedValue(existingCharacter);

      const result = await characterService.updateCharacter(1, updateData);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Monkey D. Luffy Updated');
      expect(result.message).toBe('Character updated successfully');
      expect(existingCharacter.update).toHaveBeenCalledWith(updateData);
    });

    it('should return error for invalid ID', async () => {
      const result = await characterService.updateCharacter('invalid', {});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid character ID');
      expect(result.error).toBe('INVALID_ID');
    });

    it('should return error when character not found', async () => {
      const { Character } = require('../src/models');
      Character.findByPk.mockResolvedValue(null);

      const result = await characterService.updateCharacter(999, {
        name: 'Updated Character'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Character with ID 999 not found');
      expect(result.error).toBe('NOT_FOUND');
    });

    it('should return error for no fields provided', async () => {
      const existingCharacter = {
        id: 1,
        name: 'Monkey D. Luffy'
      };

      const { Character } = require('../src/models');
      Character.findByPk.mockResolvedValue(existingCharacter);

      const result = await characterService.updateCharacter(1, {});

      expect(result.success).toBe(false);
      expect(result.message).toBe('At least one field must be provided for update');
      expect(result.error).toBe('NO_FIELDS_PROVIDED');
    });

    it('should handle database errors', async () => {
      const { Character } = require('../src/models');
      Character.findByPk.mockRejectedValue(new Error('Database connection failed'));

      const result = await characterService.updateCharacter(1, {
        name: 'Updated Character'
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update character');
    });
  });

  describe('deleteCharacter', () => {
    it('should delete character successfully', async () => {
      const existingCharacter = {
        id: 1,
        name: 'Monkey D. Luffy',
        destroy: jest.fn().mockResolvedValue()
      };

      const { Character } = require('../src/models');
      Character.findByPk.mockResolvedValue(existingCharacter);

      const result = await characterService.deleteCharacter(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Character deleted successfully');
      expect(existingCharacter.destroy).toHaveBeenCalled();
    });

    it('should return error for invalid ID', async () => {
      const result = await characterService.deleteCharacter('invalid');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid character ID');
      expect(result.error).toBe('INVALID_ID');
    });

    it('should return error when character not found', async () => {
      const { Character } = require('../src/models');
      Character.findByPk.mockResolvedValue(null);

      const result = await characterService.deleteCharacter(999);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Character with ID 999 not found');
      expect(result.error).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      const { Character } = require('../src/models');
      Character.findByPk.mockRejectedValue(new Error('Database connection failed'));

      const result = await characterService.deleteCharacter(1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to delete character');
    });
  });

  describe('searchCharacters', () => {
    it('should search characters successfully', async () => {
      const mockCharacters = [
        {
          id: 1,
          name: 'Monkey D. Luffy',
          bounty: 3000000000
        }
      ];

      const { Character } = require('../src/models');
      Character.findAll.mockResolvedValue(mockCharacters);

      const result = await characterService.searchCharacters('luffy', {
        page: 1,
        limit: 10
      });

      expect(result.success).toBe(true);
      expect(result.data.characters).toHaveLength(1);
      expect(Character.findAll).toHaveBeenCalled();
    });

    it('should return error for missing search term', async () => {
      const result = await characterService.searchCharacters('');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Search term is required');
      expect(result.error).toBe('MISSING_SEARCH_TERM');
    });

    it('should handle database errors', async () => {
      const { Character } = require('../src/models');
      Character.findAll.mockRejectedValue(new Error('Database connection failed'));

      const result = await characterService.searchCharacters('luffy');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to search characters');
    });
  });
});