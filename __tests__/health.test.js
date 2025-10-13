const request = require('supertest');
const app = require('../src/app');

// Note: These are integration tests for the health endpoint
// The health endpoint is simple with no external dependencies, so integration tests are appropriate
describe('Health Endpoint', () => {
  it('should return 200 and health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('message', 'One Piece API is running');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should return valid timestamp format', async () => {
    const response = await request(app).get('/api/health');

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.toString()).not.toBe('Invalid Date');
  });
});

