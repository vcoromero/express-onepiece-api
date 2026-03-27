const {
  buildValidationError,
  getStatusForServiceError,
  sendServiceResultError
} = require('../../src/utils/http-response.helper');

describe('http-response.helper', () => {
  it('buildValidationError returns expected payload', () => {
    const result = buildValidationError('Invalid body', 'INVALID_BODY');
    expect(result).toEqual({
      success: false,
      message: 'Invalid body',
      error: 'INVALID_BODY'
    });
  });

  it('getStatusForServiceError maps known default errors', () => {
    expect(getStatusForServiceError('NOT_FOUND')).toBe(404);
    expect(getStatusForServiceError('DUPLICATE_NAME')).toBe(409);
    expect(getStatusForServiceError('INVALID_ID')).toBe(400);
  });

  it('getStatusForServiceError applies overrides', () => {
    const status = getStatusForServiceError('MY_ERROR', { MY_ERROR: 422 });
    expect(status).toBe(422);
  });

  it('sendServiceResultError uses mapped status and body', () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status };
    const result = { success: false, error: 'NOT_FOUND', message: 'Missing' };

    sendServiceResultError(res, result);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(result);
  });
});
