jest.mock('../src/config/prisma.config', () => ({
  ship: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  organization: {
    count: jest.fn()
  }
}));

const prisma = require('../src/config/prisma.config');
const shipService = require('../src/services/ship.service');

const mockShip = {
  id: 1,
  name: 'Going Merry',
  status: 'active',
  description: 'Straw Hats first ship',
  organization: { id: 1, name: 'Straw Hat Pirates' }
};

describe('ShipService', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('getAllShips', () => {
    it('returns all ships with pagination', async () => {
      prisma.ship.findMany.mockResolvedValue([mockShip]);
      prisma.ship.count.mockResolvedValue(1);

      const result = await shipService.getAllShips();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('filters by search term', async () => {
      prisma.ship.findMany.mockResolvedValue([mockShip]);
      prisma.ship.count.mockResolvedValue(1);

      await shipService.getAllShips({ search: 'Going' });

      expect(prisma.ship.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ name: expect.any(Object) }) })
      );
    });

    it('filters by valid status', async () => {
      prisma.ship.findMany.mockResolvedValue([mockShip]);
      prisma.ship.count.mockResolvedValue(1);

      await shipService.getAllShips({ status: 'active' });

      expect(prisma.ship.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'active' }) })
      );
    });

    it('throws for invalid status', async () => {
      const result = await shipService.getAllShips({ status: 'sunk' });
      expect(result.success).toBe(false);
    });

    it('returns error object on failure', async () => {
      prisma.ship.findMany.mockRejectedValue(new Error('DB error'));

      const result = await shipService.getAllShips();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch ships');
    });
  });

  describe('getShipById', () => {
    it('returns a ship for a valid ID', async () => {
      prisma.ship.findUnique.mockResolvedValue(mockShip);

      const result = await shipService.getShipById(1);

      expect(result.success).toBe(true);
    });

    it('returns NOT_FOUND for non-numeric ID in current implementation', async () => {
      const result = await shipService.getShipById('abc');
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns INVALID_ID for ID <= 0', async () => {
      const result = await shipService.getShipById(0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('returns NOT_FOUND when ship does not exist', async () => {
      prisma.ship.findUnique.mockResolvedValue(null);

      const result = await shipService.getShipById(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });
  });

  describe('createShip', () => {
    it('creates a ship successfully', async () => {
      prisma.ship.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(mockShip);
      prisma.ship.create.mockResolvedValue(mockShip);

      const result = await shipService.createShip({ name: 'Going Merry' });

      expect(result.success).toBe(true);
    });

    it('throws SHIP_NAME_REQUIRED when name is empty', async () => {
      await expect(shipService.createShip({ name: '' })).rejects.toThrow('SHIP_NAME_REQUIRED');
    });

    it('throws SHIP_INVALID_STATUS for invalid status', async () => {
      await expect(shipService.createShip({ name: 'New Ship', status: 'sunk' })).rejects.toThrow('SHIP_INVALID_STATUS');
    });

    it('throws SHIP_NAME_EXISTS when name already taken', async () => {
      prisma.ship.findUnique.mockResolvedValue(mockShip);
      await expect(shipService.createShip({ name: 'Going Merry' })).rejects.toThrow('SHIP_NAME_EXISTS');
    });
  });

  describe('updateShip', () => {
    it('updates a ship successfully', async () => {
      const updated = { ...mockShip, status: 'retired' };
      prisma.ship.findUnique
        .mockResolvedValueOnce(mockShip)
        .mockResolvedValueOnce(updated);
      prisma.ship.update.mockResolvedValue(updated);

      const result = await shipService.updateShip(1, { status: 'retired' });

      expect(result.success).toBe(true);
    });

    it('throws SHIP_NOT_FOUND for invalid ID in current implementation', async () => {
      await expect(shipService.updateShip('abc', { status: 'retired' })).rejects.toThrow('SHIP_NOT_FOUND');
    });

    it('throws SHIP_NOT_FOUND when ship does not exist', async () => {
      prisma.ship.findUnique.mockResolvedValue(null);
      await expect(shipService.updateShip(999, { status: 'retired' })).rejects.toThrow('SHIP_NOT_FOUND');
    });

    it('throws SHIP_INVALID_STATUS for invalid status', async () => {
      prisma.ship.findUnique.mockResolvedValue(mockShip);
      await expect(shipService.updateShip(1, { status: 'sunk' })).rejects.toThrow('SHIP_INVALID_STATUS');
    });

    it('throws SHIP_NAME_EXISTS when name is taken by another ship', async () => {
      prisma.ship.findUnique.mockResolvedValue(mockShip);
      prisma.ship.findFirst.mockResolvedValue({ id: 2, name: 'Thousand Sunny' });
      await expect(shipService.updateShip(1, { name: 'Thousand Sunny' })).rejects.toThrow('SHIP_NAME_EXISTS');
    });
  });

  describe('deleteShip', () => {
    it('deletes a ship successfully', async () => {
      prisma.ship.findUnique.mockResolvedValue(mockShip);
      prisma.organization.count.mockResolvedValue(0);
      prisma.ship.delete.mockResolvedValue(mockShip);

      const result = await shipService.deleteShip(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Ship deleted successfully');
    });

    it('throws SHIP_NOT_FOUND for invalid ID in current implementation', async () => {
      await expect(shipService.deleteShip('abc')).rejects.toThrow('SHIP_NOT_FOUND');
    });

    it('throws SHIP_NOT_FOUND when ship does not exist', async () => {
      prisma.ship.findUnique.mockResolvedValue(null);
      await expect(shipService.deleteShip(999)).rejects.toThrow('SHIP_NOT_FOUND');
    });

    it('throws SHIP_IN_USE when organizations use the ship', async () => {
      prisma.ship.findUnique.mockResolvedValue(mockShip);
      prisma.organization.count.mockResolvedValue(1);
      await expect(shipService.deleteShip(1)).rejects.toThrow('SHIP_IN_USE');
    });
  });

  describe('getShipsByStatus', () => {
    it('returns ships with valid status', async () => {
      prisma.ship.findMany.mockResolvedValue([mockShip]);

      const result = await shipService.getShipsByStatus('active');

      expect(result).toHaveLength(1);
    });

    it('throws SHIP_INVALID_STATUS for invalid status', async () => {
      await expect(shipService.getShipsByStatus('sunk')).rejects.toThrow('SHIP_INVALID_STATUS');
    });
  });
});
