const { Op } = require('sequelize');
const { Organization, OrganizationType, Character, Ship, CharacterOrganization } = require('../models');

/**
 * Organization Service
 * Business logic layer for organization operations
 * @description Handles all business logic for organizations including CRUD operations,
 * validation, and complex queries with proper error handling
 * @author Database Expert
 * @version 1.0.0
 */
class OrganizationService {
  /**
     * Get all organizations with pagination and filtering
     * @param {Object} options - Query options
     * @param {number} options.page - Page number (default: 1)
     * @param {number} options.limit - Items per page (default: 10)
     * @param {string} options.search - Search term for name
     * @param {string} options.status - Filter by status
     * @param {number} options.organizationTypeId - Filter by organization type
     * @param {string} options.sortBy - Sort field (default: 'name')
     * @param {string} options.sortOrder - Sort order (default: 'ASC')
     * @returns {Promise<Object>} Paginated organizations with metadata
     * @throws {Error} Database or validation errors
     */
  static async getAllOrganizations(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        organizationTypeId,
        sortBy = 'name',
        sortOrder = 'ASC'
      } = options;

      // Validate pagination parameters
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      // Validate sort parameters
      const allowedSortFields = ['name', 'totalBounty', 'status', 'createdAt'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
      const sortDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      // Build where clause
      const whereClause = {};
            
      if (search) {
        whereClause.name = {
          [Op.like]: `%${search}%`
        };
      }
            
      if (status) {
        whereClause.status = status;
      }
            
      if (organizationTypeId) {
        whereClause.organizationTypeId = parseInt(organizationTypeId);
      }

      // Execute query with eager loading
      const { count, rows } = await Organization.findAndCountAll({
        where: whereClause,
        attributes: [
          'id', 'name', 'organizationTypeId', 'leaderId', 'shipId', 
          'baseLocation', 'totalBounty', 'status', 'description', 
          'created_at', 'updated_at'
        ],
        include: [
          {
            model: OrganizationType,
            as: 'organizationType',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Character,
            as: 'leader',
            attributes: ['id', 'name', 'alias', 'bounty']
          },
          {
            model: Ship,
            as: 'ship',
            attributes: ['id', 'name', 'status']
          }
        ],
        order: [[sortField, sortDirection]],
        limit: limitNum,
        offset: offset,
        distinct: true
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(count / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      return {
        success: true,
        organizations: rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count,
          totalPages,
          hasNext: hasNextPage,
          hasPrev: hasPrevPage
        }
      };
    } catch (error) {
      throw new Error(`Error retrieving organizations: ${error.message}`);
    }
  }

  /**
     * Get organization by ID with full details
     * @param {number} id - Organization ID
     * @returns {Promise<Object>} Organization with all relationships
     * @throws {Error} Organization not found or database error
     */
  static async getOrganizationById(id) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid organization ID is required');
      }

      const organization = await Organization.findByPk(parseInt(id), {
        attributes: [
          'id', 'name', 'organizationTypeId', 'leaderId', 'shipId', 
          'baseLocation', 'totalBounty', 'status', 'description', 
          'created_at', 'updated_at'
        ],
        include: [
          {
            model: OrganizationType,
            as: 'organizationType',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Character,
            as: 'leader',
            attributes: ['id', 'name', 'alias', 'bounty', 'status']
          },
          {
            model: Ship,
            as: 'ship',
            attributes: ['id', 'name', 'status', 'description']
          },
          {
            model: Character,
            as: 'characters',
            through: {
              model: CharacterOrganization,
              attributes: ['role', 'joined_date', 'is_current'],
              where: { is_current: true }
            },
            attributes: ['id', 'name', 'alias', 'bounty'],
            required: false
          }
        ]
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      return {
        success: true,
        data: organization,
        message: 'Organization retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Error retrieving organization: ${error.message}`);
    }
  }

  /**
     * Create new organization
     * @param {Object} organizationData - Organization data
     * @returns {Promise<Object>} Created organization
     * @throws {Error} Validation or database errors
     */
  static async createOrganization(organizationData) {
    try {
      // Validate required fields
      const requiredFields = ['name', 'organizationTypeId'];
      for (const field of requiredFields) {
        if (!organizationData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // Validate organization type exists
      const organizationType = await OrganizationType.findByPk(organizationData.organizationTypeId);
      if (!organizationType) {
        throw new Error('Invalid organization type');
      }

      // Validate leader exists if provided
      if (organizationData.leaderId) {
        const leader = await Character.findByPk(organizationData.leaderId);
        if (!leader) {
          throw new Error('Invalid leader ID');
        }
      }

      // Validate ship exists if provided
      if (organizationData.shipId) {
        const ship = await Ship.findByPk(organizationData.shipId);
        if (!ship) {
          throw new Error('Invalid ship ID');
        }
      }

      // Check for duplicate name
      const existingOrganization = await Organization.findOne({
        where: { name: organizationData.name }
      });
      if (existingOrganization) {
        throw new Error('Organization with this name already exists');
      }

      // Create organization
      const organization = await Organization.create(organizationData);

      // Return with relationships
      const createdOrganization = await Organization.findByPk(organization.id, {
        attributes: [
          'id', 'name', 'organizationTypeId', 'leaderId', 'shipId', 
          'baseLocation', 'totalBounty', 'status', 'description', 
          'created_at', 'updated_at'
        ],
        include: [
          {
            model: OrganizationType,
            as: 'organizationType',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Character,
            as: 'leader',
            attributes: ['id', 'name', 'alias', 'bounty']
          },
          {
            model: Ship,
            as: 'ship',
            attributes: ['id', 'name', 'status']
          }
        ]
      });

      return {
        success: true,
        data: createdOrganization,
        message: 'Organization created successfully'
      };
    } catch (error) {
      throw new Error(`Error creating organization: ${error.message}`);
    }
  }

  /**
     * Update organization
     * @param {number} id - Organization ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated organization
     * @throws {Error} Validation or database errors
     */
  static async updateOrganization(id, updateData) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid organization ID is required');
      }

      // Check if organization exists
      const organization = await Organization.findByPk(parseInt(id));
      if (!organization) {
        throw new Error('Organization not found');
      }

      // Validate organization type if provided
      if (updateData.organizationTypeId) {
        const organizationType = await OrganizationType.findByPk(updateData.organizationTypeId);
        if (!organizationType) {
          throw new Error('Invalid organization type');
        }
      }

      // Validate leader if provided
      if (updateData.leaderId) {
        const leader = await Character.findByPk(updateData.leaderId);
        if (!leader) {
          throw new Error('Invalid leader ID');
        }
      }

      // Validate ship if provided
      if (updateData.shipId) {
        const ship = await Ship.findByPk(updateData.shipId);
        if (!ship) {
          throw new Error('Invalid ship ID');
        }
      }

      // Check for duplicate name if name is being updated
      if (updateData.name && updateData.name !== organization.name) {
        const existingOrganization = await Organization.findOne({
          where: { 
            name: updateData.name,
            id: { [Op.ne]: parseInt(id) }
          }
        });
        if (existingOrganization) {
          throw new Error('Organization with this name already exists');
        }
      }

      // Update organization
      await organization.update(updateData);

      // Return updated organization with relationships
      const updatedOrganization = await Organization.findByPk(organization.id, {
        attributes: [
          'id', 'name', 'organizationTypeId', 'leaderId', 'shipId', 
          'baseLocation', 'totalBounty', 'status', 'description', 
          'created_at', 'updated_at'
        ],
        include: [
          {
            model: OrganizationType,
            as: 'organizationType',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Character,
            as: 'leader',
            attributes: ['id', 'name', 'alias', 'bounty']
          },
          {
            model: Ship,
            as: 'ship',
            attributes: ['id', 'name', 'status']
          }
        ]
      });

      return {
        success: true,
        data: updatedOrganization,
        message: 'Organization updated successfully'
      };
    } catch (error) {
      throw new Error(`Error updating organization: ${error.message}`);
    }
  }

  /**
     * Delete organization
     * @param {number} id - Organization ID
     * @returns {Promise<Object>} Deletion result
     * @throws {Error} Organization not found or database error
     */
  static async deleteOrganization(id) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid organization ID is required');
      }

      // Check if organization exists
      const organization = await Organization.findByPk(parseInt(id));
      if (!organization) {
        throw new Error('Organization not found');
      }

      // Check if organization has active members
      const activeMembers = await CharacterOrganization.count({
        where: { 
          organizationId: parseInt(id),
          isCurrent: true 
        }
      });

      if (activeMembers > 0) {
        throw new Error('Cannot delete organization with active members. Remove all members first.');
      }

      // Delete organization
      await organization.destroy();

      return {
        success: true,
        data: { id: parseInt(id) },
        message: 'Organization deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting organization: ${error.message}`);
    }
  }

  /**
     * Get organizations by type
     * @param {number} organizationTypeId - Organization type ID
     * @returns {Promise<Object>} Organizations of specified type
     * @throws {Error} Database or validation errors
     */
  static async getOrganizationsByType(organizationTypeId) {
    try {
      if (!organizationTypeId || isNaN(parseInt(organizationTypeId))) {
        throw new Error('Valid organization type ID is required');
      }

      // Validate organization type exists
      const organizationType = await OrganizationType.findByPk(parseInt(organizationTypeId));
      if (!organizationType) {
        throw new Error('Organization type not found');
      }

      const organizations = await Organization.findAll({
        where: { organizationTypeId: parseInt(organizationTypeId) },
        attributes: [
          'id', 'name', 'organizationTypeId', 'leaderId', 'shipId', 
          'baseLocation', 'totalBounty', 'status', 'description', 
          'created_at', 'updated_at'
        ],
        include: [
          {
            model: OrganizationType,
            as: 'organizationType',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Character,
            as: 'leader',
            attributes: ['id', 'name', 'alias', 'bounty']
          },
          {
            model: Ship,
            as: 'ship',
            attributes: ['id', 'name', 'status']
          }
        ],
        order: [['totalBounty', 'DESC']]
      });

      return {
        success: true,
        data: organizations,
        message: `Found ${organizations.length} organizations of type: ${organizationType.name}`
      };
    } catch (error) {
      throw new Error(`Error retrieving organizations by type: ${error.message}`);
    }
  }

  /**
     * Get organization members
     * @param {number} id - Organization ID
     * @returns {Promise<Object>} Organization members
     * @throws {Error} Organization not found or database error
     */
  static async getOrganizationMembers(id) {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error('Valid organization ID is required');
      }

      // Check if organization exists
      const organization = await Organization.findByPk(parseInt(id));
      if (!organization) {
        throw new Error('Organization not found');
      }

      const members = await CharacterOrganization.findAll({
        where: { organization_id: parseInt(id) },
        include: [
          {
            model: Character,
            as: 'character',
            attributes: ['id', 'name', 'alias', 'bounty', 'status']
          }
        ],
        order: [
          ['is_current', 'DESC'],
          ['role', 'ASC']
        ]
      });

      return {
        success: true,
        data: {
          organization: {
            id: organization.id,
            name: organization.name
          },
          members
        },
        message: `Found ${members.length} members for organization: ${organization.name}`
      };
    } catch (error) {
      throw new Error(`Error retrieving organization members: ${error.message}`);
    }
  }
}

module.exports = OrganizationService;
