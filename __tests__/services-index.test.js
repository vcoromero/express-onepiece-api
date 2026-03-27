jest.mock('../src/config/prisma.config', () => ({
  fruitType: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  devilFruit: { count: jest.fn() },
  ship: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  organization: { count: jest.fn() }
}));

describe('Services Index', () => {
  it('exports fruitTypeService', () => {
    const services = require('../src/services');
    expect(services.fruitTypeService).toBeDefined();
    expect(typeof services.fruitTypeService.getAllTypes).toBe('function');
  });

  it('exports shipService', () => {
    const services = require('../src/services');
    expect(services.shipService).toBeDefined();
    expect(typeof services.shipService.getAllShips).toBe('function');
  });
});
