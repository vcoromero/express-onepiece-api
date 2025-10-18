const request = require('supertest');
const app = require('../src/app');
const organizationTypeService = require('../src/services/organization-type.service');

// Mock JWTUtil since it has its own unit tests
jest.mock('../src/utils/jwt.util', () => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn((token) => {
    if (token === 'valid-test-token') {
      return { username: 'testadmin', role: 'admin' };
    }
    throw new Error('Invalid token');
  }),
  decodeToken: jest.fn()
}));

// Mock OrganizationTypeService - This is the Service Layer
jest.mock('../src/services/organization-type.service', () => ({
  getAllOrganizationTypes: jest.fn(),
  getOrganizationTypeById: jest.fn(),
  updateOrganizationType: jest.fn(),
  nameExists: jest.fn(),
  idExists: jest.fn(),
  isOrganizationTypeInUse: jest.fn()
}));

describe('Organization Type API Endpoints', () => {
  let authToken;

  // Setup mock token before all tests
  beforeAll(() => {
    // Use a mock token instead of generating a real one
    authToken = 'valid-test-token';
  });

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Clean up after all tests
  afterAll(async () => {
    jest.restoreAllMocks();
  });

  describe('GET /api/organization-types', () => {
    it('should return all organization types', async () => {
      const mockOrganizationTypes = [
        {
          id: 1,
          name: 'Pirate Crew',
          description: 'Groups of pirates sailing together under a captain',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          name: 'Marine',
          description: 'Military force of the World Government',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      organizationTypeService.getAllOrganizationTypes.mockResolvedValue({
        success: true,
        organizationTypes: mockOrganizationTypes,
        total: 2
      });

      const response = await request(app)
        .get('/api/organization-types')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(organizationTypeService.getAllOrganizationTypes).toHaveBeenCalledWith({
        search: undefined,
        sortBy: 'name',
        sortOrder: 'asc'
      });
    });

    it('should handle service errors', async () => {
      organizationTypeService.getAllOrganizationTypes.mockResolvedValue({
        success: false,
        message: 'Database connection failed'
      });

      const response = await request(app)
        .get('/api/organization-types')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database connection failed');
    });

    it('should handle search and sorting parameters', async () => {
      const mockOrganizationTypes = [
        {
          id: 1,
          name: 'Pirate Crew',
          description: 'Groups of pirates sailing together under a captain'
        }
      ];

      organizationTypeService.getAllOrganizationTypes.mockResolvedValue({
        success: true,
        organizationTypes: mockOrganizationTypes,
        total: 1
      });

      const response = await request(app)
        .get('/api/organization-types?search=pirate&sortBy=name&sortOrder=desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(organizationTypeService.getAllOrganizationTypes).toHaveBeenCalledWith({
        search: 'pirate',
        sortBy: 'name',
        sortOrder: 'desc'
      });
    });
  });

  describe('GET /api/organization-types/:id', () => {
    it('should return an organization type by ID', async () => {
      const mockOrganizationType = {
        id: 1,
        name: 'Pirate Crew',
        description: 'Groups of pirates sailing together under a captain',
        created_at: new Date(),
        updated_at: new Date()
      };

      organizationTypeService.getOrganizationTypeById.mockResolvedValue({
        success: true,
        data: mockOrganizationType
      });

      const response = await request(app)
        .get('/api/organization-types/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(organizationTypeService.getOrganizationTypeById).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent organization type', async () => {
      organizationTypeService.getOrganizationTypeById.mockResolvedValue({
        success: false,
        message: 'Organization type with ID 999 not found',
        error: 'NOT_FOUND'
      });

      const response = await request(app)
        .get('/api/organization-types/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Organization type with ID 999 not found');
    });

    it('should validate ID parameter', async () => {
      const response = await request(app)
        .get('/api/organization-types/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid organization type ID');
    });
  });

  describe('PUT /api/organization-types/:id', () => {
    it('should update an organization type', async () => {
      const updateData = {
        name: 'Pirate Crew Updated',
        description: 'Updated description for Pirate Crew organization type'
      };

      const updatedOrganizationType = {
        id: 1,
        name: 'Pirate Crew Updated',
        description: 'Updated description for Pirate Crew organization type',
        created_at: new Date(),
        updated_at: new Date()
      };

      organizationTypeService.updateOrganizationType.mockResolvedValue({
        success: true,
        data: updatedOrganizationType,
        message: 'Organization type updated successfully'
      });

      const response = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(organizationTypeService.updateOrganizationType).toHaveBeenCalledWith(1, updateData);
    });

    it('should return 404 for non-existent organization type', async () => {
      const updateData = { name: 'Updated Organization Type' };

      organizationTypeService.updateOrganizationType.mockResolvedValue({
        success: false,
        message: 'Organization type with ID 999 not found',
        error: 'NOT_FOUND'
      });

      const response = await request(app)
        .put('/api/organization-types/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Organization type with ID 999 not found');
    });

    it('should validate at least one field is provided', async () => {
      organizationTypeService.updateOrganizationType.mockResolvedValue({
        success: false,
        message: 'At least one field must be provided for update',
        error: 'NO_FIELDS_PROVIDED'
      });

      const response = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('At least one field must be provided for update');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/organization-types/1')
        .send({ name: 'Unauthorized Update' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication token not provided');
    });

    it('should validate ID parameter', async () => {
      const response = await request(app)
        .put('/api/organization-types/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid organization type ID');
    });

    it('should handle duplicate name error', async () => {
      const updateData = { name: 'Marine' };

      organizationTypeService.updateOrganizationType.mockResolvedValue({
        success: false,
        message: 'An organization type with this name already exists',
        error: 'DUPLICATE_NAME'
      });

      const response = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('An organization type with this name already exists');
    });

    it('should validate name length', async () => {
      const updateData = { name: 'A'.repeat(51) };

      organizationTypeService.updateOrganizationType.mockResolvedValue({
        success: false,
        message: 'Name cannot exceed 50 characters',
        error: 'INVALID_NAME'
      });

      const response = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Name cannot exceed 50 characters');
    });
  });
});
