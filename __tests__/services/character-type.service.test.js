// CharacterType Service Unit Tests
// Unit tests for CharacterType service

const { Op } = require('sequelize');

// Mock the CharacterType model directly
jest.mock('../../src/models/character-type.model', () => {
  const mockModel = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn()
  };
  return mockModel;
});

// Mock Sequelize operators
jest.mock('sequelize', () => ({
  Op: {
    or: Symbol('or'),
    like: Symbol('like'),
    ne: Symbol('ne'),
    iLike: Symbol('iLike'),
    and: Symbol('and')
  }
}));

// Mock database configuration to prevent DB connection
jest.mock('../../src/config/sequelize.config', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true)
  }
}));

// Mock database configuration
jest.mock('../../src/config/db.config', () => ({
  development: {
    username: 'test',
    password: 'test',
    database: 'test',
    host: 'localhost',
    dialect: 'sqlite'
  }
}));

// Mock the entire models directory to prevent any DB connection
jest.mock('../../src/models', () => {
  const mockCharacterType = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn()
  };
  
  return {
    CharacterType: mockCharacterType
  };
});

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

describe('CharacterTypeService', () => {
  let service;
  let CharacterType;

  beforeEach(() => {
    jest.clearAllMocks();
    service = require('../../src/services/character-type.service');
    CharacterType = require('../../src/models').CharacterType;
  });

  it('should have mocked CharacterType model', () => {
    expect(CharacterType.findAll).toBeDefined();
    expect(CharacterType.findByPk).toBeDefined();
    expect(CharacterType.findOne).toBeDefined();
  });

  describe('getAllCharacterTypes', () => {
    it('should return all character types with default options', async () => {
      const mockCharacterTypes = [
        {
          id: 1,
          name: 'Pirate',
          description: 'Sea-faring adventurers',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          name: 'Marine',
          description: 'Military force of the World Government',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      CharacterType.findAll.mockResolvedValue(mockCharacterTypes);

      const result = await service.getAllCharacterTypes();

      expect(CharacterType.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['name', 'asc']]
      });
      expect(result).toEqual({
        success: true,
        data: {
          characterTypes: mockCharacterTypes,
          total: 2
        }
      });
    });

    it('should apply search filter correctly', async () => {
      const mockCharacterTypes = [
        {
          id: 1,
          name: 'Pirate',
          description: 'Sea-faring adventurers'
        }
      ];

      CharacterType.findAll.mockResolvedValue(mockCharacterTypes);

      const result = await service.getAllCharacterTypes({ search: 'pirate' });

      expect(CharacterType.findAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { name: { [Op.like]: '%pirate%' } },
            { description: { [Op.like]: '%pirate%' } }
          ]
        },
        order: [['name', 'asc']]
      });
      expect(result.success).toBe(true);
    });

    it('should handle custom sort parameters', async () => {
      const mockCharacterTypes = [];
      CharacterType.findAll.mockResolvedValue(mockCharacterTypes);

      await service.getAllCharacterTypes({ 
        sortBy: 'created_at', 
        sortOrder: 'desc' 
      });

      expect(CharacterType.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['created_at', 'desc']]
      });
    });

    it('should validate and use default sort parameters for invalid values', async () => {
      const mockCharacterTypes = [];
      CharacterType.findAll.mockResolvedValue(mockCharacterTypes);

      await service.getAllCharacterTypes({ 
        sortBy: 'invalid_field', 
        sortOrder: 'invalid_order' 
      });

      expect(CharacterType.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['name', 'asc']]
      });
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      CharacterType.findAll.mockRejectedValue(error);

      const result = await service.getAllCharacterTypes();

      expect(result).toEqual({
        success: false,
        message: 'Failed to fetch character types',
        error: undefined
      });
    });

    it('should not expose error details in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Database connection failed');
      CharacterType.findAll.mockRejectedValue(error);

      const result = await service.getAllCharacterTypes();

      expect(result).toEqual({
        success: false,
        message: 'Failed to fetch character types',
        error: undefined
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getCharacterTypeById', () => {
    it('should return character type when found', async () => {
      const mockCharacterType = {
        id: 1,
        name: 'Pirate',
        description: 'Sea-faring adventurers'
      };

      CharacterType.findByPk.mockResolvedValue(mockCharacterType);

      const result = await service.getCharacterTypeById(1);

      expect(CharacterType.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        success: true,
        data: mockCharacterType
      });
    });

    it('should return error for invalid ID', async () => {
      const result = await service.getCharacterTypeById('invalid');

      expect(result).toEqual({
        success: false,
        message: 'Invalid character type ID',
        error: 'INVALID_ID'
      });
      expect(CharacterType.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for negative ID', async () => {
      const result = await service.getCharacterTypeById(-1);

      expect(result).toEqual({
        success: false,
        message: 'Invalid character type ID',
        error: 'INVALID_ID'
      });
      expect(CharacterType.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for zero ID', async () => {
      const result = await service.getCharacterTypeById(0);

      expect(result).toEqual({
        success: false,
        message: 'Invalid character type ID',
        error: 'INVALID_ID'
      });
    });

    it('should return error for null ID', async () => {
      const result = await service.getCharacterTypeById(null);

      expect(result).toEqual({
        success: false,
        message: 'Invalid character type ID',
        error: 'INVALID_ID'
      });
    });

    it('should return error for undefined ID', async () => {
      const result = await service.getCharacterTypeById(undefined);

      expect(result).toEqual({
        success: false,
        message: 'Invalid character type ID',
        error: 'INVALID_ID'
      });
    });

    it('should return error when character type not found', async () => {
      CharacterType.findByPk.mockResolvedValue(null);

      const result = await service.getCharacterTypeById(999);

      expect(result).toEqual({
        success: false,
        message: 'Character type with ID 999 not found',
        error: 'NOT_FOUND'
      });
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      CharacterType.findByPk.mockRejectedValue(error);

      const result = await service.getCharacterTypeById(1);

      expect(result).toEqual({
        success: false,
        message: 'Failed to fetch character type',
        error: undefined
      });
    });
  });

  describe('updateCharacterType', () => {
    let mockCharacterType;

    beforeEach(() => {
      mockCharacterType = {
        id: 1,
        name: 'Pirate',
        description: 'Sea-faring adventurers',
        update: jest.fn(),
        reload: jest.fn()
      };
    });

    it('should update character type successfully', async () => {
      const updateData = {
        name: 'Advanced Pirate',
        description: 'Elite sea-faring adventurers'
      };

      CharacterType.findByPk.mockResolvedValue(mockCharacterType);
      CharacterType.findOne.mockResolvedValue(null);
      mockCharacterType.update.mockResolvedValue();
      mockCharacterType.reload.mockResolvedValue();

      const result = await service.updateCharacterType(1, updateData);

      expect(CharacterType.findByPk).toHaveBeenCalledWith(1);
      expect(mockCharacterType.update).toHaveBeenCalledWith({
        name: 'Advanced Pirate',
        description: 'Elite sea-faring adventurers'
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Character type updated successfully');
    });

    it('should return error for invalid ID', async () => {
      const result = await service.updateCharacterType('invalid', {});

      expect(result).toEqual({
        success: false,
        message: 'Invalid character type ID',
        error: 'INVALID_ID'
      });
    });

    it('should return error when character type not found', async () => {
      CharacterType.findByPk.mockResolvedValue(null);

      const result = await service.updateCharacterType(999, { name: 'Updated' });

      expect(result).toEqual({
        success: false,
        message: 'Character type with ID 999 not found',
        error: 'NOT_FOUND'
      });
    });

    it('should return error when no fields provided', async () => {
      CharacterType.findByPk.mockResolvedValue(mockCharacterType);

      const result = await service.updateCharacterType(1, {});

      expect(result).toEqual({
        success: false,
        message: 'At least one field must be provided for update',
        error: 'NO_FIELDS_PROVIDED'
      });
    });

    it('should return error for empty name', async () => {
      CharacterType.findByPk.mockResolvedValue(mockCharacterType);

      const result = await service.updateCharacterType(1, { name: '' });

      expect(result).toEqual({
        success: false,
        message: 'Name cannot be empty',
        error: 'INVALID_NAME'
      });
    });

    it('should return error for whitespace-only name', async () => {
      CharacterType.findByPk.mockResolvedValue(mockCharacterType);

      const result = await service.updateCharacterType(1, { name: '   ' });

      expect(result).toEqual({
        success: false,
        message: 'Name cannot be empty',
        error: 'INVALID_NAME'
      });
    });

    it('should return error for name too long', async () => {
      CharacterType.findByPk.mockResolvedValue(mockCharacterType);

      const result = await service.updateCharacterType(1, { name: 'a'.repeat(51) });

      expect(result).toEqual({
        success: false,
        message: 'Name cannot exceed 50 characters',
        error: 'INVALID_NAME'
      });
    });

    it('should check for duplicate name when name is being updated', async () => {
      const updateData = { name: 'New Name' };
      const existingCharacterType = { id: 2, name: 'New Name' };

      CharacterType.findByPk.mockResolvedValue(mockCharacterType);
      CharacterType.findOne.mockResolvedValue(existingCharacterType);

      const result = await service.updateCharacterType(1, updateData);

      expect(CharacterType.findOne).toHaveBeenCalledWith({
        where: { name: 'New Name' }
      });
      expect(result).toEqual({
        success: false,
        message: 'A character type with this name already exists',
        error: 'DUPLICATE_NAME'
      });
    });

    it('should not check for duplicate name when name is not being updated', async () => {
      const updateData = { description: 'Updated description' };

      CharacterType.findByPk.mockResolvedValue(mockCharacterType);
      mockCharacterType.update.mockResolvedValue();
      mockCharacterType.reload.mockResolvedValue();

      const result = await service.updateCharacterType(1, updateData);

      expect(CharacterType.findOne).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should not check for duplicate name when name is the same', async () => {
      const updateData = { name: 'Pirate' };

      CharacterType.findByPk.mockResolvedValue(mockCharacterType);
      mockCharacterType.update.mockResolvedValue();
      mockCharacterType.reload.mockResolvedValue();

      const result = await service.updateCharacterType(1, updateData);

      expect(CharacterType.findOne).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should handle partial updates correctly', async () => {
      const updateData = { description: 'New description' };

      CharacterType.findByPk.mockResolvedValue(mockCharacterType);
      mockCharacterType.update.mockResolvedValue();
      mockCharacterType.reload.mockResolvedValue();

      const result = await service.updateCharacterType(1, updateData);

      expect(mockCharacterType.update).toHaveBeenCalledWith({
        description: 'New description'
      });
      expect(result.success).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      CharacterType.findByPk.mockResolvedValue(mockCharacterType);
      CharacterType.findOne.mockResolvedValue(null);
      mockCharacterType.update.mockRejectedValue(error);

      const result = await service.updateCharacterType(1, { name: 'Updated' });

      expect(result).toEqual({
        success: false,
        message: 'Failed to update character type',
        error: undefined
      });
    });
  });

  describe('nameExists', () => {
    it('should return true when name exists', async () => {
      const existingCharacterType = { id: 1, name: 'Pirate' };
      CharacterType.findOne.mockResolvedValue(existingCharacterType);

      const result = await service.nameExists('Pirate');

      expect(CharacterType.findOne).toHaveBeenCalledWith({
        where: { name: 'Pirate' }
      });
      expect(result).toBe(true);
    });

    it('should return false when name does not exist', async () => {
      CharacterType.findOne.mockResolvedValue(null);

      const result = await service.nameExists('NonExistent');

      expect(result).toBe(false);
    });

    it('should exclude ID when provided', async () => {
      const existingCharacterType = { id: 2, name: 'Pirate' };
      CharacterType.findOne.mockResolvedValue(existingCharacterType);

      const result = await service.nameExists('Pirate', 1);

      expect(CharacterType.findOne).toHaveBeenCalledWith({
        where: { name: 'Pirate', id: { [Op.ne]: 1 } }
      });
      expect(result).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      CharacterType.findOne.mockRejectedValue(error);

      const result = await service.nameExists('Pirate');

      expect(result).toBe(false);
    });
  });

  describe('idExists', () => {
    it('should return true when ID exists', async () => {
      const existingCharacterType = { id: 1, name: 'Pirate' };
      CharacterType.findByPk.mockResolvedValue(existingCharacterType);

      const result = await service.idExists(1);

      expect(CharacterType.findByPk).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false when ID does not exist', async () => {
      CharacterType.findByPk.mockResolvedValue(null);

      const result = await service.idExists(999);

      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      CharacterType.findByPk.mockRejectedValue(error);

      const result = await service.idExists(1);

      expect(result).toBe(false);
    });
  });

  describe('isCharacterTypeInUse', () => {
    it('should return true when character type is in use by characters', async () => {
      const characterTypeWithCharacters = {
        id: 1,
        name: 'Pirate',
        characters: [{ id: 1, name: 'Luffy' }]
      };
      CharacterType.findByPk.mockResolvedValue(characterTypeWithCharacters);

      const result = await service.isCharacterTypeInUse(1);

      expect(CharacterType.findByPk).toHaveBeenCalledWith(1, {
        include: [{
          association: 'characters',
          required: false
        }]
      });
      expect(result).toBe(true);
    });

    it('should return false when character type is not in use', async () => {
      const characterTypeWithoutCharacters = {
        id: 1,
        name: 'Pirate',
        characters: []
      };
      CharacterType.findByPk.mockResolvedValue(characterTypeWithoutCharacters);

      const result = await service.isCharacterTypeInUse(1);

      expect(result).toBe(false);
    });

    it('should return false when character type does not exist', async () => {
      CharacterType.findByPk.mockResolvedValue(null);

      const result = await service.isCharacterTypeInUse(999);

      expect(CharacterType.findByPk).toHaveBeenCalledWith(999, {
        include: [{
          association: 'characters',
          required: false
        }]
      });
      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      CharacterType.findByPk.mockRejectedValue(error);

      const result = await service.isCharacterTypeInUse(1);

      expect(result).toBe(false);
    });
  });
});
