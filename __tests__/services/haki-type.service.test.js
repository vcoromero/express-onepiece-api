// HakiType Service Unit Tests
// Unit tests for Haki type service

const { Op } = require('sequelize');

// Mock the HakiType model directly
jest.mock('../../src/models/haki-type.model', () => {
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
    ne: Symbol('ne')
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
  const mockHakiType = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn()
  };
  
  return {
    HakiType: mockHakiType
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

describe('HakiTypeService', () => {
  let service;
  let HakiType;

  beforeEach(() => {
    jest.clearAllMocks();
    service = require('../../src/services/haki-type.service');
    HakiType = require('../../src/models').HakiType;
  });

  it('should have mocked HakiType model', () => {
    expect(HakiType.findAll).toBeDefined();
    expect(HakiType.findByPk).toBeDefined();
    expect(HakiType.findOne).toBeDefined();
  });

  describe('getAllHakiTypes', () => {
    it('should return all Haki types with default options', async () => {
      const mockHakiTypes = [
        {
          id: 1,
          name: 'Observation Haki',
          description: 'Allows user to sense presence and emotions',
          color: 'Red',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          name: 'Armament Haki',
          description: 'Allows user to use spiritual armor',
          color: 'Black',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      HakiType.findAll.mockResolvedValue(mockHakiTypes);

      const result = await service.getAllHakiTypes();

      expect(HakiType.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['name', 'asc']]
      });
      expect(result).toEqual({
        success: true,
        data: {
          hakiTypes: mockHakiTypes,
          total: 2
        }
      });
    });

    it('should apply search filter correctly', async () => {
      const mockHakiTypes = [
        {
          id: 1,
          name: 'Observation Haki',
          description: 'Allows user to sense presence',
          color: 'Red'
        }
      ];

      HakiType.findAll.mockResolvedValue(mockHakiTypes);

      const result = await service.getAllHakiTypes({ search: 'observation' });

      expect(HakiType.findAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { name: { [Op.like]: '%observation%' } },
            { description: { [Op.like]: '%observation%' } }
          ]
        },
        order: [['name', 'asc']]
      });
      expect(result.success).toBe(true);
    });

    it('should handle custom sort parameters', async () => {
      const mockHakiTypes = [];
      HakiType.findAll.mockResolvedValue(mockHakiTypes);

      await service.getAllHakiTypes({ 
        sortBy: 'color', 
        sortOrder: 'desc' 
      });

      expect(HakiType.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['color', 'desc']]
      });
    });

    it('should validate and use default sort parameters for invalid values', async () => {
      const mockHakiTypes = [];
      HakiType.findAll.mockResolvedValue(mockHakiTypes);

      await service.getAllHakiTypes({ 
        sortBy: 'invalid_field', 
        sortOrder: 'invalid_order' 
      });

      expect(HakiType.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['name', 'asc']]
      });
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      HakiType.findAll.mockRejectedValue(error);

      const result = await service.getAllHakiTypes();

      expect(result).toEqual({
        success: false,
        message: 'Failed to retrieve Haki types',
        error: undefined
      });
    });

    it('should not expose error details in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Database connection failed');
      HakiType.findAll.mockRejectedValue(error);

      const result = await service.getAllHakiTypes();

      expect(result).toEqual({
        success: false,
        message: 'Failed to retrieve Haki types',
        error: undefined
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getHakiTypeById', () => {
    it('should return Haki type when found', async () => {
      const mockHakiType = {
        id: 1,
        name: 'Observation Haki',
        description: 'Allows user to sense presence',
        color: 'Red'
      };

      HakiType.findByPk.mockResolvedValue(mockHakiType);

      const result = await service.getHakiTypeById(1);

      expect(HakiType.findByPk).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        success: true,
        data: { hakiType: mockHakiType }
      });
    });

    it('should return error for invalid ID', async () => {
      const result = await service.getHakiTypeById('invalid');

      expect(result).toEqual({
        success: false,
        message: 'Invalid Haki type ID',
        error: 'INVALID_ID'
      });
      expect(HakiType.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for negative ID', async () => {
      const result = await service.getHakiTypeById(-1);

      expect(result).toEqual({
        success: false,
        message: 'Invalid Haki type ID',
        error: 'INVALID_ID'
      });
    });

    it('should return error for zero ID', async () => {
      const result = await service.getHakiTypeById(0);

      expect(result).toEqual({
        success: false,
        message: 'Invalid Haki type ID',
        error: 'INVALID_ID'
      });
    });

    it('should return error for null ID', async () => {
      const result = await service.getHakiTypeById(null);

      expect(result).toEqual({
        success: false,
        message: 'Invalid Haki type ID',
        error: 'INVALID_ID'
      });
    });

    it('should return error for undefined ID', async () => {
      const result = await service.getHakiTypeById(undefined);

      expect(result).toEqual({
        success: false,
        message: 'Invalid Haki type ID',
        error: 'INVALID_ID'
      });
    });

    it('should return error when Haki type not found', async () => {
      HakiType.findByPk.mockResolvedValue(null);

      const result = await service.getHakiTypeById(999);

      expect(result).toEqual({
        success: false,
        message: 'Haki type not found',
        error: 'NOT_FOUND'
      });
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      HakiType.findByPk.mockRejectedValue(error);

      const result = await service.getHakiTypeById(1);

      expect(result).toEqual({
        success: false,
        message: 'Failed to retrieve Haki type',
        error: undefined
      });
    });
  });

  describe('updateHakiType', () => {
    let mockHakiType;

    beforeEach(() => {
      mockHakiType = {
        id: 1,
        name: 'Observation Haki',
        description: 'Allows user to sense presence',
        color: 'Red',
        update: jest.fn()
      };
    });

    it('should update Haki type successfully', async () => {
      const updateData = {
        name: 'Advanced Observation Haki',
        description: 'Enhanced version',
        color: 'Dark Red'
      };

      const updatedHakiType = { ...mockHakiType, ...updateData };
      mockHakiType.update.mockResolvedValue(updatedHakiType);
      HakiType.findByPk.mockResolvedValue(mockHakiType);
      HakiType.findOne.mockResolvedValue(null);

      const result = await service.updateHakiType(1, updateData);

      expect(HakiType.findByPk).toHaveBeenCalledWith(1);
      expect(mockHakiType.update).toHaveBeenCalledWith({
        name: 'Advanced Observation Haki',
        description: 'Enhanced version',
        color: 'Dark Red'
      });
      expect(result).toEqual({
        success: true,
        data: { hakiType: updatedHakiType },
        message: 'Haki type updated successfully'
      });
    });

    it('should return error for invalid ID', async () => {
      const result = await service.updateHakiType('invalid', {});

      expect(result).toEqual({
        success: false,
        message: 'Invalid Haki type ID',
        error: 'INVALID_ID'
      });
    });

    it('should return error when Haki type not found', async () => {
      HakiType.findByPk.mockResolvedValue(null);

      const result = await service.updateHakiType(999, { name: 'Updated' });

      expect(result).toEqual({
        success: false,
        message: 'Haki type not found',
        error: 'NOT_FOUND'
      });
    });

    it('should check for duplicate name when name is being updated', async () => {
      const updateData = { name: 'New Name' };
      const existingHakiType = { id: 2, name: 'New Name' };

      HakiType.findByPk.mockResolvedValue(mockHakiType);
      HakiType.findOne.mockResolvedValue(existingHakiType);

      const result = await service.updateHakiType(1, updateData);

      expect(HakiType.findOne).toHaveBeenCalledWith({
        where: {
          name: 'New Name',
          id: { [Op.ne]: 1 }
        }
      });
      expect(result).toEqual({
        success: false,
        message: 'A Haki type with this name already exists',
        error: 'DUPLICATE_NAME'
      });
    });

    it('should not check for duplicate name when name is not being updated', async () => {
      const updateData = { description: 'Updated description' };
      const updatedHakiType = { ...mockHakiType, description: 'Updated description' };

      HakiType.findByPk.mockResolvedValue(mockHakiType);
      mockHakiType.update.mockResolvedValue(updatedHakiType);

      const result = await service.updateHakiType(1, updateData);

      expect(HakiType.findOne).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should not check for duplicate name when name is the same', async () => {
      const updateData = { name: 'Observation Haki' };
      const updatedHakiType = { ...mockHakiType };

      HakiType.findByPk.mockResolvedValue(mockHakiType);
      mockHakiType.update.mockResolvedValue(updatedHakiType);

      const result = await service.updateHakiType(1, updateData);

      expect(HakiType.findOne).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should handle partial updates correctly', async () => {
      const updateData = { color: 'Blue' };
      const updatedHakiType = { ...mockHakiType, color: 'Blue' };

      HakiType.findByPk.mockResolvedValue(mockHakiType);
      mockHakiType.update.mockResolvedValue(updatedHakiType);

      const result = await service.updateHakiType(1, updateData);

      expect(mockHakiType.update).toHaveBeenCalledWith({
        color: 'Blue'
      });
      expect(result.success).toBe(true);
    });

    it('should handle null/undefined values correctly', async () => {
      const updateData = { 
        description: null, 
        color: undefined 
      };
      const updatedHakiType = { ...mockHakiType, description: null, color: null };

      HakiType.findByPk.mockResolvedValue(mockHakiType);
      mockHakiType.update.mockResolvedValue(updatedHakiType);

      const result = await service.updateHakiType(1, updateData);

      expect(mockHakiType.update).toHaveBeenCalledWith({
        description: null
      });
      expect(result.success).toBe(true);
    });

    it('should handle empty string values correctly', async () => {
      const updateData = { 
        description: '', 
        color: '   ' 
      };
      const updatedHakiType = { ...mockHakiType, description: null, color: null };

      HakiType.findByPk.mockResolvedValue(mockHakiType);
      mockHakiType.update.mockResolvedValue(updatedHakiType);

      const result = await service.updateHakiType(1, updateData);

      expect(mockHakiType.update).toHaveBeenCalledWith({
        description: null,
        color: null
      });
      expect(result.success).toBe(true);
    });

    it('should handle Sequelize validation errors', async () => {
      const validationError = new Error('Validation error');
      validationError.name = 'SequelizeValidationError';
      validationError.errors = [
        { message: 'Name cannot be empty' },
        { message: 'Name cannot exceed 50 characters' }
      ];

      HakiType.findByPk.mockResolvedValue(mockHakiType);
      mockHakiType.update.mockRejectedValue(validationError);

      const result = await service.updateHakiType(1, { name: '' });

      expect(result).toEqual({
        success: false,
        message: 'Validation error: Name cannot be empty, Name cannot exceed 50 characters',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should handle Sequelize unique constraint errors', async () => {
      const uniqueError = new Error('Unique constraint error');
      uniqueError.name = 'SequelizeUniqueConstraintError';

      HakiType.findByPk.mockResolvedValue(mockHakiType);
      mockHakiType.update.mockRejectedValue(uniqueError);

      const result = await service.updateHakiType(1, { name: 'Duplicate Name' });

      expect(result).toEqual({
        success: false,
        message: 'A Haki type with this name already exists',
        error: 'DUPLICATE_NAME'
      });
    });

    it('should handle general database errors', async () => {
      const error = new Error('Database connection failed');
      HakiType.findByPk.mockResolvedValue(mockHakiType);
      HakiType.findOne.mockResolvedValue(null); // No duplicate found
      mockHakiType.update.mockRejectedValue(error);

      const result = await service.updateHakiType(1, { name: 'Updated' });

      expect(result).toEqual({
        success: false,
        message: 'Failed to update Haki type',
        error: undefined
      });
    });
  });
});
