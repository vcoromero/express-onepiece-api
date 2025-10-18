// CharacterType Controller Unit Tests
// Unit tests for CharacterType controller

const request = require('supertest');
const app = require('../../src/app');

// Mock the service
jest.mock('../../src/services/character-type.service', () => ({
  getAllCharacterTypes: jest.fn(),
  getCharacterTypeById: jest.fn(),
  updateCharacterType: jest.fn()
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

// Mock database configuration to prevent real connections
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

// Mock models to prevent DB connections
jest.mock('../../src/models', () => ({
  CharacterType: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Race: {
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
  HakiType: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

// Mock individual models
jest.mock('../../src/models/character-type.model', () => ({
  init: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
}));

jest.mock('../../src/models/race.model', () => ({
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

jest.mock('../../src/models/haki-type.model', () => ({
  init: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
}));

// Mock Sequelize to prevent initialization
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

describe('CharacterTypeController', () => {
  let characterTypeService;

  beforeEach(() => {
    jest.clearAllMocks();
    characterTypeService = require('../../src/services/character-type.service');
  });

  describe('GET /api/character-types', () => {
    it('should return all character types with default parameters', async () => {
      const mockServiceResult = {
        success: true,
        characterTypes: [
          { id: 1, name: 'Pirate', description: 'Sea-faring adventurers' },
          { id: 2, name: 'Marine', description: 'Military force of the World Government' }
        ]
      };

      characterTypeService.getAllCharacterTypes.mockResolvedValue(mockServiceResult);

      const response = await request(app)
        .get('/api/character-types')
        .expect(200);

      expect(characterTypeService.getAllCharacterTypes).toHaveBeenCalledWith({
        search: undefined,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.characterTypes,
        count: 2,
        message: 'Character types retrieved successfully'
      });
    });

    it('should handle query parameters correctly', async () => {
      const mockServiceResult = {
        success: true,
        characterTypes: []
      };

      characterTypeService.getAllCharacterTypes.mockResolvedValue(mockServiceResult);

      const response = await request(app)
        .get('/api/character-types?search=pirate&sortBy=created_at&sortOrder=desc')
        .expect(200);

      expect(characterTypeService.getAllCharacterTypes).toHaveBeenCalledWith({
        search: 'pirate',
        sortBy: 'created_at',
        sortOrder: 'desc'
      });
      expect(response.body).toEqual({
        success: true,
        data: [],
        count: 0,
        message: 'Character types retrieved successfully'
      });
    });

    it('should handle service errors', async () => {
      const mockError = {
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      };

      characterTypeService.getAllCharacterTypes.mockResolvedValue(mockError);

      const response = await request(app)
        .get('/api/character-types')
        .expect(500);

      expect(response.body).toEqual(mockError);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      characterTypeService.getAllCharacterTypes.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/character-types')
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
      characterTypeService.getAllCharacterTypes.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/character-types')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
        error: undefined
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('GET /api/character-types/:id', () => {
    it('should return character type when found', async () => {
      const mockServiceResult = {
        success: true,
        data: { id: 1, name: 'Pirate', description: 'Sea-faring adventurers' }
      };

      characterTypeService.getCharacterTypeById.mockResolvedValue(mockServiceResult);

      const response = await request(app)
        .get('/api/character-types/1')
        .expect(200);

      expect(characterTypeService.getCharacterTypeById).toHaveBeenCalledWith(1);
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.data,
        message: 'Character type retrieved successfully'
      });
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/character-types/invalid')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid character type ID',
        error: 'INVALID_ID'
      });
      expect(characterTypeService.getCharacterTypeById).not.toHaveBeenCalled();
    });

    it('should return 400 for negative ID', async () => {
      const response = await request(app)
        .get('/api/character-types/-1')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid character type ID',
        error: 'INVALID_ID'
      });
    });

    it('should return 400 for zero ID', async () => {
      const response = await request(app)
        .get('/api/character-types/0')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid character type ID',
        error: 'INVALID_ID'
      });
    });

    it('should return 404 when character type not found', async () => {
      const mockError = {
        success: false,
        message: 'Character type with ID 999 not found',
        error: 'NOT_FOUND'
      };

      characterTypeService.getCharacterTypeById.mockResolvedValue(mockError);

      const response = await request(app)
        .get('/api/character-types/999')
        .expect(404);

      expect(response.body).toEqual(mockError);
    });

    it('should return 500 for service errors', async () => {
      const mockError = {
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      };

      characterTypeService.getCharacterTypeById.mockResolvedValue(mockError);

      const response = await request(app)
        .get('/api/character-types/1')
        .expect(500);

      expect(response.body).toEqual(mockError);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      characterTypeService.getCharacterTypeById.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/character-types/1')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
        error: undefined
      });
    });
  });

  describe('PUT /api/character-types/:id', () => {
    it('should update character type successfully', async () => {
      const updateData = {
        name: 'Advanced Pirate',
        description: 'Elite sea-faring adventurers'
      };

      const mockResult = {
        success: true,
        data: { id: 1, name: 'Advanced Pirate' },
        message: 'Character type updated successfully'
      };

      characterTypeService.updateCharacterType.mockResolvedValue(mockResult);

      const response = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send(updateData)
        .expect(200);

      expect(characterTypeService.updateCharacterType).toHaveBeenCalledWith(1, updateData);
      expect(response.body).toEqual(mockResult);
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .put('/api/character-types/invalid')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid character type ID',
        error: 'INVALID_ID'
      });
      expect(characterTypeService.updateCharacterType).not.toHaveBeenCalled();
    });

    it('should handle empty request body', async () => {
      const mockError = {
        success: false,
        message: 'At least one field must be provided for update',
        error: 'NO_FIELDS_PROVIDED'
      };

      characterTypeService.updateCharacterType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({})
        .expect(400);

      expect(response.body).toEqual(mockError);
    });

    it('should return 404 when character type not found', async () => {
      const mockError = {
        success: false,
        message: 'Character type with ID 999 not found',
        error: 'NOT_FOUND'
      };

      characterTypeService.updateCharacterType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/character-types/999')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body).toEqual(mockError);
    });

    it('should return 400 for no fields provided', async () => {
      const mockError = {
        success: false,
        message: 'At least one field must be provided for update',
        error: 'NO_FIELDS_PROVIDED'
      };

      characterTypeService.updateCharacterType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({})
        .expect(400);

      expect(response.body).toEqual(mockError);
    });

    it('should return 400 for invalid name', async () => {
      const mockError = {
        success: false,
        message: 'Name cannot be empty',
        error: 'INVALID_NAME'
      };

      characterTypeService.updateCharacterType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: '' })
        .expect(400);

      expect(response.body).toEqual(mockError);
    });

    it('should return 409 for duplicate name', async () => {
      const mockError = {
        success: false,
        message: 'A character type with this name already exists',
        error: 'DUPLICATE_NAME'
      };

      characterTypeService.updateCharacterType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Duplicate Name' })
        .expect(409);

      expect(response.body).toEqual(mockError);
    });

    it('should return 500 for service errors', async () => {
      const mockError = {
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      };

      characterTypeService.updateCharacterType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Valid Name' })
        .expect(500);

      expect(response.body).toEqual(mockError);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      characterTypeService.updateCharacterType.mockRejectedValue(error);

      const response = await request(app)
        .put('/api/character-types/1')
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
      const mockResult = {
        success: true,
        data: { id: 1, description: 'Updated description' },
        message: 'Character type updated successfully'
      };

      characterTypeService.updateCharacterType.mockResolvedValue(mockResult);

      const response = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ description: 'Updated description' })
        .expect(200);

      expect(characterTypeService.updateCharacterType).toHaveBeenCalledWith(1, {
        description: 'Updated description'
      });
      expect(response.body).toEqual(mockResult);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/character-types/1')
        .send({ name: 'Updated Character Type' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication token not provided');
    });
  });
});
