const { serviceSuccess, serviceFailure } = require('../../src/utils/service-result.helper');

describe('service-result.helper', () => {
  it('serviceSuccess wraps payload preserving success true', () => {
    const result = serviceSuccess({ data: { id: 1 }, message: 'ok' });
    expect(result).toEqual({
      success: true,
      data: { id: 1 },
      message: 'ok'
    });
  });

  it('serviceFailure returns normalized failure payload', () => {
    const result = serviceFailure('Failed operation', 'INTERNAL_ERROR');
    expect(result).toEqual({
      success: false,
      message: 'Failed operation',
      error: 'INTERNAL_ERROR',
      details: undefined
    });
  });

  it('serviceFailure uses default error code when absent', () => {
    const result = serviceFailure('Failed operation');
    expect(result.error).toBe('INTERNAL_ERROR');
  });
});
