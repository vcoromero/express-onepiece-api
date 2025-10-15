// Race Service Unit Tests
// Unit tests for Race service

const { Op } = require('sequelize');

// Mock the Race model directly
jest.mock('../../src/models/race.model', () => {
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
  const mockRace = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn()
  };
  
  return {
    Race: mockRace
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

describe('RaceService', () => {
  let service;
  let Race;

  beforeEach(() => {
    jest.clearAllMocks();
    service = require('../../src/services/race.service');
    Race = require('../../src/models').Race;
  });

  it('should have mocked Race model', () => {
    expect(Race.findAll).toBeDefined();
    expect(Race.findByPk).toBeDefined();
    expect(Race.findOne).toBeDefined();
  });

  describe('getAllRaces', () => {
    it('should return all races with default options', async () => {
      const mockRaces = [
        {
          id: 1,
          name: 'Human',
          description: 'Standard human race',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          name: 'Fishman',
          description: 'Aquatic humanoid race',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      Race.findAll.mockResolvedValue(mockRaces);

      const result = await service.getAllRaces();

      expect(Race.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['name', 'asc']]
      });
      expect(result).toEqual({
        success: true,
        data: {
          races: mockRaces,
          total: 2
        }
      });
    });

    it('should apply search filter correctly', async () => {
      const mockRaces = [
        {
          id: 1,
          name: 'Human',
          description: 'Standard human race'
        }
      ];

      Race.findAll.mockResolvedValue(mockRaces);

      const result = await service.getAllRaces({ search: 'human' });

      expect(Race.findAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { name: { [Op.like]: '%human%' } },
            { description: { [Op.like]: '%human%' } }
          ]
        },
        order: [['name', 'asc']]
      });
      expect(result.success).toBe(true);
    });

    it('should handle custom sort parameters', async () => {
      const mockRaces = [];
      Race.findAll.mockResolvedValue(mockRaces);

      await service.getAllRaces({ 
        sortBy: 'created_at', 
        sortOrder: 'desc' 
      });

      expect(Race.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['created_at', 'desc']]
      });
    });

    it('should validate and use default sort parameters for invalid values', async () => {
      const mockRaces = [];
      Race.findAll.mockResolvedValue(mockRaces);

      await service.getAllRaces({ 
        sortBy: 'invalid_field', 
        sortOrder: 'invalid_order' 
      });

      expect(Race.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['name', 'asc']]
      });
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      Race.findAll.mockRejectedValue(error);

      const result = await service.getAllRaces();

      expect(result).toEqual({
        success: false,
        message: 'Failed to fetch races',
        error: undefined
      });
    });

    it('should not expose error details in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Database connection failed');
      Race.findAll.mockRejectedValue(error);

      const result = await service.getAllRaces();

      expect(result).toEqual({
        success: false,
        message: 'Failed to fetch races',
        error: undefined
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getRaceById', () => {
    it('should return race when found', async () => {
      const mockRace = {
        id: 1,
        name: 'Human',
        description: 'Standard human race'
      };

      Race.findByPk.mockResolvedValue(mockRace);

      const result = await service.getRaceById(1);

      expect(Race.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        success: true,
        data: mockRace
      });
    });

    it('should return error for invalid ID', async () => {
      const result = await service.getRaceById('invalid');

      expect(result).toEqual({
        success: false,
        message: 'Invalid race ID',
        error: 'INVALID_ID'
      });
      expect(Race.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for negative ID', async () => {
      const result = await service.getRaceById(-1);

      expect(result).toEqual({
        success: false,
        message: 'Invalid race ID',
        error: 'INVALID_ID'
      });
      expect(Race.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for zero ID', async () => {
      const result = await service.getRaceById(0);

      expect(result).toEqual({
        success: false,
        message: 'Invalid race ID',
        error: 'INVALID_ID'
      });
    });

    it('should return error for null ID', async () => {
      const result = await service.getRaceById(null);

      expect(result).toEqual({
        success: false,
        message: 'Invalid race ID',
        error: 'INVALID_ID'
      });
    });

    it('should return error for undefined ID', async () => {
      const result = await service.getRaceById(undefined);

      expect(result).toEqual({
        success: false,
        message: 'Invalid race ID',
        error: 'INVALID_ID'
      });
    });

    it('should return error when race not found', async () => {
      Race.findByPk.mockResolvedValue(null);

      const result = await service.getRaceById(999);

      expect(result).toEqual({
        success: false,
        message: 'Race with ID 999 not found',
        error: 'NOT_FOUND'
      });
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      Race.findByPk.mockRejectedValue(error);

      const result = await service.getRaceById(1);

      expect(result).toEqual({
        success: false,
        message: 'Failed to fetch race',
        error: undefined
      });
    });
  });

  describe('updateRace', () => {
    let mockRace;

    beforeEach(() => {
      mockRace = {
        id: 1,
        name: 'Human',
        description: 'Standard human race',
        update: jest.fn(),
        reload: jest.fn()
      };
    });

    it('should update race successfully', async () => {
      const updateData = {
        name: 'Advanced Human',
        description: 'Enhanced human race'
      };

      Race.findByPk.mockResolvedValue(mockRace);
      Race.findOne.mockResolvedValue(null);
      mockRace.update.mockResolvedValue();
      mockRace.reload.mockResolvedValue();

      const result = await service.updateRace(1, updateData);

      expect(Race.findByPk).toHaveBeenCalledWith(1);
      expect(mockRace.update).toHaveBeenCalledWith({
        name: 'Advanced Human',
        description: 'Enhanced human race'
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Race updated successfully');
    });

    it('should return error for invalid ID', async () => {
      const result = await service.updateRace('invalid', {});

      expect(result).toEqual({
        success: false,
        message: 'Invalid race ID',
        error: 'INVALID_ID'
      });
    });

    it('should return error when race not found', async () => {
      Race.findByPk.mockResolvedValue(null);

      const result = await service.updateRace(999, { name: 'Updated' });

      expect(result).toEqual({
        success: false,
        message: 'Race with ID 999 not found',
        error: 'NOT_FOUND'
      });
    });

    it('should return error when no fields provided', async () => {
      Race.findByPk.mockResolvedValue(mockRace);

      const result = await service.updateRace(1, {});

      expect(result).toEqual({
        success: false,
        message: 'At least one field must be provided for update',
        error: 'NO_FIELDS_PROVIDED'
      });
    });

    it('should return error for empty name', async () => {
      Race.findByPk.mockResolvedValue(mockRace);

      const result = await service.updateRace(1, { name: '' });

      expect(result).toEqual({
        success: false,
        message: 'Name cannot be empty',
        error: 'INVALID_NAME'
      });
    });

    it('should return error for whitespace-only name', async () => {
      Race.findByPk.mockResolvedValue(mockRace);

      const result = await service.updateRace(1, { name: '   ' });

      expect(result).toEqual({
        success: false,
        message: 'Name cannot be empty',
        error: 'INVALID_NAME'
      });
    });

    it('should return error for name too long', async () => {
      Race.findByPk.mockResolvedValue(mockRace);

      const result = await service.updateRace(1, { name: 'a'.repeat(51) });

      expect(result).toEqual({
        success: false,
        message: 'Name cannot exceed 50 characters',
        error: 'INVALID_NAME'
      });
    });

    it('should check for duplicate name when name is being updated', async () => {
      const updateData = { name: 'New Name' };
      const existingRace = { id: 2, name: 'New Name' };

      Race.findByPk.mockResolvedValue(mockRace);
      Race.findOne.mockResolvedValue(existingRace);

      const result = await service.updateRace(1, updateData);

      expect(Race.findOne).toHaveBeenCalledWith({
        where: { name: 'New Name' }
      });
      expect(result).toEqual({
        success: false,
        message: 'A race with this name already exists',
        error: 'DUPLICATE_NAME'
      });
    });

    it('should not check for duplicate name when name is not being updated', async () => {
      const updateData = { description: 'Updated description' };
      const updatedRace = { ...mockRace, description: 'Updated description' };

      Race.findByPk.mockResolvedValue(mockRace);
      mockRace.update.mockResolvedValue(updatedRace);
      mockRace.reload.mockResolvedValue(updatedRace);

      const result = await service.updateRace(1, updateData);

      expect(Race.findOne).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should not check for duplicate name when name is the same', async () => {
      const updateData = { name: 'Human' };
      const updatedRace = { ...mockRace };

      Race.findByPk.mockResolvedValue(mockRace);
      mockRace.update.mockResolvedValue(updatedRace);
      mockRace.reload.mockResolvedValue(updatedRace);

      const result = await service.updateRace(1, updateData);

      expect(Race.findOne).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should handle partial updates correctly', async () => {
      const updateData = { description: 'New description' };
      const updatedRace = { ...mockRace, description: 'New description' };

      Race.findByPk.mockResolvedValue(mockRace);
      mockRace.update.mockResolvedValue(updatedRace);
      mockRace.reload.mockResolvedValue(updatedRace);

      const result = await service.updateRace(1, updateData);

      expect(mockRace.update).toHaveBeenCalledWith({
        description: 'New description'
      });
      expect(result.success).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      Race.findByPk.mockResolvedValue(mockRace);
      Race.findOne.mockResolvedValue(null); // No duplicate found
      mockRace.update.mockRejectedValue(error);

      const result = await service.updateRace(1, { name: 'Updated' });

      expect(result).toEqual({
        success: false,
        message: 'Failed to update race',
        error: undefined
      });
    });
  });

  describe('nameExists', () => {
    it('should return true when name exists', async () => {
      const existingRace = { id: 1, name: 'Human' };
      Race.findOne.mockResolvedValue(existingRace);

      const result = await service.nameExists('Human');

      expect(Race.findOne).toHaveBeenCalledWith({
        where: { name: 'Human' }
      });
      expect(result).toBe(true);
    });

    it('should return false when name does not exist', async () => {
      Race.findOne.mockResolvedValue(null);

      const result = await service.nameExists('NonExistent');

      expect(result).toBe(false);
    });

    it('should exclude ID when provided', async () => {
      const existingRace = { id: 2, name: 'Human' };
      Race.findOne.mockResolvedValue(existingRace);

      const result = await service.nameExists('Human', 1);

      expect(Race.findOne).toHaveBeenCalledWith({
        where: { name: 'Human', id: { [Op.ne]: 1 } }
      });
      expect(result).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      Race.findOne.mockRejectedValue(error);

      const result = await service.nameExists('Human');

      expect(result).toBe(false);
    });
  });

  describe('idExists', () => {
    it('should return true when ID exists', async () => {
      const existingRace = { id: 1, name: 'Human' };
      Race.findByPk.mockResolvedValue(existingRace);

      const result = await service.idExists(1);

      expect(Race.findByPk).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false when ID does not exist', async () => {
      Race.findByPk.mockResolvedValue(null);

      const result = await service.idExists(999);

      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      Race.findByPk.mockRejectedValue(error);

      const result = await service.idExists(1);

      expect(result).toBe(false);
    });
  });

  describe('isRaceInUse', () => {
    it('should return true when race is in use by characters', async () => {
      const raceWithCharacters = {
        id: 1,
        name: 'Human',
        characters: [{ id: 1, name: 'Luffy' }]
      };
      Race.findByPk.mockResolvedValue(raceWithCharacters);

      const result = await service.isRaceInUse(1);

      expect(Race.findByPk).toHaveBeenCalledWith(1, {
        include: [{
          association: 'characters',
          required: false
        }]
      });
      expect(result).toBe(true);
    });

    it('should return false when race is not in use', async () => {
      const raceWithoutCharacters = {
        id: 1,
        name: 'Human',
        characters: []
      };
      Race.findByPk.mockResolvedValue(raceWithoutCharacters);

      const result = await service.isRaceInUse(1);

      expect(result).toBe(false);
    });

    it('should return false when race does not exist', async () => {
      Race.findByPk.mockResolvedValue(null);

      const result = await service.isRaceInUse(999);

      expect(Race.findByPk).toHaveBeenCalledWith(999, {
        include: [{
          association: 'characters',
          required: false
        }]
      });
      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      Race.findByPk.mockRejectedValue(error);

      const result = await service.isRaceInUse(1);

      expect(result).toBe(false);
    });
  });
});
