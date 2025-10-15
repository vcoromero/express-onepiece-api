const request = require('supertest');
const app = require('../../src/app');

// Mock the service
jest.mock('../../src/services/organization-type.service', () => ({
  getAllOrganizationTypes: jest.fn(),
  getOrganizationTypeById: jest.fn(),
  updateOrganizationType: jest.fn()
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
  OrganizationType: {
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
    findOne: jest.fn()
  },
  FruitType: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn()
  },
  DevilFruitType: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn()
  }
}));

// Mock individual model files
jest.mock('../../src/models/organization-type.model', () => ({
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
  findOne: jest.fn()
}));

jest.mock('../../src/models/fruit-type.model', () => ({
  init: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn()
}));

jest.mock('../../src/models/haki-type.model', () => ({
  init: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn()
}));

// Mock sequelize to avoid initialization issues
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

describe('OrganizationTypeController', () => {
  let organizationTypeService;

  beforeEach(() => {
    jest.clearAllMocks();
    organizationTypeService = require('../../src/services/organization-type.service');
  });

  describe('GET /api/organization-types', () => {
    it('should return all organization types with default parameters', async () => {
      const mockResult = {
        success: true,
        data: {
          organizationTypes: [
            { id: 1, name: 'Pirate Crew', description: 'A group of pirates' },
            { id: 2, name: 'Marine', description: 'Navy organization' }
          ],
          total: 2
        }
      };

      organizationTypeService.getAllOrganizationTypes.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/organization-types')
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(organizationTypeService.getAllOrganizationTypes).toHaveBeenCalledWith({
        search: undefined,
        sortBy: 'name',
        sortOrder: 'asc'
      });
    });

    it('should handle query parameters correctly', async () => {
      const mockResult = {
        success: true,
        data: {
          organizationTypes: [
            { id: 1, name: 'Pirate Crew', description: 'A group of pirates' }
          ],
          total: 1
        }
      };

      organizationTypeService.getAllOrganizationTypes.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/organization-types?search=pirate&sortBy=created_at&sortOrder=desc')
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(organizationTypeService.getAllOrganizationTypes).toHaveBeenCalledWith({
        search: 'pirate',
        sortBy: 'created_at',
        sortOrder: 'desc'
      });
    });

    it('should handle service errors', async () => {
      const mockError = {
        success: false,
        message: 'Failed to fetch organization types',
        error: 'DATABASE_ERROR'
      };

      organizationTypeService.getAllOrganizationTypes.mockResolvedValue(mockError);

      const response = await request(app)
        .get('/api/organization-types')
        .expect(500);

      expect(response.body).toEqual(mockError);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      organizationTypeService.getAllOrganizationTypes.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/organization-types')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
        error: undefined
      });
    });

    it('should handle different environments correctly', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Unexpected error');
      organizationTypeService.getAllOrganizationTypes.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/organization-types')
        .expect(500);

      expect(response.body.error).toBe('Unexpected error');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('GET /api/organization-types/:id', () => {
    it('should return organization type when found', async () => {
      const mockResult = {
        success: true,
        data: {
          id: 1,
          name: 'Pirate Crew',
          description: 'A group of pirates'
        }
      };

      organizationTypeService.getOrganizationTypeById.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/organization-types/1')
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(organizationTypeService.getOrganizationTypeById).toHaveBeenCalledWith(1);
    });

    it('should return 400 for invalid ID (string)', async () => {
      const response = await request(app)
        .get('/api/organization-types/invalid')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid organization type ID',
        error: 'INVALID_ID'
      });
      expect(organizationTypeService.getOrganizationTypeById).not.toHaveBeenCalled();
    });

    it('should return 400 for negative ID', async () => {
      const response = await request(app)
        .get('/api/organization-types/-1')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid organization type ID',
        error: 'INVALID_ID'
      });
      expect(organizationTypeService.getOrganizationTypeById).not.toHaveBeenCalled();
    });

    it('should return 400 for zero ID', async () => {
      const response = await request(app)
        .get('/api/organization-types/0')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid organization type ID',
        error: 'INVALID_ID'
      });
      expect(organizationTypeService.getOrganizationTypeById).not.toHaveBeenCalled();
    });

    it('should return 404 when organization type not found', async () => {
      const mockError = {
        success: false,
        message: 'Organization type with ID 999 not found',
        error: 'NOT_FOUND'
      };

      organizationTypeService.getOrganizationTypeById.mockResolvedValue(mockError);

      const response = await request(app)
        .get('/api/organization-types/999')
        .expect(404);

      expect(response.body).toEqual(mockError);
    });

    it('should return 500 for service errors', async () => {
      const mockError = {
        success: false,
        message: 'Failed to fetch organization type',
        error: 'DATABASE_ERROR'
      };

      organizationTypeService.getOrganizationTypeById.mockResolvedValue(mockError);

      const response = await request(app)
        .get('/api/organization-types/1')
        .expect(500);

      expect(response.body).toEqual(mockError);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      organizationTypeService.getOrganizationTypeById.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/organization-types/1')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
        error: undefined
      });
    });
  });

  describe('PUT /api/organization-types/:id', () => {
    it('should update organization type successfully', async () => {
      const updateData = { name: 'Updated Pirate Crew' };
      const mockResult = {
        success: true,
        data: {
          id: 1,
          name: 'Updated Pirate Crew',
          description: 'A group of pirates'
        },
        message: 'Organization type updated successfully'
      };

      organizationTypeService.updateOrganizationType.mockResolvedValue(mockResult);

      const response = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(organizationTypeService.updateOrganizationType).toHaveBeenCalledWith(1, updateData);
    });

    it('should return 400 for invalid ID (string)', async () => {
      const response = await request(app)
        .put('/api/organization-types/invalid')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid organization type ID',
        error: 'INVALID_ID'
      });
      expect(organizationTypeService.updateOrganizationType).not.toHaveBeenCalled();
    });

    it('should return 400 for negative ID', async () => {
      const response = await request(app)
        .put('/api/organization-types/-1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid organization type ID',
        error: 'INVALID_ID'
      });
      expect(organizationTypeService.updateOrganizationType).not.toHaveBeenCalled();
    });

    it('should return 400 for zero ID', async () => {
      const response = await request(app)
        .put('/api/organization-types/0')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid organization type ID',
        error: 'INVALID_ID'
      });
      expect(organizationTypeService.updateOrganizationType).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid request body', async () => {
      const mockError = {
        success: false,
        message: 'At least one field must be provided for update',
        error: 'NO_FIELDS_PROVIDED'
      };

      organizationTypeService.updateOrganizationType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({})
        .expect(400);

      expect(response.body).toEqual(mockError);
      expect(organizationTypeService.updateOrganizationType).toHaveBeenCalledWith(1, {});
    });

    it('should return 400 for empty request body', async () => {
      const mockError = {
        success: false,
        message: 'At least one field must be provided for update',
        error: 'NO_FIELDS_PROVIDED'
      };

      organizationTypeService.updateOrganizationType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({})
        .expect(400);

      expect(response.body).toEqual(mockError);
    });

    it('should return 404 when organization type not found', async () => {
      const mockError = {
        success: false,
        message: 'Organization type with ID 999 not found',
        error: 'NOT_FOUND'
      };

      organizationTypeService.updateOrganizationType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/organization-types/999')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body).toEqual(mockError);
    });

    it('should return 409 for duplicate name', async () => {
      const mockError = {
        success: false,
        message: 'An organization type with this name already exists',
        error: 'DUPLICATE_NAME'
      };

      organizationTypeService.updateOrganizationType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Existing Name' })
        .expect(409);

      expect(response.body).toEqual(mockError);
    });

    it('should return 400 for validation errors', async () => {
      const mockError = {
        success: false,
        message: 'Name cannot be empty',
        error: 'INVALID_NAME'
      };

      organizationTypeService.updateOrganizationType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: '' })
        .expect(400);

      expect(response.body).toEqual(mockError);
    });

    it('should return 500 for service errors', async () => {
      const mockError = {
        success: false,
        message: 'Failed to update organization type',
        error: 'DATABASE_ERROR'
      };

      organizationTypeService.updateOrganizationType.mockResolvedValue(mockError);

      const response = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(500);

      expect(response.body).toEqual(mockError);
    });

    it('should handle unexpected errors', async () => {
      const error = new Error('Unexpected error');
      organizationTypeService.updateOrganizationType.mockRejectedValue(error);

      const response = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
        error: undefined
      });
    });

    it('should handle partial updates', async () => {
      const updateData = { description: 'Updated description' };
      const mockResult = {
        success: true,
        data: {
          id: 1,
          name: 'Pirate Crew',
          description: 'Updated description'
        },
        message: 'Organization type updated successfully'
      };

      organizationTypeService.updateOrganizationType.mockResolvedValue(mockResult);

      const response = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(organizationTypeService.updateOrganizationType).toHaveBeenCalledWith(1, updateData);
    });

    it('should handle null values in update data', async () => {
      const updateData = { description: null };
      const mockResult = {
        success: true,
        data: {
          id: 1,
          name: 'Pirate Crew',
          description: null
        },
        message: 'Organization type updated successfully'
      };

      organizationTypeService.updateOrganizationType.mockResolvedValue(mockResult);

      const response = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockResult);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/organization-types/1')
        .send({ name: 'Updated' })
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Authentication token not provided',
        error: 'Authorization header not found'
      });
    });

    it('should handle invalid token', async () => {
      const response = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'Updated' })
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid token',
        error: 'The provided token is not valid'
      });
    });
  });
});
