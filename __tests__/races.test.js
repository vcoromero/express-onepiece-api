jest.mock('../src/config/prisma.config', () => ({
  race: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn()
  },
  character: {
    count: jest.fn()
  }
}));

const prisma = require('../src/config/prisma.config');
const raceService = require('../src/services/race.service');

const mockRace = { id: 1, name: 'Human', description: 'Regular humans', createdAt: new Date(), updatedAt: new Date() };

describe('RaceService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllRaces', () => {
    it('returns all races successfully', async () => {
      prisma.race.findMany.mockResolvedValue([mockRace]);

      const result = await raceService.getAllRaces();

      expect(result.success).toBe(true);
      expect(result.races).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('filters by search term', async () => {
      prisma.race.findMany.mockResolvedValue([mockRace]);

      const result = await raceService.getAllRaces({ search: 'Human' });

      expect(result.success).toBe(true);
      expect(prisma.race.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
      );
    });

    it('returns error object on database failure', async () => {
      prisma.race.findMany.mockRejectedValue(new Error('DB error'));

      const result = await raceService.getAllRaces();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch races');
    });
  });

  describe('getRaceById', () => {
    it('returns a race for a valid ID', async () => {
      prisma.race.findUnique.mockResolvedValue(mockRace);

      const result = await raceService.getRaceById(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRace);
    });

    it('returns NOT_FOUND error for non-numeric ID in current implementation', async () => {
      const result = await raceService.getRaceById('abc');
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns INVALID_ID error for ID <= 0', async () => {
      const result = await raceService.getRaceById(0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('returns NOT_FOUND when race does not exist', async () => {
      prisma.race.findUnique.mockResolvedValue(null);

      const result = await raceService.getRaceById(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });
  });

  describe('updateRace', () => {
    it('updates a race successfully', async () => {
      const updated = { ...mockRace, name: 'Giant' };
      prisma.race.findUnique
        .mockResolvedValueOnce(mockRace)
        .mockResolvedValueOnce(null);
      prisma.race.update.mockResolvedValue(updated);

      const result = await raceService.updateRace(1, { name: 'Giant' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Race updated successfully');
    });

    it('returns NOT_FOUND when race does not exist', async () => {
      prisma.race.findUnique.mockResolvedValue(null);

      const result = await raceService.updateRace(999, { name: 'Giant' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns NO_FIELDS_PROVIDED when updateData is empty', async () => {
      prisma.race.findUnique.mockResolvedValue(mockRace);

      const result = await raceService.updateRace(1, {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('NO_FIELDS_PROVIDED');
    });

    it('returns NOT_FOUND for invalid ID in current implementation', async () => {
      const result = await raceService.updateRace('abc', { name: 'Giant' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns INVALID_NAME when name exceeds 50 characters', async () => {
      prisma.race.findUnique.mockResolvedValue(mockRace);

      const result = await raceService.updateRace(1, { name: 'A'.repeat(51) });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_NAME');
    });

    it('returns INVALID_NAME when name is empty string', async () => {
      prisma.race.findUnique.mockResolvedValue(mockRace);

      const result = await raceService.updateRace(1, { name: '' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_NAME');
    });

    it('skips duplicate check when name is unchanged', async () => {
      const updated = { ...mockRace };
      prisma.race.findUnique.mockResolvedValue(mockRace);
      prisma.race.update.mockResolvedValue(updated);

      const result = await raceService.updateRace(1, { name: 'Human' });

      expect(result.success).toBe(true);
      expect(prisma.race.findFirst).not.toHaveBeenCalled();
    });

    it('returns DUPLICATE_NAME when updated name already exists', async () => {
      prisma.race.findUnique
        .mockResolvedValueOnce(mockRace)
        .mockResolvedValueOnce({ id: 2, name: 'Mink' });

      const result = await raceService.updateRace(1, { name: 'Mink' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('DUPLICATE_NAME');
    });

    it('returns error on DB failure', async () => {
      prisma.race.findUnique.mockRejectedValue(new Error('DB error'));

      const result = await raceService.updateRace(1, { name: 'Giant' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update race');
    });
  });

  describe('getRaceById', () => {
    it('returns error on DB failure', async () => {
      prisma.race.findUnique.mockRejectedValue(new Error('DB error'));

      const result = await raceService.getRaceById(1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch race');
    });
  });

  describe('nameExists', () => {
    it('returns true when name exists', async () => {
      prisma.race.findFirst.mockResolvedValue(mockRace);
      const result = await raceService.nameExists('Human');
      expect(result).toBe(true);
    });

    it('returns false when name does not exist', async () => {
      prisma.race.findFirst.mockResolvedValue(null);
      const result = await raceService.nameExists('UnknownRace');
      expect(result).toBe(false);
    });

    it('uses excludeId in query when provided', async () => {
      prisma.race.findFirst.mockResolvedValue(null);
      const result = await raceService.nameExists('Human', 1);
      expect(prisma.race.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ id: { not: 1 } }) })
      );
      expect(result).toBe(false);
    });

    it('returns false on DB error', async () => {
      prisma.race.findFirst.mockRejectedValue(new Error('DB error'));
      const result = await raceService.nameExists('Human');
      expect(result).toBe(false);
    });
  });

  describe('idExists', () => {
    it('returns true when ID exists', async () => {
      prisma.race.findUnique.mockResolvedValue(mockRace);
      const result = await raceService.idExists(1);
      expect(result).toBe(true);
    });

    it('returns false when ID does not exist', async () => {
      prisma.race.findUnique.mockResolvedValue(null);
      const result = await raceService.idExists(999);
      expect(result).toBe(false);
    });

    it('returns false on DB error', async () => {
      prisma.race.findUnique.mockRejectedValue(new Error('DB error'));
      const result = await raceService.idExists(1);
      expect(result).toBe(false);
    });
  });

  describe('isRaceInUse', () => {
    it('returns true when characters use the race', async () => {
      prisma.character.count.mockResolvedValue(5);
      const result = await raceService.isRaceInUse(1);
      expect(result).toBe(true);
    });

    it('returns false when no characters use the race', async () => {
      prisma.character.count.mockResolvedValue(0);
      const result = await raceService.isRaceInUse(1);
      expect(result).toBe(false);
    });

    it('returns false on DB error', async () => {
      prisma.character.count.mockRejectedValue(new Error('DB error'));
      const result = await raceService.isRaceInUse(1);
      expect(result).toBe(false);
    });
  });
});
