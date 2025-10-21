const { Op } = require('sequelize');

// Mock of main model
jest.mock('../../src/models', () => ({
  Ship: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findAndCountAll: jest.fn()
  },
  Organization: {
    count: jest.fn()
  }
}));

// Mock of Sequelize operators
jest.mock('sequelize', () => ({
  Op: {
    or: Symbol('or'),
    like: Symbol('like'),
    ne: Symbol('ne'),
    iLike: Symbol('iLike'),
    and: Symbol('and')
  }
}));

// Mock of database configuration to avoid real connections
jest.mock('../../src/config/sequelize.config', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true)
  }
}));

// Mock of database configuration
jest.mock('../../src/config/db.config', () => ({
  development: {
    username: 'test',
    password: 'test',
    database: 'test',
    host: 'localhost',
    dialect: 'sqlite'
  }
}));

// Mock of console to avoid logs in tests
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

describe('ShipService', () => {
  let shipService;
  let Ship;
  let Organization;

  beforeEach(() => {
    jest.clearAllMocks();
    shipService = require('../../src/services/ship.service');
    const models = require('../../src/models');
    Ship = models.Ship;
    Organization = models.Organization;
  });

  describe('getAllShips', () => {
    it('should return ships with default pagination when no options provided', async () => {
      // Arrange
      const mockShips = [
        { id: 1, name: 'Thousand Sunny', status: 'active' },
        { id: 2, name: 'Going Merry', status: 'destroyed' }
      ];
      const mockResult = { count: 2, rows: mockShips };
      Ship.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      const result = await shipService.getAllShips();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockShips);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
      expect(Ship.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        include: [
          {
            model: Organization,
            as: 'organizations',
            attributes: ['id', 'name', 'status', 'total_bounty'],
            required: false
          }
        ],
        order: [['name', 'ASC']],
        limit: 10,
        offset: 0
      });
    });

    it('should apply status filter when provided', async () => {
      // Arrange
      const mockShips = [{ id: 1, name: 'Thousand Sunny', status: 'active' }];
      const mockResult = { count: 1, rows: mockShips };
      Ship.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      const result = await shipService.getAllShips({ status: 'active' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockShips);
      expect(Ship.findAndCountAll).toHaveBeenCalledWith({
        where: { status: 'active' },
        include: expect.any(Array),
        order: [['name', 'ASC']],
        limit: 10,
        offset: 0
      });
    });

    it('should apply search filter when provided', async () => {
      // Arrange
      const mockShips = [{ id: 1, name: 'Thousand Sunny', status: 'active' }];
      const mockResult = { count: 1, rows: mockShips };
      Ship.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      const result = await shipService.getAllShips({ search: 'Sunny' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockShips);
      expect(Ship.findAndCountAll).toHaveBeenCalledWith({
        where: { name: { [Op.like]: '%Sunny%' } },
        include: expect.any(Array),
        order: [['name', 'ASC']],
        limit: 10,
        offset: 0
      });
    });

    it('should apply custom pagination parameters', async () => {
      // Arrange
      const mockShips = [{ id: 1, name: 'Thousand Sunny', status: 'active' }];
      const mockResult = { count: 25, rows: mockShips };
      Ship.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      const result = await shipService.getAllShips({ page: 2, limit: 5 });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockShips);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 25,
        totalPages: 5,
        hasNext: true,
        hasPrev: true
      });
      expect(Ship.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Array),
        order: [['name', 'ASC']],
        limit: 5,
        offset: 5
      });
    });

    it('should handle invalid status filter', async () => {
      // Act
      const result = await shipService.getAllShips({ status: 'invalid' });
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      Ship.findAndCountAll.mockRejectedValue(error);

      // Act
      const result = await shipService.getAllShips();
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should limit maximum items per page to 100', async () => {
      // Arrange
      const mockResult = { count: 0, rows: [] };
      Ship.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      await shipService.getAllShips({ limit: 150 });

      // Assert
      expect(Ship.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });

    it('should ensure minimum page number is 1', async () => {
      // Arrange
      const mockResult = { count: 0, rows: [] };
      Ship.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      await shipService.getAllShips({ page: 0 });

      // Assert
      expect(Ship.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 0 })
      );
    });
  });

  describe('getShipById', () => {
    it('should return ship when found', async () => {
      // Arrange
      const mockShip = { id: 1, name: 'Thousand Sunny', status: 'active' };
      Ship.findByPk.mockResolvedValue(mockShip);

      // Act
      const result = await shipService.getShipById(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockShip);
      expect(Ship.findByPk).toHaveBeenCalledWith(1, {
        include: [
          {
            model: Organization,
            as: 'organizations',
            attributes: ['id', 'name', 'status', 'total_bounty'],
            required: false
          }
        ]
      });
    });

    it('should throw error for invalid ID (string)', async () => {
      // Act
      const result = await shipService.getShipById('invalid');
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('should throw error for invalid ID (negative)', async () => {
      // Act
      const result = await shipService.getShipById(-1);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('should throw error for invalid ID (zero)', async () => {
      // Act
      const result = await shipService.getShipById(0);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('should throw error for invalid ID (null)', async () => {
      // Act
      const result = await shipService.getShipById(null);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('should throw error for invalid ID (undefined)', async () => {
      // Act
      const result = await shipService.getShipById(undefined);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('should throw error when ship not found', async () => {
      // Arrange
      Ship.findByPk.mockResolvedValue(null);

      // Act
      const result = await shipService.getShipById(999);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      Ship.findByPk.mockRejectedValue(error);

      // Act
      const result = await shipService.getShipById(1);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('createShip', () => {
    it('should create ship successfully with required fields only', async () => {
      // Arrange
      const shipData = { name: 'Thousand Sunny' };
      const mockCreatedShip = { id: 1, name: 'Thousand Sunny', status: 'active' };
      const mockShipWithRelations = { id: 1, name: 'Thousand Sunny', status: 'active', organizations: [] };
      
      Ship.findOne.mockResolvedValue(null); // No duplicate
      Ship.create.mockResolvedValue(mockCreatedShip);
      Ship.findByPk.mockResolvedValue(mockShipWithRelations);

      // Act
      const result = await shipService.createShip(shipData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockShipWithRelations);
      expect(Ship.create).toHaveBeenCalledWith({
        name: 'Thousand Sunny',
        description: null,
        status: 'active'
      });
    });

    it('should create ship with all fields provided', async () => {
      // Arrange
      const shipData = {
        name: 'Going Merry',
        description: 'Straw Hat Pirates first ship',
        status: 'destroyed'
      };
      const mockCreatedShip = { id: 2, ...shipData };
      const mockShipWithRelations = { id: 2, ...shipData, organizations: [] };
      
      Ship.findOne.mockResolvedValue(null); // No duplicate
      Ship.create.mockResolvedValue(mockCreatedShip);
      Ship.findByPk.mockResolvedValue(mockShipWithRelations);

      // Act
      const result = await shipService.createShip(shipData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockShipWithRelations);
      expect(Ship.create).toHaveBeenCalledWith({
        name: 'Going Merry',
        description: 'Straw Hat Pirates first ship',
        status: 'destroyed'
      });
    });

    it('should throw error when name is missing', async () => {
      // Act & Assert
      await expect(shipService.createShip({}))
        .rejects.toThrow('SHIP_NAME_REQUIRED');
    });

    it('should throw error when name is empty string', async () => {
      // Act & Assert
      await expect(shipService.createShip({ name: '' }))
        .rejects.toThrow('SHIP_NAME_REQUIRED');
    });

    it('should throw error when name is only whitespace', async () => {
      // Act & Assert
      await expect(shipService.createShip({ name: '   ' }))
        .rejects.toThrow('SHIP_NAME_REQUIRED');
    });

    it('should throw error for invalid status', async () => {
      // Act & Assert
      await expect(shipService.createShip({ name: 'Test Ship', status: 'invalid' }))
        .rejects.toThrow('SHIP_INVALID_STATUS');
    });

    it('should throw error when ship name already exists', async () => {
      // Arrange
      const existingShip = { id: 1, name: 'Thousand Sunny' };
      Ship.findOne.mockResolvedValue(existingShip);

      // Act & Assert
      await expect(shipService.createShip({ name: 'Thousand Sunny' }))
        .rejects.toThrow('SHIP_NAME_EXISTS');
    });

    it('should handle database errors during creation', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      Ship.findOne.mockResolvedValue(null);
      Ship.create.mockRejectedValue(error);

      // Act & Assert
      await expect(shipService.createShip({ name: 'Test Ship' }))
        .rejects.toThrow('SHIP_CREATE_ERROR: Database connection failed');
    });
  });

  describe('updateShip', () => {
    it('should update ship successfully', async () => {
      // Arrange
      const existingShip = { id: 1, name: 'Old Name', status: 'active' };
      const updateData = { name: 'New Name', status: 'destroyed' };
      const updatedShip = { id: 1, name: 'New Name', status: 'destroyed', organizations: [] };
      
      Ship.findByPk.mockResolvedValueOnce(existingShip); // Check if exists
      Ship.findOne.mockResolvedValue(null); // No duplicate name
      Ship.update.mockResolvedValue([1]);
      Ship.findByPk.mockResolvedValueOnce(updatedShip); // Return updated ship

      // Act
      const result = await shipService.updateShip(1, updateData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedShip);
      expect(Ship.update).toHaveBeenCalledWith({
        name: 'New Name',
        status: 'destroyed'
      }, { where: { id: 1 } });
    });

    it('should throw error for invalid ID', async () => {
      // Act & Assert
      await expect(shipService.updateShip('invalid', {}))
        .rejects.toThrow('SHIP_INVALID_ID');
    });

    it('should throw error when ship not found', async () => {
      // Arrange
      Ship.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(shipService.updateShip(999, { name: 'New Name' }))
        .rejects.toThrow('SHIP_NOT_FOUND');
    });

    it('should throw error for invalid status', async () => {
      // Arrange
      const existingShip = { id: 1, name: 'Test Ship', status: 'active' };
      Ship.findByPk.mockResolvedValue(existingShip);

      // Act & Assert
      await expect(shipService.updateShip(1, { status: 'invalid' }))
        .rejects.toThrow('SHIP_INVALID_STATUS');
    });

    it('should throw error when new name already exists', async () => {
      // Arrange
      const existingShip = { id: 1, name: 'Old Name', status: 'active' };
      const duplicateShip = { id: 2, name: 'New Name', status: 'active' };
      Ship.findByPk.mockResolvedValue(existingShip);
      Ship.findOne.mockResolvedValue(duplicateShip);

      // Act & Assert
      await expect(shipService.updateShip(1, { name: 'New Name' }))
        .rejects.toThrow('SHIP_NAME_EXISTS');
    });

    it('should not check for duplicate when name is not changing', async () => {
      // Arrange
      const existingShip = { id: 1, name: 'Same Name', status: 'active' };
      const updatedShip = { id: 1, name: 'Same Name', status: 'destroyed', organizations: [] };
      
      Ship.findByPk.mockResolvedValueOnce(existingShip);
      Ship.update.mockResolvedValue([1]);
      Ship.findByPk.mockResolvedValueOnce(updatedShip);

      // Act
      const result = await shipService.updateShip(1, { status: 'destroyed' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedShip);
      expect(Ship.findOne).not.toHaveBeenCalled(); // Should not check for duplicates
    });

    it('should handle partial updates', async () => {
      // Arrange
      const existingShip = { id: 1, name: 'Test Ship', status: 'active' };
      const updatedShip = { id: 1, name: 'Test Ship', status: 'destroyed', organizations: [] };
      
      Ship.findByPk.mockResolvedValueOnce(existingShip);
      Ship.update.mockResolvedValue([1]);
      Ship.findByPk.mockResolvedValueOnce(updatedShip);

      // Act
      const result = await shipService.updateShip(1, { status: 'destroyed' });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedShip);
      expect(Ship.update).toHaveBeenCalledWith({
        status: 'destroyed'
      }, { where: { id: 1 } });
    });

    it('should handle null and undefined values', async () => {
      // Arrange
      const existingShip = { id: 1, name: 'Test Ship', status: 'active' };
      const updatedShip = { id: 1, name: 'Test Ship', status: 'active', organizations: [] };
      
      Ship.findByPk.mockResolvedValueOnce(existingShip);
      Ship.update.mockResolvedValue([1]);
      Ship.findByPk.mockResolvedValueOnce(updatedShip);

      // Act
      const result = await shipService.updateShip(1, { 
        description: null, 
        image_url: undefined 
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedShip);
      expect(Ship.update).toHaveBeenCalledWith({
        description: null
      }, { where: { id: 1 } });
    });

    it('should handle empty strings', async () => {
      // Arrange
      const existingShip = { id: 1, name: 'Test Ship', status: 'active' };
      const updatedShip = { id: 1, name: 'Test Ship', status: 'active', organizations: [] };
      
      Ship.findByPk.mockResolvedValueOnce(existingShip);
      Ship.update.mockResolvedValue([1]);
      Ship.findByPk.mockResolvedValueOnce(updatedShip);

      // Act
      const result = await shipService.updateShip(1, { 
        description: '', 
        image_url: '   ' 
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedShip);
      expect(Ship.update).toHaveBeenCalledWith({
        description: null,
        image_url: null
      }, { where: { id: 1 } });
    });

    it('should handle database errors during update', async () => {
      // Arrange
      const existingShip = { id: 1, name: 'Test Ship', status: 'active' };
      const error = new Error('Database connection failed');
      Ship.findByPk.mockResolvedValue(existingShip);
      Ship.findOne.mockResolvedValue(null); // No duplicate
      Ship.update.mockRejectedValue(error);

      // Act & Assert
      await expect(shipService.updateShip(1, { name: 'New Name' }))
        .rejects.toThrow('SHIP_UPDATE_ERROR: Database connection failed');
    });
  });

  describe('deleteShip', () => {
    it('should delete ship successfully when not in use', async () => {
      // Arrange
      const shipToDelete = { id: 1, name: 'Thousand Sunny' };
      Ship.findByPk.mockResolvedValue(shipToDelete);
      Organization.count.mockResolvedValue(0);
      Ship.destroy.mockResolvedValue(1);

      // Act
      const result = await shipService.deleteShip(1);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Ship deleted successfully'
      });
      expect(Ship.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw error for invalid ID', async () => {
      // Act & Assert
      await expect(shipService.deleteShip('invalid'))
        .rejects.toThrow('SHIP_INVALID_ID');
    });

    it('should throw error when ship not found', async () => {
      // Arrange
      Ship.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(shipService.deleteShip(999))
        .rejects.toThrow('SHIP_NOT_FOUND');
    });

    it('should throw error when ship is in use by organization', async () => {
      // Arrange
      const shipToDelete = { id: 1, name: 'Thousand Sunny' };
      Ship.findByPk.mockResolvedValue(shipToDelete);
      Organization.count.mockResolvedValue(2); // Ship is being used

      // Act & Assert
      await expect(shipService.deleteShip(1))
        .rejects.toThrow('SHIP_IN_USE');
    });

    it('should handle database errors during deletion', async () => {
      // Arrange
      const shipToDelete = { id: 1, name: 'Thousand Sunny' };
      const error = new Error('Database connection failed');
      Ship.findByPk.mockResolvedValue(shipToDelete);
      Organization.count.mockResolvedValue(0);
      Ship.destroy.mockRejectedValue(error);

      // Act & Assert
      await expect(shipService.deleteShip(1))
        .rejects.toThrow('SHIP_DELETE_ERROR: Database connection failed');
    });
  });

  describe('getShipsByStatus', () => {
    it('should return ships with valid status', async () => {
      // Arrange
      const mockShips = [
        { id: 1, name: 'Thousand Sunny', status: 'active' },
        { id: 2, name: 'Going Merry', status: 'active' }
      ];
      Ship.findAll.mockResolvedValue(mockShips);

      // Act
      const result = await shipService.getShipsByStatus('active');

      // Assert
      expect(result).toEqual(mockShips);
      expect(Ship.findAll).toHaveBeenCalledWith({
        where: { status: 'active' },
        include: [
          {
            model: Organization,
            as: 'organizations',
            attributes: ['id', 'name', 'status'],
            required: false
          }
        ],
        order: [['name', 'ASC']]
      });
    });

    it('should throw error for invalid status', async () => {
      // Act & Assert
      await expect(shipService.getShipsByStatus('invalid'))
        .rejects.toThrow('SHIP_INVALID_STATUS');
    });

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      Ship.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(shipService.getShipsByStatus('active'))
        .rejects.toThrow('SHIP_GET_BY_STATUS_ERROR: Database connection failed');
    });
  });
});
