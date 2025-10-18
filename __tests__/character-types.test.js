const request = require('supertest');
const app = require('../src/app');
const characterTypeService = require('../src/services/character-type.service');

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

// Mock CharacterTypeService - This is the Service Layer
jest.mock('../src/services/character-type.service', () => ({
  getAllCharacterTypes: jest.fn(),
  getCharacterTypeById: jest.fn(),
  updateCharacterType: jest.fn(),
  nameExists: jest.fn(),
  idExists: jest.fn(),
  isCharacterTypeInUse: jest.fn()
}));

describe('Character Type API Endpoints', () => {
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

  describe('GET /api/character-types', () => {
    it('should return all character types', async () => {
      const mockCharacterTypes = [
        {
          id: 1,
          name: 'Pirate',
          description: 'Individuals who sail the seas seeking freedom and adventure',
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

      characterTypeService.getAllCharacterTypes.mockResolvedValue({
        success: true,
        characterTypes: mockCharacterTypes,
        total: 2
      });

      const response = await request(app)
        .get('/api/character-types')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(characterTypeService.getAllCharacterTypes).toHaveBeenCalledWith({
        search: undefined,
        sortBy: 'name',
        sortOrder: 'asc'
      });
    });

    it('should handle service errors', async () => {
      characterTypeService.getAllCharacterTypes.mockResolvedValue({
        success: false,
        message: 'Database connection failed'
      });

      const response = await request(app)
        .get('/api/character-types')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database connection failed');
    });

    it('should handle search and sorting parameters', async () => {
      const mockCharacterTypes = [
        {
          id: 1,
          name: 'Pirate',
          description: 'Individuals who sail the seas seeking freedom and adventure'
        }
      ];

      characterTypeService.getAllCharacterTypes.mockResolvedValue({
        success: true,
        characterTypes: mockCharacterTypes,
        total: 1
      });

      const response = await request(app)
        .get('/api/character-types?search=pirate&sortBy=name&sortOrder=desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(characterTypeService.getAllCharacterTypes).toHaveBeenCalledWith({
        search: 'pirate',
        sortBy: 'name',
        sortOrder: 'desc'
      });
    });
  });

  describe('GET /api/character-types/:id', () => {
    it('should return a character type by ID', async () => {
      const mockCharacterType = {
        id: 1,
        name: 'Pirate',
        description: 'Individuals who sail the seas seeking freedom and adventure',
        created_at: new Date(),
        updated_at: new Date()
      };

      characterTypeService.getCharacterTypeById.mockResolvedValue({
        success: true,
        data: mockCharacterType
      });

      const response = await request(app)
        .get('/api/character-types/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Pirate');
      expect(characterTypeService.getCharacterTypeById).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent character type', async () => {
      characterTypeService.getCharacterTypeById.mockResolvedValue({
        success: false,
        message: 'Character type with ID 999 not found',
        error: 'NOT_FOUND'
      });

      const response = await request(app)
        .get('/api/character-types/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Character type with ID 999 not found');
    });

    it('should validate ID parameter', async () => {
      const response = await request(app)
        .get('/api/character-types/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid character type ID');
    });
  });

  describe('PUT /api/character-types/:id', () => {
    it('should update a character type', async () => {
      const updateData = {
        name: 'Pirate Updated',
        description: 'Updated description for Pirate character type'
      };

      const updatedCharacterType = {
        id: 1,
        name: 'Pirate Updated',
        description: 'Updated description for Pirate character type',
        created_at: new Date(),
        updated_at: new Date()
      };

      characterTypeService.updateCharacterType.mockResolvedValue({
        success: true,
        data: updatedCharacterType,
        message: 'Character type updated successfully'
      });

      const response = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Pirate Updated');
      expect(characterTypeService.updateCharacterType).toHaveBeenCalledWith(1, updateData);
    });

    it('should return 404 for non-existent character type', async () => {
      const updateData = { name: 'Updated Character Type' };

      characterTypeService.updateCharacterType.mockResolvedValue({
        success: false,
        message: 'Character type with ID 999 not found',
        error: 'NOT_FOUND'
      });

      const response = await request(app)
        .put('/api/character-types/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Character type with ID 999 not found');
    });

    it('should validate at least one field is provided', async () => {
      characterTypeService.updateCharacterType.mockResolvedValue({
        success: false,
        message: 'At least one field must be provided for update',
        error: 'NO_FIELDS_PROVIDED'
      });

      const response = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('At least one field must be provided for update');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/character-types/1')
        .send({ name: 'Unauthorized Update' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication token not provided');
    });

    it('should validate ID parameter', async () => {
      const response = await request(app)
        .put('/api/character-types/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid character type ID');
    });

    it('should handle duplicate name error', async () => {
      const updateData = { name: 'Marine' };

      characterTypeService.updateCharacterType.mockResolvedValue({
        success: false,
        message: 'A character type with this name already exists',
        error: 'DUPLICATE_NAME'
      });

      const response = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('A character type with this name already exists');
    });

    it('should validate name length', async () => {
      const updateData = { name: 'A'.repeat(51) };

      characterTypeService.updateCharacterType.mockResolvedValue({
        success: false,
        message: 'Name cannot exceed 50 characters',
        error: 'INVALID_NAME'
      });

      const response = await request(app)
        .put('/api/character-types/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Name cannot exceed 50 characters');
    });
  });
});
