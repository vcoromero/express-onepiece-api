const {
  createPaginatedResponse,
  createListResponse,
  createItemResponse
} = require('../../src/utils/response.helper');

describe('response.helper', () => {
  describe('createPaginatedResponse', () => {
    it('uses provided truthy pagination values', () => {
      const result = createPaginatedResponse(
        [{ id: 1 }, { id: 2 }],
        { page: 2, limit: 5, total: 20, totalPages: 4, hasNext: true, hasPrev: true },
        'Custom message'
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(20);
      expect(result.pagination.totalPages).toBe(4);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
      expect(result.message).toBe('Custom message');
    });

    it('falls back to defaults when pagination fields are undefined', () => {
      const result = createPaginatedResponse([], {});

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.hasNext).toBe(false);
      expect(result.pagination.hasPrev).toBe(false);
    });

    it('uses default message when message is not provided', () => {
      const result = createPaginatedResponse([], { page: 1, limit: 10, total: 0, totalPages: 0 });
      expect(result.message).toBe('Data retrieved successfully');
    });
  });

  describe('createListResponse', () => {
    it('returns correct structure with items', () => {
      const result = createListResponse([{ id: 1 }, { id: 2 }], 'Items retrieved');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(result.message).toBe('Items retrieved');
    });

    it('uses default message when not provided', () => {
      const result = createListResponse([]);
      expect(result.message).toBe('Data retrieved successfully');
      expect(result.count).toBe(0);
    });
  });

  describe('createItemResponse', () => {
    it('returns correct structure for single item', () => {
      const result = createItemResponse({ id: 1, name: 'Test' }, 'Item found');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, name: 'Test' });
      expect(result.message).toBe('Item found');
    });

    it('uses default message when not provided', () => {
      const result = createItemResponse({});
      expect(result.message).toBe('Data retrieved successfully');
    });
  });
});
