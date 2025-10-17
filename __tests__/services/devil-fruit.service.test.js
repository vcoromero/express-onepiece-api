// Devil Fruit Service Tests
// These are unit tests for the devil fruit service

const { Op } = require('sequelize');

// Mock Sequelize models
jest.mock('../../src/models/devil-fruit.model', () => ({
  findAndCountAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
}));

jest.mock('../../src/models', () => ({
  FruitType: {
    findByPk: jest.fn()
  }
}));

describe('DevilFruitService', () => {
  let service;
  let DevilFruit;
  let FruitType;

  beforeEach(() => {
    jest.clearAllMocks();
    service = require('../../src/services/devil-fruit.service');
    DevilFruit = require('../../src/models/devil-fruit.model');
    FruitType = require('../../src/models').FruitType;
  });

  describe('getAllFruits', () => {
    it('should return paginated fruits with default options', async () => {
      const mockFruits = [
        { id: 1, name: 'Gomu Gomu no Mi', type_id: 1 },
        { id: 2, name: 'Mera Mera no Mi', type_id: 1 }
      ];
      
      DevilFruit.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockFruits
      });

      const result = await service.getAllFruits();

      expect(DevilFruit.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Array),
        attributes: expect.any(Array),
        order: [['id', 'ASC']],
        limit: 10,
        offset: 0
      });
      expect(result).toHaveProperty('fruits');
      expect(result).toHaveProperty('pagination');
    });

    it('should apply search filter', async () => {
      const mockFruits = [{ id: 1, name: 'Gomu Gomu no Mi' }];
      
      DevilFruit.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockFruits
      });

      await service.getAllFruits({ search: 'Gomu' });

      expect(DevilFruit.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            name: {
              [Op.like]: '%Gomu%'
            }
          }
        })
      );
    });

    it('should apply type filter', async () => {
      const mockFruits = [{ id: 1, name: 'Gomu Gomu no Mi', type_id: 1 }];
      
      DevilFruit.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockFruits
      });

      await service.getAllFruits({ type_id: '1' });

      expect(DevilFruit.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            type_id: '1'
          }
        })
      );
    });

    it('should handle pagination correctly', async () => {
      const mockFruits = [{ id: 1, name: 'Gomu Gomu no Mi' }];
      
      DevilFruit.findAndCountAll.mockResolvedValue({
        count: 25,
        rows: mockFruits
      });

      const result = await service.getAllFruits({ page: 2, limit: 10 });

      expect(DevilFruit.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
          offset: 10
        })
      );
      expect(result.pagination.currentPage).toBe(2);
    });
  });

  describe('getFruitById', () => {
    it('should return fruit when found', async () => {
      const mockFruit = { id: 1, name: 'Gomu Gomu no Mi', type_id: 1 };
      
      DevilFruit.findOne.mockResolvedValue(mockFruit);

      const result = await service.getFruitById(1);

      expect(DevilFruit.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Array),
        attributes: expect.any(Array)
      });
      expect(result).toBe(mockFruit);
    });

    it('should return null when fruit not found', async () => {
      DevilFruit.findOne.mockResolvedValue(null);

      const result = await service.getFruitById(999);

      expect(result).toBeNull();
    });
  });

  describe('nameExists', () => {
    it('should return true if name exists', async () => {
      DevilFruit.findOne.mockResolvedValue({ id: 1, name: 'Existing Name' });

      const result = await service.nameExists('Existing Name');

      expect(DevilFruit.findOne).toHaveBeenCalledWith({
        where: { name: 'Existing Name' }
      });
      expect(result).toBe(true);
    });

    it('should return false if name does not exist', async () => {
      DevilFruit.findOne.mockResolvedValue(null);

      const result = await service.nameExists('Non-existing Name');

      expect(result).toBe(false);
    });

    it('should exclude ID when checking for duplicates', async () => {
      DevilFruit.findOne.mockResolvedValue(null);

      await service.nameExists('Test Name', 1);

      expect(DevilFruit.findOne).toHaveBeenCalledWith({
        where: {
          name: 'Test Name',
          id: { [Op.ne]: 1 }
        }
      });
    });
  });

  describe('typeExists', () => {
    it('should return true if type exists', async () => {
      FruitType.findByPk.mockResolvedValue({ id: 1, name: 'Paramecia' });

      const result = await service.typeExists(1);

      expect(FruitType.findByPk).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false if type does not exist', async () => {
      FruitType.findByPk.mockResolvedValue(null);

      const result = await service.typeExists(999);

      expect(result).toBe(false);
    });
  });

  describe('createFruit', () => {
    it('should create fruit successfully', async () => {
      const fruitData = {
        name: 'Gomu Gomu no Mi',
        type_id: 1,
        description: 'Rubber fruit'
      };
      
      const mockCreatedFruit = { id: 1, ...fruitData };
      
      // Mock nameExists to return false (no duplicate)
      jest.spyOn(service, 'nameExists').mockResolvedValue(false);
      // Mock typeExists to return true (type exists)
      jest.spyOn(service, 'typeExists').mockResolvedValue(true);
      // Mock getFruitById to return created fruit
      jest.spyOn(service, 'getFruitById').mockResolvedValue(mockCreatedFruit);
      
      DevilFruit.create.mockResolvedValue(mockCreatedFruit);

      const result = await service.createFruit(fruitData);

      expect(DevilFruit.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Gomu Gomu no Mi',
          type_id: 1,
          description: 'Rubber fruit'
        })
      );
      expect(result).toBe(mockCreatedFruit);
    });

    it('should throw error for duplicate name', async () => {
      const fruitData = {
        name: 'Gomu Gomu no Mi',
        type_id: 1
      };
      
      // Mock nameExists to return true (duplicate exists)
      jest.spyOn(service, 'nameExists').mockResolvedValue(true);

      await expect(service.createFruit(fruitData)).rejects.toThrow('A devil fruit with this name already exists');
    });

    it('should throw error for invalid type', async () => {
      const fruitData = {
        name: 'Gomu Gomu no Mi',
        type_id: 999
      };
      
      // Mock nameExists to return false (no duplicate)
      jest.spyOn(service, 'nameExists').mockResolvedValue(false);
      // Mock typeExists to return false (type doesn't exist)
      jest.spyOn(service, 'typeExists').mockResolvedValue(false);

      await expect(service.createFruit(fruitData)).rejects.toThrow('Invalid type ID');
    });
  });

  describe('updateFruit', () => {
    it('should update fruit successfully', async () => {
      const fruitId = 1;
      const updateData = {
        name: 'Gomu Gomu no Mi Updated',
        description: 'Updated description'
      };
      
      const mockUpdatedFruit = { id: 1, ...updateData };
      
      // Mock getFruitById to return existing fruit
      jest.spyOn(service, 'getFruitById').mockResolvedValue({ id: 1, name: 'Old Name' });
      // Mock nameExists to return false (no duplicate)
      jest.spyOn(service, 'nameExists').mockResolvedValue(false);
      // Mock getFruitById to return updated fruit
      jest.spyOn(service, 'getFruitById').mockResolvedValueOnce({ id: 1, name: 'Old Name' })
        .mockResolvedValueOnce(mockUpdatedFruit);
      
      DevilFruit.update.mockResolvedValue([1]);

      const result = await service.updateFruit(fruitId, updateData);

      expect(DevilFruit.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Gomu Gomu no Mi Updated',
          description: 'Updated description'
        }),
        { where: { id: fruitId } }
      );
      expect(result).toBe(mockUpdatedFruit);
    });

    it('should throw error when fruit not found', async () => {
      const fruitId = 999;
      const updateData = { name: 'Updated Name' };
      
      // Mock getFruitById to return null (not found)
      jest.spyOn(service, 'getFruitById').mockResolvedValue(null);

      await expect(service.updateFruit(fruitId, updateData)).rejects.toThrow('Devil fruit with ID 999 not found');
    });

    it('should throw error for duplicate name', async () => {
      const fruitId = 1;
      const updateData = { name: 'Existing Name' };
      
      // Mock getFruitById to return existing fruit
      jest.spyOn(service, 'getFruitById').mockResolvedValue({ id: 1, name: 'Old Name' });
      // Mock nameExists to return true (duplicate exists)
      jest.spyOn(service, 'nameExists').mockResolvedValue(true);

      await expect(service.updateFruit(fruitId, updateData)).rejects.toThrow('Another devil fruit with this name already exists');
    });
  });

  describe('deleteFruit', () => {
    it('should delete fruit successfully', async () => {
      const fruitId = 1;
      const mockFruit = { id: 1, name: 'Gomu Gomu no Mi' };
      
      // Mock getFruitById to return existing fruit
      jest.spyOn(service, 'getFruitById').mockResolvedValue(mockFruit);
      DevilFruit.destroy.mockResolvedValue(1);

      const result = await service.deleteFruit(fruitId);

      expect(DevilFruit.destroy).toHaveBeenCalledWith({ where: { id: fruitId } });
      expect(result).toEqual({
        id: 1,
        name: 'Gomu Gomu no Mi'
      });
    });

    it('should throw error when fruit not found', async () => {
      const fruitId = 999;
      
      // Mock getFruitById to return null (not found)
      jest.spyOn(service, 'getFruitById').mockResolvedValue(null);

      await expect(service.deleteFruit(fruitId)).rejects.toThrow('Devil fruit with ID 999 not found');
    });
  });

  describe('getFruitsByType', () => {
    it('should return fruits by type with pagination', async () => {
      const typeId = 1;
      const mockFruits = [
        { id: 1, name: 'Gomu Gomu no Mi', type_id: 1 },
        { id: 2, name: 'Mera Mera no Mi', type_id: 1 }
      ];
      
      DevilFruit.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockFruits
      });

      const result = await service.getFruitsByType(typeId, { page: 1, limit: 10 });

      expect(DevilFruit.findAndCountAll).toHaveBeenCalledWith({
        where: { type_id: typeId },
        include: expect.any(Array),
        attributes: expect.any(Array),
        order: [['id', 'ASC']],
        limit: 10,
        offset: 0
      });
      expect(result).toHaveProperty('fruits');
      expect(result).toHaveProperty('pagination');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors in getAllFruits', async () => {
      const error = new Error('Database connection failed');
      DevilFruit.findAndCountAll.mockRejectedValue(error);

      await expect(service.getAllFruits()).rejects.toThrow('Database connection failed');
    });

    it('should handle database errors in createFruit', async () => {
      const fruitData = { name: 'Test Fruit', type_id: 1 };
      const error = new Error('Database error');
      
      jest.spyOn(service, 'nameExists').mockResolvedValue(false);
      jest.spyOn(service, 'typeExists').mockResolvedValue(true);
      DevilFruit.create.mockRejectedValue(error);

      await expect(service.createFruit(fruitData)).rejects.toThrow('Database error');
    });

    it('should handle database errors in updateFruit', async () => {
      const fruitId = 1;
      const updateData = { name: 'Updated' };
      
      jest.spyOn(service, 'getFruitById').mockResolvedValue({ id: 1 });
      jest.spyOn(service, 'nameExists').mockResolvedValue(false);
      const error = new Error('Database error');
      DevilFruit.update.mockRejectedValue(error);

      await expect(service.updateFruit(fruitId, updateData)).rejects.toThrow('Database error');
    });

    it('should handle database errors in deleteFruit', async () => {
      const fruitId = 1;
      
      jest.spyOn(service, 'getFruitById').mockResolvedValue({ id: 1 });
      const error = new Error('Database error');
      DevilFruit.destroy.mockRejectedValue(error);

      await expect(service.deleteFruit(fruitId)).rejects.toThrow('Database error');
    });
  });
});
