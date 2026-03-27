jest.mock('../../src/config/prisma.config', () => ({
  $connect: jest.fn(),
  race: { count: jest.fn() },
  characterType: { count: jest.fn() },
  fruitType: { count: jest.fn() },
  organizationType: { count: jest.fn() },
  hakiType: { count: jest.fn() },
  ship: { count: jest.fn() },
  character: { count: jest.fn() },
  devilFruit: { count: jest.fn() },
  organization: { count: jest.fn() },
  characterDevilFruit: { count: jest.fn() },
  characterHaki: { count: jest.fn() },
  characterCharacterType: { count: jest.fn() },
  characterOrganization: { count: jest.fn() }
}));

jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn()
  }
}));

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

const prisma = require('../../src/config/prisma.config');
const fs = require('fs');
const { syncDatabase, getAvailableSqlFiles, executeSqlFiles, getDatabaseStatus, diagnoseDatabase } = require('../../src/controllers/db.controller');

const mockReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: { username: 'testadmin' },
  ip: '127.0.0.1',
  ...overrides
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('DB Controller', () => {
  beforeEach(() => jest.resetAllMocks());

  describe('syncDatabase', () => {
    it('returns 200 on successful sync', async () => {
      const req = mockReq();
      const res = mockRes();
      await syncDatabase(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('getAvailableSqlFiles', () => {
    it('returns 200 with list of SQL files', async () => {
      fs.promises.readdir.mockResolvedValue([
        '01-clean-database.sql',
        '02-seed-races.sql',
        'readme.txt'
      ]);
      const req = mockReq();
      const res = mockRes();
      await getAvailableSqlFiles(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const jsonArg = res.json.mock.calls[0][0];
      expect(jsonArg.success).toBe(true);
      expect(jsonArg.data.files).toHaveLength(2);
    });

    it('returns 500 on readdir error', async () => {
      fs.promises.readdir.mockRejectedValue(new Error('ENOENT'));
      const req = mockReq();
      const res = mockRes();
      await getAvailableSqlFiles(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('executeSqlFiles', () => {
    it('returns 200 when fileNames array is provided', async () => {
      prisma.$connect.mockResolvedValue(undefined);
      const req = mockReq({ body: { fileNames: ['01-clean-database.sql'] } });
      const res = mockRes();
      await executeSqlFiles(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 400 when fileNames is missing', async () => {
      const req = mockReq({ body: {} });
      const res = mockRes();
      await executeSqlFiles(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when fileNames is empty array', async () => {
      const req = mockReq({ body: { fileNames: [] } });
      const res = mockRes();
      await executeSqlFiles(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when fileNames is not an array', async () => {
      const req = mockReq({ body: { fileNames: 'file.sql' } });
      const res = mockRes();
      await executeSqlFiles(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getDatabaseStatus', () => {
    it('returns 200 with database status', async () => {
      prisma.$connect.mockResolvedValue(undefined);
      prisma.race.count.mockResolvedValue(5);
      prisma.characterType.count.mockResolvedValue(3);
      prisma.fruitType.count.mockResolvedValue(3);
      prisma.organizationType.count.mockResolvedValue(4);
      prisma.hakiType.count.mockResolvedValue(3);
      prisma.ship.count.mockResolvedValue(10);
      prisma.character.count.mockResolvedValue(50);
      prisma.devilFruit.count.mockResolvedValue(20);
      prisma.organization.count.mockResolvedValue(8);
      prisma.characterDevilFruit.count.mockResolvedValue(15);
      prisma.characterHaki.count.mockResolvedValue(30);
      prisma.characterCharacterType.count.mockResolvedValue(50);
      prisma.characterOrganization.count.mockResolvedValue(40);

      const req = mockReq();
      const res = mockRes();
      await getDatabaseStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('handles tables with count errors gracefully', async () => {
      prisma.$connect.mockResolvedValue(undefined);
      prisma.race.count.mockRejectedValue(new Error('Table error'));
      prisma.characterType.count.mockResolvedValue(0);
      prisma.fruitType.count.mockResolvedValue(0);
      prisma.organizationType.count.mockResolvedValue(0);
      prisma.hakiType.count.mockResolvedValue(0);
      prisma.ship.count.mockResolvedValue(0);
      prisma.character.count.mockResolvedValue(0);
      prisma.devilFruit.count.mockResolvedValue(0);
      prisma.organization.count.mockResolvedValue(0);
      prisma.characterDevilFruit.count.mockResolvedValue(0);
      prisma.characterHaki.count.mockResolvedValue(0);
      prisma.characterCharacterType.count.mockResolvedValue(0);
      prisma.characterOrganization.count.mockResolvedValue(0);

      const req = mockReq();
      const res = mockRes();
      await getDatabaseStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('returns 500 on connection failure', async () => {
      prisma.$connect.mockRejectedValue(new Error('Connection refused'));
      const req = mockReq();
      const res = mockRes();
      await getDatabaseStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('diagnoseDatabase', () => {
    it('returns 200 with healthy database diagnosis', async () => {
      prisma.$connect.mockResolvedValue(undefined);
      prisma.race.count.mockResolvedValue(10);
      prisma.characterType.count.mockResolvedValue(5);
      prisma.fruitType.count.mockResolvedValue(3);
      prisma.organizationType.count.mockResolvedValue(4);
      prisma.hakiType.count.mockResolvedValue(3);
      prisma.ship.count.mockResolvedValue(8);
      prisma.character.count.mockResolvedValue(50);
      prisma.devilFruit.count.mockResolvedValue(20);
      prisma.organization.count.mockResolvedValue(5);

      const req = mockReq();
      const res = mockRes();
      await diagnoseDatabase(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const jsonArg = res.json.mock.calls[0][0];
      expect(jsonArg.success).toBe(true);
    });

    it('returns 200 with issues for empty tables', async () => {
      prisma.$connect.mockResolvedValue(undefined);
      prisma.race.count.mockResolvedValue(0);
      prisma.characterType.count.mockResolvedValue(0);
      prisma.fruitType.count.mockResolvedValue(0);
      prisma.organizationType.count.mockResolvedValue(0);
      prisma.hakiType.count.mockResolvedValue(0);
      prisma.ship.count.mockResolvedValue(0);
      prisma.character.count.mockResolvedValue(0);
      prisma.devilFruit.count.mockResolvedValue(0);
      prisma.organization.count.mockResolvedValue(0);

      const req = mockReq();
      const res = mockRes();
      await diagnoseDatabase(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const jsonArg = res.json.mock.calls[0][0];
      expect(jsonArg.data.issues.length).toBeGreaterThan(0);
    });

    it('returns 200 with connection failure in diagnosis', async () => {
      prisma.$connect.mockRejectedValue(new Error('Connection refused'));
      const req = mockReq();
      const res = mockRes();
      await diagnoseDatabase(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const jsonArg = res.json.mock.calls[0][0];
      expect(jsonArg.success).toBe(false);
    });

    it('handles table errors gracefully', async () => {
      prisma.$connect.mockResolvedValue(undefined);
      prisma.race.count.mockRejectedValue(new Error('Table missing'));
      prisma.characterType.count.mockResolvedValue(5);
      prisma.fruitType.count.mockResolvedValue(3);
      prisma.organizationType.count.mockResolvedValue(4);
      prisma.hakiType.count.mockResolvedValue(3);
      prisma.ship.count.mockResolvedValue(8);
      prisma.character.count.mockResolvedValue(50);
      prisma.devilFruit.count.mockResolvedValue(20);
      prisma.organization.count.mockResolvedValue(5);

      const req = mockReq();
      const res = mockRes();
      await diagnoseDatabase(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      const jsonArg = res.json.mock.calls[0][0];
      expect(jsonArg.data.tables.some(t => t.status === 'missing')).toBe(true);
    });
  });
});
