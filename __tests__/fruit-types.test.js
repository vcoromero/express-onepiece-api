const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db.config');

describe('Fruit Types API Endpoints', () => {
  let createdFruitTypeId;

  // Hook to clean up after tests
  afterAll(async () => {
    // Clean up test records if needed
    if (createdFruitTypeId) {
      try {
        await pool.query('DELETE FROM devil_fruit_types WHERE id = ?', [createdFruitTypeId]);
      } catch (error) {
        console.log('Cleanup error:', error.message);
      }
    }
    // Close connection pool
    await pool.end();
  });

  describe('GET /api/fruit-types', () => {
    it('should return 200 and a list of fruit types', async () => {
      const response = await request(app).get('/api/fruit-types');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return fruit types with correct structure', async () => {
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
      const response = await request(app).get('/api/fruit-types/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', 1);
    });

    it('should return 404 for a non-existent ID', async () => {
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
    it('should create a new fruit type with valid data', async () => {
      const newFruitType = {
        name: 'Test Type',
        description: 'This is a test type'
      };

      const response = await request(app)
        .post('/api/fruit-types')
        .send(newFruitType);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', newFruitType.name);
      expect(response.body.data).toHaveProperty('description', newFruitType.description);

      // Save ID for cleanup
      createdFruitTypeId = response.body.data.id;
    });

    it('should return 400 if name is missing', async () => {
      const invalidFruitType = {
        description: 'Description without name'
      };

      const response = await request(app)
        .post('/api/fruit-types')
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
        .send(invalidFruitType);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 409 if name already exists', async () => {
      const duplicateFruitType = {
        name: 'Paramecia',
        description: 'Duplicate attempt'
      };

      const response = await request(app)
        .post('/api/fruit-types')
        .send(duplicateFruitType);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('exists');
    });
  });

  describe('PUT /api/fruit-types/:id', () => {
    it('should update an existing fruit type', async () => {
      // First, get a fruit type to update (use the one we created earlier)
      if (!createdFruitTypeId) {
        // If it doesn't exist, create one for the test
        const createResponse = await request(app)
          .post('/api/fruit-types')
          .send({ name: 'Update Test', description: 'To be updated' });
        createdFruitTypeId = createResponse.body.data.id;
      }

      const updatedData = {
        name: 'Test Type Updated',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/fruit-types/${createdFruitTypeId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', updatedData.name);
      expect(response.body.data).toHaveProperty('description', updatedData.description);
    });

    it('should return 404 for a non-existent ID', async () => {
      const response = await request(app)
        .put('/api/fruit-types/99999')
        .send({ name: 'Does not exist' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 if no fields are provided', async () => {
      const response = await request(app)
        .put('/api/fruit-types/1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('fields');
    });

    it('should return 400 for an invalid ID', async () => {
      const response = await request(app)
        .put('/api/fruit-types/invalid')
        .send({ name: 'Test' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Invalid ID');
    });
  });

  describe('DELETE /api/fruit-types/:id', () => {
    it('should return 409 when trying to delete a type with associated fruits', async () => {
      // Try to delete a type that has fruits (e.g., Paramecia with ID 1)
      const response = await request(app).delete('/api/fruit-types/1');

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('associated');
    });

    it('should successfully delete a fruit type without associations', async () => {
      // Create a temporary fruit type just to delete it
      const createResponse = await request(app)
        .post('/api/fruit-types')
        .send({ name: 'Delete Test', description: 'To be deleted' });

      const idToDelete = createResponse.body.data.id;

      const response = await request(app).delete(`/api/fruit-types/${idToDelete}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 for a non-existent ID', async () => {
      const response = await request(app).delete('/api/fruit-types/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    it('should return 400 for an invalid ID', async () => {
      const response = await request(app).delete('/api/fruit-types/invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Invalid ID');
    });
  });
});
