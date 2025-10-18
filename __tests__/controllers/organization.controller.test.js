const request = require('supertest');
const app = require('../../src/app');

// Mock of service
jest.mock('../../src/services/organization.service', () => ({
  getAllOrganizations: jest.fn(),
  getOrganizationById: jest.fn(),
  createOrganization: jest.fn(),
  updateOrganization: jest.fn(),
  deleteOrganization: jest.fn(),
  getOrganizationsByType: jest.fn(),
  getOrganizationMembers: jest.fn()
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
  Organization: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  OrganizationType: {
    count: jest.fn()
  },
  Character: {
    count: jest.fn()
  },
  Ship: {
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

jest.mock('../../src/models/character-character-type.model', () => ({
  init: jest.fn()
}));

jest.mock('../../src/models/character-devil-fruit.model', () => ({
  init: jest.fn()
}));

jest.mock('../../src/models/character-haki.model', () => ({
  init: jest.fn()
}));

jest.mock('../../src/models/character-organization.model', () => ({
  init: jest.fn()
}));

// Mock of console to avoid logs in tests
const originalConsole = global.console;
beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  };
});

afterAll(() => {
  global.console = originalConsole;
});

const OrganizationService = require('../../src/services/organization.service');

describe('OrganizationController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/organizations', () => {
    it('should return 200 with organizations list', async () => {
      // Arrange
      const mockOrganizations = [
        { id: 1, name: 'Straw Hat Pirates', status: 'active' },
        { id: 2, name: 'Marine', status: 'active' }
      ];
      const mockServiceResult = {
        success: true,
        organizations: [
          { id: 1, name: 'Straw Hat Pirates', status: 'active' },
          { id: 2, name: 'Marine', status: 'active' }
        ],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1, hasNext: false, hasPrev: false }
      };
      OrganizationService.getAllOrganizations.mockResolvedValue(mockServiceResult);

      // Act
      const response = await request(app)
        .get('/api/organizations')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.organizations,
        pagination: mockServiceResult.pagination,
        message: 'Organizations retrieved successfully'
      });
      expect(OrganizationService.getAllOrganizations).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        status: undefined,
        organizationTypeId: undefined,
        sortBy: 'name',
        sortOrder: 'ASC'
      });
    });

    it('should return 400 for invalid status parameter', async () => {
      // Act
      const response = await request(app)
        .get('/api/organizations?status=invalid')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid status. Must be active, disbanded, or destroyed',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for invalid organizationTypeId parameter', async () => {
      // Act
      const response = await request(app)
        .get('/api/organizations?organizationTypeId=invalid')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid organization type ID',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should handle valid status parameter', async () => {
      // Arrange
      const mockServiceResult = {
        success: true,
        organizations: [{ id: 1, name: 'Straw Hat Pirates', status: 'active' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false }
      };
      OrganizationService.getAllOrganizations.mockResolvedValue(mockServiceResult);

      // Act
      const response = await request(app)
        .get('/api/organizations?status=active')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.organizations,
        pagination: mockServiceResult.pagination,
        message: 'Organizations retrieved successfully'
      });
      expect(OrganizationService.getAllOrganizations).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        status: 'active',
        organizationTypeId: undefined,
        sortBy: 'name',
        sortOrder: 'ASC'
      });
    });

    it('should handle valid organizationTypeId parameter', async () => {
      // Arrange
      const mockServiceResult = {
        success: true,
        organizations: [{ id: 1, name: 'Straw Hat Pirates' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false }
      };
      OrganizationService.getAllOrganizations.mockResolvedValue(mockServiceResult);

      // Act
      const response = await request(app)
        .get('/api/organizations?organizationTypeId=1')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.organizations,
        pagination: mockServiceResult.pagination,
        message: 'Organizations retrieved successfully'
      });
      expect(OrganizationService.getAllOrganizations).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        status: undefined,
        organizationTypeId: 1,
        sortBy: 'name',
        sortOrder: 'ASC'
      });
    });

    it('should handle search parameter', async () => {
      // Arrange
      const mockServiceResult = {
        success: true,
        organizations: [{ id: 1, name: 'Straw Hat Pirates' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false }
      };
      OrganizationService.getAllOrganizations.mockResolvedValue(mockServiceResult);

      // Act
      const response = await request(app)
        .get('/api/organizations?search=Straw')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.organizations,
        pagination: mockServiceResult.pagination,
        message: 'Organizations retrieved successfully'
      });
      expect(OrganizationService.getAllOrganizations).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'Straw',
        status: undefined,
        organizationTypeId: undefined,
        sortBy: 'name',
        sortOrder: 'ASC'
      });
    });

    it('should handle pagination parameters', async () => {
      // Arrange
      const mockServiceResult = {
        success: true,
        organizations: [{ id: 1, name: 'Straw Hat Pirates' }],
        pagination: { page: 2, limit: 5, total: 1, totalPages: 1, hasNext: false, hasPrev: false }
      };
      OrganizationService.getAllOrganizations.mockResolvedValue(mockServiceResult);

      // Act
      const response = await request(app)
        .get('/api/organizations?page=2&limit=5')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.organizations,
        pagination: mockServiceResult.pagination,
        message: 'Organizations retrieved successfully'
      });
      expect(OrganizationService.getAllOrganizations).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        search: undefined,
        status: undefined,
        organizationTypeId: undefined,
        sortBy: 'name',
        sortOrder: 'ASC'
      });
    });

    it('should handle sort parameters', async () => {
      // Arrange
      const mockServiceResult = {
        success: true,
        organizations: [{ id: 1, name: 'Straw Hat Pirates' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false }
      };
      OrganizationService.getAllOrganizations.mockResolvedValue(mockServiceResult);

      // Act
      const response = await request(app)
        .get('/api/organizations?sortBy=totalBounty&sortOrder=DESC')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.organizations,
        pagination: mockServiceResult.pagination,
        message: 'Organizations retrieved successfully'
      });
      expect(OrganizationService.getAllOrganizations).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        status: undefined,
        organizationTypeId: undefined,
        sortBy: 'totalBounty',
        sortOrder: 'DESC'
      });
    });
  });

  describe('GET /api/organizations/:id', () => {
    it('should return 200 with organization details', async () => {
      // Arrange
      const mockOrganization = {
        id: 1,
        name: 'Straw Hat Pirates',
        status: 'active',
        organizationType: { name: 'Pirate Crew' },
        leader: { name: 'Monkey D. Luffy' }
      };
      const mockServiceResult = {
        success: true,
        data: mockOrganization
      };
      OrganizationService.getOrganizationById.mockResolvedValue(mockServiceResult);

      // Act
      const response = await request(app)
        .get('/api/organizations/1')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.data,
        message: 'Organization retrieved successfully'
      });
      expect(OrganizationService.getOrganizationById).toHaveBeenCalledWith(1);
    });

    it('should return 400 for invalid organization ID', async () => {
      // Act
      const response = await request(app)
        .get('/api/organizations/invalid')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Valid organization ID is required',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 200 for empty organization ID (handled by Express router)', async () => {
      // Act
      const response = await request(app)
        .get('/api/organizations/')
        .expect(200); // This will be handled by the getAllOrganizations route
    });

    it('should return 404 when organization not found', async () => {
      // Arrange
      const error = new Error('Organization not found');
      OrganizationService.getOrganizationById.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .get('/api/organizations/999')
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Organization not found',
        error: 'NOT_FOUND'
      });
    });

    it('should return 500 when service fails', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      OrganizationService.getOrganizationById.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .get('/api/organizations/1')
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error while retrieving organization',
        error: undefined // In test mode, error details are not shown
      });
    });
  });

  describe('POST /api/organizations', () => {
    it('should return 201 with created organization', async () => {
      // Arrange
      const organizationData = {
        name: 'Straw Hat Pirates',
        organizationTypeId: 1,
        status: 'active'
      };
      const mockResult = {
        success: true,
        data: { id: 1, ...organizationData }
      };
      OrganizationService.createOrganization.mockResolvedValue(mockResult);

      // Act
      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', 'Bearer valid-test-token')
        .send(organizationData)
        .expect(201);

      // Assert
      expect(response.body).toEqual(mockResult);
      expect(OrganizationService.createOrganization).toHaveBeenCalledWith(organizationData);
    });

    it('should return 400 for missing name', async () => {
      // Act
      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ organizationTypeId: 1 })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Name and organization type are required',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for missing organizationTypeId', async () => {
      // Act
      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Test Organization' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Name and organization type are required',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for name too long', async () => {
      // Act
      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ 
          name: 'A'.repeat(101), // 101 characters
          organizationTypeId: 1 
        })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Organization name must be 100 characters or less',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for invalid organizationTypeId', async () => {
      // Act
      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ 
          name: 'Test Organization',
          organizationTypeId: 'invalid' 
        })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Valid organization type ID is required',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for invalid leaderId', async () => {
      // Act
      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ 
          name: 'Test Organization',
          organizationTypeId: 1,
          leaderId: 'invalid' 
        })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Valid leader ID is required',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for invalid shipId', async () => {
      // Act
      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ 
          name: 'Test Organization',
          organizationTypeId: 1,
          shipId: 'invalid' 
        })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Valid ship ID is required',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for invalid status', async () => {
      // Act
      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ 
          name: 'Test Organization',
          organizationTypeId: 1,
          status: 'invalid' 
        })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid status. Must be active, disbanded, or destroyed',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for negative totalBounty', async () => {
      // Act
      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ 
          name: 'Test Organization',
          organizationTypeId: 1,
          totalBounty: -1000 
        })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Total bounty must be a non-negative number',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for invalid jollyRogerUrl', async () => {
      // Act
      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ 
          name: 'Test Organization',
          organizationTypeId: 1,
          jollyRogerUrl: 'not-a-valid-url' 
        })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid Jolly Roger URL format',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 409 for duplicate organization', async () => {
      // Arrange
      const error = new Error('Organization already exists');
      OrganizationService.createOrganization.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ 
          name: 'Straw Hat Pirates',
          organizationTypeId: 1 
        })
        .expect(409);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Organization already exists',
        error: 'DUPLICATE_ERROR'
      });
    });

    it('should return 400 for validation error', async () => {
      // Arrange
      const error = new Error('Invalid organization type required');
      OrganizationService.createOrganization.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ 
          name: 'Test Organization',
          organizationTypeId: 1 
        })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid organization type required',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 500 when service fails', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      OrganizationService.createOrganization.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ 
          name: 'Test Organization',
          organizationTypeId: 1 
        })
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error while creating organization',
        error: undefined // In test mode, error details are not shown
      });
    });
  });

  describe('PUT /api/organizations/:id', () => {
    it('should return 200 with updated organization', async () => {
      // Arrange
      const updateData = { name: 'Updated Organization', status: 'disbanded' };
      const mockServiceResult = {
        success: true,
        data: { id: 1, ...updateData }
      };
      OrganizationService.updateOrganization.mockResolvedValue(mockServiceResult);

      // Act
      const response = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.data,
        message: 'Organization updated successfully'
      });
      expect(OrganizationService.updateOrganization).toHaveBeenCalledWith(1, updateData);
    });

    it('should return 400 for invalid organization ID', async () => {
      // Act
      const response = await request(app)
        .put('/api/organizations/invalid')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Valid organization ID is required',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for name too long', async () => {
      // Act
      const response = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'A'.repeat(101) })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Organization name must be 100 characters or less',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for invalid organizationTypeId', async () => {
      // Act
      const response = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ organizationTypeId: 'invalid' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Valid organization type ID is required',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for invalid leaderId', async () => {
      // Act
      const response = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ leaderId: 'invalid' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Valid leader ID is required',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for invalid shipId', async () => {
      // Act
      const response = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ shipId: 'invalid' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Valid ship ID is required',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for invalid status', async () => {
      // Act
      const response = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ status: 'invalid' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid status. Must be active, disbanded, or destroyed',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for negative totalBounty', async () => {
      // Act
      const response = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ totalBounty: -1000 })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Total bounty must be a non-negative number',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 400 for invalid jollyRogerUrl', async () => {
      // Act
      const response = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ jollyRogerUrl: 'not-a-valid-url' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid Jolly Roger URL format',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 404 when organization not found', async () => {
      // Arrange
      const error = new Error('Organization not found');
      OrganizationService.updateOrganization.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .put('/api/organizations/999')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Organization not found',
        error: 'NOT_FOUND'
      });
    });

    it('should return 409 for duplicate name', async () => {
      // Arrange
      const error = new Error('Organization name already exists');
      OrganizationService.updateOrganization.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Existing Name' })
        .expect(409);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Organization name already exists',
        error: 'DUPLICATE_ERROR'
      });
    });

    it('should return 400 for validation error', async () => {
      // Arrange
      const error = new Error('Invalid organization type required');
      OrganizationService.updateOrganization.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid organization type required',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 500 when service fails', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      OrganizationService.updateOrganization.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error while updating organization',
        error: undefined // In test mode, error details are not shown
      });
    });
  });

  describe('DELETE /api/organizations/:id', () => {
    it('should return 200 with deletion confirmation', async () => {
      // Arrange
      const mockResult = {
        success: true,
        message: 'Organization deleted successfully'
      };
      OrganizationService.deleteOrganization.mockResolvedValue(mockResult);

      // Act
      const response = await request(app)
        .delete('/api/organizations/1')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockResult);
      expect(OrganizationService.deleteOrganization).toHaveBeenCalledWith(1);
    });

    it('should return 400 for invalid organization ID', async () => {
      // Act
      const response = await request(app)
        .delete('/api/organizations/invalid')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Valid organization ID is required',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 404 when organization not found', async () => {
      // Arrange
      const error = new Error('Organization not found');
      OrganizationService.deleteOrganization.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .delete('/api/organizations/999')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Organization not found',
        error: 'NOT_FOUND'
      });
    });

    it('should return 409 when organization has active members', async () => {
      // Arrange
      const error = new Error('Cannot delete organization with active members');
      OrganizationService.deleteOrganization.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .delete('/api/organizations/1')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(409);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Cannot delete organization with active members',
        error: 'CONFLICT_ERROR'
      });
    });

    it('should return 500 when service fails', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      OrganizationService.deleteOrganization.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .delete('/api/organizations/1')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error while deleting organization',
        error: undefined // In test mode, error details are not shown
      });
    });
  });

  describe('GET /api/organizations/type/:organizationTypeId', () => {
    it('should return 200 with organizations by type', async () => {
      // Arrange
      const mockOrganizations = [
        { id: 1, name: 'Straw Hat Pirates', organizationType: { name: 'Pirate Crew' } },
        { id: 2, name: 'Heart Pirates', organizationType: { name: 'Pirate Crew' } }
      ];
      const mockServiceResult = {
        success: true,
        data: mockOrganizations
      };
      OrganizationService.getOrganizationsByType.mockResolvedValue(mockServiceResult);

      // Act
      const response = await request(app)
        .get('/api/organizations/type/1')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.data,
        count: 2,
        message: 'Data retrieved successfully'
      });
      expect(OrganizationService.getOrganizationsByType).toHaveBeenCalledWith(1);
    });

    it('should return 400 for invalid organization type ID', async () => {
      // Act
      const response = await request(app)
        .get('/api/organizations/type/invalid')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Valid organization type ID is required',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 404 when organization type not found', async () => {
      // Arrange
      const error = new Error('Organization type not found');
      OrganizationService.getOrganizationsByType.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .get('/api/organizations/type/999')
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Organization type not found',
        error: 'NOT_FOUND'
      });
    });

    it('should return 500 when service fails', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      OrganizationService.getOrganizationsByType.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .get('/api/organizations/type/1')
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error while retrieving organizations by type',
        error: undefined // In test mode, error details are not shown
      });
    });
  });

  describe('GET /api/organizations/:id/members', () => {
    it('should return 200 with organization members', async () => {
      // Arrange
      const mockMembers = [
        { id: 1, name: 'Monkey D. Luffy', role: 'Captain' },
        { id: 2, name: 'Roronoa Zoro', role: 'Swordsman' }
      ];
      const mockServiceResult = {
        success: true,
        data: mockMembers
      };
      OrganizationService.getOrganizationMembers.mockResolvedValue(mockServiceResult);

      // Act
      const response = await request(app)
        .get('/api/organizations/1/members')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: mockServiceResult.data,
        message: 'Data retrieved successfully'
      });
      expect(OrganizationService.getOrganizationMembers).toHaveBeenCalledWith(1);
    });

    it('should return 400 for invalid organization ID', async () => {
      // Act
      const response = await request(app)
        .get('/api/organizations/invalid/members')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Valid organization ID is required',
        error: 'VALIDATION_ERROR'
      });
    });

    it('should return 404 when organization not found', async () => {
      // Arrange
      const error = new Error('Organization not found');
      OrganizationService.getOrganizationMembers.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .get('/api/organizations/999/members')
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Organization not found',
        error: 'NOT_FOUND'
      });
    });

    it('should return 500 when service fails', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      OrganizationService.getOrganizationMembers.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .get('/api/organizations/1/members')
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error while retrieving organization members',
        error: undefined // In test mode, error details are not shown
      });
    });
  });
});
