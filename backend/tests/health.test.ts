import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Health and Middleware Verification', () => {
  it('GET /api/health should return 200 with healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('service');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/non-existent-route should return 404 with error message', async () => {
    const res = await request(app).get('/api/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toContain('Endpoint not found');
  });
});
