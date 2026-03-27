jest.mock('../src/config/prisma.config', () => ({
  devilFruit: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  fruitType: {
    findUnique: jest.fn()
  }
}));

const prisma = require('../src/config/prisma.config');
const devilFruitService = require('../src/services/devil-fruit.service');

const mockFruitType = { id: 1, name: 'Paramecia', description: 'Common type' };
const mockFruit = {
  id: 1,
  name: 'Gomu Gomu no Mi',
  japaneseName: 'ゴムゴムの実',
  typeId: 1,
  description: 'Rubber fruit',
  currentUserId: null,
  fruitType: mockFruitType,
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('DevilFruitService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllFruits', () => {
    it('returns all devil fruits with pagination', async () => {
      prisma.devilFruit.findMany.mockResolvedValue([mockFruit]);
      prisma.devilFruit.count.mockResolvedValue(1);

      const result = await devilFruitService.getAllFruits();

      expect(result.success).toBe(true);
      expect(result.fruits).toHaveLength(1);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBe(1);
    });

    it('supports pagination options', async () => {
      prisma.devilFruit.findMany.mockResolvedValue([]);
      prisma.devilFruit.count.mockResolvedValue(50);

      const result = await devilFruitService.getAllFruits({ page: 2, limit: 5 });

      expect(result.success).toBe(true);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
    });

    it('applies search filter', async () => {
      prisma.devilFruit.findMany.mockResolvedValue([mockFruit]);
      prisma.devilFruit.count.mockResolvedValue(1);

      await devilFruitService.getAllFruits({ search: 'Gomu' });

      expect(prisma.devilFruit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
      );
    });

    it('applies type_id filter', async () => {
      prisma.devilFruit.findMany.mockResolvedValue([mockFruit]);
      prisma.devilFruit.count.mockResolvedValue(1);

      await devilFruitService.getAllFruits({ type_id: 1 });

      expect(prisma.devilFruit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ typeId: 1 }) })
      );
    });

    it('uses desc sort order', async () => {
      prisma.devilFruit.findMany.mockResolvedValue([mockFruit]);
      prisma.devilFruit.count.mockResolvedValue(1);

      const result = await devilFruitService.getAllFruits({ sortBy: 'createdAt', sortOrder: 'desc' });

      expect(result.success).toBe(true);
    });

    it('falls back to default sort field for invalid sortBy', async () => {
      prisma.devilFruit.findMany.mockResolvedValue([mockFruit]);
      prisma.devilFruit.count.mockResolvedValue(1);

      const result = await devilFruitService.getAllFruits({ sortBy: 'invalidField' });

      expect(result.success).toBe(true);
    });

    it('calculates hasNext and hasPrev pagination flags', async () => {
      prisma.devilFruit.findMany.mockResolvedValue([mockFruit]);
      prisma.devilFruit.count.mockResolvedValue(25);

      const result = await devilFruitService.getAllFruits({ page: 2, limit: 10 });

      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
    });

    it('returns error object on failure', async () => {
      prisma.devilFruit.findMany.mockRejectedValue(new Error('DB error'));

      const result = await devilFruitService.getAllFruits();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch devil fruits');
    });
  });

  describe('getFruitById', () => {
    it('returns a fruit for a valid ID', async () => {
      prisma.devilFruit.findUnique.mockResolvedValue(mockFruit);

      const result = await devilFruitService.getFruitById(1);

      expect(result).toEqual(mockFruit);
    });

    it('returns null for an invalid ID (non-numeric)', async () => {
      const result = await devilFruitService.getFruitById('abc');
      expect(result).toBeNull();
    });

    it('returns null for ID <= 0', async () => {
      const result = await devilFruitService.getFruitById(0);
      expect(result).toBeNull();
    });

    it('returns null when fruit does not exist', async () => {
      prisma.devilFruit.findUnique.mockResolvedValue(null);

      const result = await devilFruitService.getFruitById(999);

      expect(result).toBeNull();
    });

    it('returns null on DB error', async () => {
      prisma.devilFruit.findUnique.mockRejectedValue(new Error('DB error'));

      const result = await devilFruitService.getFruitById(1);

      expect(result).toBeNull();
    });
  });

  describe('createFruit', () => {
    it('creates a devil fruit successfully', async () => {
      prisma.devilFruit.findFirst.mockResolvedValue(null);
      prisma.fruitType.findUnique.mockResolvedValue(mockFruitType);
      prisma.devilFruit.create.mockResolvedValue(mockFruit);
      prisma.devilFruit.findUnique.mockResolvedValue(mockFruit);

      const result = await devilFruitService.createFruit({
        name: 'Gomu Gomu no Mi',
        typeId: 1
      });

      expect(result).toEqual(mockFruit);
    });

    it('throws DUPLICATE_NAME when fruit name exists', async () => {
      prisma.devilFruit.findFirst.mockResolvedValue(mockFruit);

      await expect(devilFruitService.createFruit({ name: 'Gomu Gomu no Mi', typeId: 1 })).rejects.toMatchObject({
        code: 'DUPLICATE_NAME'
      });
    });

    it('throws INVALID_TYPE when type does not exist', async () => {
      prisma.devilFruit.findFirst.mockResolvedValue(null);
      prisma.fruitType.findUnique.mockResolvedValue(null);

      await expect(devilFruitService.createFruit({ name: 'New Fruit', typeId: 99 })).rejects.toMatchObject({
        code: 'INVALID_TYPE'
      });
    });
  });

  describe('deleteFruit', () => {
    it('deletes a fruit successfully', async () => {
      prisma.devilFruit.findUnique.mockResolvedValue(mockFruit);
      prisma.devilFruit.delete.mockResolvedValue(mockFruit);

      const result = await devilFruitService.deleteFruit(1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Gomu Gomu no Mi');
    });

    it('throws NOT_FOUND when fruit does not exist', async () => {
      prisma.devilFruit.findUnique.mockResolvedValue(null);

      await expect(devilFruitService.deleteFruit(999)).rejects.toMatchObject({
        code: 'NOT_FOUND'
      });
    });
  });

  describe('nameExists', () => {
    it('returns true when name exists', async () => {
      prisma.devilFruit.findFirst.mockResolvedValue(mockFruit);
      const result = await devilFruitService.nameExists('Gomu Gomu no Mi');
      expect(result).toBe(true);
    });

    it('returns false when name does not exist', async () => {
      prisma.devilFruit.findFirst.mockResolvedValue(null);
      const result = await devilFruitService.nameExists('Unknown Fruit');
      expect(result).toBe(false);
    });

    it('uses excludeId in query when provided', async () => {
      prisma.devilFruit.findFirst.mockResolvedValue(null);
      const result = await devilFruitService.nameExists('Gomu Gomu no Mi', 1);
      expect(prisma.devilFruit.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ id: { not: 1 } }) })
      );
      expect(result).toBe(false);
    });

    it('returns false on DB error', async () => {
      prisma.devilFruit.findFirst.mockRejectedValue(new Error('DB error'));
      const result = await devilFruitService.nameExists('Gomu Gomu no Mi');
      expect(result).toBe(false);
    });
  });

  describe('typeExists', () => {
    it('returns true when type exists', async () => {
      prisma.fruitType.findUnique.mockResolvedValue(mockFruitType);
      const result = await devilFruitService.typeExists(1);
      expect(result).toBe(true);
    });

    it('returns false when type does not exist', async () => {
      prisma.fruitType.findUnique.mockResolvedValue(null);
      const result = await devilFruitService.typeExists(99);
      expect(result).toBe(false);
    });

    it('returns false on DB error', async () => {
      prisma.fruitType.findUnique.mockRejectedValue(new Error('DB error'));
      const result = await devilFruitService.typeExists(1);
      expect(result).toBe(false);
    });
  });

  describe('updateFruit', () => {
    it('updates a fruit successfully (name + typeId)', async () => {
      const updatedFruit = { ...mockFruit, name: 'Hito Hito no Mi' };
      prisma.devilFruit.findUnique
        .mockResolvedValueOnce(mockFruit)
        .mockResolvedValueOnce(updatedFruit);
      prisma.devilFruit.findFirst.mockResolvedValue(null);
      prisma.fruitType.findUnique.mockResolvedValue(mockFruitType);
      prisma.devilFruit.update.mockResolvedValue(updatedFruit);

      const result = await devilFruitService.updateFruit(1, { name: 'Hito Hito no Mi', typeId: 1 });

      expect(result).toEqual(updatedFruit);
    });

    it('updates fruit with optional fields (japaneseName, description, currentUserId)', async () => {
      const updatedFruit = { ...mockFruit, description: 'Updated' };
      prisma.devilFruit.findUnique
        .mockResolvedValueOnce(mockFruit)
        .mockResolvedValueOnce(updatedFruit);
      prisma.devilFruit.update.mockResolvedValue(updatedFruit);

      const result = await devilFruitService.updateFruit(1, {
        japaneseName: 'ゴムゴムの実',
        description: 'Updated',
        currentUserId: 5
      });

      expect(result).toEqual(updatedFruit);
    });

    it('clears optional fields when set to null/empty', async () => {
      prisma.devilFruit.findUnique
        .mockResolvedValueOnce(mockFruit)
        .mockResolvedValueOnce(mockFruit);
      prisma.devilFruit.update.mockResolvedValue(mockFruit);

      const result = await devilFruitService.updateFruit(1, {
        japaneseName: '',
        description: '',
        currentUserId: 0
      });

      expect(result).toEqual(mockFruit);
    });

    it('throws NOT_FOUND when fruit does not exist', async () => {
      prisma.devilFruit.findUnique.mockResolvedValue(null);

      await expect(devilFruitService.updateFruit(999, { name: 'Test' })).rejects.toMatchObject({
        code: 'NOT_FOUND'
      });
    });

    it('throws DUPLICATE_NAME when updated name already exists', async () => {
      prisma.devilFruit.findUnique.mockResolvedValue(mockFruit);
      prisma.devilFruit.findFirst.mockResolvedValue({ ...mockFruit, id: 2, name: 'Hito Hito no Mi' });

      await expect(devilFruitService.updateFruit(1, { name: 'Hito Hito no Mi' })).rejects.toMatchObject({
        code: 'DUPLICATE_NAME'
      });
    });

    it('throws INVALID_TYPE when updated typeId does not exist', async () => {
      prisma.devilFruit.findUnique.mockResolvedValue(mockFruit);
      prisma.devilFruit.findFirst.mockResolvedValue(null);
      prisma.fruitType.findUnique.mockResolvedValue(null);

      await expect(devilFruitService.updateFruit(1, { typeId: 99 })).rejects.toMatchObject({
        code: 'INVALID_TYPE'
      });
    });
  });

  describe('getFruitsByType', () => {
    it('returns fruits for a given type with pagination', async () => {
      prisma.devilFruit.findMany.mockResolvedValue([mockFruit]);
      prisma.devilFruit.count.mockResolvedValue(1);

      const result = await devilFruitService.getFruitsByType(1);

      expect(result.success).toBe(true);
      expect(result.fruits).toHaveLength(1);
      expect(result.pagination).toBeDefined();
    });

    it('supports pagination options', async () => {
      prisma.devilFruit.findMany.mockResolvedValue([]);
      prisma.devilFruit.count.mockResolvedValue(30);

      const result = await devilFruitService.getFruitsByType(1, { page: 2, limit: 5 });

      expect(result.success).toBe(true);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.hasPrev).toBe(true);
    });

    it('uses desc sort order', async () => {
      prisma.devilFruit.findMany.mockResolvedValue([mockFruit]);
      prisma.devilFruit.count.mockResolvedValue(1);

      const result = await devilFruitService.getFruitsByType(1, { sortOrder: 'desc' });

      expect(result.success).toBe(true);
    });

    it('falls back to default sortBy for invalid field', async () => {
      prisma.devilFruit.findMany.mockResolvedValue([mockFruit]);
      prisma.devilFruit.count.mockResolvedValue(1);

      const result = await devilFruitService.getFruitsByType(1, { sortBy: 'invalidField' });

      expect(result.success).toBe(true);
    });

    it('returns error object on failure', async () => {
      prisma.devilFruit.findMany.mockRejectedValue(new Error('DB error'));

      const result = await devilFruitService.getFruitsByType(1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch devil fruits by type');
    });
  });
});
