const request = require('supertest');
const app = require('../src/app');
const devilFruitService = require('../src/services/devil-fruit.service');

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

// Mock DevilFruitService - This is the Service Layer
jest.mock('../src/services/devil-fruit.service', () => ({
  getAllFruits: jest.fn(),
  getFruitById: jest.fn(),
  createFruit: jest.fn(),
  updateFruit: jest.fn(),
  deleteFruit: jest.fn(),
  getFruitsByType: jest.fn(),
  nameExists: jest.fn(),
  typeExists: jest.fn()
}));

describe('Devil Fruits API Endpoints', () => {
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

  describe('GET /api/devil-fruits', () => {
    it('should return all devil fruits with pagination', async () => {
      const mockFruits = [
        {
          id: 1,
          name: 'Gomu Gomu no Mi',
          japanese_name: 'ゴムゴムの実',
          type_id: 1,
          description: 'Rubber fruit',
          abilities: 'Stretching abilities',
          weaknesses: 'Cutting attacks',
          awakening_description: 'Sun God Nika form',
          current_user_id: 1,
          previous_users: [2, 3],
          image_url: 'https://example.com/gomu-gomu.jpg',
          type: {
            id: 1,
            name: 'Paramecia',
            description: 'Superhuman powers'
          }
        }
      ];

      const mockPagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: 10
      };

      devilFruitService.getAllFruits.mockResolvedValue({
        fruits: mockFruits,
        pagination: mockPagination
      });

      const response = await request(app)
        .get('/api/devil-fruits')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data).toEqual(mockFruits);
      expect(response.body.pagination).toEqual(mockPagination);
      expect(devilFruitService.getAllFruits).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        type_id: undefined,
        rarity: undefined,
        sortBy: 'id',
        sortOrder: 'ASC'
      });
    });

    it('should handle query parameters correctly', async () => {
      devilFruitService.getAllFruits.mockResolvedValue({
        fruits: [],
        pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 5 }
      });

      await request(app)
        .get('/api/devil-fruits?page=2&limit=5&search=gomu&type_id=1&rarity=legendary&sortBy=name&sortOrder=DESC')
        .expect(200);

      expect(devilFruitService.getAllFruits).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        search: 'gomu',
        type_id: '1',
        sortBy: 'name',
        sortOrder: 'DESC'
      });
    });

    it('should validate pagination parameters', async () => {
      await request(app)
        .get('/api/devil-fruits?page=0')
        .expect(400);

      await request(app)
        .get('/api/devil-fruits?limit=0')
        .expect(400);

      await request(app)
        .get('/api/devil-fruits?limit=101')
        .expect(400);
    });

    it('should validate sort parameters', async () => {
      await request(app)
        .get('/api/devil-fruits?sortBy=invalid')
        .expect(400);

      await request(app)
        .get('/api/devil-fruits?sortOrder=INVALID')
        .expect(400);
    });


    it('should handle service errors', async () => {
      devilFruitService.getAllFruits.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/devil-fruits')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching devil fruits');
    });
  });

  describe('GET /api/devil-fruits/:id', () => {
    it('should return a devil fruit by ID', async () => {
      const mockFruit = {
        id: 1,
        name: 'Gomu Gomu no Mi',
        japanese_name: 'ゴムゴムの実',
        type_id: 1,
        description: 'Rubber fruit',
        abilities: 'Stretching abilities',
        weaknesses: 'Cutting attacks',
        awakening_description: 'Sun God Nika form',
        current_user_id: 1,
        previous_users: [2, 3],
        image_url: 'https://example.com/gomu-gomu.jpg',
        type: {
          id: 1,
          name: 'Paramecia',
          description: 'Superhuman powers'
        }
      };

      devilFruitService.getFruitById.mockResolvedValue(mockFruit);

      const response = await request(app)
        .get('/api/devil-fruits/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockFruit);
      expect(devilFruitService.getFruitById).toHaveBeenCalledWith('1');
    });

    it('should return 404 for non-existent fruit', async () => {
      devilFruitService.getFruitById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/devil-fruits/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Devil fruit with ID 999 not found');
    });

    it('should validate ID parameter', async () => {
      await request(app)
        .get('/api/devil-fruits/invalid')
        .expect(400);

      await request(app)
        .get('/api/devil-fruits/')
        .expect(500);
    });

    it('should handle service errors', async () => {
      devilFruitService.getFruitById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/devil-fruits/1')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching devil fruit');
    });
  });

  describe('POST /api/devil-fruits', () => {
    it('should create a new devil fruit with valid data', async () => {
      const fruitData = {
        name: 'Gomu Gomu no Mi',
        type_id: 1,
        japanese_name: 'ゴムゴムの実',
        description: 'Rubber fruit',
        abilities: 'Stretching abilities',
        weaknesses: 'Cutting attacks',
        awakening_description: 'Sun God Nika form',
        current_user_id: 1,
        previous_users: [2, 3],
        image_url: 'https://example.com/gomu-gomu.jpg'
      };

      const mockCreatedFruit = {
        id: 1,
        ...fruitData,
        type: {
          id: 1,
          name: 'Paramecia',
          description: 'Superhuman powers'
        }
      };

      devilFruitService.createFruit.mockResolvedValue(mockCreatedFruit);

      const response = await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${authToken}`)
        .send(fruitData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Devil fruit created successfully');
      expect(response.body.data).toEqual(mockCreatedFruit);
      expect(devilFruitService.createFruit).toHaveBeenCalledWith({
        name: 'Gomu Gomu no Mi',
        type_id: 1,
        japanese_name: 'ゴムゴムの実',
        description: 'Rubber fruit',
        abilities: 'Stretching abilities',
        weaknesses: 'Cutting attacks',
        awakening_description: 'Sun God Nika form',
        current_user_id: 1,
        previous_users: [2, 3],
        image_url: 'https://example.com/gomu-gomu.jpg'
      });
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/devil-fruits')
        .send({ name: 'Test Fruit', type_id: 1 })
        .expect(401);
    });

    it('should validate required fields', async () => {
      await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '', type_id: 1 })
        .expect(400);

      await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Fruit' })
        .expect(400);
    });

    it('should validate field constraints', async () => {
      // Name too long
      await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'A'.repeat(101),
          type_id: 1
        })
        .expect(400);

      // Invalid type_id
      await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Fruit',
          type_id: 'invalid'
        })
        .expect(400);

    });

    it('should handle duplicate name error', async () => {
      const error = new Error('A devil fruit with this name already exists');
      error.code = 'DUPLICATE_NAME';
      devilFruitService.createFruit.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Existing Fruit', type_id: 1 })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('A devil fruit with this name already exists');
    });

    it('should handle invalid type error', async () => {
      const error = new Error('Invalid type ID');
      error.code = 'INVALID_TYPE';
      devilFruitService.createFruit.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test Fruit', type_id: 999 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid type ID');
    });

    it('should handle service errors', async () => {
      devilFruitService.createFruit.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/devil-fruits')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Fruit',
          type_id: 1
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error creating devil fruit');
    });
  });

  describe('PUT /api/devil-fruits/:id', () => {
    it('should update a devil fruit with valid data', async () => {
      const updateData = {
        name: 'Updated Fruit Name',
        japanese_name: 'Updated Japanese Name',
        description: 'Updated description'
      };

      const mockUpdatedFruit = {
        id: 1,
        name: 'Updated Fruit Name',
        japanese_name: 'Updated Japanese Name',
        type_id: 1,
        description: 'Updated description',
        type: {
          id: 1,
          name: 'Paramecia'
        }
      };

      devilFruitService.updateFruit.mockResolvedValue(mockUpdatedFruit);

      const response = await request(app)
        .put('/api/devil-fruits/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Devil fruit updated successfully');
      expect(response.body.data).toEqual(mockUpdatedFruit);
      expect(devilFruitService.updateFruit).toHaveBeenCalledWith('1', updateData);
    });

    it('should require authentication', async () => {
      await request(app)
        .put('/api/devil-fruits/1')
        .send({ name: 'Updated Name' })
        .expect(401);
    });

    it('should validate ID parameter', async () => {
      await request(app)
        .put('/api/devil-fruits/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(400);
    });

    it('should require at least one field to update', async () => {
      await request(app)
        .put('/api/devil-fruits/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });

    it('should handle not found error', async () => {
      const error = new Error('Devil fruit with ID 999 not found');
      error.code = 'NOT_FOUND';
      devilFruitService.updateFruit.mockRejectedValue(error);

      const response = await request(app)
        .put('/api/devil-fruits/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Devil fruit with ID 999 not found');
    });

    it('should handle duplicate name error', async () => {
      const error = new Error('Another devil fruit with this name already exists');
      error.code = 'DUPLICATE_NAME';
      devilFruitService.updateFruit.mockRejectedValue(error);

      const response = await request(app)
        .put('/api/devil-fruits/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Existing Name' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Another devil fruit with this name already exists');
    });
  });

  describe('DELETE /api/devil-fruits/:id', () => {
    it('should delete a devil fruit', async () => {
      const mockDeletedFruit = {
        id: 1,
        name: 'Deleted Fruit'
      };

      devilFruitService.deleteFruit.mockResolvedValue(mockDeletedFruit);

      const response = await request(app)
        .delete('/api/devil-fruits/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Devil fruit "Deleted Fruit" deleted successfully');
      expect(devilFruitService.deleteFruit).toHaveBeenCalledWith('1');
    });

    it('should require authentication', async () => {
      await request(app)
        .delete('/api/devil-fruits/1')
        .expect(401);
    });

    it('should validate ID parameter', async () => {
      await request(app)
        .delete('/api/devil-fruits/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should handle not found error', async () => {
      const error = new Error('Devil fruit with ID 999 not found');
      error.code = 'NOT_FOUND';
      devilFruitService.deleteFruit.mockRejectedValue(error);

      const response = await request(app)
        .delete('/api/devil-fruits/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Devil fruit with ID 999 not found');
    });
  });

  describe('GET /api/devil-fruits/type/:typeId', () => {
    it('should return devil fruits by type', async () => {
      const mockFruits = [
        {
          id: 1,
          name: 'Gomu Gomu no Mi',
          japanese_name: 'ゴムゴムの実',
          type_id: 1,
          description: 'Rubber fruit',
          type: {
            id: 1,
            name: 'Paramecia'
          }
        }
      ];

      const mockPagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: 10
      };

      devilFruitService.getFruitsByType.mockResolvedValue({
        fruits: mockFruits,
        pagination: mockPagination
      });

      const response = await request(app)
        .get('/api/devil-fruits/type/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data).toEqual(mockFruits);
      expect(response.body.pagination).toEqual(mockPagination);
      expect(devilFruitService.getFruitsByType).toHaveBeenCalledWith(1, {
        page: 1,
        limit: 10,
        sortBy: 'id',
        sortOrder: 'ASC'
      });
    });

    it('should validate type ID parameter', async () => {
      await request(app)
        .get('/api/devil-fruits/type/invalid')
        .expect(400);
    });

    it('should handle query parameters', async () => {
      devilFruitService.getFruitsByType.mockResolvedValue({
        fruits: [],
        pagination: { currentPage: 2, totalPages: 0, totalItems: 0, itemsPerPage: 5 }
      });

      await request(app)
        .get('/api/devil-fruits/type/1?page=2&limit=5&sortBy=name&sortOrder=DESC')
        .expect(200);

      expect(devilFruitService.getFruitsByType).toHaveBeenCalledWith(1, {
        page: 2,
        limit: 5,
        sortBy: 'name',
        sortOrder: 'DESC'
      });
    });

    it('should handle service errors', async () => {
      devilFruitService.getFruitsByType.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/devil-fruits/type/1')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error fetching devil fruits by type');
    });
  });
});
