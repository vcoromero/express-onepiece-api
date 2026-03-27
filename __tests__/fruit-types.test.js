jest.mock('../src/config/prisma.config', () => ({
  fruitType: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  devilFruit: {
    count: jest.fn()
  }
}));

const prisma = require('../src/config/prisma.config');
const fruitTypeService = require('../src/services/fruit-type.service');

const mockFruitType = {
  id: 1,
  name: 'Paramecia',
  description: 'The most common Devil Fruit type',
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('FruitTypeService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllTypes', () => {
    it('returns all fruit types successfully', async () => {
      prisma.fruitType.findMany.mockResolvedValue([mockFruitType]);

      const result = await fruitTypeService.getAllTypes();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it('returns error object on failure', async () => {
      prisma.fruitType.findMany.mockRejectedValue(new Error('DB error'));

      const result = await fruitTypeService.getAllTypes();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch fruit types');
    });
  });

  describe('getTypeById', () => {
    it('returns a fruit type for a valid ID', async () => {
      prisma.fruitType.findUnique.mockResolvedValue(mockFruitType);

      const result = await fruitTypeService.getTypeById(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFruitType);
    });

    it('returns NOT_FOUND for non-numeric ID in current implementation', async () => {
      const result = await fruitTypeService.getTypeById('abc');
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns NOT_FOUND when type does not exist', async () => {
      prisma.fruitType.findUnique.mockResolvedValue(null);

      const result = await fruitTypeService.getTypeById(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });
  });

  describe('createType', () => {
    it('creates a fruit type successfully', async () => {
      prisma.fruitType.findFirst.mockResolvedValue(null);
      prisma.fruitType.create.mockResolvedValue(mockFruitType);

      const result = await fruitTypeService.createType({ name: 'Paramecia', description: 'Test' });

      expect(result.id).toBe(1);
      expect(result.name).toBe('Paramecia');
    });

    it('throws DUPLICATE_NAME when name already exists', async () => {
      prisma.fruitType.findFirst.mockResolvedValue(mockFruitType);

      await expect(fruitTypeService.createType({ name: 'Paramecia' })).rejects.toMatchObject({
        code: 'DUPLICATE_NAME'
      });
    });
  });

  describe('deleteType', () => {
    it('deletes a fruit type successfully', async () => {
      prisma.fruitType.findUnique.mockResolvedValue(mockFruitType);
      prisma.devilFruit.count.mockResolvedValue(0);
      prisma.fruitType.delete.mockResolvedValue(mockFruitType);

      const result = await fruitTypeService.deleteType(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Paramecia');
    });

    it('throws NOT_FOUND when type does not exist', async () => {
      prisma.fruitType.findUnique.mockResolvedValue(null);

      await expect(fruitTypeService.deleteType(999)).rejects.toMatchObject({
        code: 'NOT_FOUND'
      });
    });

    it('throws HAS_ASSOCIATIONS when type has associated devil fruits', async () => {
      prisma.fruitType.findUnique.mockResolvedValue(mockFruitType);
      prisma.devilFruit.count.mockResolvedValue(3);

      await expect(fruitTypeService.deleteType(1)).rejects.toMatchObject({
        code: 'HAS_ASSOCIATIONS'
      });
    });
  });

  describe('nameExists', () => {
    it('returns true when name exists', async () => {
      prisma.fruitType.findFirst.mockResolvedValue(mockFruitType);
      const result = await fruitTypeService.nameExists('Paramecia');
      expect(result).toBe(true);
    });

    it('returns false when name does not exist', async () => {
      prisma.fruitType.findFirst.mockResolvedValue(null);
      const result = await fruitTypeService.nameExists('Unknown');
      expect(result).toBe(false);
    });

    it('uses excludeId when provided', async () => {
      prisma.fruitType.findFirst.mockResolvedValue(null);
      const result = await fruitTypeService.nameExists('Paramecia', 1);
      expect(result).toBe(false);
      expect(prisma.fruitType.findFirst).toHaveBeenCalledWith({
        where: { name: 'Paramecia', id: { not: 1 } }
      });
    });

    it('returns false on findFirst error', async () => {
      prisma.fruitType.findFirst.mockRejectedValue(new Error('DB error'));
      const result = await fruitTypeService.nameExists('Paramecia');
      expect(result).toBe(false);
    });
  });

  describe('hasAssociatedFruits', () => {
    it('returns true when associated devil fruits exist', async () => {
      prisma.devilFruit.count.mockResolvedValue(5);
      const result = await fruitTypeService.hasAssociatedFruits(1);
      expect(result).toBe(true);
    });

    it('returns false when no associated devil fruits', async () => {
      prisma.devilFruit.count.mockResolvedValue(0);
      const result = await fruitTypeService.hasAssociatedFruits(1);
      expect(result).toBe(false);
    });

    it('returns false on error', async () => {
      prisma.devilFruit.count.mockRejectedValue(new Error('DB error'));
      const result = await fruitTypeService.hasAssociatedFruits(1);
      expect(result).toBe(false);
    });
  });

  describe('getAssociatedFruitsCount', () => {
    it('returns count of associated devil fruits', async () => {
      prisma.devilFruit.count.mockResolvedValue(7);
      const result = await fruitTypeService.getAssociatedFruitsCount(1);
      expect(result).toBe(7);
    });

    it('returns 0 on error', async () => {
      prisma.devilFruit.count.mockRejectedValue(new Error('DB error'));
      const result = await fruitTypeService.getAssociatedFruitsCount(1);
      expect(result).toBe(0);
    });
  });

  describe('updateType', () => {
    it('updates name and description successfully', async () => {
      prisma.fruitType.findUnique
        .mockResolvedValueOnce(mockFruitType)
        .mockResolvedValueOnce({ ...mockFruitType, name: 'Zoan' });
      prisma.fruitType.findFirst.mockResolvedValue(null);
      prisma.fruitType.update.mockResolvedValue({ ...mockFruitType, name: 'Zoan' });

      const result = await fruitTypeService.updateType(1, { name: 'Zoan', description: 'Animals' });

      expect(result.success).toBe(true);
    });

    it('throws NOT_FOUND when type does not exist', async () => {
      prisma.fruitType.findUnique.mockResolvedValue(null);

      await expect(fruitTypeService.updateType(999, { name: 'Zoan' })).rejects.toMatchObject({
        code: 'NOT_FOUND'
      });
    });

    it('throws DUPLICATE_NAME when new name already taken', async () => {
      prisma.fruitType.findUnique.mockResolvedValue(mockFruitType);
      prisma.fruitType.findFirst.mockResolvedValue({ id: 2, name: 'Zoan' });

      await expect(fruitTypeService.updateType(1, { name: 'Zoan' })).rejects.toMatchObject({
        code: 'DUPLICATE_NAME'
      });
    });

    it('updates only description when name not provided', async () => {
      prisma.fruitType.findUnique
        .mockResolvedValueOnce(mockFruitType)
        .mockResolvedValueOnce({ ...mockFruitType, description: 'New desc' });
      prisma.fruitType.update.mockResolvedValue({ ...mockFruitType, description: 'New desc' });

      const result = await fruitTypeService.updateType(1, { description: 'New desc' });

      expect(result.success).toBe(true);
    });
  });
});
