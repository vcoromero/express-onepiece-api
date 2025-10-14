const request = require('supertest');
const app = require('../src/app');
const fruitTypeService = require('../src/services/fruit-type.service');

// Note: These are unit tests with mocked dependencies
// We mock the Service Layer to test controller logic in isolation
// This ensures tests are fast, reliable, and don't depend on database

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

// Mock FruitTypeService - This is the Service Layer
jest.mock('../src/services/fruit-type.service', () => ({
  getAllTypes: jest.fn(),
  getTypeById: jest.fn(),
  updateType: jest.fn(),
  nameExists: jest.fn(),
  hasAssociatedFruits: jest.fn()
}));

describe('Fruit Types API Endpoints', () => {
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

  describe('GET /api/fruit-types', () => {
    it('should return 200 and a list of fruit types', async () => {
      // Mock service response
      const mockFruitTypes = [
        { id: 1, name: 'Paramecia', description: 'Test description', created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'Zoan', description: 'Test description 2', created_at: new Date(), updated_at: new Date() }
      ];
      fruitTypeService.getAllTypes.mockResolvedValueOnce(mockFruitTypes);

      const response = await request(app).get('/api/fruit-types');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count', 2);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(fruitTypeService.getAllTypes).toHaveBeenCalledTimes(1);
    });

    it('should return fruit types with correct structure', async () => {
      // Mock service response
      const mockFruitTypes = [
        { id: 1, name: 'Paramecia', description: 'Test description', created_at: new Date(), updated_at: new Date() }
      ];
      fruitTypeService.getAllTypes.mockResolvedValueOnce(mockFruitTypes);

      const response = await request(app).get('/api/fruit-types');

      if (response.body.data.length > 0) {
        const fruitType = response.body.data[0];
        expect(fruitType).toHaveProperty('id');
        expect(fruitType).toHaveProperty('name');
        expect(fruitType).toHaveProperty('description');
        expect(fruitType).toHaveProperty('created_at');
        expect(fruitType).toHaveProperty('updated_at');
      }
    });
  });

  describe('GET /api/fruit-types/:id', () => {
    it('should return 200 and an existing fruit type', async () => {
      // Mock service response for existing fruit type
      const mockFruitType = { id: 1, name: 'Paramecia', description: 'Test', created_at: new Date(), updated_at: new Date() };
      fruitTypeService.getTypeById.mockResolvedValueOnce(mockFruitType);

      const response = await request(app).get('/api/fruit-types/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 1);
    });

    it('should return 404 for a non-existent ID', async () => {
      // Mock service response for non-existent fruit type
      fruitTypeService.getTypeById.mockResolvedValueOnce(null);

      const response = await request(app).get('/api/fruit-types/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for an invalid ID', async () => {
      const response = await request(app).get('/api/fruit-types/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid ID');
    });
  });


  describe('PUT /api/fruit-types/:id', () => {
    it('should return 401 when no authentication token is provided', async () => {
      const response = await request(app)
        .put('/api/fruit-types/1')
        .send({ name: 'Unauthorized Update' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Authentication token not provided');
    });

    it('should update an existing fruit type with authentication', async () => {
      const updatedData = {
        name: 'Test Type Updated',
        description: 'Updated description'
      };

      // Mock service response
      const mockUpdatedRecord = { id: 1, name: 'Test Type Updated', description: 'Updated description', created_at: new Date(), updated_at: new Date() };
      fruitTypeService.updateType.mockResolvedValueOnce(mockUpdatedRecord);

      const response = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', updatedData.name);
      expect(response.body.data).toHaveProperty('description', updatedData.description);
      expect(fruitTypeService.updateType).toHaveBeenCalledWith('1', updatedData);
    });

    it('should return 404 for a non-existent ID', async () => {
      // Mock service throwing not found error
      const error = new Error('Fruit type with ID 99999 not found');
      error.code = 'NOT_FOUND';
      fruitTypeService.updateType.mockRejectedValueOnce(error);

      const response = await request(app)
        .put('/api/fruit-types/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Does not exist' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 if no fields are provided', async () => {
      const response = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('fields');
    });

    it('should return 400 for an invalid ID', async () => {
      const response = await request(app)
        .put('/api/fruit-types/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Invalid ID');
    });

    it('should return 400 if name is empty string', async () => {
      const response = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '   ' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('empty');
    });

    it('should return 400 if name exceeds 50 characters', async () => {
      const response = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'B'.repeat(51) });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('50 characters');
    });

    it('should return 409 if trying to update to an existing name', async () => {
      // Mock service throwing duplicate error
      const error = new Error('Another fruit type with this name already exists');
      error.code = 'DUPLICATE_NAME';
      fruitTypeService.updateType.mockRejectedValueOnce(error);

      const response = await request(app)
        .put('/api/fruit-types/2')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Paramecia' });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('exists');
    });

    it('should update only description', async () => {
      // Mock service response
      const mockUpdatedRecord = { id: 1, name: 'Existing Name', description: 'Updated description only', created_at: new Date(), updated_at: new Date() };
      fruitTypeService.updateType.mockResolvedValueOnce(mockUpdatedRecord);

      const response = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated description only' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('description', 'Updated description only');
    });

    it('should update description to null', async () => {
      // Mock service response
      const mockUpdatedRecord = { id: 1, name: 'Existing Name', description: null, created_at: new Date(), updated_at: new Date() };
      fruitTypeService.updateType.mockResolvedValueOnce(mockUpdatedRecord);

      const response = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: null });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });


  describe('Error Handling', () => {
    it('should handle service errors on GET all', async () => {
      // Mock service error
      fruitTypeService.getAllTypes.mockRejectedValueOnce(new Error('Service error'));

      const response = await request(app).get('/api/fruit-types');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Error fetching fruit types');
    });

    it('should handle service errors on GET by ID', async () => {
      // Mock service error
      fruitTypeService.getTypeById.mockRejectedValueOnce(new Error('Service error'));

      const response = await request(app).get('/api/fruit-types/1');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Error fetching fruit type');
    });


    it('should handle service errors on PUT', async () => {
      // Mock service error (generic error, not not_found or duplicate)
      fruitTypeService.updateType.mockRejectedValueOnce(new Error('Service error'));

      const response = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Error updating fruit type');
    });

  });
});
