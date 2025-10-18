const request = require('supertest');
const app = require('../../src/app');

// Mock of service
jest.mock('../../src/services/ship.service', () => ({
  getAllShips: jest.fn(),
  getShipById: jest.fn(),
  createShip: jest.fn(),
  updateShip: jest.fn(),
  deleteShip: jest.fn(),
  getShipsByStatus: jest.fn()
}));

// Mock of JWTUtil for authentication
jest.mock('../../src/utils/jwt.util', () => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn((token) => {
    if (token === 'valid-test-token') {
      return { username: 'testadmin', role: 'admin' };
    }
    throw new Error('Invalid token');
  }),
  decodeToken: jest.fn()
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

// Mock of models to avoid DB connections
jest.mock('../../src/models', () => ({
  Ship: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Organization: {
    count: jest.fn()
  }
}));

// Mock of individual models to avoid initialization
jest.mock('../../src/models/fruit-type.model', () => ({
  init: jest.fn()
}));

jest.mock('../../src/models/character-type.model', () => ({
  init: jest.fn()
}));

jest.mock('../../src/models/haki-type.model', () => ({
  init: jest.fn()
}));

jest.mock('../../src/models/organization-type.model', () => ({
  init: jest.fn()
}));

jest.mock('../../src/models/race.model', () => ({
  init: jest.fn()
}));

jest.mock('../../src/models/character.model', () => ({
  init: jest.fn()
}));

jest.mock('../../src/models/devil-fruit.model', () => ({
  init: jest.fn()
}));

jest.mock('../../src/models/organization.model', () => ({
  init: jest.fn()
}));

jest.mock('../../src/models/ship.model', () => ({
  init: jest.fn()
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

describe('ShipController', () => {
  let shipService;
  let originalEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    shipService = require('../../src/services/ship.service');
    // Set NODE_ENV to development for tests
    originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });

  describe('GET /api/ships', () => {
    it('should return ships with default parameters', async () => {
      // Arrange
      const mockServiceResult = {
        success: true,
        data: [
          { id: 1, name: 'Thousand Sunny', status: 'active' },
          { id: 2, name: 'Going Merry', status: 'destroyed' }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      };
      shipService.getAllShips.mockResolvedValue(mockServiceResult);

      // Act
      const response = await request(app)
        .get('/api/ships')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.data,
        pagination: mockServiceResult.pagination,
        message: 'Ships retrieved successfully'
      });
      expect(shipService.getAllShips).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: undefined,
        search: undefined
      });
    });

    it('should handle query parameters correctly', async () => {
      // Arrange
      const mockServiceResult = {
        success: true,
        data: [{ id: 1, name: 'Thousand Sunny', status: 'active' }],
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: true
        }
      };
      shipService.getAllShips.mockResolvedValue(mockServiceResult);

      // Act
      const response = await request(app)
        .get('/api/ships?page=2&limit=10&status=active&search=Sunny')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.data,
        pagination: mockServiceResult.pagination,
        message: 'Ships retrieved successfully'
      });
      expect(shipService.getAllShips).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        status: 'active',
        search: 'Sunny'
      });
    });

    it('should return 400 for invalid page parameter', async () => {
      // Act
      const response = await request(app)
        .get('/api/ships?page=invalid')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Page must be a positive integer',
        error: 'Invalid page parameter'
      });
    });

    it('should return 400 for negative page parameter', async () => {
      // Act
      const response = await request(app)
        .get('/api/ships?page=-1')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Page must be a positive integer',
        error: 'Invalid page parameter'
      });
    });

    it('should return 400 for invalid limit parameter', async () => {
      // Act
      const response = await request(app)
        .get('/api/ships?limit=invalid')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Limit must be between 1 and 100',
        error: 'Invalid limit parameter'
      });
    });

    it('should return 400 for limit greater than 100', async () => {
      // Act
      const response = await request(app)
        .get('/api/ships?limit=150')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Limit must be between 1 and 100',
        error: 'Invalid limit parameter'
      });
    });

    it('should return 400 for invalid status filter', async () => {
      // Arrange
      shipService.getAllShips.mockRejectedValue(new Error('SHIP_INVALID_STATUS'));

      // Act
      const response = await request(app)
        .get('/api/ships?status=invalid')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid status filter. Must be active, destroyed, or retired',
        error: 'Invalid status parameter'
      });
    });

    it('should return 500 for service errors', async () => {
      // Arrange
      shipService.getAllShips.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app)
        .get('/api/ships')
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Failed to retrieve ships',
        error: 'Database connection failed'
      });
    });

    it('should return generic error in production', async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      shipService.getAllShips.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app)
        .get('/api/ships')
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Failed to retrieve ships',
        error: 'Internal server error'
      });

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('GET /api/ships/:id', () => {
    it('should return ship when found', async () => {
      // Arrange
      const mockServiceResult = {
        success: true,
        data: { id: 1, name: 'Thousand Sunny', status: 'active' }
      };
      shipService.getShipById.mockResolvedValue(mockServiceResult);

      // Act
      const response = await request(app)
        .get('/api/ships/1')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.data,
        message: 'Ship retrieved successfully'
      });
      expect(shipService.getShipById).toHaveBeenCalledWith(1);
    });

    it('should return 400 for invalid ID (string)', async () => {
      // Act
      const response = await request(app)
        .get('/api/ships/invalid')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid ship ID',
        error: 'ID must be a positive integer'
      });
    });

    it('should return 400 for invalid ID (negative)', async () => {
      // Act
      const response = await request(app)
        .get('/api/ships/-1')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid ship ID',
        error: 'ID must be a positive integer'
      });
    });

    it('should return 400 for invalid ID (zero)', async () => {
      // Act
      const response = await request(app)
        .get('/api/ships/0')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid ship ID',
        error: 'ID must be a positive integer'
      });
    });

    it('should return 404 when ship not found', async () => {
      // Arrange
      shipService.getShipById.mockResolvedValue({
        success: false,
        message: 'Ship not found',
        error: 'NOT_FOUND'
      });

      // Act
      const response = await request(app)
        .get('/api/ships/999')
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Ship not found',
        error: 'NOT_FOUND'
      });
    });

    it('should return 500 for service errors', async () => {
      // Arrange
      shipService.getShipById.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app)
        .get('/api/ships/1')
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
        error: 'Database connection failed'
      });
    });
  });

  describe('POST /api/ships', () => {
    it('should create ship successfully with valid data', async () => {
      // Arrange
      const shipData = {
        name: 'Thousand Sunny',
        description: 'Straw Hat Pirates ship',
        status: 'active',
        image_url: 'https://example.com/sunny.jpg'
      };
      const mockCreatedShip = { id: 1, ...shipData };
      shipService.createShip.mockResolvedValue(mockCreatedShip);

      // Act
      const response = await request(app)
        .post('/api/ships')
        .set('Authorization', 'Bearer valid-test-token')
        .send(shipData)
        .expect(201);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockCreatedShip,
        message: 'Ship created successfully'
      });
      expect(shipService.createShip).toHaveBeenCalledWith(shipData);
    });

    it('should create ship with only required fields', async () => {
      // Arrange
      const shipData = { name: 'Going Merry' };
      const mockCreatedShip = { id: 1, name: 'Going Merry', status: 'active' };
      shipService.createShip.mockResolvedValue(mockCreatedShip);

      // Act
      const response = await request(app)
        .post('/api/ships')
        .set('Authorization', 'Bearer valid-test-token')
        .send(shipData)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(shipService.createShip).toHaveBeenCalledWith(shipData);
    });

    it('should return 401 when no authentication provided', async () => {
      // Act
      const response = await request(app)
        .post('/api/ships')
        .send({ name: 'Test Ship' })
        .expect(401);

      // Assert
      expect(response.body.message).toContain('Authentication token not provided');
    });

    it('should return 401 when invalid token provided', async () => {
      // Act
      const response = await request(app)
        .post('/api/ships')
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'Test Ship' })
        .expect(401);

      // Assert
      expect(response.body.message).toContain('Invalid token');
    });

    it('should return 400 for missing name field', async () => {
      // Act
      const response = await request(app)
        .post('/api/ships')
        .set('Authorization', 'Bearer valid-test-token')
        .send({})
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Ship name is required',
        error: 'Name field is missing or invalid'
      });
    });

    it('should return 400 for empty name field', async () => {
      // Act
      const response = await request(app)
        .post('/api/ships')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: '' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Ship name is required',
        error: 'Name field is missing or invalid'
      });
    });

    it('should return 400 for whitespace-only name field', async () => {
      // Act
      const response = await request(app)
        .post('/api/ships')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: '   ' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Ship name is required',
        error: 'Name field is missing or invalid'
      });
    });

    it('should return 400 for invalid description type', async () => {
      // Act
      const response = await request(app)
        .post('/api/ships')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Test Ship', description: 123 })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Description must be a string',
        error: 'Invalid description field'
      });
    });

    it('should return 400 for invalid status', async () => {
      // Act
      const response = await request(app)
        .post('/api/ships')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Test Ship', status: 'invalid' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Status must be active, destroyed, or retired',
        error: 'Invalid status value'
      });
    });

    it('should return 400 for invalid image_url type', async () => {
      // Act
      const response = await request(app)
        .post('/api/ships')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Test Ship', image_url: 123 })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Image URL must be a string',
        error: 'Invalid image_url field'
      });
    });

    it('should return 409 for duplicate ship name', async () => {
      // Arrange
      shipService.createShip.mockRejectedValue(new Error('SHIP_NAME_EXISTS'));

      // Act
      const response = await request(app)
        .post('/api/ships')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Existing Ship' })
        .expect(409);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'A ship with this name already exists',
        error: 'Ship name must be unique'
      });
    });

    it('should return 500 for service errors', async () => {
      // Arrange
      shipService.createShip.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app)
        .post('/api/ships')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Test Ship' })
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Failed to create ship',
        error: 'Database connection failed'
      });
    });
  });

  describe('PUT /api/ships/:id', () => {
    it('should update ship successfully with valid data', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Ship',
        description: 'Updated description',
        status: 'destroyed'
      };
      const mockUpdatedShip = { id: 1, ...updateData };
      shipService.updateShip.mockResolvedValue({
        success: true,
        data: mockUpdatedShip
      });

      // Act
      const response = await request(app)
        .put('/api/ships/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockUpdatedShip,
        message: 'Ship updated successfully'
      });
      expect(shipService.updateShip).toHaveBeenCalledWith(1, updateData);
    });

    it('should return 401 when no authentication provided', async () => {
      // Act
      const response = await request(app)
        .put('/api/ships/1')
        .send({ name: 'Updated Ship' })
        .expect(401);

      // Assert
      expect(response.body.message).toContain('Authentication token not provided');
    });

    it('should return 400 for invalid ID', async () => {
      // Act
      const response = await request(app)
        .put('/api/ships/invalid')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated Ship' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid ship ID',
        error: 'ID must be a positive integer'
      });
    });

    it('should return 400 for empty request body', async () => {
      // Act
      const response = await request(app)
        .put('/api/ships/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({})
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'At least one field must be provided for update',
        error: 'Empty request body'
      });
    });

    it('should return 400 for invalid name field', async () => {
      // Act
      const response = await request(app)
        .put('/api/ships/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: '', description: 'Valid description' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Name must be a non-empty string',
        error: 'Invalid name field'
      });
    });

    it('should return 400 for invalid description type', async () => {
      // Act
      const response = await request(app)
        .put('/api/ships/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ description: 123 })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Description must be a string',
        error: 'Invalid description field'
      });
    });

    it('should return 400 for invalid status', async () => {
      // Act
      const response = await request(app)
        .put('/api/ships/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ status: 'invalid' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Status must be active, destroyed, or retired',
        error: 'Invalid status value'
      });
    });

    it('should return 400 for invalid image_url type', async () => {
      // Act
      const response = await request(app)
        .put('/api/ships/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ image_url: 123 })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Image URL must be a string',
        error: 'Invalid image_url field'
      });
    });

    it('should return 404 when ship not found', async () => {
      // Arrange
      shipService.updateShip.mockResolvedValue({
        success: false,
        message: 'Ship not found',
        error: 'NOT_FOUND'
      });

      // Act
      const response = await request(app)
        .put('/api/ships/999')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated Ship' })
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Ship not found',
        error: 'NOT_FOUND'
      });
    });

    it('should return 409 for duplicate ship name', async () => {
      // Arrange
      shipService.updateShip.mockRejectedValue(new Error('SHIP_NAME_EXISTS'));

      // Act
      const response = await request(app)
        .put('/api/ships/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Existing Ship' })
        .expect(409);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'A ship with this name already exists',
        error: 'Ship name must be unique'
      });
    });

    it('should handle partial updates', async () => {
      // Arrange
      const updateData = { status: 'destroyed' };
      const mockUpdatedShip = { id: 1, name: 'Original Name', status: 'destroyed' };
      shipService.updateShip.mockResolvedValue({
        success: true,
        data: mockUpdatedShip
      });

      // Act
      const response = await request(app)
        .put('/api/ships/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(shipService.updateShip).toHaveBeenCalledWith(1, updateData);
    });

    it('should handle null and undefined values', async () => {
      // Arrange
      const updateData = { name: 'Updated Name', description: 'Valid description', image_url: 'https://example.com/image.jpg' };
      const mockUpdatedShip = { id: 1, name: 'Updated Name', description: null, image_url: 'https://example.com/image.jpg' };
      shipService.updateShip.mockResolvedValue({
        success: true,
        data: mockUpdatedShip
      });

      // Act
      const response = await request(app)
        .put('/api/ships/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(shipService.updateShip).toHaveBeenCalledWith(1, updateData);
    });

    it('should return 500 for service errors', async () => {
      // Arrange
      shipService.updateShip.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app)
        .put('/api/ships/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated Ship' })
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Failed to update ship',
        error: 'Database connection failed'
      });
    });
  });

  describe('DELETE /api/ships/:id', () => {
    it('should delete ship successfully', async () => {
      // Arrange
      const mockServiceResult = {
        success: true,
        message: 'Ship deleted successfully'
      };
      shipService.deleteShip.mockResolvedValue(mockServiceResult);

      // Act
      const response = await request(app)
        .delete('/api/ships/1')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult,
        message: mockServiceResult.message
      });
      expect(shipService.deleteShip).toHaveBeenCalledWith(1);
    });

    it('should return 401 when no authentication provided', async () => {
      // Act
      const response = await request(app)
        .delete('/api/ships/1')
        .expect(401);

      // Assert
      expect(response.body.message).toContain('Authentication token not provided');
    });

    it('should return 400 for invalid ID', async () => {
      // Act
      const response = await request(app)
        .delete('/api/ships/invalid')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid ship ID',
        error: 'ID must be a positive integer'
      });
    });

    it('should return 404 when ship not found', async () => {
      // Arrange
      shipService.deleteShip.mockResolvedValue({
        success: false,
        message: 'Ship not found',
        error: 'NOT_FOUND'
      });

      // Act
      const response = await request(app)
        .delete('/api/ships/999')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Ship not found',
        error: 'NOT_FOUND'
      });
    });

    it('should return 409 when ship is in use', async () => {
      // Arrange
      shipService.deleteShip.mockRejectedValue(new Error('SHIP_IN_USE'));

      // Act
      const response = await request(app)
        .delete('/api/ships/1')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(409);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Cannot delete ship that is currently in use by an organization',
        error: 'Ship is associated with one or more organizations'
      });
    });

    it('should return 500 for service errors', async () => {
      // Arrange
      shipService.deleteShip.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app)
        .delete('/api/ships/1')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Failed to delete ship',
        error: 'Database connection failed'
      });
    });
  });

  describe('GET /api/ships/status/:status', () => {
    it('should return ships with valid status', async () => {
      // Arrange
      const mockServiceResult = [
        { id: 1, name: 'Thousand Sunny', status: 'active' },
        { id: 2, name: 'Going Merry', status: 'active' }
      ];
      shipService.getShipsByStatus.mockResolvedValue(mockServiceResult);

      // Act
      const response = await request(app)
        .get('/api/ships/status/active')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult,
        count: 2,
        message: 'Ships with status \'active\' retrieved successfully'
      });
      expect(shipService.getShipsByStatus).toHaveBeenCalledWith('active');
    });

    it('should return 400 for invalid status', async () => {
      // Act
      const response = await request(app)
        .get('/api/ships/status/invalid')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid status. Must be active, destroyed, or retired',
        error: 'Invalid status parameter'
      });
    });

    it('should return 500 for service errors', async () => {
      // Arrange
      shipService.getShipsByStatus.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app)
        .get('/api/ships/status/active')
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Failed to retrieve ships by status',
        error: 'Database connection failed'
      });
    });
  });
});
