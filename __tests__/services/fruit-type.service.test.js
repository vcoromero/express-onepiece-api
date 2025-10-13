const fruitTypeService = require('../../src/services/fruit-type.service');
const FruitType = require('../../src/models/fruit-type.model');
const { sequelize } = require('../../src/config/sequelize.config');
const { Op } = require('sequelize');

// Mock Sequelize configuration
jest.mock('../../src/config/sequelize.config', () => ({
  sequelize: {
    query: jest.fn(),
    authenticate: jest.fn(),
    sync: jest.fn()
  },
  checkConnection: jest.fn(),
  syncModels: jest.fn()
}));

// Mock FruitType model
jest.mock('../../src/models/fruit-type.model', () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
}));

describe('FruitTypeService (fruit-type.service.js)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTypes', () => {
    it('should return all fruit types ordered by ID', async () => {
      const mockTypes = [
        { id: 1, name: 'Paramecia', description: 'Test 1', created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'Zoan', description: 'Test 2', created_at: new Date(), updated_at: new Date() }
      ];

      FruitType.findAll.mockResolvedValue(mockTypes);

      const result = await fruitTypeService.getAllTypes();

      expect(result).toEqual(mockTypes);
      expect(FruitType.findAll).toHaveBeenCalledWith({
        order: [['id', 'ASC']],
        attributes: ['id', 'name', 'description', 'created_at', 'updated_at']
      });
      expect(FruitType.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if no types exist', async () => {
      FruitType.findAll.mockResolvedValue([]);

      const result = await fruitTypeService.getAllTypes();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getTypeById', () => {
    it('should return fruit type when found', async () => {
      const mockType = { id: 1, name: 'Paramecia', description: 'Test', created_at: new Date(), updated_at: new Date() };
      FruitType.findOne.mockResolvedValue(mockType);

      const result = await fruitTypeService.getTypeById(1);

      expect(result).toEqual(mockType);
      expect(FruitType.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        attributes: ['id', 'name', 'description', 'created_at', 'updated_at']
      });
    });

    it('should return null when type not found', async () => {
      FruitType.findOne.mockResolvedValue(null);

      const result = await fruitTypeService.getTypeById(999);

      expect(result).toBeNull();
      expect(FruitType.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('nameExists', () => {
    it('should return true if name exists', async () => {
      FruitType.findOne.mockResolvedValue({ id: 1, name: 'Paramecia' });

      const result = await fruitTypeService.nameExists('Paramecia');

      expect(result).toBe(true);
      expect(FruitType.findOne).toHaveBeenCalledWith({
        where: { name: 'Paramecia' }
      });
    });

    it('should return false if name does not exist', async () => {
      FruitType.findOne.mockResolvedValue(null);

      const result = await fruitTypeService.nameExists('NonExistent');

      expect(result).toBe(false);
    });

    it('should exclude specific ID when checking existence', async () => {
      FruitType.findOne.mockResolvedValue(null);

      const result = await fruitTypeService.nameExists('Paramecia', 5);

      expect(result).toBe(false);
      expect(FruitType.findOne).toHaveBeenCalledWith({
        where: {
          name: 'Paramecia',
          id: { [Op.ne]: 5 }
        }
      });
    });

    it('should trim name before checking', async () => {
      FruitType.findOne.mockResolvedValue(null);

      await fruitTypeService.nameExists('  Paramecia  ');

      expect(FruitType.findOne).toHaveBeenCalledWith({
        where: { name: 'Paramecia' }
      });
    });
  });

  describe('hasAssociatedFruits', () => {
    it('should return true if type has associated fruits', async () => {
      sequelize.query.mockResolvedValue([{ count: 5 }]);

      const result = await fruitTypeService.hasAssociatedFruits(1);

      expect(result).toBe(true);
      expect(sequelize.query).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM devil_fruits WHERE type_id = ?',
        expect.objectContaining({
          replacements: [1]
        })
      );
    });

    it('should return false if type has no associated fruits', async () => {
      sequelize.query.mockResolvedValue([{ count: 0 }]);

      const result = await fruitTypeService.hasAssociatedFruits(1);

      expect(result).toBe(false);
    });
  });

  describe('getAssociatedFruitsCount', () => {
    it('should return count of associated fruits', async () => {
      sequelize.query.mockResolvedValue([{ count: 10 }]);

      const result = await fruitTypeService.getAssociatedFruitsCount(1);

      expect(result).toBe(10);
      expect(sequelize.query).toHaveBeenCalledTimes(1);
    });

    it('should return 0 if no associated fruits', async () => {
      sequelize.query.mockResolvedValue([{ count: 0 }]);

      const result = await fruitTypeService.getAssociatedFruitsCount(1);

      expect(result).toBe(0);
    });
  });

  describe('createType', () => {
    it('should create fruit type successfully', async () => {
      const inputData = {
        name: 'Mythical Zoan',
        description: 'Rare type'
      };

      const mockCreated = {
        id: 10,
        name: 'Mythical Zoan',
        description: 'Rare type',
        created_at: new Date(),
        updated_at: new Date()
      };

      FruitType.findOne.mockResolvedValue(null); // Name doesn't exist
      FruitType.create.mockResolvedValue(mockCreated);

      const result = await fruitTypeService.createType(inputData);

      expect(result).toEqual({
        id: 10,
        name: 'Mythical Zoan',
        description: 'Rare type',
        created_at: mockCreated.created_at,
        updated_at: mockCreated.updated_at
      });
      expect(FruitType.findOne).toHaveBeenCalledTimes(1);
      expect(FruitType.create).toHaveBeenCalledWith({
        name: 'Mythical Zoan',
        description: 'Rare type'
      });
    });

    it('should trim name and description before creating', async () => {
      const inputData = {
        name: '  Mythical Zoan  ',
        description: '  Rare type  '
      };

      FruitType.findOne.mockResolvedValue(null);
      FruitType.create.mockResolvedValue({
        id: 10,
        name: 'Mythical Zoan',
        description: 'Rare type',
        created_at: new Date(),
        updated_at: new Date()
      });

      await fruitTypeService.createType(inputData);

      expect(FruitType.create).toHaveBeenCalledWith({
        name: 'Mythical Zoan',
        description: 'Rare type'
      });
    });

    it('should handle null description', async () => {
      const inputData = {
        name: 'Test Type',
        description: null
      };

      FruitType.findOne.mockResolvedValue(null);
      FruitType.create.mockResolvedValue({
        id: 10,
        name: 'Test Type',
        description: null,
        created_at: new Date(),
        updated_at: new Date()
      });

      const result = await fruitTypeService.createType(inputData);

      expect(result.description).toBeNull();
      expect(FruitType.create).toHaveBeenCalledWith({
        name: 'Test Type',
        description: null
      });
    });

    it('should throw DUPLICATE_NAME error if name already exists', async () => {
      const inputData = {
        name: 'Paramecia',
        description: 'Duplicate'
      };

      FruitType.findOne.mockResolvedValue({ id: 1, name: 'Paramecia' });

      await expect(fruitTypeService.createType(inputData)).rejects.toMatchObject({
        message: 'A fruit type with this name already exists',
        code: 'DUPLICATE_NAME'
      });

      expect(FruitType.create).not.toHaveBeenCalled();
    });
  });

  describe('updateType', () => {
    it('should update fruit type successfully', async () => {
      const mockExisting = { id: 1, name: 'Old Name', description: 'Old desc' };
      const mockUpdated = { id: 1, name: 'New Name', description: 'New desc', created_at: new Date(), updated_at: new Date() };

      FruitType.findOne
        .mockResolvedValueOnce(mockExisting) // getTypeById call
        .mockResolvedValueOnce(null) // nameExists call
        .mockResolvedValueOnce(mockUpdated); // getTypeById call after update

      FruitType.update.mockResolvedValue([1]);

      const result = await fruitTypeService.updateType(1, {
        name: 'New Name',
        description: 'New desc'
      });

      expect(result).toEqual(mockUpdated);
      expect(FruitType.update).toHaveBeenCalledWith(
        { name: 'New Name', description: 'New desc' },
        { where: { id: 1 } }
      );
    });

    it('should update only name', async () => {
      const mockExisting = { id: 1, name: 'Old Name', description: 'Desc' };
      const mockUpdated = { id: 1, name: 'New Name', description: 'Desc', created_at: new Date(), updated_at: new Date() };

      FruitType.findOne
        .mockResolvedValueOnce(mockExisting)
        .mockResolvedValueOnce(null) // nameExists
        .mockResolvedValueOnce(mockUpdated);

      FruitType.update.mockResolvedValue([1]);

      await fruitTypeService.updateType(1, { name: 'New Name' });

      expect(FruitType.update).toHaveBeenCalledWith(
        { name: 'New Name' },
        { where: { id: 1 } }
      );
    });

    it('should update only description', async () => {
      const mockExisting = { id: 1, name: 'Name', description: 'Old desc' };
      const mockUpdated = { id: 1, name: 'Name', description: 'New desc', created_at: new Date(), updated_at: new Date() };

      FruitType.findOne
        .mockResolvedValueOnce(mockExisting)
        .mockResolvedValueOnce(mockUpdated);

      FruitType.update.mockResolvedValue([1]);

      await fruitTypeService.updateType(1, { description: 'New desc' });

      expect(FruitType.update).toHaveBeenCalledWith(
        { description: 'New desc' },
        { where: { id: 1 } }
      );
    });

    it('should set description to null when provided as null', async () => {
      const mockExisting = { id: 1, name: 'Name', description: 'Old desc' };
      const mockUpdated = { id: 1, name: 'Name', description: null, created_at: new Date(), updated_at: new Date() };

      FruitType.findOne
        .mockResolvedValueOnce(mockExisting)
        .mockResolvedValueOnce(mockUpdated);

      FruitType.update.mockResolvedValue([1]);

      await fruitTypeService.updateType(1, { description: null });

      expect(FruitType.update).toHaveBeenCalledWith(
        { description: null },
        { where: { id: 1 } }
      );
    });

    it('should throw NOT_FOUND error if type does not exist', async () => {
      FruitType.findOne.mockResolvedValue(null);

      await expect(fruitTypeService.updateType(999, { name: 'New Name' })).rejects.toMatchObject({
        message: 'Fruit type with ID 999 not found',
        code: 'NOT_FOUND'
      });

      expect(FruitType.update).not.toHaveBeenCalled();
    });

    it('should throw DUPLICATE_NAME error if new name already exists', async () => {
      const mockExisting = { id: 1, name: 'Old Name' };
      const mockDuplicate = { id: 2, name: 'Paramecia' };

      FruitType.findOne
        .mockResolvedValueOnce(mockExisting) // getTypeById
        .mockResolvedValueOnce(mockDuplicate); // nameExists

      await expect(
        fruitTypeService.updateType(1, { name: 'Paramecia' })
      ).rejects.toMatchObject({
        message: 'Another fruit type with this name already exists',
        code: 'DUPLICATE_NAME'
      });

      expect(FruitType.update).not.toHaveBeenCalled();
    });

    it('should trim name and description before updating', async () => {
      const mockExisting = { id: 1, name: 'Name' };
      const mockUpdated = { id: 1, name: 'Updated', description: 'Desc', created_at: new Date(), updated_at: new Date() };

      FruitType.findOne
        .mockResolvedValueOnce(mockExisting)
        .mockResolvedValueOnce(null) // nameExists
        .mockResolvedValueOnce(mockUpdated);

      FruitType.update.mockResolvedValue([1]);

      await fruitTypeService.updateType(1, {
        name: '  Updated  ',
        description: '  Desc  '
      });

      expect(FruitType.update).toHaveBeenCalledWith(
        { name: 'Updated', description: 'Desc' },
        { where: { id: 1 } }
      );
    });

    it('should not check for duplicates if name is not being updated', async () => {
      const mockExisting = { id: 1, name: 'Name', description: 'Old' };
      const mockUpdated = { id: 1, name: 'Name', description: 'New', created_at: new Date(), updated_at: new Date() };

      FruitType.findOne
        .mockResolvedValueOnce(mockExisting) // getTypeById
        .mockResolvedValueOnce(mockUpdated); // getTypeById after update

      FruitType.update.mockResolvedValue([1]);

      await fruitTypeService.updateType(1, { description: 'New' });

      // findOne should only be called twice (not three times with nameExists)
      expect(FruitType.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteType', () => {
    it('should delete fruit type successfully when no associations', async () => {
      const mockType = { id: 10, name: 'Delete Test' };

      FruitType.findOne.mockResolvedValue(mockType);
      sequelize.query.mockResolvedValue([{ count: 0 }]);
      FruitType.destroy.mockResolvedValue(1);

      const result = await fruitTypeService.deleteType(10);

      expect(result).toEqual({ id: 10, name: 'Delete Test' });
      expect(FruitType.destroy).toHaveBeenCalledWith({ where: { id: 10 } });
      expect(FruitType.destroy).toHaveBeenCalledTimes(1);
    });

    it('should throw NOT_FOUND error if type does not exist', async () => {
      FruitType.findOne.mockResolvedValue(null);

      await expect(fruitTypeService.deleteType(999)).rejects.toMatchObject({
        message: 'Fruit type with ID 999 not found',
        code: 'NOT_FOUND'
      });

      expect(FruitType.destroy).not.toHaveBeenCalled();
    });

    it('should throw HAS_ASSOCIATIONS error if type has associated fruits', async () => {
      const mockType = { id: 1, name: 'Paramecia' };

      FruitType.findOne.mockResolvedValue(mockType);
      sequelize.query
        .mockResolvedValueOnce([{ count: 5 }]) // hasAssociatedFruits
        .mockResolvedValueOnce([{ count: 5 }]); // getAssociatedFruitsCount

      await expect(fruitTypeService.deleteType(1)).rejects.toMatchObject({
        message: 'Cannot delete fruit type because it has associated devil fruits',
        code: 'HAS_ASSOCIATIONS',
        associatedCount: 5
      });

      expect(FruitType.destroy).not.toHaveBeenCalled();
    });

    it('should include associated count in error', async () => {
      const mockType = { id: 1, name: 'Paramecia' };

      FruitType.findOne.mockResolvedValue(mockType);
      sequelize.query
        .mockResolvedValueOnce([{ count: 15 }])
        .mockResolvedValueOnce([{ count: 15 }]);

      try {
        await fruitTypeService.deleteType(1);
        fail('Should have thrown error');
      } catch (error) {
        expect(error.code).toBe('HAS_ASSOCIATIONS');
        expect(error.associatedCount).toBe(15);
      }
    });
  });

  describe('createType - Edge Cases', () => {
    it('should handle empty string description', async () => {
      const inputData = {
        name: 'Test',
        description: '   '
      };

      FruitType.findOne.mockResolvedValue(null);
      FruitType.create.mockResolvedValue({
        id: 1,
        name: 'Test',
        description: null,
        created_at: new Date(),
        updated_at: new Date()
      });

      await fruitTypeService.createType(inputData);

      expect(FruitType.create).toHaveBeenCalledWith({
        name: 'Test',
        description: null // Empty string converted to null
      });
    });

    it('should handle undefined description', async () => {
      const inputData = {
        name: 'Test'
        // description is undefined
      };

      FruitType.findOne.mockResolvedValue(null);
      FruitType.create.mockResolvedValue({
        id: 1,
        name: 'Test',
        description: null,
        created_at: new Date(),
        updated_at: new Date()
      });

      await fruitTypeService.createType(inputData);

      expect(FruitType.create).toHaveBeenCalledWith({
        name: 'Test',
        description: null
      });
    });
  });

  describe('updateType - Edge Cases', () => {
    it('should handle updating to same name (no duplicate check needed)', async () => {
      const mockExisting = { id: 1, name: 'Paramecia', description: 'Old' };
      const mockUpdated = { id: 1, name: 'Paramecia', description: 'New', created_at: new Date(), updated_at: new Date() };

      FruitType.findOne
        .mockResolvedValueOnce(mockExisting)
        .mockResolvedValueOnce(null) // nameExists (should exclude current ID)
        .mockResolvedValueOnce(mockUpdated);

      FruitType.update.mockResolvedValue([1]);

      await fruitTypeService.updateType(1, {
        name: 'Paramecia',
        description: 'New'
      });

      expect(FruitType.update).toHaveBeenCalled();
    });

    it('should handle empty string description in update', async () => {
      const mockExisting = { id: 1, name: 'Name' };
      const mockUpdated = { id: 1, name: 'Name', description: null, created_at: new Date(), updated_at: new Date() };

      FruitType.findOne
        .mockResolvedValueOnce(mockExisting)
        .mockResolvedValueOnce(mockUpdated);

      FruitType.update.mockResolvedValue([1]);

      await fruitTypeService.updateType(1, { description: '   ' });

      expect(FruitType.update).toHaveBeenCalledWith(
        { description: null }, // Empty string converted to null
        { where: { id: 1 } }
      );
    });
  });

  describe('Error Propagation', () => {
    it('should propagate database errors from findAll', async () => {
      const dbError = new Error('Database connection error');
      FruitType.findAll.mockRejectedValue(dbError);

      await expect(fruitTypeService.getAllTypes()).rejects.toThrow('Database connection error');
    });

    it('should propagate database errors from create', async () => {
      const dbError = new Error('Unique constraint violation');
      FruitType.findOne.mockResolvedValue(null);
      FruitType.create.mockRejectedValue(dbError);

      await expect(
        fruitTypeService.createType({ name: 'Test', description: 'Test' })
      ).rejects.toThrow('Unique constraint violation');
    });

    it('should propagate database errors from update', async () => {
      const mockExisting = { id: 1, name: 'Name' };
      const dbError = new Error('Update failed');

      FruitType.findOne.mockResolvedValue(mockExisting);
      FruitType.update.mockRejectedValue(dbError);

      await expect(
        fruitTypeService.updateType(1, { description: 'New' })
      ).rejects.toThrow('Update failed');
    });

    it('should propagate database errors from destroy', async () => {
      const mockType = { id: 1, name: 'Test' };
      const dbError = new Error('Foreign key constraint');

      FruitType.findOne.mockResolvedValue(mockType);
      sequelize.query.mockResolvedValue([[{ count: 0 }]]);
      FruitType.destroy.mockRejectedValue(dbError);

      await expect(fruitTypeService.deleteType(1)).rejects.toThrow('Foreign key constraint');
    });
  });
});

