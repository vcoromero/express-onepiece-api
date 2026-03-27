jest.mock('../src/config/prisma.config', () => ({
  hakiType: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  }
}));

const prisma = require('../src/config/prisma.config');
const hakiTypeService = require('../src/services/haki-type.service');

const mockHakiType = {
  id: 1,
  name: 'Observation Haki',
  description: 'Allows the user to sense the presence of others',
  color: 'yellow',
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('HakiTypeService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllHakiTypes', () => {
    it('returns all haki types successfully', async () => {
      prisma.hakiType.findMany.mockResolvedValue([mockHakiType]);

      const result = await hakiTypeService.getAllHakiTypes();

      expect(result.success).toBe(true);
      expect(result.hakiTypes).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('filters by search term', async () => {
      prisma.hakiType.findMany.mockResolvedValue([mockHakiType]);

      await hakiTypeService.getAllHakiTypes({ search: 'Observation' });

      expect(prisma.hakiType.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
      );
    });

    it('returns error object on failure', async () => {
      prisma.hakiType.findMany.mockRejectedValue(new Error('DB error'));

      const result = await hakiTypeService.getAllHakiTypes();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to retrieve Haki types');
    });
  });

  describe('getHakiTypeById', () => {
    it('returns a haki type for a valid ID', async () => {
      prisma.hakiType.findUnique.mockResolvedValue(mockHakiType);

      const result = await hakiTypeService.getHakiTypeById(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockHakiType);
    });

    it('returns INVALID_ID for a non-numeric ID', async () => {
      const result = await hakiTypeService.getHakiTypeById('abc');
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('returns INVALID_ID for ID <= 0', async () => {
      const result = await hakiTypeService.getHakiTypeById(0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('returns NOT_FOUND when haki type does not exist', async () => {
      prisma.hakiType.findUnique.mockResolvedValue(null);

      const result = await hakiTypeService.getHakiTypeById(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });
  });

  describe('updateHakiType', () => {
    it('updates a haki type successfully', async () => {
      const updated = { ...mockHakiType, description: 'Updated description' };
      prisma.hakiType.findUnique.mockResolvedValue(mockHakiType);
      prisma.hakiType.findFirst.mockResolvedValue(null);
      prisma.hakiType.update.mockResolvedValue(updated);

      const result = await hakiTypeService.updateHakiType(1, { description: 'Updated description' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Haki type updated successfully');
    });

    it('returns NOT_FOUND for non-existing ID', async () => {
      prisma.hakiType.findUnique.mockResolvedValue(null);

      const result = await hakiTypeService.updateHakiType(999, { name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns DUPLICATE_NAME when name already exists', async () => {
      prisma.hakiType.findUnique.mockResolvedValue(mockHakiType);
      prisma.hakiType.findFirst.mockResolvedValue({ id: 2, name: 'Armament Haki' });

      const result = await hakiTypeService.updateHakiType(1, { name: 'Armament Haki' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('DUPLICATE_NAME');
    });

    it('returns INVALID_ID for invalid ID', async () => {
      const result = await hakiTypeService.updateHakiType('abc', { name: 'Test' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('skips duplicate check when name is the same', async () => {
      prisma.hakiType.findUnique.mockResolvedValue(mockHakiType);
      prisma.hakiType.update.mockResolvedValue(mockHakiType);

      const result = await hakiTypeService.updateHakiType(1, { name: 'Observation Haki' });

      expect(result.success).toBe(true);
      expect(prisma.hakiType.findFirst).not.toHaveBeenCalled();
    });

    it('updates with description and color cleared when empty', async () => {
      const updated = { ...mockHakiType, description: null, color: null };
      prisma.hakiType.findUnique.mockResolvedValue(mockHakiType);
      prisma.hakiType.update.mockResolvedValue(updated);

      const result = await hakiTypeService.updateHakiType(1, { description: '', color: '' });

      expect(result.success).toBe(true);
    });

    it('returns error on DB failure', async () => {
      prisma.hakiType.findUnique.mockRejectedValue(new Error('DB error'));

      const result = await hakiTypeService.updateHakiType(1, { name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update Haki type');
    });
  });

  describe('getHakiTypeById DB error', () => {
    it('returns error on DB failure', async () => {
      prisma.hakiType.findUnique.mockRejectedValue(new Error('DB error'));

      const result = await hakiTypeService.getHakiTypeById(1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to retrieve Haki type');
    });
  });
});
