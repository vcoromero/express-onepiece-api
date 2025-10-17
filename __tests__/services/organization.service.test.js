const OrganizationService = require('../../src/services/organization.service');
const { Op } = require('sequelize');

// Mock of main models
jest.mock('../../src/models', () => ({
  Organization: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn()
  },
  OrganizationType: {
    findByPk: jest.fn()
  },
  Character: {
    findByPk: jest.fn()
  },
  Ship: {
    findByPk: jest.fn()
  },
  CharacterOrganization: {
    count: jest.fn(),
    findAll: jest.fn()
  }
}));

// Mock of Sequelize operators
jest.mock('sequelize', () => ({
  Op: {
    or: Symbol('or'),
    like: Symbol('like'),
    ne: Symbol('ne'),
    iLike: Symbol('iLike'),
    and: Symbol('and')
  }
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

// Mock of console to avoid logs in tests
const originalConsole = global.console;
beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
});

afterAll(() => {
  global.console = originalConsole;
});

describe('OrganizationService', () => {
  let Organization, OrganizationType, Character, Ship, CharacterOrganization;

  beforeEach(() => {
    jest.clearAllMocks();
    const models = require('../../src/models');
    Organization = models.Organization;
    OrganizationType = models.OrganizationType;
    Character = models.Character;
    Ship = models.Ship;
    CharacterOrganization = models.CharacterOrganization;
  });

  describe('getAllOrganizations', () => {
    it('should return all organizations with default parameters', async () => {
      // Arrange
      const mockOrganizations = [
        { id: 1, name: 'Straw Hat Pirates', totalBounty: 1000000 },
        { id: 2, name: 'Marine', totalBounty: 500000 }
      ];
      const mockResult = { count: 2, rows: mockOrganizations };
      Organization.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      const result = await OrganizationService.getAllOrganizations();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.organizations).toEqual(mockOrganizations);
      expect(result.data.pagination.totalItems).toBe(2);
      expect(Organization.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Array),
        order: [['name', 'ASC']],
        limit: 10,
        offset: 0,
        distinct: true
      });
    });

    it('should apply search filter when provided', async () => {
      // Arrange
      const mockOrganizations = [{ id: 1, name: 'Straw Hat Pirates', totalBounty: 1000000 }];
      const mockResult = { count: 1, rows: mockOrganizations };
      Organization.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      const result = await OrganizationService.getAllOrganizations({ search: 'Straw' });

      // Assert
      expect(result.success).toBe(true);
      expect(Organization.findAndCountAll).toHaveBeenCalledWith({
        where: { name: { [Op.like]: '%Straw%' } },
        include: expect.any(Array),
        order: [['name', 'ASC']],
        limit: 10,
        offset: 0,
        distinct: true
      });
    });

    it('should apply status filter when provided', async () => {
      // Arrange
      const mockOrganizations = [{ id: 1, name: 'Straw Hat Pirates', status: 'active' }];
      const mockResult = { count: 1, rows: mockOrganizations };
      Organization.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      const result = await OrganizationService.getAllOrganizations({ status: 'active' });

      // Assert
      expect(result.success).toBe(true);
      expect(Organization.findAndCountAll).toHaveBeenCalledWith({
        where: { status: 'active' },
        include: expect.any(Array),
        order: [['name', 'ASC']],
        limit: 10,
        offset: 0,
        distinct: true
      });
    });

    it('should apply organization type filter when provided', async () => {
      // Arrange
      const mockOrganizations = [{ id: 1, name: 'Straw Hat Pirates', organizationTypeId: 1 }];
      const mockResult = { count: 1, rows: mockOrganizations };
      Organization.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      const result = await OrganizationService.getAllOrganizations({ organizationTypeId: 1 });

      // Assert
      expect(result.success).toBe(true);
      expect(Organization.findAndCountAll).toHaveBeenCalledWith({
        where: { organizationTypeId: 1 },
        include: expect.any(Array),
        order: [['name', 'ASC']],
        limit: 10,
        offset: 0,
        distinct: true
      });
    });

    it('should apply custom pagination parameters', async () => {
      // Arrange
      const mockOrganizations = [{ id: 1, name: 'Straw Hat Pirates' }];
      const mockResult = { count: 25, rows: mockOrganizations };
      Organization.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      const result = await OrganizationService.getAllOrganizations({ page: 2, limit: 5 });

      // Assert
      expect(result.data.pagination).toEqual({
        currentPage: 2,
        totalPages: 5,
        totalItems: 25,
        itemsPerPage: 5,
        hasNextPage: true,
        hasPrevPage: true
      });
      expect(Organization.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Array),
        order: [['name', 'ASC']],
        limit: 5,
        offset: 5,
        distinct: true
      });
    });

    it('should apply custom sorting parameters', async () => {
      // Arrange
      const mockOrganizations = [{ id: 1, name: 'Straw Hat Pirates' }];
      const mockResult = { count: 1, rows: mockOrganizations };
      Organization.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      const result = await OrganizationService.getAllOrganizations({ 
        sortBy: 'totalBounty', 
        sortOrder: 'DESC' 
      });

      // Assert
      expect(result.success).toBe(true);
      expect(Organization.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Array),
        order: [['totalBounty', 'DESC']],
        limit: 10,
        offset: 0,
        distinct: true
      });
    });

    it('should limit maximum items per page to 100', async () => {
      // Arrange
      const mockResult = { count: 0, rows: [] };
      Organization.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      await OrganizationService.getAllOrganizations({ limit: 150 });

      // Assert
      expect(Organization.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 100 })
      );
    });

    it('should ensure minimum page number is 1', async () => {
      // Arrange
      const mockResult = { count: 0, rows: [] };
      Organization.findAndCountAll.mockResolvedValue(mockResult);

      // Act
      await OrganizationService.getAllOrganizations({ page: 0 });

      // Assert
      expect(Organization.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 0 })
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      Organization.findAndCountAll.mockRejectedValue(error);

      // Act & Assert
      await expect(OrganizationService.getAllOrganizations())
        .rejects.toThrow('Error retrieving organizations: Database connection failed');
    });
  });

  describe('getOrganizationById', () => {
    it('should return organization when found', async () => {
      // Arrange
      const mockOrganization = { 
        id: 1, 
        name: 'Straw Hat Pirates',
        organizationType: { id: 1, name: 'Pirate Crew' },
        leader: { id: 1, name: 'Monkey D. Luffy' },
        ship: { id: 1, name: 'Thousand Sunny' }
      };
      Organization.findByPk.mockResolvedValue(mockOrganization);

      // Act
      const result = await OrganizationService.getOrganizationById(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrganization);
      expect(Organization.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should throw error for invalid ID (string)', async () => {
      // Act & Assert
      await expect(OrganizationService.getOrganizationById('invalid'))
        .rejects.toThrow('Error retrieving organization: Valid organization ID is required');
    });

    it('should handle negative ID by converting to positive', async () => {
      // Arrange
      const mockOrganization = { 
        id: 1, 
        name: 'Straw Hat Pirates',
        organizationType: { id: 1, name: 'Pirate Crew' },
        leader: { id: 1, name: 'Monkey D. Luffy' },
        ship: { id: 1, name: 'Thousand Sunny' }
      };
      Organization.findByPk.mockResolvedValue(mockOrganization);

      // Act
      const result = await OrganizationService.getOrganizationById(-1);

      // Assert
      expect(result.success).toBe(true);
      expect(Organization.findByPk).toHaveBeenCalledWith(-1, expect.any(Object));
    });

    it('should throw error for invalid ID (zero)', async () => {
      // Act & Assert
      await expect(OrganizationService.getOrganizationById(0))
        .rejects.toThrow('Error retrieving organization: Valid organization ID is required');
    });

    it('should throw error for invalid ID (null)', async () => {
      // Act & Assert
      await expect(OrganizationService.getOrganizationById(null))
        .rejects.toThrow('Error retrieving organization: Valid organization ID is required');
    });

    it('should throw error for invalid ID (undefined)', async () => {
      // Act & Assert
      await expect(OrganizationService.getOrganizationById(undefined))
        .rejects.toThrow('Error retrieving organization: Valid organization ID is required');
    });

    it('should throw error when organization not found', async () => {
      // Arrange
      Organization.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(OrganizationService.getOrganizationById(999))
        .rejects.toThrow('Error retrieving organization: Organization not found');
    });

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      Organization.findByPk.mockRejectedValue(error);

      // Act & Assert
      await expect(OrganizationService.getOrganizationById(1))
        .rejects.toThrow('Error retrieving organization: Database connection failed');
    });
  });

  describe('createOrganization', () => {
    it('should create organization successfully with required fields only', async () => {
      // Arrange
      const organizationData = { 
        name: 'Straw Hat Pirates', 
        organizationTypeId: 1 
      };
      const mockCreatedOrganization = { id: 1, ...organizationData };
      const mockOrganizationWithRelations = { 
        id: 1, 
        ...organizationData,
        organizationType: { id: 1, name: 'Pirate Crew' }
      };
      
      OrganizationType.findByPk.mockResolvedValue({ id: 1, name: 'Pirate Crew' });
      Organization.findOne.mockResolvedValue(null); // No duplicate
      Organization.create.mockResolvedValue(mockCreatedOrganization);
      Organization.findByPk.mockResolvedValue(mockOrganizationWithRelations);

      // Act
      const result = await OrganizationService.createOrganization(organizationData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrganizationWithRelations);
      expect(Organization.create).toHaveBeenCalledWith(organizationData);
    });

    it('should create organization with all fields provided', async () => {
      // Arrange
      const organizationData = {
        name: 'Marine',
        organizationTypeId: 2,
        leaderId: 1,
        shipId: 1,
        totalBounty: 500000,
        status: 'active'
      };
      const mockCreatedOrganization = { id: 2, ...organizationData };
      const mockOrganizationWithRelations = { id: 2, ...organizationData };
      
      OrganizationType.findByPk.mockResolvedValue({ id: 2, name: 'Marine' });
      Character.findByPk.mockResolvedValue({ id: 1, name: 'Admiral' });
      Ship.findByPk.mockResolvedValue({ id: 1, name: 'Marine Ship' });
      Organization.findOne.mockResolvedValue(null); // No duplicate
      Organization.create.mockResolvedValue(mockCreatedOrganization);
      Organization.findByPk.mockResolvedValue(mockOrganizationWithRelations);

      // Act
      const result = await OrganizationService.createOrganization(organizationData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrganizationWithRelations);
      expect(Organization.create).toHaveBeenCalledWith(organizationData);
    });

    it('should throw error when name is missing', async () => {
      // Act & Assert
      await expect(OrganizationService.createOrganization({ organizationTypeId: 1 }))
        .rejects.toThrow('Error creating organization: name is required');
    });

    it('should throw error when organizationTypeId is missing', async () => {
      // Act & Assert
      await expect(OrganizationService.createOrganization({ name: 'Test Organization' }))
        .rejects.toThrow('Error creating organization: organizationTypeId is required');
    });

    it('should throw error for invalid organization type', async () => {
      // Arrange
      const organizationData = { name: 'Test Organization', organizationTypeId: 999 };
      OrganizationType.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(OrganizationService.createOrganization(organizationData))
        .rejects.toThrow('Error creating organization: Invalid organization type');
    });

    it('should throw error for invalid leader ID', async () => {
      // Arrange
      const organizationData = { 
        name: 'Test Organization', 
        organizationTypeId: 1, 
        leaderId: 999 
      };
      OrganizationType.findByPk.mockResolvedValue({ id: 1, name: 'Pirate Crew' });
      Character.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(OrganizationService.createOrganization(organizationData))
        .rejects.toThrow('Error creating organization: Invalid leader ID');
    });

    it('should throw error for invalid ship ID', async () => {
      // Arrange
      const organizationData = { 
        name: 'Test Organization', 
        organizationTypeId: 1, 
        shipId: 999 
      };
      OrganizationType.findByPk.mockResolvedValue({ id: 1, name: 'Pirate Crew' });
      Ship.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(OrganizationService.createOrganization(organizationData))
        .rejects.toThrow('Error creating organization: Invalid ship ID');
    });

    it('should throw error when organization name already exists', async () => {
      // Arrange
      const organizationData = { name: 'Existing Organization', organizationTypeId: 1 };
      const existingOrganization = { id: 1, name: 'Existing Organization' };
      
      OrganizationType.findByPk.mockResolvedValue({ id: 1, name: 'Pirate Crew' });
      Organization.findOne.mockResolvedValue(existingOrganization);

      // Act & Assert
      await expect(OrganizationService.createOrganization(organizationData))
        .rejects.toThrow('Error creating organization: Organization with this name already exists');
    });

    it('should handle database errors during creation', async () => {
      // Arrange
      const organizationData = { name: 'Test Organization', organizationTypeId: 1 };
      const error = new Error('Database connection failed');
      
      OrganizationType.findByPk.mockResolvedValue({ id: 1, name: 'Pirate Crew' });
      Organization.findOne.mockResolvedValue(null);
      Organization.create.mockRejectedValue(error);

      // Act & Assert
      await expect(OrganizationService.createOrganization(organizationData))
        .rejects.toThrow('Error creating organization: Database connection failed');
    });
  });

  describe('updateOrganization', () => {
    it('should update organization successfully', async () => {
      // Arrange
      const existingOrganization = { 
        id: 1, 
        name: 'Old Name', 
        organizationTypeId: 1,
        update: jest.fn()
      };
      const updateData = { name: 'New Name', totalBounty: 2000000 };
      const updatedOrganization = { 
        id: 1, 
        name: 'New Name', 
        totalBounty: 2000000,
        organizationType: { id: 1, name: 'Pirate Crew' }
      };
      
      Organization.findByPk.mockResolvedValueOnce(existingOrganization); // Check if exists
      Organization.findOne.mockResolvedValue(null); // No duplicate name
      existingOrganization.update.mockResolvedValue(updatedOrganization);
      Organization.findByPk.mockResolvedValueOnce(updatedOrganization); // Return updated organization

      // Act
      const result = await OrganizationService.updateOrganization(1, updateData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedOrganization);
      expect(existingOrganization.update).toHaveBeenCalledWith(updateData);
    });

    it('should throw error for invalid ID', async () => {
      // Act & Assert
      await expect(OrganizationService.updateOrganization('invalid', {}))
        .rejects.toThrow('Error updating organization: Valid organization ID is required');
    });

    it('should throw error when organization not found', async () => {
      // Arrange
      Organization.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(OrganizationService.updateOrganization(999, { name: 'New Name' }))
        .rejects.toThrow('Error updating organization: Organization not found');
    });

    it('should throw error for invalid organization type', async () => {
      // Arrange
      const existingOrganization = { id: 1, name: 'Test Organization', organizationTypeId: 1 };
      Organization.findByPk.mockResolvedValue(existingOrganization);
      OrganizationType.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(OrganizationService.updateOrganization(1, { organizationTypeId: 999 }))
        .rejects.toThrow('Error updating organization: Invalid organization type');
    });

    it('should throw error for invalid leader ID', async () => {
      // Arrange
      const existingOrganization = { id: 1, name: 'Test Organization', organizationTypeId: 1 };
      Organization.findByPk.mockResolvedValue(existingOrganization);
      Character.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(OrganizationService.updateOrganization(1, { leaderId: 999 }))
        .rejects.toThrow('Error updating organization: Invalid leader ID');
    });

    it('should throw error for invalid ship ID', async () => {
      // Arrange
      const existingOrganization = { id: 1, name: 'Test Organization', organizationTypeId: 1 };
      Organization.findByPk.mockResolvedValue(existingOrganization);
      Ship.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(OrganizationService.updateOrganization(1, { shipId: 999 }))
        .rejects.toThrow('Error updating organization: Invalid ship ID');
    });

    it('should throw error when new name already exists', async () => {
      // Arrange
      const existingOrganization = { id: 1, name: 'Old Name', organizationTypeId: 1 };
      const duplicateOrganization = { id: 2, name: 'New Name', organizationTypeId: 1 };
      Organization.findByPk.mockResolvedValue(existingOrganization);
      Organization.findOne.mockResolvedValue(duplicateOrganization);

      // Act & Assert
      await expect(OrganizationService.updateOrganization(1, { name: 'New Name' }))
        .rejects.toThrow('Error updating organization: Organization with this name already exists');
    });

    it('should not check for duplicate when name is not changing', async () => {
      // Arrange
      const existingOrganization = { 
        id: 1, 
        name: 'Same Name', 
        organizationTypeId: 1,
        update: jest.fn()
      };
      const updatedOrganization = { 
        id: 1, 
        name: 'Same Name', 
        totalBounty: 2000000,
        organizationType: { id: 1, name: 'Pirate Crew' }
      };
      
      Organization.findByPk.mockResolvedValueOnce(existingOrganization);
      existingOrganization.update.mockResolvedValue(updatedOrganization);
      Organization.findByPk.mockResolvedValueOnce(updatedOrganization);

      // Act
      const result = await OrganizationService.updateOrganization(1, { totalBounty: 2000000 });

      // Assert
      expect(result.success).toBe(true);
      expect(Organization.findOne).not.toHaveBeenCalled(); // Should not check for duplicates
    });

    it('should handle partial updates', async () => {
      // Arrange
      const existingOrganization = { 
        id: 1, 
        name: 'Test Organization', 
        organizationTypeId: 1,
        update: jest.fn()
      };
      const updatedOrganization = { 
        id: 1, 
        name: 'Test Organization', 
        totalBounty: 2000000,
        organizationType: { id: 1, name: 'Pirate Crew' }
      };
      
      Organization.findByPk.mockResolvedValueOnce(existingOrganization);
      existingOrganization.update.mockResolvedValue(updatedOrganization);
      Organization.findByPk.mockResolvedValueOnce(updatedOrganization);

      // Act
      const result = await OrganizationService.updateOrganization(1, { totalBounty: 2000000 });

      // Assert
      expect(result.success).toBe(true);
      expect(existingOrganization.update).toHaveBeenCalledWith({ totalBounty: 2000000 });
    });

    it('should handle database errors during update', async () => {
      // Arrange
      const existingOrganization = { 
        id: 1, 
        name: 'Test Organization', 
        organizationTypeId: 1,
        update: jest.fn()
      };
      const error = new Error('Database connection failed');
      
      Organization.findByPk.mockResolvedValue(existingOrganization);
      Organization.findOne.mockResolvedValue(null); // No duplicate
      existingOrganization.update.mockRejectedValue(error);

      // Act & Assert
      await expect(OrganizationService.updateOrganization(1, { name: 'New Name' }))
        .rejects.toThrow('Error updating organization: Database connection failed');
    });
  });

  describe('deleteOrganization', () => {
    it('should delete organization successfully when no active members', async () => {
      // Arrange
      const organizationToDelete = { 
        id: 1, 
        name: 'Straw Hat Pirates',
        destroy: jest.fn()
      };
      Organization.findByPk.mockResolvedValue(organizationToDelete);
      CharacterOrganization.count.mockResolvedValue(0);
      organizationToDelete.destroy.mockResolvedValue();

      // Act
      const result = await OrganizationService.deleteOrganization(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
      expect(organizationToDelete.destroy).toHaveBeenCalled();
    });

    it('should throw error for invalid ID', async () => {
      // Act & Assert
      await expect(OrganizationService.deleteOrganization('invalid'))
        .rejects.toThrow('Error deleting organization: Valid organization ID is required');
    });

    it('should throw error when organization not found', async () => {
      // Arrange
      Organization.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(OrganizationService.deleteOrganization(999))
        .rejects.toThrow('Error deleting organization: Organization not found');
    });

    it('should throw error when organization has active members', async () => {
      // Arrange
      const organizationToDelete = { id: 1, name: 'Straw Hat Pirates' };
      Organization.findByPk.mockResolvedValue(organizationToDelete);
      CharacterOrganization.count.mockResolvedValue(3); // Has active members

      // Act & Assert
      await expect(OrganizationService.deleteOrganization(1))
        .rejects.toThrow('Error deleting organization: Cannot delete organization with active members. Remove all members first.');
    });

    it('should handle database errors during deletion', async () => {
      // Arrange
      const organizationToDelete = { 
        id: 1, 
        name: 'Straw Hat Pirates',
        destroy: jest.fn()
      };
      const error = new Error('Database connection failed');
      
      Organization.findByPk.mockResolvedValue(organizationToDelete);
      CharacterOrganization.count.mockResolvedValue(0);
      organizationToDelete.destroy.mockRejectedValue(error);

      // Act & Assert
      await expect(OrganizationService.deleteOrganization(1))
        .rejects.toThrow('Error deleting organization: Database connection failed');
    });
  });

  describe('getOrganizationsByType', () => {
    it('should return organizations with valid type ID', async () => {
      // Arrange
      const mockOrganizations = [
        { id: 1, name: 'Straw Hat Pirates', organizationTypeId: 1 },
        { id: 2, name: 'Heart Pirates', organizationTypeId: 1 }
      ];
      const mockOrganizationType = { id: 1, name: 'Pirate Crew' };
      
      OrganizationType.findByPk.mockResolvedValue(mockOrganizationType);
      Organization.findAll.mockResolvedValue(mockOrganizations);

      // Act
      const result = await OrganizationService.getOrganizationsByType(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrganizations);
      expect(Organization.findAll).toHaveBeenCalledWith({
        where: { organizationTypeId: 1 },
        include: expect.any(Array),
        order: [['totalBounty', 'DESC']]
      });
    });

    it('should throw error for invalid type ID', async () => {
      // Act & Assert
      await expect(OrganizationService.getOrganizationsByType('invalid'))
        .rejects.toThrow('Error retrieving organizations by type: Valid organization type ID is required');
    });

    it('should throw error when organization type not found', async () => {
      // Arrange
      OrganizationType.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(OrganizationService.getOrganizationsByType(999))
        .rejects.toThrow('Error retrieving organizations by type: Organization type not found');
    });

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      OrganizationType.findByPk.mockResolvedValue({ id: 1, name: 'Pirate Crew' });
      Organization.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(OrganizationService.getOrganizationsByType(1))
        .rejects.toThrow('Error retrieving organizations by type: Database connection failed');
    });
  });

  describe('getOrganizationMembers', () => {
    it('should return organization members when found', async () => {
      // Arrange
      const mockOrganization = { id: 1, name: 'Straw Hat Pirates' };
      const mockMembers = [
        { id: 1, character: { id: 1, name: 'Monkey D. Luffy' }, role: 'Captain' },
        { id: 2, character: { id: 2, name: 'Roronoa Zoro' }, role: 'Swordsman' }
      ];
      
      Organization.findByPk.mockResolvedValue(mockOrganization);
      CharacterOrganization.findAll.mockResolvedValue(mockMembers);

      // Act
      const result = await OrganizationService.getOrganizationMembers(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.members).toEqual(mockMembers);
      expect(CharacterOrganization.findAll).toHaveBeenCalledWith({
        where: { organization_id: 1 },
        include: expect.any(Array),
        order: expect.any(Array)
      });
    });

    it('should throw error for invalid ID', async () => {
      // Act & Assert
      await expect(OrganizationService.getOrganizationMembers('invalid'))
        .rejects.toThrow('Error retrieving organization members: Valid organization ID is required');
    });

    it('should throw error when organization not found', async () => {
      // Arrange
      Organization.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(OrganizationService.getOrganizationMembers(999))
        .rejects.toThrow('Error retrieving organization members: Organization not found');
    });

    it('should handle database errors', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      Organization.findByPk.mockResolvedValue({ id: 1, name: 'Straw Hat Pirates' });
      CharacterOrganization.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(OrganizationService.getOrganizationMembers(1))
        .rejects.toThrow('Error retrieving organization members: Database connection failed');
    });
  });
});
