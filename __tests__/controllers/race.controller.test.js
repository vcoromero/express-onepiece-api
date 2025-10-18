// Race Controller Unit Tests
// Unit tests for Race controller

const request = require('supertest');
const app = require('../../src/app');

// Mock the service
jest.mock('../../src/services/race.service', () => ({
  getAllRaces: jest.fn(),
  getRaceById: jest.fn(),
  updateRace: jest.fn()
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

describe('RaceController', () => {
  let raceService;

  beforeEach(() => {
    jest.clearAllMocks();
    raceService = require('../../src/services/race.service');
  });

  describe('GET /api/races', () => {
    it('should return all races with default parameters', async () => {
      const mockServiceResult = {
        success: true,
        races: [
          { id: 1, name: 'Human', description: 'Standard human race' },
          { id: 2, name: 'Fishman', description: 'Aquatic humanoid race' }
        ]
      };

      raceService.getAllRaces.mockResolvedValue(mockServiceResult);

      const response = await request(app)
        .get('/api/races')
        .expect(200);

      expect(raceService.getAllRaces).toHaveBeenCalledWith({
        search: undefined,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.races,
        count: 2,
        message: 'Races retrieved successfully'
      });
    });

    it('should handle query parameters correctly', async () => {
      const mockServiceResult = {
        success: true,
        races: []
      };

      raceService.getAllRaces.mockResolvedValue(mockServiceResult);

      const response = await request(app)
        .get('/api/races?search=human&sortBy=created_at&sortOrder=desc')
        .expect(200);

      expect(raceService.getAllRaces).toHaveBeenCalledWith({
        search: 'human',
        sortBy: 'created_at',
        sortOrder: 'desc'
      });
      expect(response.body).toEqual({
        success: true,
        data: [],
        count: 0,
        message: 'Races retrieved successfully'
      });
    });

    it('should handle service errors', async () => {
      const mockError = {
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      };

      raceService.getAllRaces.mockResolvedValue(mockError);

      const response = await request(app)
        .get('/api/races')
        .expect(500);

      expect(response.body).toEqual(mockError);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      raceService.getAllRaces.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/races')
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
      raceService.getAllRaces.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/races')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
        error: undefined
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('GET /api/races/:id', () => {
    it('should return race when found', async () => {
      const mockServiceResult = {
        success: true,
        data: { id: 1, name: 'Human', description: 'Standard human race' }
      };

      raceService.getRaceById.mockResolvedValue(mockServiceResult);

      const response = await request(app)
        .get('/api/races/1')
        .expect(200);

      expect(raceService.getRaceById).toHaveBeenCalledWith(1);
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.data,
        message: 'Race retrieved successfully'
      });
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/races/invalid')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid race ID',
        error: 'INVALID_ID'
      });
      expect(raceService.getRaceById).not.toHaveBeenCalled();
    });

    it('should return 400 for negative ID', async () => {
      const response = await request(app)
        .get('/api/races/-1')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid race ID',
        error: 'INVALID_ID'
      });
    });

    it('should return 400 for zero ID', async () => {
      const response = await request(app)
        .get('/api/races/0')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid race ID',
        error: 'INVALID_ID'
      });
    });

    it('should return 404 when race not found', async () => {
      const mockError = {
        success: false,
        message: 'Race with ID 999 not found',
        error: 'NOT_FOUND'
      };

      raceService.getRaceById.mockResolvedValue(mockError);

      const response = await request(app)
        .get('/api/races/999')
        .expect(404);

      expect(response.body).toEqual(mockError);
    });

    it('should return 500 for service errors', async () => {
      const mockError = {
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      };

      raceService.getRaceById.mockResolvedValue(mockError);

      const response = await request(app)
        .get('/api/races/1')
        .expect(500);

      expect(response.body).toEqual(mockError);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      raceService.getRaceById.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/races/1')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
        error: undefined
      });
    });
  });

  describe('PUT /api/races/:id', () => {
    it('should update race successfully', async () => {
      const updateData = {
        name: 'Advanced Human',
        description: 'Enhanced human race'
      };

      const mockServiceResult = {
        success: true,
        data: { id: 1, name: 'Advanced Human' }
      };

      raceService.updateRace.mockResolvedValue(mockServiceResult);

      const response = await request(app)
        .put('/api/races/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send(updateData)
        .expect(200);

      expect(raceService.updateRace).toHaveBeenCalledWith(1, updateData);
      expect(response.body).toEqual({
        success: true,
        message: 'Race updated successfully'
      });
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .put('/api/races/invalid')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid race ID',
        error: 'INVALID_ID'
      });
      expect(raceService.updateRace).not.toHaveBeenCalled();
    });

    it('should handle empty request body', async () => {
      const mockError = {
        success: false,
        message: 'At least one field must be provided for update',
        error: 'NO_FIELDS_PROVIDED'
      };

      raceService.updateRace.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/races/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({})
        .expect(400);

      expect(response.body).toEqual(mockError);
    });

    it('should return 404 when race not found', async () => {
      const mockError = {
        success: false,
        message: 'Race with ID 999 not found',
        error: 'NOT_FOUND'
      };

      raceService.updateRace.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/races/999')
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

      raceService.updateRace.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/races/1')
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

      raceService.updateRace.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/races/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: '' })
        .expect(400);

      expect(response.body).toEqual(mockError);
    });

    it('should return 409 for duplicate name', async () => {
      const mockError = {
        success: false,
        message: 'A race with this name already exists',
        error: 'DUPLICATE_NAME'
      };

      raceService.updateRace.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/races/1')
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

      raceService.updateRace.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/races/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Valid Name' })
        .expect(500);

      expect(response.body).toEqual(mockError);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      raceService.updateRace.mockRejectedValue(error);

      const response = await request(app)
        .put('/api/races/1')
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
        data: { id: 1, description: 'Updated description' }
      };

      raceService.updateRace.mockResolvedValue(mockServiceResult);

      const response = await request(app)
        .put('/api/races/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ description: 'Updated description' })
        .expect(200);

      expect(raceService.updateRace).toHaveBeenCalledWith(1, {
        description: 'Updated description'
      });
      expect(response.body).toEqual({
        success: true,
        message: 'Race updated successfully'
      });
    });
  });
});
