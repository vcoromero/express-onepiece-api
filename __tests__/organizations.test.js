jest.mock('../src/config/prisma.config', () => ({
  organization: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  characterOrganization: {
    count: jest.fn()
  }
}));

const prisma = require('../src/config/prisma.config');
const organizationService = require('../src/services/organization.service');

const mockOrg = {
  id: 1,
  name: 'Straw Hat Pirates',
  status: 'active',
  organizationTypeId: 1,
  totalBounty: BigInt('3000000000'),
  organizationType: { id: 1, name: 'Pirate Crew' },
  leader: { id: 1, name: 'Monkey D. Luffy' },
  ship: { id: 1, name: 'Going Merry' }
};

describe('OrganizationService', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('getAllOrganizations', () => {
    it('returns all organizations with pagination', async () => {
      prisma.organization.findMany.mockResolvedValue([mockOrg]);
      prisma.organization.count.mockResolvedValue(1);

      const result = await organizationService.getAllOrganizations();

      expect(result.success).toBe(true);
      expect(result.organizations).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('filters by search term', async () => {
      prisma.organization.findMany.mockResolvedValue([mockOrg]);
      prisma.organization.count.mockResolvedValue(1);

      await organizationService.getAllOrganizations({ search: 'Straw Hat' });

      expect(prisma.organization.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ name: expect.any(Object) }) })
      );
    });

    it('filters by status', async () => {
      prisma.organization.findMany.mockResolvedValue([mockOrg]);
      prisma.organization.count.mockResolvedValue(1);

      await organizationService.getAllOrganizations({ status: 'active' });

      expect(prisma.organization.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'active' }) })
      );
    });

    it('returns error object on failure', async () => {
      prisma.organization.findMany.mockRejectedValue(new Error('DB error'));

      const result = await organizationService.getAllOrganizations();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch organizations');
    });
  });

  describe('getOrganizationById', () => {
    it('returns an organization for a valid ID', async () => {
      prisma.organization.findUnique.mockResolvedValue(mockOrg);

      const result = await organizationService.getOrganizationById(1);

      expect(result.success).toBe(true);
    });

    it('returns NOT_FOUND for non-numeric ID in current implementation', async () => {
      const result = await organizationService.getOrganizationById('abc');
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns INVALID_ID for ID <= 0', async () => {
      const result = await organizationService.getOrganizationById(0);
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_ID');
    });

    it('returns NOT_FOUND when organization does not exist', async () => {
      prisma.organization.findUnique.mockResolvedValue(null);

      const result = await organizationService.getOrganizationById(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });
  });

  describe('createOrganization', () => {
    it('creates successfully', async () => {
      prisma.organization.findUnique.mockResolvedValue(null);
      prisma.organization.create.mockResolvedValue(mockOrg);

      const result = await organizationService.createOrganization({ name: 'Straw Hat Pirates' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Organization created successfully');
    });

    it('returns MISSING_NAME when name is not provided', async () => {
      const result = await organizationService.createOrganization({});
      expect(result.success).toBe(false);
      expect(result.error).toBe('MISSING_NAME');
    });

    it('returns MISSING_NAME when name is empty', async () => {
      const result = await organizationService.createOrganization({ name: '   ' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('MISSING_NAME');
    });

    it('returns DUPLICATE_NAME when name already exists', async () => {
      prisma.organization.findUnique.mockResolvedValue(mockOrg);

      const result = await organizationService.createOrganization({ name: 'Straw Hat Pirates' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('DUPLICATE_NAME');
    });
  });

  describe('updateOrganization', () => {
    it('updates successfully', async () => {
      const updated = { ...mockOrg, status: 'disbanded' };
      prisma.organization.findUnique
        .mockResolvedValueOnce(mockOrg)
        .mockResolvedValueOnce(null);
      prisma.organization.update.mockResolvedValue(updated);

      const result = await organizationService.updateOrganization(1, { status: 'disbanded' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Organization updated successfully');
    });

    it('returns NOT_FOUND for non-numeric ID in current implementation', async () => {
      const result = await organizationService.updateOrganization('abc', { status: 'active' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns NOT_FOUND when not found', async () => {
      prisma.organization.findUnique.mockResolvedValue(null);

      const result = await organizationService.updateOrganization(999, { status: 'active' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns NO_FIELDS_PROVIDED for empty update', async () => {
      prisma.organization.findUnique.mockResolvedValue(mockOrg);

      const result = await organizationService.updateOrganization(1, {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('NO_FIELDS_PROVIDED');
    });

    it('returns INVALID_NAME when name is empty', async () => {
      prisma.organization.findUnique.mockResolvedValue(mockOrg);

      const result = await organizationService.updateOrganization(1, { name: '' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_NAME');
    });

    it('returns DUPLICATE_NAME when name already used', async () => {
      prisma.organization.findUnique
        .mockResolvedValueOnce(mockOrg)
        .mockResolvedValueOnce({ id: 2, name: 'Other Crew' });

      const result = await organizationService.updateOrganization(1, { name: 'Other Crew' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('DUPLICATE_NAME');
    });
  });

  describe('deleteOrganization', () => {
    it('deletes successfully', async () => {
      prisma.organization.findUnique.mockResolvedValue(mockOrg);
      prisma.characterOrganization.count.mockResolvedValue(0);
      prisma.organization.delete.mockResolvedValue(mockOrg);

      const result = await organizationService.deleteOrganization(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Organization deleted successfully');
    });

    it('returns NOT_FOUND for invalid ID in current implementation', async () => {
      const result = await organizationService.deleteOrganization('abc');
      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns NOT_FOUND when not found', async () => {
      prisma.organization.findUnique.mockResolvedValue(null);

      const result = await organizationService.deleteOrganization(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('NOT_FOUND');
    });

    it('returns HAS_MEMBERS when organization has active members', async () => {
      prisma.organization.findUnique.mockResolvedValue(mockOrg);
      prisma.characterOrganization.count.mockResolvedValue(5);

      const result = await organizationService.deleteOrganization(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('HAS_MEMBERS');
    });
  });
});
