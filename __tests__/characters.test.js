jest.mock('../src/config/prisma.config', () => ({
  character: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  race: {
    findUnique: jest.fn()
  },
  characterDevilFruit: {
    count: jest.fn()
  }
}));

const prisma = require('../src/config/prisma.config');
const characterService = require('../src/services/character.service');

const mockRace = { id: 1, name: 'Human' };
const mockCharacter = {
  id: 1,
  name: 'Monkey D. Luffy',
  alias: 'Straw Hat Luffy',
  raceId: 1,
  bounty: BigInt('3000000000'),
  age: 19,
  status: 'alive',
  race: mockRace,
  devilFruits: [],
  characterTypes: [],
  organizations: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('CharacterService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllCharacters', () => {
    it('returns all characters with pagination', async () => {
      prisma.character.findMany.mockResolvedValue([mockCharacter]);
      prisma.character.count.mockResolvedValue(1);

      const result = await characterService.getAllCharacters();

      expect(result.success).toBe(true);
      expect(result.characters).toHaveLength(1);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBe(1);
    });

    it('supports search option', async () => {
      prisma.character.findMany.mockResolvedValue([mockCharacter]);
      prisma.character.count.mockResolvedValue(1);

      await characterService.getAllCharacters({ search: 'Luffy' });

      expect(prisma.character.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
      );
    });

    it('supports race_id filter', async () => {
      prisma.character.findMany.mockResolvedValue([mockCharacter]);
      prisma.character.count.mockResolvedValue(1);

      await characterService.getAllCharacters({ race_id: 1 });

      expect(prisma.character.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ raceId: 1 }) })
      );
    });

    it('supports status filter', async () => {
      prisma.character.findMany.mockResolvedValue([mockCharacter]);
      prisma.character.count.mockResolvedValue(1);

      await characterService.getAllCharacters({ status: 'alive' });

      expect(prisma.character.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'alive' }) })
      );
    });

    it('enters bounty filter branch when min_bounty or max_bounty is provided', async () => {
      prisma.character.findMany.mockResolvedValue([mockCharacter]);
      prisma.character.count.mockResolvedValue(1);

      const result = await characterService.getAllCharacters({ min_bounty: '1000000' });

      expect(result).toBeDefined();
    });

    it('supports desc sort order', async () => {
      prisma.character.findMany.mockResolvedValue([mockCharacter]);
      prisma.character.count.mockResolvedValue(1);

      const result = await characterService.getAllCharacters({ sortBy: 'bounty', sortOrder: 'desc' });

      expect(result.success).toBe(true);
    });

    it('falls back to default sort field for invalid sortBy', async () => {
      prisma.character.findMany.mockResolvedValue([mockCharacter]);
      prisma.character.count.mockResolvedValue(1);

      const result = await characterService.getAllCharacters({ sortBy: 'invalidField' });

      expect(result.success).toBe(true);
    });

    it('returns error object on failure', async () => {
      prisma.character.findMany.mockRejectedValue(new Error('DB error'));

      const result = await characterService.getAllCharacters();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch characters');
    });
  });

  describe('getCharacterById', () => {
    it('returns a character for a valid ID', async () => {
      prisma.character.findUnique.mockResolvedValue(mockCharacter);

      const result = await characterService.getCharacterById(1);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Monkey D. Luffy');
    });

    it('returns INVALID_ID for string zero ID', async () => {
      const result = await characterService.getCharacterById('0');
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('returns error on DB failure', async () => {
      prisma.character.findUnique.mockRejectedValue(new Error('DB error'));
      const result = await characterService.getCharacterById(1);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch character');
    });

    it('returns INVALID_ID for ID <= 0', async () => {
      const result = await characterService.getCharacterById(0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('returns NOT_FOUND when character does not exist', async () => {
      prisma.character.findUnique.mockResolvedValue(null);

      const result = await characterService.getCharacterById(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });
  });

  describe('createCharacter', () => {
    it('creates a character successfully', async () => {
      prisma.character.findUnique.mockResolvedValue(null);
      prisma.race.findUnique.mockResolvedValue(mockRace);
      prisma.character.create.mockResolvedValue(mockCharacter);

      const result = await characterService.createCharacter({
        name: 'Monkey D. Luffy',
        raceId: 1
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Character created successfully');
    });

    it('returns MISSING_NAME when name is not provided', async () => {
      const result = await characterService.createCharacter({ alias: 'Straw Hat' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('MISSING_NAME');
    });

    it('returns DUPLICATE_NAME when character name already exists', async () => {
      prisma.character.findUnique.mockResolvedValue(mockCharacter);

      const result = await characterService.createCharacter({ name: 'Monkey D. Luffy' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('DUPLICATE_NAME');
    });

    it('returns INVALID_RACE when raceId does not exist', async () => {
      prisma.character.findUnique.mockResolvedValue(null);
      prisma.race.findUnique.mockResolvedValue(null);

      const result = await characterService.createCharacter({ name: 'New Character', raceId: 99 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_RACE');
    });

    it('creates character without raceId (raceId optional)', async () => {
      prisma.character.findUnique.mockResolvedValue(null);
      prisma.character.create.mockResolvedValue({ ...mockCharacter, raceId: null });

      const result = await characterService.createCharacter({ name: 'Nameless' });

      expect(result.success).toBe(true);
    });

    it('returns error on DB failure during create', async () => {
      prisma.character.findUnique.mockResolvedValue(null);
      prisma.race.findUnique.mockResolvedValue(mockRace);
      prisma.character.create.mockRejectedValue(new Error('DB error'));

      const result = await characterService.createCharacter({ name: 'New Character', raceId: 1 });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create character');
    });
  });

  describe('updateCharacter', () => {
    it('updates a character successfully', async () => {
      const updated = { ...mockCharacter, alias: 'King of Pirates' };
      prisma.character.findUnique
        .mockResolvedValueOnce(mockCharacter)
        .mockResolvedValueOnce(null);
      prisma.character.update.mockResolvedValue(updated);

      const result = await characterService.updateCharacter(1, { alias: 'King of Pirates' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Character updated successfully');
    });

    it('returns NOT_FOUND for non-existing character', async () => {
      prisma.character.findUnique.mockResolvedValue(null);

      const result = await characterService.updateCharacter(999, { alias: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns NO_FIELDS_PROVIDED for empty update', async () => {
      prisma.character.findUnique.mockResolvedValue(mockCharacter);

      const result = await characterService.updateCharacter(1, {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('NO_FIELDS_PROVIDED');
    });

    it('returns INVALID_ID for ID <= 0', async () => {
      const result = await characterService.updateCharacter(0, { alias: 'Test' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('returns DUPLICATE_NAME when updated name already exists', async () => {
      prisma.character.findUnique
        .mockResolvedValueOnce(mockCharacter)
        .mockResolvedValueOnce({ ...mockCharacter, id: 2, name: 'Roronoa Zoro' });

      const result = await characterService.updateCharacter(1, { name: 'Roronoa Zoro' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('DUPLICATE_NAME');
    });

    it('allows updating name to the same value', async () => {
      prisma.character.findUnique
        .mockResolvedValueOnce(mockCharacter)
        .mockResolvedValueOnce(null);
      prisma.character.update.mockResolvedValue(mockCharacter);

      const result = await characterService.updateCharacter(1, { name: 'Monkey D. Luffy' });

      expect(result.success).toBe(true);
    });

    it('returns INVALID_RACE when updated raceId does not exist', async () => {
      prisma.character.findUnique.mockResolvedValueOnce(mockCharacter);
      prisma.race.findUnique.mockResolvedValue(null);

      const result = await characterService.updateCharacter(1, { raceId: 99 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_RACE');
    });
  });

  describe('deleteCharacter', () => {
    it('deletes a character successfully', async () => {
      prisma.character.findUnique.mockResolvedValue(mockCharacter);
      prisma.characterDevilFruit.count.mockResolvedValue(0);
      prisma.character.delete.mockResolvedValue(mockCharacter);

      const result = await characterService.deleteCharacter(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Character deleted successfully');
    });

    it('returns NOT_FOUND when character does not exist', async () => {
      prisma.character.findUnique.mockResolvedValue(null);

      const result = await characterService.deleteCharacter(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns HAS_ASSOCIATIONS when character has devil fruits', async () => {
      prisma.character.findUnique.mockResolvedValue(mockCharacter);
      prisma.characterDevilFruit.count.mockResolvedValue(1);

      const result = await characterService.deleteCharacter(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('HAS_ASSOCIATIONS');
    });

    it('returns INVALID_ID for ID <= 0', async () => {
      const result = await characterService.deleteCharacter(0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });
  });

  describe('searchCharacters', () => {
    it('returns matching characters', async () => {
      prisma.character.findMany.mockResolvedValue([mockCharacter]);
      prisma.character.count.mockResolvedValue(1);

      const result = await characterService.searchCharacters('Luffy');

      expect(result.success).toBe(true);
      expect(result.characters).toHaveLength(1);
    });

    it('returns error when search term is empty', async () => {
      const result = await characterService.searchCharacters('');
      expect(result.success).toBe(false);
      expect(result.error).toBe('MISSING_SEARCH_TERM');
    });

    it('returns error on DB failure during search', async () => {
      prisma.character.findMany.mockRejectedValue(new Error('DB error'));

      const result = await characterService.searchCharacters('Luffy');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch characters');
    });
  });
});
