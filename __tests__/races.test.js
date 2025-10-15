const request = require('supertest');
const app = require('../src/app');
const raceService = require('../src/services/race.service');

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

// Mock RaceService - This is the Service Layer
jest.mock('../src/services/race.service', () => ({
  getAllRaces: jest.fn(),
  getRaceById: jest.fn(),
  updateRace: jest.fn(),
  nameExists: jest.fn(),
  idExists: jest.fn(),
  isRaceInUse: jest.fn()
}));

describe('Race API Endpoints', () => {
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

  describe('GET /api/races', () => {
    it('should return all races', async () => {
      const mockRaces = [
        {
          id: 1,
          name: 'Human',
          description: 'The most common race in the world',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          name: 'Fishman',
          description: 'Humanoid fish that can breathe underwater',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      raceService.getAllRaces.mockResolvedValue({
        success: true,
        data: {
          races: mockRaces,
          total: 2
        }
      });

      const response = await request(app)
        .get('/api/races')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.races).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
      expect(raceService.getAllRaces).toHaveBeenCalledWith({
        search: undefined,
        sortBy: 'name',
        sortOrder: 'asc'
      });
    });

    it('should handle service errors', async () => {
      raceService.getAllRaces.mockResolvedValue({
        success: false,
        message: 'Database connection failed'
      });

      const response = await request(app)
        .get('/api/races')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database connection failed');
    });

    it('should handle search and sorting parameters', async () => {
      const mockRaces = [
        {
          id: 1,
          name: 'Human',
          description: 'The most common race in the world'
        }
      ];

      raceService.getAllRaces.mockResolvedValue({
        success: true,
        data: {
          races: mockRaces,
          total: 1
        }
      });

      const response = await request(app)
        .get('/api/races?search=human&sortBy=name&sortOrder=desc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(raceService.getAllRaces).toHaveBeenCalledWith({
        search: 'human',
        sortBy: 'name',
        sortOrder: 'desc'
      });
    });
  });

  describe('GET /api/races/:id', () => {
    it('should return a race by ID', async () => {
      const mockRace = {
        id: 1,
        name: 'Human',
        description: 'The most common race in the world',
        created_at: new Date(),
        updated_at: new Date()
      };

      raceService.getRaceById.mockResolvedValue({
        success: true,
        data: mockRace
      });

      const response = await request(app)
        .get('/api/races/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Human');
      expect(raceService.getRaceById).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent race', async () => {
      raceService.getRaceById.mockResolvedValue({
        success: false,
        message: 'Race with ID 999 not found',
        error: 'NOT_FOUND'
      });

      const response = await request(app)
        .get('/api/races/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Race with ID 999 not found');
    });

    it('should validate ID parameter', async () => {
      const response = await request(app)
        .get('/api/races/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid race ID');
    });
  });

  describe('PUT /api/races/:id', () => {
    it('should update a race', async () => {
      const updateData = {
        name: 'Human Updated',
        description: 'Updated description for Human race'
      };

      const updatedRace = {
        id: 1,
        name: 'Human Updated',
        description: 'Updated description for Human race',
        created_at: new Date(),
        updated_at: new Date()
      };

      raceService.updateRace.mockResolvedValue({
        success: true,
        data: updatedRace,
        message: 'Race updated successfully'
      });

      const response = await request(app)
        .put('/api/races/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Human Updated');
      expect(raceService.updateRace).toHaveBeenCalledWith(1, updateData);
    });

    it('should return 404 for non-existent race', async () => {
      const updateData = { name: 'Updated Race' };

      raceService.updateRace.mockResolvedValue({
        success: false,
        message: 'Race with ID 999 not found',
        error: 'NOT_FOUND'
      });

      const response = await request(app)
        .put('/api/races/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Race with ID 999 not found');
    });

    it('should validate at least one field is provided', async () => {
      raceService.updateRace.mockResolvedValue({
        success: false,
        message: 'At least one field must be provided for update',
        error: 'NO_FIELDS_PROVIDED'
      });

      const response = await request(app)
        .put('/api/races/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('At least one field must be provided for update');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/races/1')
        .send({ name: 'Unauthorized Update' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication token not provided');
    });

    it('should validate ID parameter', async () => {
      const response = await request(app)
        .put('/api/races/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid race ID');
    });

    it('should handle duplicate name error', async () => {
      const updateData = { name: 'Fishman' };

      raceService.updateRace.mockResolvedValue({
        success: false,
        message: 'A race with this name already exists',
        error: 'DUPLICATE_NAME'
      });

      const response = await request(app)
        .put('/api/races/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('A race with this name already exists');
    });

    it('should validate name length', async () => {
      const updateData = { name: 'A'.repeat(51) };

      raceService.updateRace.mockResolvedValue({
        success: false,
        message: 'Name cannot exceed 50 characters',
        error: 'INVALID_NAME'
      });

      const response = await request(app)
        .put('/api/races/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Name cannot exceed 50 characters');
    });
  });
});
