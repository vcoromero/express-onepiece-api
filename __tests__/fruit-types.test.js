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

    it('should return 400 if name exceeds 50 characters', async () => {
      const longNameFruitType = {
        name: 'A'.repeat(51),
        description: 'Name too long'
      };

      const response = await request(app)
        .post('/api/fruit-types')
        .send(longNameFruitType);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('50 characters');
    });

    it('should create fruit type without description', async () => {
      const fruitTypeNoDesc = {
        name: 'Test Without Desc'
      };

      const response = await request(app)
        .post('/api/fruit-types')
        .send(fruitTypeNoDesc);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', fruitTypeNoDesc.name);
      
      // Clean up
      if (response.body.data && response.body.data.id) {
        await pool.query('DELETE FROM devil_fruit_types WHERE id = ?', [response.body.data.id]);
      }
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

    it('should return 400 if name is empty string', async () => {
      if (!createdFruitTypeId) {
        const createResponse = await request(app)
          .post('/api/fruit-types')
          .send({ name: 'Empty Name Test', description: 'To be updated with empty' });
        createdFruitTypeId = createResponse.body.data.id;
      }

      const response = await request(app)
        .put(`/api/fruit-types/${createdFruitTypeId}`)
        .send({ name: '   ' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('empty');
    });

    it('should return 400 if name exceeds 50 characters', async () => {
      if (!createdFruitTypeId) {
        const createResponse = await request(app)
          .post('/api/fruit-types')
          .send({ name: 'Long Name Test', description: 'To be updated' });
        createdFruitTypeId = createResponse.body.data.id;
      }

      const response = await request(app)
        .put(`/api/fruit-types/${createdFruitTypeId}`)
        .send({ name: 'B'.repeat(51) });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('50 characters');
    });

    it('should return 409 if trying to update to an existing name', async () => {
      if (!createdFruitTypeId) {
        const createResponse = await request(app)
          .post('/api/fruit-types')
          .send({ name: 'Duplicate Update Test', description: 'To be updated' });
        createdFruitTypeId = createResponse.body.data.id;
      }

      const response = await request(app)
        .put(`/api/fruit-types/${createdFruitTypeId}`)
        .send({ name: 'Paramecia' });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('exists');
    });

    it('should update only description', async () => {
      if (!createdFruitTypeId) {
        const createResponse = await request(app)
          .post('/api/fruit-types')
          .send({ name: 'Desc Only Update', description: 'Original' });
        createdFruitTypeId = createResponse.body.data.id;
      }

      const response = await request(app)
        .put(`/api/fruit-types/${createdFruitTypeId}`)
        .send({ description: 'Updated description only' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('description', 'Updated description only');
    });

    it('should update description to null', async () => {
      if (!createdFruitTypeId) {
        const createResponse = await request(app)
          .post('/api/fruit-types')
          .send({ name: 'Null Desc Test', description: 'To be nulled' });
        createdFruitTypeId = createResponse.body.data.id;
      }

      const response = await request(app)
        .put(`/api/fruit-types/${createdFruitTypeId}`)
        .send({ description: null });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
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

  describe('Error Handling', () => {
    it('should handle database errors on GET all', async () => {
      // Mock the pool.query to throw an error
      const originalQuery = pool.query.bind(pool);
      pool.query = jest.fn().mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(app).get('/api/fruit-types');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Error fetching fruit types');

      // Restore original function
      pool.query = originalQuery;
    });

    it('should handle database errors on GET by ID', async () => {
      const originalQuery = pool.query.bind(pool);
      pool.query = jest.fn().mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/api/fruit-types/1');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Error fetching fruit type');

      pool.query = originalQuery;
    });

    it('should handle database errors on POST', async () => {
      const originalQuery = pool.query.bind(pool);
      // Mock to fail on the INSERT query (after successful existence check)
      pool.query = jest.fn()
        .mockResolvedValueOnce([[]])  // First call: check if name exists (returns empty)
        .mockRejectedValueOnce(new Error('Insert failed'));  // Second call: INSERT fails

      const response = await request(app)
        .post('/api/fruit-types')
        .send({ name: 'Error Test', description: 'Test error handling' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Error creating fruit type');

      pool.query = originalQuery;
    });

    it('should handle database errors on PUT', async () => {
      const originalQuery = pool.query.bind(pool);
      // Mock to fail on UPDATE
      pool.query = jest.fn()
        .mockResolvedValueOnce([[{ id: 1 }]])  // First call: check existence
        .mockResolvedValueOnce([[]])  // Second call: check duplicate name
        .mockRejectedValueOnce(new Error('Update failed'));  // Third call: UPDATE fails

      const response = await request(app)
        .put('/api/fruit-types/1')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Error updating fruit type');

      pool.query = originalQuery;
    });

    it('should handle database errors on DELETE', async () => {
      const originalQuery = pool.query.bind(pool);
      // Mock to fail on DELETE
      pool.query = jest.fn()
        .mockResolvedValueOnce([[{ id: 999, name: 'Test' }]])  // First call: check existence
        .mockResolvedValueOnce([[{ count: 0 }]])  // Second call: check associations
        .mockRejectedValueOnce(new Error('Delete failed'));  // Third call: DELETE fails

      const response = await request(app).delete('/api/fruit-types/999');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Error deleting fruit type');

      pool.query = originalQuery;
    });
  });
});
