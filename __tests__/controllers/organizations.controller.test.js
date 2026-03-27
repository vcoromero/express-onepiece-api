jest.mock('../../src/services/organization.service');

const request = require('supertest');
const app = require('../../src/app');
const OrganizationService = require('../../src/services/organization.service');
const JWTUtil = require('../../src/utils/jwt.util');

const token = JWTUtil.generateToken({ username: 'testadmin', role: 'admin' });
const mockOrg = { id: 1, name: 'Straw Hat Pirates', status: 'active', organizationTypeId: 1 };
const mockPagination = { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false };

describe('Organization Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    OrganizationService.getOrganizationsByType = jest.fn();
    OrganizationService.getOrganizationMembers = jest.fn();
  });

  describe('GET /api/organizations', () => {
    it('returns 200 with paginated list', async () => {
      OrganizationService.getAllOrganizations.mockResolvedValue({
        success: true, organizations: [mockOrg], pagination: mockPagination
      });
      const res = await request(app).get('/api/organizations');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('returns 400 for invalid status', async () => {
      const res = await request(app).get('/api/organizations?status=invalid');
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid organizationTypeId', async () => {
      const res = await request(app).get('/api/organizations?organizationTypeId=abc');
      expect(res.status).toBe(400);
    });

    it('returns 500 when service throws', async () => {
      OrganizationService.getAllOrganizations.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/organizations');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/organizations/:id', () => {
    it('returns 200 for a valid existing organization', async () => {
      OrganizationService.getOrganizationById.mockResolvedValue({ success: true, data: mockOrg });
      const res = await request(app).get('/api/organizations/1');
      expect(res.status).toBe(200);
    });

    it('returns 400 for an invalid ID', async () => {
      const res = await request(app).get('/api/organizations/abc');
      expect(res.status).toBe(400);
    });

    it('returns 404 when service throws not found', async () => {
      OrganizationService.getOrganizationById.mockRejectedValue(new Error('not found'));
      const res = await request(app).get('/api/organizations/1');
      expect(res.status).toBe(404);
    });

    it('returns 500 for generic service error', async () => {
      OrganizationService.getOrganizationById.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/organizations/1');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/organizations/type/:organizationTypeId', () => {
    it('returns 400 for invalid type ID', async () => {
      const res = await request(app).get('/api/organizations/type/abc');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/organizations/:id/members', () => {
    it('returns 400 for invalid ID', async () => {
      const res = await request(app).get('/api/organizations/abc/members');
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/organizations', () => {
    it('returns 201 on successful creation', async () => {
      OrganizationService.createOrganization.mockResolvedValue({ success: true, data: mockOrg, message: 'Created' });
      const res = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Crew', organizationTypeId: 1 });
      expect(res.status).toBe(201);
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ organizationTypeId: 1 });
      expect(res.status).toBe(400);
    });

    it('returns 400 when organizationTypeId is missing', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Crew' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when name exceeds 100 chars', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'A'.repeat(101), organizationTypeId: 1 });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid status', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Crew', organizationTypeId: 1, status: 'unknown' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid totalBounty', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Crew', organizationTypeId: 1, totalBounty: -100 });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid jollyRogerUrl', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Crew', organizationTypeId: 1, jollyRogerUrl: 'not-a-url' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for non-numeric organizationTypeId', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Crew', organizationTypeId: 'abc' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid leaderId', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Crew', organizationTypeId: 1, leaderId: 'abc' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid shipId', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Crew', organizationTypeId: 1, shipId: 'abc' });
      expect(res.status).toBe(400);
    });

    it('returns 409 when name already exists (service throws)', async () => {
      OrganizationService.createOrganization.mockRejectedValue(new Error('already exists'));
      const res = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Straw Hat Pirates', organizationTypeId: 1 });
      expect(res.status).toBe(409);
    });

    it('returns 400 when service throws Invalid error', async () => {
      OrganizationService.createOrganization.mockRejectedValue(new Error('Invalid type ID'));
      const res = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Crew', organizationTypeId: 1 });
      expect(res.status).toBe(400);
    });

    it('returns 500 for generic service error', async () => {
      OrganizationService.createOrganization.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Crew', organizationTypeId: 1 });
      expect(res.status).toBe(500);
    });

    it('returns 401 without token', async () => {
      const res = await request(app)
        .post('/api/organizations')
        .send({ name: 'Test', organizationTypeId: 1 });
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/organizations/:id', () => {
    it('returns 200 on successful update', async () => {
      OrganizationService.updateOrganization.mockResolvedValue({ success: true, data: mockOrg, message: 'Updated' });
      const res = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'disbanded' });
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      const res = await request(app)
        .put('/api/organizations/abc')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'disbanded' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid status', async () => {
      const res = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'invalid' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid jollyRogerUrl', async () => {
      const res = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ jollyRogerUrl: 'bad-url' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when name exceeds 100 chars', async () => {
      const res = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'A'.repeat(101) });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid organizationTypeId in update', async () => {
      const res = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ organizationTypeId: 'abc' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid leaderId in update', async () => {
      const res = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ leaderId: 'abc' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid shipId in update', async () => {
      const res = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ shipId: 'abc' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for negative totalBounty in update', async () => {
      const res = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ totalBounty: -50 });
      expect(res.status).toBe(400);
    });

    it('returns 404 when service throws not found', async () => {
      OrganizationService.updateOrganization.mockRejectedValue(new Error('not found'));
      const res = await request(app)
        .put('/api/organizations/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'disbanded' });
      expect(res.status).toBe(404);
    });

    it('returns 409 when service throws already exists', async () => {
      OrganizationService.updateOrganization.mockRejectedValue(new Error('already exists'));
      const res = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Straw Hat Pirates' });
      expect(res.status).toBe(409);
    });

    it('returns 400 when service throws Invalid error', async () => {
      OrganizationService.updateOrganization.mockRejectedValue(new Error('Invalid type ID'));
      const res = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'active' });
      expect(res.status).toBe(400);
    });

    it('returns 500 for generic service error', async () => {
      OrganizationService.updateOrganization.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .put('/api/organizations/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'active' });
      expect(res.status).toBe(500);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).put('/api/organizations/1').send({ status: 'disbanded' });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/organizations/:id', () => {
    it('returns 200 on successful delete', async () => {
      OrganizationService.deleteOrganization.mockResolvedValue({ success: true, data: null, message: 'Deleted' });
      const res = await request(app)
        .delete('/api/organizations/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      const res = await request(app)
        .delete('/api/organizations/abc')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });

    it('returns 404 when service throws not found', async () => {
      OrganizationService.deleteOrganization.mockRejectedValue(new Error('not found'));
      const res = await request(app)
        .delete('/api/organizations/999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('returns 409 when organization has active members', async () => {
      OrganizationService.deleteOrganization.mockRejectedValue(new Error('active members'));
      const res = await request(app)
        .delete('/api/organizations/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(409);
    });

    it('returns 500 for generic service error', async () => {
      OrganizationService.deleteOrganization.mockRejectedValue(new Error('DB error'));
      const res = await request(app)
        .delete('/api/organizations/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(500);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).delete('/api/organizations/1');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/organizations/type/:organizationTypeId', () => {
    it('returns 200 with organizations for valid type ID', async () => {
      OrganizationService.getOrganizationsByType.mockResolvedValue({
        data: [mockOrg],
        message: 'Organizations by type retrieved'
      });
      const res = await request(app).get('/api/organizations/type/1');
      expect(res.status).toBe(200);
    });

    it('returns 404 when service throws not found', async () => {
      OrganizationService.getOrganizationsByType.mockRejectedValue(new Error('not found'));
      const res = await request(app).get('/api/organizations/type/1');
      expect(res.status).toBe(404);
    });

    it('returns 500 for generic service error', async () => {
      OrganizationService.getOrganizationsByType.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/organizations/type/1');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/organizations/:id/members', () => {
    it('returns 200 with members for valid ID', async () => {
      OrganizationService.getOrganizationMembers.mockResolvedValue({
        data: [],
        message: 'Members retrieved'
      });
      const res = await request(app).get('/api/organizations/1/members');
      expect(res.status).toBe(200);
    });

    it('returns 404 when service throws not found', async () => {
      OrganizationService.getOrganizationMembers.mockRejectedValue(new Error('not found'));
      const res = await request(app).get('/api/organizations/1/members');
      expect(res.status).toBe(404);
    });

    it('returns 500 for generic service error', async () => {
      OrganizationService.getOrganizationMembers.mockRejectedValue(new Error('DB error'));
      const res = await request(app).get('/api/organizations/1/members');
      expect(res.status).toBe(500);
    });
  });
});
