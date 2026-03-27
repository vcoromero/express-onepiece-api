jest.mock('../../src/services/organization-type.service');

const request = require('supertest');
const app = require('../../src/app');
const organizationTypeService = require('../../src/services/organization-type.service');
const JWTUtil = require('../../src/utils/jwt.util');

const token = JWTUtil.generateToken({ username: 'testadmin', role: 'admin' });
const mockOrgType = { id: 1, name: 'Pirate Crew', description: 'Pirates' };

describe('OrganizationType Controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/organization-types', () => {
    it('returns 200 with list', async () => {
      organizationTypeService.getAllOrganizationTypes.mockResolvedValue({ success: true, organizationTypes: [mockOrgType], total: 1 });
      const res = await request(app).get('/api/organization-types');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('returns 500 on service failure', async () => {
      organizationTypeService.getAllOrganizationTypes.mockResolvedValue({ success: false });
      const res = await request(app).get('/api/organization-types');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/organization-types/:id', () => {
    it('returns 200 for valid ID', async () => {
      organizationTypeService.getOrganizationTypeById.mockResolvedValue({ success: true, data: mockOrgType });
      const res = await request(app).get('/api/organization-types/1');
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      organizationTypeService.getOrganizationTypeById.mockResolvedValue({ success: false, error: 'INVALID_ID' });
      const res = await request(app).get('/api/organization-types/abc');
      expect(res.status).toBe(400);
    });

    it('returns 404 when not found', async () => {
      organizationTypeService.getOrganizationTypeById.mockResolvedValue({ success: false, error: 'NOT_FOUND' });
      const res = await request(app).get('/api/organization-types/999');
      expect(res.status).toBe(404);
    });

    it('returns 500 on generic error', async () => {
      organizationTypeService.getOrganizationTypeById.mockResolvedValue({ success: false, error: 'DB_ERROR' });
      const res = await request(app).get('/api/organization-types/1');
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/organization-types/:id', () => {
    it('returns 200 on successful update', async () => {
      organizationTypeService.updateOrganizationType.mockResolvedValue({ success: true, organizationType: mockOrgType, message: 'Updated' });
      const res = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Marine Division' });
      expect(res.status).toBe(200);
    });

    it('returns 400 for invalid ID', async () => {
      organizationTypeService.updateOrganizationType.mockResolvedValue({ success: false, error: 'INVALID_ID' });
      const res = await request(app)
        .put('/api/organization-types/abc')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' });
      expect(res.status).toBe(400);
    });

    it('returns 404 when not found', async () => {
      organizationTypeService.updateOrganizationType.mockResolvedValue({ success: false, error: 'NOT_FOUND' });
      const res = await request(app)
        .put('/api/organization-types/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' });
      expect(res.status).toBe(404);
    });

    it('returns 400 for NO_FIELDS_PROVIDED', async () => {
      organizationTypeService.updateOrganizationType.mockResolvedValue({ success: false, error: 'NO_FIELDS_PROVIDED' });
      const res = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns 400 for INVALID_NAME', async () => {
      organizationTypeService.updateOrganizationType.mockResolvedValue({ success: false, error: 'INVALID_NAME' });
      const res = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });
      expect(res.status).toBe(400);
    });

    it('returns 409 for DUPLICATE_NAME', async () => {
      organizationTypeService.updateOrganizationType.mockResolvedValue({ success: false, error: 'DUPLICATE_NAME' });
      const res = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Existing Type' });
      expect(res.status).toBe(409);
    });

    it('returns 500 for unknown error', async () => {
      organizationTypeService.updateOrganizationType.mockResolvedValue({ success: false, error: 'UNKNOWN' });
      const res = await request(app)
        .put('/api/organization-types/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' });
      expect(res.status).toBe(500);
    });

    it('returns 401 without token', async () => {
      const res = await request(app).put('/api/organization-types/1').send({ name: 'Test' });
      expect(res.status).toBe(401);
    });
  });
});
