const prisma = require('../config/prisma.config');
const { serviceFailure, serviceSuccess } = require('../utils/service-result.helper');

const serializeBigInt = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));
};

class OrganizationService {
  buildUpdateOrganizationPayload(updateData) {
    const dataToUpdate = { ...updateData };

    if (dataToUpdate.totalBounty !== undefined) {
      dataToUpdate.totalBounty = BigInt(dataToUpdate.totalBounty);
    }
    if (dataToUpdate.name) dataToUpdate.name = dataToUpdate.name.trim();
    if (dataToUpdate.baseLocation) dataToUpdate.baseLocation = dataToUpdate.baseLocation.trim();
    if (dataToUpdate.description) dataToUpdate.description = dataToUpdate.description.trim();

    return dataToUpdate;
  }

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

      const pageNum = Math.max(1, Number.parseInt(page));
      const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit)));
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
        where.organizationTypeId = Number.parseInt(organizationTypeId);
      }

      const [organizations, total] = await Promise.all([
        prisma.organization.findMany({
          where,
          include: {
            organizationType: { select: { id: true, name: true, description: true } },
            leader: { select: { id: true, name: true, alias: true, bounty: true } },
            ships: { select: { id: true, name: true, status: true } }
          },
          orderBy: { [sortField]: orderDirection },
          skip: offset,
          take: limitNum
        }),
        prisma.organization.count({ where })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return serviceSuccess({
        organizations: serializeBigInt(organizations),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      });
    } catch (error) {
      return serviceFailure('Failed to fetch organizations', 'INTERNAL_ERROR', error, 'organization.getAll');
    }
  }

  async getOrganizationById(id) {
    try {
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return serviceFailure('Invalid organization ID', 'INVALID_ID');
      }

      const organization = await prisma.organization.findUnique({
        where: { id: Number.parseInt(id) },
        include: {
          organizationType: { select: { id: true, name: true, description: true } },
          leader: { select: { id: true, name: true, alias: true, bounty: true } },
          ships: { select: { id: true, name: true, status: true } },
          members: {
            where: { isCurrent: true },
            include: {
              character: { select: { id: true, name: true, alias: true } }
            }
          }
        }
      });

      if (!organization) {
        return serviceFailure(`Organization with ID ${id} not found`, 'NOT_FOUND');
      }

      return serviceSuccess({ data: serializeBigInt(organization) });
    } catch (error) {
      return serviceFailure('Failed to fetch organization', 'INTERNAL_ERROR', error, 'organization.getById');
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
        return serviceFailure('Name is required', 'MISSING_NAME');
      }

      const existing = await prisma.organization.findUnique({
        where: { name: name.trim() }
      });

      if (existing) {
        return serviceFailure('An organization with this name already exists', 'DUPLICATE_NAME');
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
          ships: { select: { id: true, name: true } }
        }
      });

      return serviceSuccess({
        data: newOrganization,
        message: 'Organization created successfully'
      });
    } catch (error) {
      return serviceFailure('Failed to create organization', 'INTERNAL_ERROR', error, 'organization.create');
    }
  }

  async updateOrganization(id, updateData) {
    try {
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return serviceFailure('Invalid organization ID', 'INVALID_ID');
      }

      const organization = await prisma.organization.findUnique({
        where: { id: Number.parseInt(id) }
      });

      if (!organization) {
        return serviceFailure(`Organization with ID ${id} not found`, 'NOT_FOUND');
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        return serviceFailure('At least one field must be provided for update', 'NO_FIELDS_PROVIDED');
      }

      if (updateData.name !== undefined && (!updateData.name || updateData.name.trim() === '')) {
        return serviceFailure('Name cannot be empty', 'INVALID_NAME');
      }

      if (updateData.name !== undefined && updateData.name !== organization.name) {
        const existing = await prisma.organization.findUnique({
          where: { name: updateData.name.trim() }
        });

        if (existing) {
          return serviceFailure('An organization with this name already exists', 'DUPLICATE_NAME');
        }
      }

      const dataToUpdate = this.buildUpdateOrganizationPayload(updateData);

      const updatedOrganization = await prisma.organization.update({
        where: { id: Number.parseInt(id) },
        data: dataToUpdate,
        include: {
          organizationType: { select: { id: true, name: true } },
          leader: { select: { id: true, name: true } },
          ships: { select: { id: true, name: true } }
        }
      });

      return serviceSuccess({
        data: updatedOrganization,
        message: 'Organization updated successfully'
      });
    } catch (error) {
      return serviceFailure('Failed to update organization', 'INTERNAL_ERROR', error, 'organization.update');
    }
  }

  async getOrganizationsByType(organizationTypeId) {
    try {
      if (!organizationTypeId || Number.isNaN(Number.parseInt(organizationTypeId)) || Number.parseInt(organizationTypeId) <= 0) {
        return serviceFailure('Invalid organization type ID', 'INVALID_ID');
      }

      const organizations = await prisma.organization.findMany({
        where: { organizationTypeId: Number.parseInt(organizationTypeId) },
        include: {
          organizationType: { select: { id: true, name: true, description: true } },
          leader: { select: { id: true, name: true, alias: true, bounty: true } },
          ships: { select: { id: true, name: true, status: true } }
        },
        orderBy: { name: 'asc' }
      });

      return serviceSuccess({
        data: serializeBigInt(organizations),
        message: 'Organizations by type retrieved successfully'
      });
    } catch (error) {
      return serviceFailure('Failed to fetch organizations by type', 'INTERNAL_ERROR', error, 'organization.getByType');
    }
  }

  async getOrganizationMembers(id) {
    try {
      if (!id || Number.isNaN(Number.parseInt(id)) || Number.parseInt(id) <= 0) {
        return serviceFailure('Invalid organization ID', 'INVALID_ID');
      }

      const organization = await prisma.organization.findUnique({
        where: { id: Number.parseInt(id) },
        select: { id: true, name: true }
      });

      if (!organization) {
        return serviceFailure(`Organization with ID ${id} not found`, 'NOT_FOUND');
      }

      const members = await prisma.characterOrganization.findMany({
        where: { organizationId: Number.parseInt(id), isCurrent: true },
        include: {
          character: {
            select: {
              id: true,
              name: true,
              alias: true,
              bounty: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      return serviceSuccess({
        data: {
          organization,
          members: serializeBigInt(members)
        },
        message: 'Organization members retrieved successfully'
      });
    } catch (error) {
      return serviceFailure('Failed to fetch organization members', 'INTERNAL_ERROR', error, 'organization.getMembers');
    }
  }

  async deleteOrganization(id) {
    try {
      if (!id || Number.isNaN(id) || Number.parseInt(id) <= 0) {
        return serviceFailure('Invalid organization ID', 'INVALID_ID');
      }

      const organization = await prisma.organization.findUnique({
        where: { id: Number.parseInt(id) }
      });

      if (!organization) {
        return serviceFailure(`Organization with ID ${id} not found`, 'NOT_FOUND');
      }

      const memberCount = await prisma.characterOrganization.count({
        where: { organizationId: Number.parseInt(id), isCurrent: true }
      });

      if (memberCount > 0) {
        return serviceFailure('Cannot delete organization with active members', 'HAS_MEMBERS');
      }

      await prisma.organization.delete({
        where: { id: Number.parseInt(id) }
      });

      return serviceSuccess({ message: 'Organization deleted successfully' });
    } catch (error) {
      return serviceFailure('Failed to delete organization', 'INTERNAL_ERROR', error, 'organization.delete');
    }
  }
}

module.exports = new OrganizationService();
