const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db.config');

// Note: These are unit tests with mocked dependencies
// We mock both JWTUtil and the database pool to test controller logic in isolation
// This ensures tests are fast, reliable, and don't depend on external services

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

// Mock database pool to avoid real database connections
jest.mock('../src/config/db.config', () => ({
  pool: {
    query: jest.fn(),
    end: jest.fn()
  }
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
      // Mock database response
      const mockFruitTypes = [
        { id: 1, name: 'Paramecia', description: 'Test description', created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'Zoan', description: 'Test description 2', created_at: new Date(), updated_at: new Date() }
      ];
      pool.query.mockResolvedValueOnce([mockFruitTypes]);

      const response = await request(app).get('/api/fruit-types');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count', 2);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('should return fruit types with correct structure', async () => {
      // Mock database response
      const mockFruitTypes = [
        { id: 1, name: 'Paramecia', description: 'Test description', created_at: new Date(), updated_at: new Date() }
      ];
      pool.query.mockResolvedValueOnce([mockFruitTypes]);

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
      // Mock database response for existing fruit type
      const mockFruitType = { id: 1, name: 'Paramecia', description: 'Test', created_at: new Date(), updated_at: new Date() };
      pool.query.mockResolvedValueOnce([[mockFruitType]]);

      const response = await request(app).get('/api/fruit-types/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 1);
    });

    it('should return 404 for a non-existent ID', async () => {
      // Mock database response for non-existent fruit type
      pool.query.mockResolvedValueOnce([[]]);

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

  describe('POST /api/fruit-types', () => {
    it('should return 401 when no authentication token is provided', async () => {
      const newFruitType = {
        name: 'Unauthorized Test',
        description: 'This should fail'
      };

      const response = await request(app)
        .post('/api/fruit-types')
        .send(newFruitType);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Authentication token not provided');
    });

    it('should create a new fruit type with valid data and authentication', async () => {
      const newFruitType = {
        name: 'Test Type',
        description: 'This is a test type'
      };

      // Mock database responses
      const mockCreatedRecord = { id: 123, name: 'Test Type', description: 'This is a test type', created_at: new Date(), updated_at: new Date() };
      pool.query
        .mockResolvedValueOnce([[]]) // Check if name exists (empty result)
        .mockResolvedValueOnce([{ insertId: 123 }]) // INSERT query
        .mockResolvedValueOnce([[mockCreatedRecord]]); // SELECT created record

      const response = await request(app)
        .post('/api/fruit-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newFruitType);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id', 123);
      expect(response.body.data).toHaveProperty('name', newFruitType.name);
      expect(response.body.data).toHaveProperty('description', newFruitType.description);
    });

    it('should return 400 if name is missing', async () => {
      const invalidFruitType = {
        description: 'Description without name'
      };

      const response = await request(app)
        .post('/api/fruit-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidFruitType);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Name');
    });

    it('should return 400 if name is empty', async () => {
      const invalidFruitType = {
        name: '   ',
        description: 'Empty name'
      };

      const response = await request(app)
        .post('/api/fruit-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidFruitType);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 409 if name already exists', async () => {
      const duplicateFruitType = {
        name: 'Paramecia',
        description: 'Duplicate attempt'
      };

      // Mock database response showing name already exists
      pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Paramecia' }]]);

      const response = await request(app)
        .post('/api/fruit-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateFruitType);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('exists');
    });

    it('should return 400 if name exceeds 50 characters', async () => {
      const longNameFruitType = {
        name: 'A'.repeat(51),
        description: 'Name too long'
      };

      const response = await request(app)
        .post('/api/fruit-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send(longNameFruitType);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('50 characters');
    });

    it('should create fruit type without description', async () => {
      const fruitTypeNoDesc = {
        name: 'Test Without Desc'
      };

      // Mock database responses
      const mockCreatedRecord = { id: 456, name: 'Test Without Desc', description: null, created_at: new Date(), updated_at: new Date() };
      pool.query
        .mockResolvedValueOnce([[]]) // Check if name exists
        .mockResolvedValueOnce([{ insertId: 456 }]) // INSERT query
        .mockResolvedValueOnce([[mockCreatedRecord]]); // SELECT created record

      const response = await request(app)
        .post('/api/fruit-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fruitTypeNoDesc);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', fruitTypeNoDesc.name);
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

      // Mock database responses
      const mockUpdatedRecord = { id: 1, name: 'Test Type Updated', description: 'Updated description', created_at: new Date(), updated_at: new Date() };
      pool.query
        .mockResolvedValueOnce([[{ id: 1, name: 'Old Name' }]]) // Check if ID exists
        .mockResolvedValueOnce([[]]) // Check if new name exists
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE query
        .mockResolvedValueOnce([[mockUpdatedRecord]]); // SELECT updated record

      const response = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', updatedData.name);
      expect(response.body.data).toHaveProperty('description', updatedData.description);
    });

    it('should return 404 for a non-existent ID', async () => {
      // Mock database response showing ID doesn't exist
      pool.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .put('/api/fruit-types/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Does not exist' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 if no fields are provided', async () => {
      // Mock database response showing ID exists
      pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Existing' }]]);

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
      // Mock database response showing ID exists
      pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Existing' }]]);

      const response = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '   ' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('empty');
    });

    it('should return 400 if name exceeds 50 characters', async () => {
      // Mock database response showing ID exists
      pool.query.mockResolvedValueOnce([[{ id: 1, name: 'Existing' }]]);

      const response = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'B'.repeat(51) });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('50 characters');
    });

    it('should return 409 if trying to update to an existing name', async () => {
      // Mock database responses
      pool.query
        .mockResolvedValueOnce([[{ id: 2, name: 'Current Name' }]]) // Check if ID exists
        .mockResolvedValueOnce([[{ id: 1, name: 'Paramecia' }]]); // Check if new name exists

      const response = await request(app)
        .put('/api/fruit-types/2')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Paramecia' });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('exists');
    });

    it('should update only description', async () => {
      // Mock database responses
      const mockUpdatedRecord = { id: 1, name: 'Existing Name', description: 'Updated description only', created_at: new Date(), updated_at: new Date() };
      pool.query
        .mockResolvedValueOnce([[{ id: 1, name: 'Existing Name' }]]) // Check if ID exists
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE query
        .mockResolvedValueOnce([[mockUpdatedRecord]]); // SELECT updated record

      const response = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated description only' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('description', 'Updated description only');
    });

    it('should update description to null', async () => {
      // Mock database responses
      const mockUpdatedRecord = { id: 1, name: 'Existing Name', description: null, created_at: new Date(), updated_at: new Date() };
      pool.query
        .mockResolvedValueOnce([[{ id: 1, name: 'Existing Name' }]]) // Check if ID exists
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE query
        .mockResolvedValueOnce([[mockUpdatedRecord]]); // SELECT updated record

      const response = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: null });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('DELETE /api/fruit-types/:id', () => {
    it('should return 401 when no authentication token is provided', async () => {
      const response = await request(app).delete('/api/fruit-types/1');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Authentication token not provided');
    });

    it('should return 409 when trying to delete a type with associated fruits', async () => {
      // Mock database responses
      pool.query
        .mockResolvedValueOnce([[{ id: 1, name: 'Paramecia' }]]) // Check if ID exists
        .mockResolvedValueOnce([[{ count: 5 }]]); // Check associations (has 5 fruits)

      const response = await request(app)
        .delete('/api/fruit-types/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('associated');
    });

    it('should successfully delete a fruit type without associations', async () => {
      // Mock database responses
      pool.query
        .mockResolvedValueOnce([[{ id: 10, name: 'Delete Test' }]]) // Check if ID exists
        .mockResolvedValueOnce([[{ count: 0 }]]) // Check associations (no fruits)
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // DELETE query

      const response = await request(app)
        .delete('/api/fruit-types/10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 for a non-existent ID', async () => {
      // Mock database response showing ID doesn't exist
      pool.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .delete('/api/fruit-types/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 for an invalid ID', async () => {
      const response = await request(app)
        .delete('/api/fruit-types/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Invalid ID');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors on GET all', async () => {
      // Mock database error
      pool.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app).get('/api/fruit-types');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Error fetching fruit types');
    });

    it('should handle database errors on GET by ID', async () => {
      // Mock database error
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/api/fruit-types/1');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Error fetching fruit type');
    });

    it('should handle database errors on POST', async () => {
      // Mock to fail on the INSERT query (after successful existence check)
      pool.query
        .mockResolvedValueOnce([[]])  // First call: check if name exists (returns empty)
        .mockRejectedValueOnce(new Error('Insert failed'));  // Second call: INSERT fails

      const response = await request(app)
        .post('/api/fruit-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Error Test', description: 'Test error handling' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Error creating fruit type');
    });

    it('should handle database errors on PUT', async () => {
      // Mock to fail on UPDATE
      pool.query
        .mockResolvedValueOnce([[{ id: 1 }]])  // First call: check existence
        .mockResolvedValueOnce([[]])  // Second call: check duplicate name
        .mockRejectedValueOnce(new Error('Update failed'));  // Third call: UPDATE fails

      const response = await request(app)
        .put('/api/fruit-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Error updating fruit type');
    });

    it('should handle database errors on DELETE', async () => {
      // Mock to fail on DELETE
      pool.query
        .mockResolvedValueOnce([[{ id: 999, name: 'Test' }]])  // First call: check existence
        .mockResolvedValueOnce([[{ count: 0 }]])  // Second call: check associations
        .mockRejectedValueOnce(new Error('Delete failed'));  // Third call: DELETE fails

      const response = await request(app)
        .delete('/api/fruit-types/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Error deleting fruit type');
    });
  });
});
