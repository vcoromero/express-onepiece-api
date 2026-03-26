const prisma = require('../config/prisma.config');

const serializeBigInt = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));
};

class OrganizationService {
  async getAllOrganizations(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        organizationTypeId,
        sortBy = 'name',
        sortOrder = 'asc'
      } = options;

      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const offset = (pageNum - 1) * limitNum;

      const allowedSortFields = ['name', 'totalBounty', 'status', 'createdAt'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
      const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';

      const where = {};

      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }

      if (status) {
        where.status = status;
      }

      if (organizationTypeId) {
        where.organizationTypeId = parseInt(organizationTypeId);
      }

      const [organizations, total] = await Promise.all([
        prisma.organization.findMany({
          where,
          include: {
            organizationType: { select: { id: true, name: true, description: true } },
            leader: { select: { id: true, name: true, alias: true, bounty: true } },
            ship: { select: { id: true, name: true, status: true } }
          },
          orderBy: { [sortField]: orderDirection },
          skip: offset,
          take: limitNum
        }),
        prisma.organization.count({ where })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        success: true,
        organizations: serializeBigInt(organizations),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      };
    } catch (error) {
      console.error('Error in getAllOrganizations:', error);
      return {
        success: false,
        message: 'Failed to fetch organizations',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  async getOrganizationById(id) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid organization ID',
          error: 'INVALID_ID'
        };
      }

      const organization = await prisma.organization.findUnique({
        where: { id: parseInt(id) },
        include: {
          organizationType: { select: { id: true, name: true, description: true } },
          leader: { select: { id: true, name: true, alias: true, bounty: true } },
          ship: { select: { id: true, name: true, status: true } },
          members: {
            where: { isCurrent: true },
            include: {
              character: { select: { id: true, name: true, alias: true } }
            }
          }
        }
      });

      if (!organization) {
        return {
          success: false,
          message: `Organization with ID ${id} not found`,
          error: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data: serializeBigInt(organization)
      };
    } catch (error) {
      console.error('Error in getOrganizationById:', error);
      return {
        success: false,
        message: 'Failed to fetch organization',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  async createOrganization(data) {
    try {
      const {
        name,
        organizationTypeId,
        leaderId,
        shipId,
        baseLocation,
        totalBounty,
        status = 'active',
        description
      } = data;

      if (!name || name.trim() === '') {
        return {
          success: false,
          message: 'Name is required',
          error: 'MISSING_NAME'
        };
      }

      const existing = await prisma.organization.findUnique({
        where: { name: name.trim() }
      });

      if (existing) {
        return {
          success: false,
          message: 'An organization with this name already exists',
          error: 'DUPLICATE_NAME'
        };
      }

      const newOrganization = await prisma.organization.create({
        data: {
          name: name.trim(),
          organizationTypeId: organizationTypeId || null,
          leaderId: leaderId || null,
          shipId: shipId || null,
          baseLocation: baseLocation ? baseLocation.trim() : null,
          totalBounty: totalBounty ? BigInt(totalBounty) : BigInt(0),
          status,
          description: description ? description.trim() : null
        },
        include: {
          organizationType: { select: { id: true, name: true } },
          leader: { select: { id: true, name: true } },
          ship: { select: { id: true, name: true } }
        }
      });

      return {
        success: true,
        data: newOrganization,
        message: 'Organization created successfully'
      };
    } catch (error) {
      console.error('Error in createOrganization:', error);
      return {
        success: false,
        message: 'Failed to create organization',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  async updateOrganization(id, updateData) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid organization ID',
          error: 'INVALID_ID'
        };
      }

      const organization = await prisma.organization.findUnique({
        where: { id: parseInt(id) }
      });

      if (!organization) {
        return {
          success: false,
          message: `Organization with ID ${id} not found`,
          error: 'NOT_FOUND'
        };
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        return {
          success: false,
          message: 'At least one field must be provided for update',
          error: 'NO_FIELDS_PROVIDED'
        };
      }

      if (updateData.name !== undefined) {
        if (!updateData.name || updateData.name.trim() === '') {
          return {
            success: false,
            message: 'Name cannot be empty',
            error: 'INVALID_NAME'
          };
        }

        if (updateData.name !== organization.name) {
          const existing = await prisma.organization.findUnique({
            where: { name: updateData.name.trim() }
          });

          if (existing) {
            return {
              success: false,
              message: 'An organization with this name already exists',
              error: 'DUPLICATE_NAME'
            };
          }
        }
      }

      const dataToUpdate = { ...updateData };
      if (dataToUpdate.totalBounty !== undefined) {
        dataToUpdate.totalBounty = BigInt(dataToUpdate.totalBounty);
      }
      if (dataToUpdate.name) dataToUpdate.name = dataToUpdate.name.trim();
      if (dataToUpdate.baseLocation) dataToUpdate.baseLocation = dataToUpdate.baseLocation.trim();
      if (dataToUpdate.description) dataToUpdate.description = dataToUpdate.description.trim();

      const updatedOrganization = await prisma.organization.update({
        where: { id: parseInt(id) },
        data: dataToUpdate,
        include: {
          organizationType: { select: { id: true, name: true } },
          leader: { select: { id: true, name: true } },
          ship: { select: { id: true, name: true } }
        }
      });

      return {
        success: true,
        data: updatedOrganization,
        message: 'Organization updated successfully'
      };
    } catch (error) {
      console.error('Error in updateOrganization:', error);
      return {
        success: false,
        message: 'Failed to update organization',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  async deleteOrganization(id) {
    try {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        return {
          success: false,
          message: 'Invalid organization ID',
          error: 'INVALID_ID'
        };
      }

      const organization = await prisma.organization.findUnique({
        where: { id: parseInt(id) }
      });

      if (!organization) {
        return {
          success: false,
          message: `Organization with ID ${id} not found`,
          error: 'NOT_FOUND'
        };
      }

      const memberCount = await prisma.characterOrganization.count({
        where: { organizationId: parseInt(id), isCurrent: true }
      });

      if (memberCount > 0) {
        return {
          success: false,
          message: 'Cannot delete organization with active members',
          error: 'HAS_MEMBERS'
        };
      }

      await prisma.organization.delete({
        where: { id: parseInt(id) }
      });

      return {
        success: true,
        message: 'Organization deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteOrganization:', error);
      return {
        success: false,
        message: 'Failed to delete organization',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }
}

module.exports = new OrganizationService();