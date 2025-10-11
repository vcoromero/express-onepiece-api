const request = require('supertest');
const app = require('../src/app');

describe('Health Endpoint', () => {
  it('should return 200 and health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('message', 'One Piece API is running');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment');
  });

  it('should return valid timestamp format', async () => {
    const response = await request(app).get('/api/health');

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.toString()).not.toBe('Invalid Date');
  });
});

