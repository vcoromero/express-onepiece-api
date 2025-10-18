const request = require('supertest');
const app = require('../src/app');
const hakiTypeService = require('../src/services/haki-type.service');

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

// Mock the service
jest.mock('../src/services/haki-type.service');

describe('HakiType API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/haki-types', () => {
    it('should return all Haki types with pagination', async () => {
      const mockHakiTypes = [
        {
          id: 1,
          name: 'Observation Haki',
          description: 'Allows user to sense presence and emotions of others',
          color: 'Red',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 2,
          name: 'Armament Haki',
          description: 'Allows user to use spiritual armor for offense and defense',
          color: 'Black',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z'
        }
      ];

      hakiTypeService.getAllHakiTypes.mockResolvedValue({
        success: true,
        hakiTypes: mockHakiTypes,
        total: 2
      });

      const response = await request(app)
        .get('/api/haki-types')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(hakiTypeService.getAllHakiTypes).toHaveBeenCalledWith({
        search: undefined,
        sortBy: 'name',
        sortOrder: 'asc'
      });
    });

    it('should handle service errors', async () => {
      hakiTypeService.getAllHakiTypes.mockResolvedValue({
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      });

      const response = await request(app)
        .get('/api/haki-types')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database error');
    });

    it('should handle invalid query parameters gracefully', async () => {
      hakiTypeService.getAllHakiTypes.mockResolvedValue({
        success: true,
        hakiTypes: [],
        total: 0
      });

      const response = await request(app)
        .get('/api/haki-types?page=0&limit=0')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle search and sorting parameters', async () => {
      hakiTypeService.getAllHakiTypes.mockResolvedValue({
        success: true,
        hakiTypes: [],
        total: 0
      });

      await request(app)
        .get('/api/haki-types?search=observation&sortBy=color&sortOrder=desc')
        .expect(200);

      expect(hakiTypeService.getAllHakiTypes).toHaveBeenCalledWith({
        search: 'observation',
        sortBy: 'color',
        sortOrder: 'desc'
      });
    });
  });

  describe('GET /api/haki-types/:id', () => {
    it('should return a Haki type by ID', async () => {
      const mockHakiType = {
        id: 1,
        name: 'Observation Haki',
        description: 'Allows user to sense presence and emotions of others',
        color: 'Red',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      };

      hakiTypeService.getHakiTypeById.mockResolvedValue({
        success: true,
        data: { hakiType: mockHakiType }
      });

      const response = await request(app)
        .get('/api/haki-types/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.hakiType.name).toBe('Observation Haki');
      expect(hakiTypeService.getHakiTypeById).toHaveBeenCalledWith('1');
    });

    it('should return 404 for non-existent Haki type', async () => {
      hakiTypeService.getHakiTypeById.mockResolvedValue({
        success: false,
        message: 'Haki type not found',
        error: 'NOT_FOUND'
      });

      const response = await request(app)
        .get('/api/haki-types/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Haki type not found');
    });

    it('should validate ID parameter', async () => {
      const response = await request(app)
        .get('/api/haki-types/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid Haki type ID');
    });
  });



  describe('PUT /api/haki-types/:id', () => {
    it('should update a Haki type', async () => {
      const updateData = {
        name: 'Advanced Observation Haki',
        description: 'Enhanced version of Observation Haki'
      };

      const mockUpdatedHakiType = {
        id: 1,
        name: 'Advanced Observation Haki',
        description: 'Enhanced version of Observation Haki',
        color: 'Red',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z'
      };

      hakiTypeService.updateHakiType.mockResolvedValue({
        success: true,
        data: { hakiType: mockUpdatedHakiType },
        message: 'Haki type updated successfully'
      });

      const response = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
      expect(hakiTypeService.updateHakiType).toHaveBeenCalledWith('1', updateData);
    });

    it('should return 404 for non-existent Haki type', async () => {
      hakiTypeService.updateHakiType.mockResolvedValue({
        success: false,
        message: 'Haki type not found',
        error: 'NOT_FOUND'
      });

      const response = await request(app)
        .put('/api/haki-types/999')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated Haki' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Haki type not found');
    });

    it('should validate at least one field is provided', async () => {
      const response = await request(app)
        .put('/api/haki-types/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('At least one field');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/haki-types/1')
        .send({ name: 'Updated Haki' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication token not provided');
    });
  });

});
