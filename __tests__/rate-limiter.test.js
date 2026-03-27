const request = require('supertest');
const express = require('express');
const { createRateLimiter } = require('../src/middlewares/rate-limiter');

describe('Rate Limiter integration', () => {
  it('allows requests within the limit', async () => {
    const app = express();
    app.use(createRateLimiter({ windowMs: 60000, max: 5 }));
    app.get('/test', (req, res) => res.status(200).json({ ok: true }));

    const response = await request(app).get('/test');
    expect(response.status).toBe(200);
  });

  it('blocks requests that exceed the limit', async () => {
    const app = express();
    app.use(createRateLimiter({ windowMs: 60000, max: 2 }));
    app.get('/test', (req, res) => res.status(200).json({ ok: true }));

    await request(app).get('/test');
    await request(app).get('/test');
    const response = await request(app).get('/test');
    expect(response.status).toBe(429);
  });
});
