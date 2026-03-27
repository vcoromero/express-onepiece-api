jest.mock('../src/config/prisma.config', () => ({
  characterType: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  },
  characterCharacterType: {
    count: jest.fn()
  }
}));

const prisma = require('../src/config/prisma.config');
const characterTypeService = require('../src/services/character-type.service');

const mockType = { id: 1, name: 'Pirate', description: 'Pirates of the sea', createdAt: new Date(), updatedAt: new Date() };

describe('CharacterTypeService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllCharacterTypes', () => {
    it('returns all character types successfully', async () => {
      prisma.characterType.findMany.mockResolvedValue([mockType]);

      const result = await characterTypeService.getAllCharacterTypes();

      expect(result.success).toBe(true);
      expect(result.characterTypes).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('returns error object on failure', async () => {
      prisma.characterType.findMany.mockRejectedValue(new Error('DB error'));

      const result = await characterTypeService.getAllCharacterTypes();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch character types');
    });
  });

  describe('getCharacterTypeById', () => {
    it('returns a character type for a valid ID', async () => {
      prisma.characterType.findUnique.mockResolvedValue(mockType);

      const result = await characterTypeService.getCharacterTypeById(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockType);
    });

    it('returns INVALID_ID for ID of zero', async () => {
      const result = await characterTypeService.getCharacterTypeById(0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('returns INVALID_ID for negative ID', async () => {
      const result = await characterTypeService.getCharacterTypeById(-1);
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('returns NOT_FOUND when type does not exist', async () => {
      prisma.characterType.findUnique.mockResolvedValue(null);

      const result = await characterTypeService.getCharacterTypeById(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });
  });

  describe('updateCharacterType', () => {
    it('updates successfully', async () => {
      const updated = { ...mockType, name: 'Marine' };
      prisma.characterType.findUnique
        .mockResolvedValueOnce(mockType)
        .mockResolvedValueOnce(null);
      prisma.characterType.update.mockResolvedValue(updated);

      const result = await characterTypeService.updateCharacterType(1, { name: 'Marine' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Character type updated successfully');
    });

    it('returns NOT_FOUND for non-existing ID', async () => {
      prisma.characterType.findUnique.mockResolvedValue(null);

      const result = await characterTypeService.updateCharacterType(999, { name: 'Marine' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns NO_FIELDS_PROVIDED for empty update', async () => {
      prisma.characterType.findUnique.mockResolvedValue(mockType);

      const result = await characterTypeService.updateCharacterType(1, {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('NO_FIELDS_PROVIDED');
    });

    it('returns INVALID_NAME when name is empty string', async () => {
      prisma.characterType.findUnique.mockResolvedValue(mockType);

      const result = await characterTypeService.updateCharacterType(1, { name: '' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_NAME');
    });

    it('returns INVALID_NAME when name exceeds 50 characters', async () => {
      prisma.characterType.findUnique.mockResolvedValue(mockType);
      const longName = 'A'.repeat(51);

      const result = await characterTypeService.updateCharacterType(1, { name: longName });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_NAME');
    });

    it('skips duplicate check when name is unchanged', async () => {
      prisma.characterType.findUnique.mockResolvedValue(mockType);
      prisma.characterType.update.mockResolvedValue(mockType);

      const result = await characterTypeService.updateCharacterType(1, { name: 'Pirate' });

      expect(result.success).toBe(true);
      expect(prisma.characterType.findFirst).not.toHaveBeenCalled();
    });

    it('returns DUPLICATE_NAME when updated name already exists', async () => {
      prisma.characterType.findUnique
        .mockResolvedValueOnce(mockType)
        .mockResolvedValueOnce({ id: 2, name: 'Marine' });

      const result = await characterTypeService.updateCharacterType(1, { name: 'Marine' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('DUPLICATE_NAME');
    });

    it('returns error on DB failure', async () => {
      prisma.characterType.findUnique.mockRejectedValue(new Error('DB error'));

      const result = await characterTypeService.updateCharacterType(1, { name: 'Marine' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update character type');
    });
  });

  describe('getCharacterTypeById DB error', () => {
    it('returns error on DB failure', async () => {
      prisma.characterType.findUnique.mockRejectedValue(new Error('DB error'));

      const result = await characterTypeService.getCharacterTypeById(1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch character type');
    });
  });

  describe('nameExists', () => {
    it('returns true when name exists', async () => {
      prisma.characterType.findFirst.mockResolvedValue(mockType);
      const result = await characterTypeService.nameExists('Pirate');
      expect(result).toBe(true);
    });

    it('returns false when name does not exist', async () => {
      prisma.characterType.findFirst.mockResolvedValue(null);
      const result = await characterTypeService.nameExists('Unknown');
      expect(result).toBe(false);
    });

    it('uses excludeId in query when provided', async () => {
      prisma.characterType.findFirst.mockResolvedValue(null);
      await characterTypeService.nameExists('Pirate', 1);
      expect(prisma.characterType.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ id: { not: 1 } }) })
      );
    });

    it('returns false on DB error', async () => {
      prisma.characterType.findFirst.mockRejectedValue(new Error('DB error'));
      const result = await characterTypeService.nameExists('Pirate');
      expect(result).toBe(false);
    });
  });

  describe('idExists', () => {
    it('returns true when ID exists', async () => {
      prisma.characterType.findUnique.mockResolvedValue(mockType);
      const result = await characterTypeService.idExists(1);
      expect(result).toBe(true);
    });

    it('returns false when ID does not exist', async () => {
      prisma.characterType.findUnique.mockResolvedValue(null);
      const result = await characterTypeService.idExists(999);
      expect(result).toBe(false);
    });

    it('returns false on DB error', async () => {
      prisma.characterType.findUnique.mockRejectedValue(new Error('DB error'));
      const result = await characterTypeService.idExists(1);
      expect(result).toBe(false);
    });
  });

  describe('isCharacterTypeInUse', () => {
    it('returns true when characters use the type', async () => {
      prisma.characterCharacterType.count.mockResolvedValue(3);
      const result = await characterTypeService.isCharacterTypeInUse(1);
      expect(result).toBe(true);
    });

    it('returns false when no characters use the type', async () => {
      prisma.characterCharacterType.count.mockResolvedValue(0);
      const result = await characterTypeService.isCharacterTypeInUse(1);
      expect(result).toBe(false);
    });

    it('returns false on DB error', async () => {
      prisma.characterCharacterType.count.mockRejectedValue(new Error('DB error'));
      const result = await characterTypeService.isCharacterTypeInUse(1);
      expect(result).toBe(false);
    });
  });
});
