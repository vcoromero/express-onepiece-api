// HakiType Controller Unit Tests
// Unit tests for Haki Type controller

const request = require('supertest');
const app = require('../../src/app');

// Mock the service
jest.mock('../../src/services/haki-type.service', () => ({
  getAllHakiTypes: jest.fn(),
  getHakiTypeById: jest.fn(),
  updateHakiType: jest.fn()
}));

// Mock JWTUtil for authentication
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

// Mock models to avoid DB connections
jest.mock('../../src/models', () => ({
  HakiType: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  DevilFruit: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  FruitType: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  DevilFruitType: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

// Mock individual models
jest.mock('../../src/models/haki-type.model', () => ({
  init: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
}));

jest.mock('../../src/models/devil-fruit.model', () => ({
  init: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
}));

jest.mock('../../src/models/fruit-type.model', () => ({
  init: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
}));

// Mock Sequelize to avoid initialization
jest.mock('sequelize', () => {
  const Sequelize = jest.fn(() => ({
    define: jest.fn(),
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true)
  }));
  
  Sequelize.Op = {
    or: Symbol('or'),
    like: Symbol('like'),
    ne: Symbol('ne'),
    iLike: Symbol('iLike'),
    and: Symbol('and')
  };
  
  return Sequelize;
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

describe('HakiTypeController', () => {
  let hakiTypeService;

  beforeEach(() => {
    jest.clearAllMocks();
    hakiTypeService = require('../../src/services/haki-type.service');
  });

  describe('GET /api/haki-types', () => {
    it('should return all Haki types with default parameters', async () => {
      const mockServiceResult = {
        success: true,
        hakiTypes: [
          { id: 1, name: 'Observation Haki', color: 'Red' },
          { id: 2, name: 'Armament Haki', color: 'Black' }
        ]
      };

      hakiTypeService.getAllHakiTypes.mockResolvedValue(mockServiceResult);

      const response = await request(app)
        .get('/api/haki-types')
        .expect(200);

      expect(hakiTypeService.getAllHakiTypes).toHaveBeenCalledWith({
        search: undefined,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.hakiTypes,
        count: 2,
        message: 'Haki types retrieved successfully'
      });
    });

    it('should handle query parameters correctly', async () => {
      const mockServiceResult = {
        success: true,
        hakiTypes: []
      };

      hakiTypeService.getAllHakiTypes.mockResolvedValue(mockServiceResult);

      const response = await request(app)
        .get('/api/haki-types?search=observation&sortBy=color&sortOrder=desc')
        .expect(200);

      expect(hakiTypeService.getAllHakiTypes).toHaveBeenCalledWith({
        search: 'observation',
        sortBy: 'color',
        sortOrder: 'desc'
      });
      expect(response.body).toEqual({
        success: true,
        data: [],
        count: 0,
        message: 'Haki types retrieved successfully'
      });
    });

    it('should handle service errors', async () => {
      const mockError = {
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      };

      hakiTypeService.getAllHakiTypes.mockResolvedValue(mockError);

      const response = await request(app)
        .get('/api/haki-types')
        .expect(500);

      expect(response.body).toEqual(mockError);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      hakiTypeService.getAllHakiTypes.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/haki-types')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
        error: undefined
      });
    });

    it('should not expose error details in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Unexpected error');
      hakiTypeService.getAllHakiTypes.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/haki-types')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
        error: undefined
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('GET /api/haki-types/:id', () => {
    it('should return Haki type when found', async () => {
      const mockServiceResult = {
        success: true,
        data: { hakiType: { id: 1, name: 'Observation Haki' } }
      };

      hakiTypeService.getHakiTypeById.mockResolvedValue(mockServiceResult);

      const response = await request(app)
        .get('/api/haki-types/1')
        .expect(200);

      expect(hakiTypeService.getHakiTypeById).toHaveBeenCalledWith('1');
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.data,
        message: 'Haki type retrieved successfully'
      });
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/haki-types/invalid')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid Haki type ID',
        error: 'INVALID_ID'
      });
      expect(hakiTypeService.getHakiTypeById).not.toHaveBeenCalled();
    });

    it('should return 400 for negative ID', async () => {
      await request(app)
        .get('/api/haki-types/-1')
        .expect(400);
    });

    it('should return 400 for zero ID', async () => {
      await request(app)
        .get('/api/haki-types/0')
        .expect(400);
    });

    it('should return 404 when Haki type not found', async () => {
      const mockError = {
        success: false,
        message: 'Haki type not found',
        error: 'NOT_FOUND'
      };

      hakiTypeService.getHakiTypeById.mockResolvedValue(mockError);

      const response = await request(app)
        .get('/api/haki-types/999')
        .expect(404);

      expect(response.body).toEqual(mockError);
    });

    it('should return 500 for service errors', async () => {
      const mockError = {
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      };

      hakiTypeService.getHakiTypeById.mockResolvedValue(mockError);

      const response = await request(app)
        .get('/api/haki-types/1')
        .expect(500);

      expect(response.body).toEqual(mockError);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      hakiTypeService.getHakiTypeById.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/haki-types/1')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
        error: undefined
      });
    });
  });

  describe('PUT /api/haki-types/:id', () => {
    it('should update Haki type successfully', async () => {
      const updateData = {
        name: 'Advanced Observation Haki',
        description: 'Enhanced version',
        color: 'Dark Red'
      };

      const mockServiceResult = {
        success: true,
        data: { hakiType: { id: 1, name: 'Advanced Observation Haki' } }
      };

      hakiTypeService.updateHakiType.mockResolvedValue(mockServiceResult);

      const response = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send(updateData)
        .expect(200);

      expect(hakiTypeService.updateHakiType).toHaveBeenCalledWith('1', updateData);
      expect(response.body).toEqual({
        success: true,
        message: 'Haki type updated successfully'
      });
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .put('/api/haki-types/invalid')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid Haki type ID',
        error: 'INVALID_ID'
      });
      expect(hakiTypeService.updateHakiType).not.toHaveBeenCalled();
    });

    it('should return 400 when no fields provided for update', async () => {
      const response = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'At least one field (name, description, color) must be provided for update',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 when all fields are undefined', async () => {
      await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({
          name: undefined,
          description: undefined,
          color: undefined
        })
        .expect(400);
    });

    it('should validate name field type', async () => {
      const response = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 123 })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Name must be a non-empty string',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should validate empty name string', async () => {
      const response = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: '' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'At least one field (name, description, color) must be provided for update',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should validate whitespace-only name string', async () => {
      await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: '   ' })
        .expect(400);
    });

    it('should validate description field type', async () => {
      const response = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ description: 123 })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Description must be a string',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should validate color field type', async () => {
      const response = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ color: 123 })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Color must be a string',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should allow valid string fields', async () => {
      const mockResult = {
        success: true,
        data: { hakiType: { id: 1 } },
        message: 'Haki type updated successfully'
      };

      hakiTypeService.updateHakiType.mockResolvedValue(mockResult);

      await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({
          name: 'Valid Name',
          description: 'Valid description',
          color: 'Valid color'
        })
        .expect(200);
    });

    it('should return 404 when Haki type not found', async () => {
      const mockError = {
        success: false,
        message: 'Haki type not found',
        error: 'NOT_FOUND'
      };

      hakiTypeService.updateHakiType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/haki-types/999')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body).toEqual(mockError);
    });

    it('should return 409 for duplicate name', async () => {
      const mockError = {
        success: false,
        message: 'A Haki type with this name already exists',
        error: 'DUPLICATE_NAME'
      };

      hakiTypeService.updateHakiType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Duplicate Name' })
        .expect(409);

      expect(response.body).toEqual(mockError);
    });

    it('should return 400 for validation errors', async () => {
      const mockError = {
        success: false,
        message: 'Validation error: Name cannot be empty',
        error: 'VALIDATION_ERROR'
      };

      hakiTypeService.updateHakiType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Valid Name' })
        .expect(400);

      expect(response.body).toEqual(mockError);
    });

    it('should return 500 for service errors', async () => {
      const mockError = {
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      };

      hakiTypeService.updateHakiType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Valid Name' })
        .expect(500);

      expect(response.body).toEqual(mockError);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      hakiTypeService.updateHakiType.mockRejectedValue(error);

      const response = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Valid Name' })
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
        error: undefined
      });
    });

    it('should handle partial updates correctly', async () => {
      const mockServiceResult = {
        success: true,
        data: { hakiType: { id: 1, color: 'Blue' } }
      };

      hakiTypeService.updateHakiType.mockResolvedValue(mockServiceResult);

      const response = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ color: 'Blue' })
        .expect(200);

      expect(hakiTypeService.updateHakiType).toHaveBeenCalledWith('1', {
        color: 'Blue'
      });
      expect(response.body).toEqual({
        success: true,
        message: 'Haki type updated successfully'
      });
    });

    it('should handle null and undefined values correctly', async () => {
      const mockServiceResult = {
        success: true,
        data: { hakiType: { id: 1 } }
      };

      hakiTypeService.updateHakiType.mockResolvedValue(mockServiceResult);

      const response = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({
          name: 'Valid Name',
          description: 'Valid description',
          color: 'Valid color'
        })
        .expect(200);

      expect(hakiTypeService.updateHakiType).toHaveBeenCalledWith('1', {
        name: 'Valid Name',
        description: 'Valid description',
        color: 'Valid color'
      });
      expect(response.body).toEqual({
        success: true,
        message: 'Haki type updated successfully'
      });
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/haki-types/1')
        .send({ name: 'Updated Haki' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication token not provided');
    });
  });
});
