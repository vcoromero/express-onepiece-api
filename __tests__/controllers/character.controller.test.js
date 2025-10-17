const request = require('supertest');
const app = require('../../src/app');

// Mock of service
jest.mock('../../src/services/character.service', () => ({
  getAllCharacters: jest.fn(),
  getCharacterById: jest.fn(),
  createCharacter: jest.fn(),
  updateCharacter: jest.fn(),
  deleteCharacter: jest.fn(),
  searchCharacters: jest.fn()
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
  Character: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Race: {
    count: jest.fn()
  },
  CharacterType: {
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

const CharacterService = require('../../src/services/character.service');

describe('CharacterController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/characters', () => {
    it('should return 200 with characters list', async () => {
      // Arrange
      const mockCharacters = [
        { id: 1, name: 'Monkey D. Luffy', bounty: 1500000000 },
        { id: 2, name: 'Roronoa Zoro', bounty: 1111000000 }
      ];
      const mockResult = {
        success: true,
        data: mockCharacters,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      };
      CharacterService.getAllCharacters.mockResolvedValue(mockResult);

      // Act
      const response = await request(app)
        .get('/api/characters')
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockResult);
      expect(CharacterService.getAllCharacters).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        race_id: undefined,
        character_type_id: undefined,
        min_bounty: undefined,
        max_bounty: undefined,
        is_alive: undefined,
        sortBy: 'name',
        sortOrder: 'asc'
      });
    });

    it('should return 400 for invalid page parameter', async () => {
      // Act
      const response = await request(app)
        .get('/api/characters?page=0')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100',
        error: 'INVALID_PAGINATION'
      });
    });

    it('should return 400 for invalid limit parameter', async () => {
      // Act
      const response = await request(app)
        .get('/api/characters?limit=101')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100',
        error: 'INVALID_PAGINATION'
      });
    });

    it('should return 400 for invalid race_id parameter', async () => {
      // Act
      const response = await request(app)
        .get('/api/characters?race_id=invalid')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid race_id parameter',
        error: 'INVALID_RACE_ID'
      });
    });

    it('should return 400 for invalid character_type_id parameter', async () => {
      // Act
      const response = await request(app)
        .get('/api/characters?character_type_id=invalid')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid character_type_id parameter',
        error: 'INVALID_CHARACTER_TYPE_ID'
      });
    });

    it('should return 400 for invalid min_bounty parameter', async () => {
      // Act
      const response = await request(app)
        .get('/api/characters?min_bounty=-1')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid min_bounty parameter',
        error: 'INVALID_MIN_BOUNTY'
      });
    });

    it('should return 400 for invalid max_bounty parameter', async () => {
      // Act
      const response = await request(app)
        .get('/api/characters?max_bounty=-1')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid max_bounty parameter',
        error: 'INVALID_MAX_BOUNTY'
      });
    });

    it('should return 400 when min_bounty is greater than max_bounty', async () => {
      // Act
      const response = await request(app)
        .get('/api/characters?min_bounty=1000&max_bounty=500')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'min_bounty cannot be greater than max_bounty',
        error: 'INVALID_BOUNTY_RANGE'
      });
    });

    it('should return 500 when service fails', async () => {
      // Arrange
      CharacterService.getAllCharacters.mockResolvedValue({
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      });

      // Act
      const response = await request(app)
        .get('/api/characters')
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      });
    });
  });

  describe('GET /api/characters/:id', () => {
    it('should return 200 with character details', async () => {
      // Arrange
      const mockCharacter = {
        id: 1,
        name: 'Monkey D. Luffy',
        bounty: 1500000000,
        race: { name: 'Human' },
        characterType: { name: 'Pirate' }
      };
      const mockResult = {
        success: true,
        data: mockCharacter
      };
      CharacterService.getCharacterById.mockResolvedValue(mockResult);

      // Act
      const response = await request(app)
        .get('/api/characters/1')
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockResult);
      expect(CharacterService.getCharacterById).toHaveBeenCalledWith(1);
    });

    it('should return 400 for invalid character ID', async () => {
      // Act
      const response = await request(app)
        .get('/api/characters/invalid')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid character ID',
        error: 'INVALID_ID'
      });
    });

    it('should return 400 for negative character ID', async () => {
      // Act
      const response = await request(app)
        .get('/api/characters/-1')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid character ID',
        error: 'INVALID_ID'
      });
    });

    it('should return 404 when character not found', async () => {
      // Arrange
      CharacterService.getCharacterById.mockResolvedValue({
        success: false,
        message: 'Character not found',
        error: 'NOT_FOUND'
      });

      // Act
      const response = await request(app)
        .get('/api/characters/999')
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Character not found',
        error: 'NOT_FOUND'
      });
    });

    it('should return 500 when service fails', async () => {
      // Arrange
      CharacterService.getCharacterById.mockResolvedValue({
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      });

      // Act
      const response = await request(app)
        .get('/api/characters/1')
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      });
    });
  });

  describe('POST /api/characters', () => {
    it('should return 201 with created character', async () => {
      // Arrange
      const characterData = {
        name: 'Monkey D. Luffy',
        race_id: 1,
        character_type_id: 1,
        bounty: 1500000000
      };
      const mockResult = {
        success: true,
        data: { id: 1, ...characterData }
      };
      CharacterService.createCharacter.mockResolvedValue(mockResult);

      // Act
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', 'Bearer valid-test-token')
        .send(characterData)
        .expect(201);

      // Assert
      expect(response.body).toEqual(mockResult);
      expect(CharacterService.createCharacter).toHaveBeenCalledWith({
        name: 'Monkey D. Luffy',
        race_id: 1,
        character_type_id: 1,
        bounty: 1500000000,
        japanese_name: undefined,
        age: undefined,
        height: undefined,
        description: undefined,
        abilities: undefined,
        image_url: undefined,
        is_alive: true,
        first_appearance: undefined
      });
    });

    it('should return 400 for missing name', async () => {
      // Act
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ race_id: 1 })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Name is required',
        error: 'MISSING_NAME'
      });
    });

    it('should return 400 for empty name', async () => {
      // Act
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: '   ' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Name is required',
        error: 'MISSING_NAME'
      });
    });

    it('should return 400 for invalid race_id', async () => {
      // Act
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Test', race_id: 'invalid' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid race_id',
        error: 'INVALID_RACE_ID'
      });
    });

    it('should return 400 for invalid character_type_id', async () => {
      // Act
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Test', character_type_id: 'invalid' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid character_type_id',
        error: 'INVALID_CHARACTER_TYPE_ID'
      });
    });

    it('should return 400 for invalid bounty', async () => {
      // Act
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Test', bounty: -1000 })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid bounty value',
        error: 'INVALID_BOUNTY'
      });
    });

    it('should return 400 for invalid age', async () => {
      // Act
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Test', age: 1500 })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid age value (must be between 0 and 1000)',
        error: 'INVALID_AGE'
      });
    });

    it('should return 400 for invalid height', async () => {
      // Act
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Test', height: 2000 })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid height value (must be between 0 and 1000 cm)',
        error: 'INVALID_HEIGHT'
      });
    });

    it('should return 400 for invalid race', async () => {
      // Arrange
      CharacterService.createCharacter.mockResolvedValue({
        success: false,
        message: 'Invalid race',
        error: 'INVALID_RACE'
      });

      // Act
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Test', race_id: 999 })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid race',
        error: 'INVALID_RACE'
      });
    });

    it('should return 409 for duplicate name', async () => {
      // Arrange
      CharacterService.createCharacter.mockResolvedValue({
        success: false,
        message: 'Character name already exists',
        error: 'DUPLICATE_NAME'
      });

      // Act
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Monkey D. Luffy' })
        .expect(409);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Character name already exists',
        error: 'DUPLICATE_NAME'
      });
    });

    it('should return 500 when service fails', async () => {
      // Arrange
      CharacterService.createCharacter.mockResolvedValue({
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      });

      // Act
      const response = await request(app)
        .post('/api/characters')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Test' })
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      });
    });
  });

  describe('PUT /api/characters/:id', () => {
    it('should return 200 with updated character', async () => {
      // Arrange
      const updateData = { name: 'Updated Name', bounty: 2000000000 };
      const mockResult = {
        success: true,
        data: { id: 1, ...updateData }
      };
      CharacterService.updateCharacter.mockResolvedValue(mockResult);

      // Act
      const response = await request(app)
        .put('/api/characters/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockResult);
      expect(CharacterService.updateCharacter).toHaveBeenCalledWith(1, updateData);
    });

    it('should return 400 for invalid character ID', async () => {
      // Act
      const response = await request(app)
        .put('/api/characters/invalid')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid character ID',
        error: 'INVALID_ID'
      });
    });

    it('should return 200 for invalid request body (Express handles JSON parsing)', async () => {
      // Act
      const response = await request(app)
        .put('/api/characters/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send('invalid')
        .expect(200); // Express will parse this as an empty object

      // Assert
      expect(response.body).toEqual({
        success: true,
        data: { id: 1, name: 'Updated Name', bounty: 2000000000 }
      });
    });

    it('should return 400 for invalid race_id in update', async () => {
      // Act
      const response = await request(app)
        .put('/api/characters/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ race_id: 'invalid' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid race_id',
        error: 'INVALID_RACE_ID'
      });
    });

    it('should return 400 for invalid character_type_id in update', async () => {
      // Act
      const response = await request(app)
        .put('/api/characters/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ character_type_id: 'invalid' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid character_type_id',
        error: 'INVALID_CHARACTER_TYPE_ID'
      });
    });

    it('should return 400 for invalid bounty in update', async () => {
      // Act
      const response = await request(app)
        .put('/api/characters/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ bounty: -1000 })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid bounty value',
        error: 'INVALID_BOUNTY'
      });
    });

    it('should return 400 for invalid age in update', async () => {
      // Act
      const response = await request(app)
        .put('/api/characters/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ age: 1500 })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid age value (must be between 0 and 1000)',
        error: 'INVALID_AGE'
      });
    });

    it('should return 400 for invalid height in update', async () => {
      // Act
      const response = await request(app)
        .put('/api/characters/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ height: 2000 })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid height value (must be between 0 and 1000 cm)',
        error: 'INVALID_HEIGHT'
      });
    });

    it('should return 404 when character not found', async () => {
      // Arrange
      CharacterService.updateCharacter.mockResolvedValue({
        success: false,
        message: 'Character not found',
        error: 'NOT_FOUND'
      });

      // Act
      const response = await request(app)
        .put('/api/characters/999')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Character not found',
        error: 'NOT_FOUND'
      });
    });

    it('should return 400 for invalid fields', async () => {
      // Arrange
      CharacterService.updateCharacter.mockResolvedValue({
        success: false,
        message: 'Invalid name',
        error: 'INVALID_NAME'
      });

      // Act
      const response = await request(app)
        .put('/api/characters/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: '' })
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid name',
        error: 'INVALID_NAME'
      });
    });

    it('should return 409 for duplicate name', async () => {
      // Arrange
      CharacterService.updateCharacter.mockResolvedValue({
        success: false,
        message: 'Character name already exists',
        error: 'DUPLICATE_NAME'
      });

      // Act
      const response = await request(app)
        .put('/api/characters/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Existing Name' })
        .expect(409);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Character name already exists',
        error: 'DUPLICATE_NAME'
      });
    });

    it('should return 500 when service fails', async () => {
      // Arrange
      CharacterService.updateCharacter.mockResolvedValue({
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      });

      // Act
      const response = await request(app)
        .put('/api/characters/1')
        .set('Authorization', 'Bearer valid-test-token')
        .send({ name: 'Updated' })
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      });
    });
  });

  describe('DELETE /api/characters/:id', () => {
    it('should return 200 with deletion confirmation', async () => {
      // Arrange
      const mockResult = {
        success: true,
        message: 'Character deleted successfully'
      };
      CharacterService.deleteCharacter.mockResolvedValue(mockResult);

      // Act
      const response = await request(app)
        .delete('/api/characters/1')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockResult);
      expect(CharacterService.deleteCharacter).toHaveBeenCalledWith(1);
    });

    it('should return 400 for invalid character ID', async () => {
      // Act
      const response = await request(app)
        .delete('/api/characters/invalid')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Invalid character ID',
        error: 'INVALID_ID'
      });
    });

    it('should return 404 when character not found', async () => {
      // Arrange
      CharacterService.deleteCharacter.mockResolvedValue({
        success: false,
        message: 'Character not found',
        error: 'NOT_FOUND'
      });

      // Act
      const response = await request(app)
        .delete('/api/characters/999')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(404);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Character not found',
        error: 'NOT_FOUND'
      });
    });

    it('should return 409 when character has associations', async () => {
      // Arrange
      CharacterService.deleteCharacter.mockResolvedValue({
        success: false,
        message: 'Cannot delete character with active associations',
        error: 'HAS_ASSOCIATIONS'
      });

      // Act
      const response = await request(app)
        .delete('/api/characters/1')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(409);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Cannot delete character with active associations',
        error: 'HAS_ASSOCIATIONS'
      });
    });

    it('should return 500 when service fails', async () => {
      // Arrange
      CharacterService.deleteCharacter.mockResolvedValue({
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      });

      // Act
      const response = await request(app)
        .delete('/api/characters/1')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      });
    });
  });

  describe('GET /api/characters/search', () => {
    it('should return 200 with search results', async () => {
      // Arrange
      const mockResults = [
        { id: 1, name: 'Monkey D. Luffy' },
        { id: 2, name: 'Monkey D. Dragon' }
      ];
      const mockResult = {
        success: true,
        data: mockResults
      };
      CharacterService.searchCharacters.mockResolvedValue(mockResult);

      // Act
      const response = await request(app)
        .get('/api/characters/search?q=Monkey')
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockResult);
      expect(CharacterService.searchCharacters).toHaveBeenCalledWith('Monkey', {});
    });

    it('should return 400 for missing search query', async () => {
      // Act
      const response = await request(app)
        .get('/api/characters/search')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Search query parameter "q" is required',
        error: 'MISSING_SEARCH_QUERY'
      });
    });

    it('should return 400 for empty search query', async () => {
      // Act
      const response = await request(app)
        .get('/api/characters/search?q=   ')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Search query parameter "q" is required',
        error: 'MISSING_SEARCH_QUERY'
      });
    });

    it('should return 400 for missing search term', async () => {
      // Arrange
      CharacterService.searchCharacters.mockResolvedValue({
        success: false,
        message: 'Search query parameter "q" is required',
        error: 'MISSING_SEARCH_QUERY'
      });

      // Act
      const response = await request(app)
        .get('/api/characters/search?q=')
        .expect(400);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Search query parameter "q" is required',
        error: 'MISSING_SEARCH_QUERY'
      });
    });

    it('should return 500 when service fails', async () => {
      // Arrange
      CharacterService.searchCharacters.mockResolvedValue({
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      });

      // Act
      const response = await request(app)
        .get('/api/characters/search?q=test')
        .expect(500);

      // Assert
      expect(response.body).toEqual({
        success: false,
        message: 'Database error',
        error: 'DATABASE_ERROR'
      });
    });
  });
});
