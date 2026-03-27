jest.mock('../src/config/prisma.config', () => ({
  organizationType: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  },
  organization: {
    count: jest.fn()
  }
}));

const prisma = require('../src/config/prisma.config');
const organizationTypeService = require('../src/services/organization-type.service');

const mockOrgType = {
  id: 1,
  name: 'Pirate Crew',
  description: 'A group of pirates',
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('OrganizationTypeService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getAllOrganizationTypes', () => {
    it('returns all organization types successfully', async () => {
      prisma.organizationType.findMany.mockResolvedValue([mockOrgType]);

      const result = await organizationTypeService.getAllOrganizationTypes();

      expect(result.success).toBe(true);
      expect(result.organizationTypes).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('filters by search term', async () => {
      prisma.organizationType.findMany.mockResolvedValue([mockOrgType]);

      await organizationTypeService.getAllOrganizationTypes({ search: 'Pirate' });

      expect(prisma.organizationType.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ OR: expect.any(Array) }) })
      );
    });

    it('returns error object on failure', async () => {
      prisma.organizationType.findMany.mockRejectedValue(new Error('DB error'));

      const result = await organizationTypeService.getAllOrganizationTypes();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch organization types');
    });
  });

  describe('getOrganizationTypeById', () => {
    it('returns an organization type for a valid ID', async () => {
      prisma.organizationType.findUnique.mockResolvedValue(mockOrgType);

      const result = await organizationTypeService.getOrganizationTypeById(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrgType);
    });

    it('returns NOT_FOUND for non-numeric ID in current implementation', async () => {
      const result = await organizationTypeService.getOrganizationTypeById('abc');
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns NOT_FOUND when type does not exist', async () => {
      prisma.organizationType.findUnique.mockResolvedValue(null);

      const result = await organizationTypeService.getOrganizationTypeById(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });
  });

  describe('updateOrganizationType', () => {
    it('updates successfully', async () => {
      const updated = { ...mockOrgType, name: 'Marine Division' };
      prisma.organizationType.findUnique
        .mockResolvedValueOnce(mockOrgType)
        .mockResolvedValueOnce(null);
      prisma.organizationType.update.mockResolvedValue(updated);

      const result = await organizationTypeService.updateOrganizationType(1, { name: 'Marine Division' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Organization type updated successfully');
    });

    it('returns NOT_FOUND for non-existing ID', async () => {
      prisma.organizationType.findUnique.mockResolvedValue(null);

      const result = await organizationTypeService.updateOrganizationType(999, { name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns NO_FIELDS_PROVIDED for empty update', async () => {
      prisma.organizationType.findUnique.mockResolvedValue(mockOrgType);

      const result = await organizationTypeService.updateOrganizationType(1, {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('NO_FIELDS_PROVIDED');
    });

    it('returns INVALID_NAME when name is empty', async () => {
      prisma.organizationType.findUnique.mockResolvedValue(mockOrgType);

      const result = await organizationTypeService.updateOrganizationType(1, { name: '' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_NAME');
    });

    it('returns INVALID_NAME when name exceeds 50 characters', async () => {
      prisma.organizationType.findUnique.mockResolvedValue(mockOrgType);

      const result = await organizationTypeService.updateOrganizationType(1, { name: 'A'.repeat(51) });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_NAME');
    });

    it('skips duplicate check when name is unchanged', async () => {
      prisma.organizationType.findUnique.mockResolvedValue(mockOrgType);
      prisma.organizationType.update.mockResolvedValue(mockOrgType);

      const result = await organizationTypeService.updateOrganizationType(1, { name: 'Pirate Crew' });

      expect(result.success).toBe(true);
      expect(prisma.organizationType.findFirst).not.toHaveBeenCalled();
    });

    it('returns DUPLICATE_NAME when updated name already exists', async () => {
      prisma.organizationType.findUnique
        .mockResolvedValueOnce(mockOrgType)
        .mockResolvedValueOnce({ id: 2, name: 'Marine Division' });

      const result = await organizationTypeService.updateOrganizationType(1, { name: 'Marine Division' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('DUPLICATE_NAME');
    });

    it('returns error on DB failure', async () => {
      prisma.organizationType.findUnique.mockRejectedValue(new Error('DB error'));

      const result = await organizationTypeService.updateOrganizationType(1, { name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to update organization type');
    });
  });

  describe('getOrganizationTypeById', () => {
    it('returns INVALID_ID for ID <= 0', async () => {
      const result = await organizationTypeService.getOrganizationTypeById(0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('returns error on DB failure', async () => {
      prisma.organizationType.findUnique.mockRejectedValue(new Error('DB error'));

      const result = await organizationTypeService.getOrganizationTypeById(1);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch organization type');
    });
  });

  describe('nameExists', () => {
    it('returns true when name exists', async () => {
      prisma.organizationType.findFirst.mockResolvedValue(mockOrgType);
      const result = await organizationTypeService.nameExists('Pirate Crew');
      expect(result).toBe(true);
    });

    it('returns false when name does not exist', async () => {
      prisma.organizationType.findFirst.mockResolvedValue(null);
      const result = await organizationTypeService.nameExists('Unknown');
      expect(result).toBe(false);
    });

    it('uses excludeId in query when provided', async () => {
      prisma.organizationType.findFirst.mockResolvedValue(null);
      await organizationTypeService.nameExists('Pirate Crew', 1);
      expect(prisma.organizationType.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ id: { not: 1 } }) })
      );
    });

    it('returns false on DB error', async () => {
      prisma.organizationType.findFirst.mockRejectedValue(new Error('DB error'));
      const result = await organizationTypeService.nameExists('Pirate Crew');
      expect(result).toBe(false);
    });
  });

  describe('idExists', () => {
    it('returns true when ID exists', async () => {
      prisma.organizationType.findUnique.mockResolvedValue(mockOrgType);
      const result = await organizationTypeService.idExists(1);
      expect(result).toBe(true);
    });

    it('returns false when ID does not exist', async () => {
      prisma.organizationType.findUnique.mockResolvedValue(null);
      const result = await organizationTypeService.idExists(999);
      expect(result).toBe(false);
    });

    it('returns false on DB error', async () => {
      prisma.organizationType.findUnique.mockRejectedValue(new Error('DB error'));
      const result = await organizationTypeService.idExists(1);
      expect(result).toBe(false);
    });
  });

  describe('isOrganizationTypeInUse', () => {
    it('returns true when organizations use the type', async () => {
      prisma.organization.count.mockResolvedValue(2);
      const result = await organizationTypeService.isOrganizationTypeInUse(1);
      expect(result).toBe(true);
    });

    it('returns false when no organizations use the type', async () => {
      prisma.organization.count.mockResolvedValue(0);
      const result = await organizationTypeService.isOrganizationTypeInUse(1);
      expect(result).toBe(false);
    });

    it('returns false on DB error', async () => {
      prisma.organization.count.mockRejectedValue(new Error('DB error'));
      const result = await organizationTypeService.isOrganizationTypeInUse(1);
      expect(result).toBe(false);
    });
  });
});
