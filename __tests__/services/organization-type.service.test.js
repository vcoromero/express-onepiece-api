const { OrganizationType } = require('../../src/models');
const { Op } = require('sequelize');
const organizationTypeService = require('../../src/services/organization-type.service');

// Mock the main model
jest.mock('../../src/models', () => ({
  OrganizationType: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

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

// Mock database configuration to avoid real connections
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

describe('OrganizationTypeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOrganizationTypes', () => {
    it('should return all organization types with default parameters', async () => {
      const mockOrganizationTypes = [
        { id: 1, name: 'Pirate Crew', description: 'A group of pirates' },
        { id: 2, name: 'Marine', description: 'Navy organization' }
      ];

      OrganizationType.findAll.mockResolvedValue(mockOrganizationTypes);

      const result = await organizationTypeService.getAllOrganizationTypes();

      expect(result).toEqual({
        success: true,
        organizationTypes: mockOrganizationTypes,
        total: 2
      });
      expect(OrganizationType.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['name', 'asc']]
      });
    });

    it('should apply search filters correctly', async () => {
      const mockOrganizationTypes = [
        { id: 1, name: 'Pirate Crew', description: 'A group of pirates' }
      ];

      OrganizationType.findAll.mockResolvedValue(mockOrganizationTypes);

      const result = await organizationTypeService.getAllOrganizationTypes({
        search: 'pirate'
      });

      expect(result.success).toBe(true);
      expect(OrganizationType.findAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { name: { [Op.like]: '%pirate%' } },
            { description: { [Op.like]: '%pirate%' } }
          ]
        },
        order: [['name', 'asc']]
      });
    });

    it('should apply custom sorting parameters', async () => {
      const mockOrganizationTypes = [
        { id: 2, name: 'Marine', description: 'Navy organization' },
        { id: 1, name: 'Pirate Crew', description: 'A group of pirates' }
      ];

      OrganizationType.findAll.mockResolvedValue(mockOrganizationTypes);

      const result = await organizationTypeService.getAllOrganizationTypes({
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      expect(result.success).toBe(true);
      expect(OrganizationType.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['created_at', 'desc']]
      });
    });

    it('should handle invalid sort parameters gracefully', async () => {
      const mockOrganizationTypes = [
        { id: 1, name: 'Pirate Crew', description: 'A group of pirates' }
      ];

      OrganizationType.findAll.mockResolvedValue(mockOrganizationTypes);

      const result = await organizationTypeService.getAllOrganizationTypes({
        sortBy: 'invalid_field',
        sortOrder: 'invalid_order'
      });

      expect(result.success).toBe(true);
      expect(OrganizationType.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['name', 'asc']]
      });
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      OrganizationType.findAll.mockRejectedValue(error);

      const result = await organizationTypeService.getAllOrganizationTypes();

      expect(result).toEqual({
        success: false,
        message: 'Failed to fetch organization types',
        error: undefined
      });
    });

    it('should handle different environments correctly', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Database connection failed');
      OrganizationType.findAll.mockRejectedValue(error);

      const result = await organizationTypeService.getAllOrganizationTypes();

      expect(result.error).toBe('Database connection failed');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getOrganizationTypeById', () => {
    it('should return organization type when found', async () => {
      const mockOrganizationType = {
        id: 1,
        name: 'Pirate Crew',
        description: 'A group of pirates'
      };

      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);

      const result = await organizationTypeService.getOrganizationTypeById(1);

      expect(result).toEqual({
        success: true,
        data: mockOrganizationType
      });
      expect(OrganizationType.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return error for invalid ID (string)', async () => {
      const result = await organizationTypeService.getOrganizationTypeById('invalid');

      expect(result).toEqual({
        success: false,
        message: 'Invalid organization type ID',
        error: 'INVALID_ID'
      });
      expect(OrganizationType.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for invalid ID (negative)', async () => {
      const result = await organizationTypeService.getOrganizationTypeById(-1);

      expect(result).toEqual({
        success: false,
        message: 'Invalid organization type ID',
        error: 'INVALID_ID'
      });
      expect(OrganizationType.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for invalid ID (zero)', async () => {
      const result = await organizationTypeService.getOrganizationTypeById(0);

      expect(result).toEqual({
        success: false,
        message: 'Invalid organization type ID',
        error: 'INVALID_ID'
      });
      expect(OrganizationType.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for invalid ID (null)', async () => {
      const result = await organizationTypeService.getOrganizationTypeById(null);

      expect(result).toEqual({
        success: false,
        message: 'Invalid organization type ID',
        error: 'INVALID_ID'
      });
      expect(OrganizationType.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for invalid ID (undefined)', async () => {
      const result = await organizationTypeService.getOrganizationTypeById(undefined);

      expect(result).toEqual({
        success: false,
        message: 'Invalid organization type ID',
        error: 'INVALID_ID'
      });
      expect(OrganizationType.findByPk).not.toHaveBeenCalled();
    });

    it('should return error when organization type not found', async () => {
      OrganizationType.findByPk.mockResolvedValue(null);

      const result = await organizationTypeService.getOrganizationTypeById(999);

      expect(result).toEqual({
        success: false,
        message: 'Organization type with ID 999 not found',
        error: 'NOT_FOUND'
      });
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      OrganizationType.findByPk.mockRejectedValue(error);

      const result = await organizationTypeService.getOrganizationTypeById(1);

      expect(result).toEqual({
        success: false,
        message: 'Failed to fetch organization type',
        error: undefined
      });
    });
  });

  describe('updateOrganizationType', () => {
    let mockOrganizationType;

    beforeEach(() => {
      mockOrganizationType = {
        id: 1,
        name: 'Pirate Crew',
        description: 'A group of pirates',
        update: jest.fn(),
        reload: jest.fn()
      };
    });

    it('should update organization type successfully', async () => {
      const updateData = { name: 'Updated Pirate Crew' };
      const updatedOrganizationType = { 
        id: 1, 
        name: 'Updated Pirate Crew', 
        description: 'A group of pirates' 
      };

      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);
      OrganizationType.findOne.mockResolvedValue(null);
      mockOrganizationType.update.mockResolvedValue(updatedOrganizationType);
      mockOrganizationType.reload.mockResolvedValue(updatedOrganizationType);

      const result = await organizationTypeService.updateOrganizationType(1, updateData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Organization type updated successfully');
      expect(result.data).toBeDefined();
      expect(mockOrganizationType.update).toHaveBeenCalledWith(updateData);
      expect(mockOrganizationType.reload).toHaveBeenCalled();
    });

    it('should return error for invalid ID (string)', async () => {
      const result = await organizationTypeService.updateOrganizationType('invalid', {});

      expect(result).toEqual({
        success: false,
        message: 'Invalid organization type ID',
        error: 'INVALID_ID'
      });
      expect(OrganizationType.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for invalid ID (negative)', async () => {
      const result = await organizationTypeService.updateOrganizationType(-1, {});

      expect(result).toEqual({
        success: false,
        message: 'Invalid organization type ID',
        error: 'INVALID_ID'
      });
      expect(OrganizationType.findByPk).not.toHaveBeenCalled();
    });

    it('should return error for invalid ID (zero)', async () => {
      const result = await organizationTypeService.updateOrganizationType(0, {});

      expect(result).toEqual({
        success: false,
        message: 'Invalid organization type ID',
        error: 'INVALID_ID'
      });
      expect(OrganizationType.findByPk).not.toHaveBeenCalled();
    });

    it('should return error when organization type not found', async () => {
      OrganizationType.findByPk.mockResolvedValue(null);

      const result = await organizationTypeService.updateOrganizationType(999, { name: 'Updated' });

      expect(result).toEqual({
        success: false,
        message: 'Organization type with ID 999 not found',
        error: 'NOT_FOUND'
      });
    });

    it('should return error when no fields provided', async () => {
      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);

      const result = await organizationTypeService.updateOrganizationType(1, {});

      expect(result).toEqual({
        success: false,
        message: 'At least one field must be provided for update',
        error: 'NO_FIELDS_PROVIDED'
      });
    });

    it('should return error when no fields provided (null)', async () => {
      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);

      const result = await organizationTypeService.updateOrganizationType(1, null);

      expect(result).toEqual({
        success: false,
        message: 'At least one field must be provided for update',
        error: 'NO_FIELDS_PROVIDED'
      });
    });

    it('should return error when no fields provided (undefined)', async () => {
      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);

      const result = await organizationTypeService.updateOrganizationType(1, undefined);

      expect(result).toEqual({
        success: false,
        message: 'At least one field must be provided for update',
        error: 'NO_FIELDS_PROVIDED'
      });
    });

    it('should return error for empty name', async () => {
      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);

      const result = await organizationTypeService.updateOrganizationType(1, { name: '' });

      expect(result).toEqual({
        success: false,
        message: 'Name cannot be empty',
        error: 'INVALID_NAME'
      });
    });

    it('should return error for whitespace-only name', async () => {
      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);

      const result = await organizationTypeService.updateOrganizationType(1, { name: '   ' });

      expect(result).toEqual({
        success: false,
        message: 'Name cannot be empty',
        error: 'INVALID_NAME'
      });
    });

    it('should return error for name too long', async () => {
      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);

      const result = await organizationTypeService.updateOrganizationType(1, { 
        name: 'A'.repeat(51) 
      });

      expect(result).toEqual({
        success: false,
        message: 'Name cannot exceed 50 characters',
        error: 'INVALID_NAME'
      });
    });

    it('should return error for duplicate name', async () => {
      const existingOrganizationType = { id: 2, name: 'Marine' };
      
      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);
      OrganizationType.findOne.mockResolvedValue(existingOrganizationType);

      const result = await organizationTypeService.updateOrganizationType(1, { 
        name: 'Marine' 
      });

      expect(result).toEqual({
        success: false,
        message: 'An organization type with this name already exists',
        error: 'DUPLICATE_NAME'
      });
    });

    it('should not check for duplicates when name is not being updated', async () => {
      const updateData = { description: 'Updated description' };
      const updatedOrganizationType = { ...mockOrganizationType, ...updateData };

      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);
      mockOrganizationType.update.mockResolvedValue(updatedOrganizationType);
      mockOrganizationType.reload.mockResolvedValue(updatedOrganizationType);

      const result = await organizationTypeService.updateOrganizationType(1, updateData);

      expect(result.success).toBe(true);
      expect(OrganizationType.findOne).not.toHaveBeenCalled();
    });

    it('should not check for duplicates when name is the same', async () => {
      const updateData = { name: 'Pirate Crew' };
      const updatedOrganizationType = { ...mockOrganizationType, ...updateData };

      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);
      mockOrganizationType.update.mockResolvedValue(updatedOrganizationType);
      mockOrganizationType.reload.mockResolvedValue(updatedOrganizationType);

      const result = await organizationTypeService.updateOrganizationType(1, updateData);

      expect(result.success).toBe(true);
      expect(OrganizationType.findOne).not.toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      const updateData = { description: 'Updated description' };
      const updatedOrganizationType = { ...mockOrganizationType, ...updateData };

      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);
      mockOrganizationType.update.mockResolvedValue(updatedOrganizationType);
      mockOrganizationType.reload.mockResolvedValue(updatedOrganizationType);

      const result = await organizationTypeService.updateOrganizationType(1, updateData);

      expect(result.success).toBe(true);
      expect(mockOrganizationType.update).toHaveBeenCalledWith(updateData);
    });

    it('should handle null values in update data', async () => {
      const updateData = { description: null };
      const updatedOrganizationType = { ...mockOrganizationType, ...updateData };

      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);
      mockOrganizationType.update.mockResolvedValue(updatedOrganizationType);
      mockOrganizationType.reload.mockResolvedValue(updatedOrganizationType);

      const result = await organizationTypeService.updateOrganizationType(1, updateData);

      expect(result.success).toBe(true);
    });

    it('should handle undefined values in update data', async () => {
      const updateData = { description: undefined };
      const updatedOrganizationType = { ...mockOrganizationType, ...updateData };

      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);
      mockOrganizationType.update.mockResolvedValue(updatedOrganizationType);
      mockOrganizationType.reload.mockResolvedValue(updatedOrganizationType);

      const result = await organizationTypeService.updateOrganizationType(1, updateData);

      expect(result.success).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);
      OrganizationType.findOne.mockResolvedValue(null);
      mockOrganizationType.update.mockRejectedValue(error);

      const result = await organizationTypeService.updateOrganizationType(1, { name: 'Updated' });

      expect(result).toEqual({
        success: false,
        message: 'Failed to update organization type',
        error: undefined
      });
    });
  });

  describe('nameExists', () => {
    it('should return true when name exists', async () => {
      const existingOrganizationType = { id: 1, name: 'Pirate Crew' };
      OrganizationType.findOne.mockResolvedValue(existingOrganizationType);

      const result = await organizationTypeService.nameExists('Pirate Crew');

      expect(result).toBe(true);
      expect(OrganizationType.findOne).toHaveBeenCalledWith({
        where: { name: 'Pirate Crew' }
      });
    });

    it('should return false when name does not exist', async () => {
      OrganizationType.findOne.mockResolvedValue(null);

      const result = await organizationTypeService.nameExists('Non-existent');

      expect(result).toBe(false);
    });

    it('should exclude ID when provided', async () => {
      OrganizationType.findOne.mockResolvedValue(null);

      const result = await organizationTypeService.nameExists('Pirate Crew', 1);

      expect(result).toBe(false);
      expect(OrganizationType.findOne).toHaveBeenCalledWith({
        where: { 
          name: 'Pirate Crew',
          id: { [Op.ne]: 1 }
        }
      });
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      OrganizationType.findOne.mockRejectedValue(error);

      const result = await organizationTypeService.nameExists('Pirate Crew');

      expect(result).toBe(false);
    });
  });

  describe('idExists', () => {
    it('should return true when ID exists', async () => {
      const existingOrganizationType = { id: 1, name: 'Pirate Crew' };
      OrganizationType.findByPk.mockResolvedValue(existingOrganizationType);

      const result = await organizationTypeService.idExists(1);

      expect(result).toBe(true);
      expect(OrganizationType.findByPk).toHaveBeenCalledWith(1);
    });

    it('should return false when ID does not exist', async () => {
      OrganizationType.findByPk.mockResolvedValue(null);

      const result = await organizationTypeService.idExists(999);

      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      OrganizationType.findByPk.mockRejectedValue(error);

      const result = await organizationTypeService.idExists(1);

      expect(result).toBe(false);
    });
  });

  describe('isOrganizationTypeInUse', () => {
    it('should return true when organization type is in use', async () => {
      const organizationTypeWithOrganizations = {
        id: 1,
        name: 'Pirate Crew',
        organizations: [{ id: 1, name: 'Straw Hat Pirates' }]
      };
      OrganizationType.findByPk.mockResolvedValue(organizationTypeWithOrganizations);

      const result = await organizationTypeService.isOrganizationTypeInUse(1);

      expect(result).toBe(true);
      expect(OrganizationType.findByPk).toHaveBeenCalledWith(1, {
        include: [{
          association: 'organizations',
          required: false
        }]
      });
    });

    it('should return false when organization type is not in use', async () => {
      const organizationTypeWithoutOrganizations = {
        id: 1,
        name: 'Pirate Crew',
        organizations: []
      };
      OrganizationType.findByPk.mockResolvedValue(organizationTypeWithoutOrganizations);

      const result = await organizationTypeService.isOrganizationTypeInUse(1);

      expect(result).toBe(false);
    });

    it('should return false when organization type does not exist', async () => {
      OrganizationType.findByPk.mockResolvedValue(null);

      const result = await organizationTypeService.isOrganizationTypeInUse(999);

      expect(result).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      OrganizationType.findByPk.mockRejectedValue(error);

      const result = await organizationTypeService.isOrganizationTypeInUse(1);

      expect(result).toBe(false);
    });
  });
});
