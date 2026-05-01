import { test, expect } from '@playwright/test';

test.describe('Student Task Manager - API Tests', () => {
  test('Health check endpoint should return OK', async ({ request }) => {
    const response = await request.get('http://localhost:5000/api/health');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('OK');
  });

  test('Register new user', async ({ request }) => {
    const response = await request.post('http://localhost:5000/api/auth/register', {
      data: {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
      },
    });
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.email).toBeTruthy();
  });

  test('Login user', async ({ request }) => {
    // Register first
    const email = `login${Date.now()}@example.com`;
    await request.post('http://localhost:5000/api/auth/register', {
      data: {
        name: 'Login Test',
        email,
        password: 'password123',
      },
    });

    // Then login
    const response = await request.post('http://localhost:5000/api/auth/login', {
      data: {
        email,
        password: 'password123',
      },
    });
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('Create task with authentication', async ({ request }) => {
    // Register and login
    const email = `task${Date.now()}@example.com`;
    await request.post('http://localhost:5000/api/auth/register', {
      data: {
        name: 'Task Test',
        email,
        password: 'password123',
      },
    });

    const loginResponse = await request.post('http://localhost:5000/api/auth/login', {
      data: {
        email,
        password: 'password123',
      },
    });

    const cookie = loginResponse.headers()['set-cookie'];

    // Create task
    const response = await request.post('http://localhost:5000/api/tasks', {
      headers: {
        cookie,
      },
      data: {
        title: 'Math Homework',
        description: 'Complete algebra problems',
        subject: 'Math',
        dueDate: '2026-12-01T00:00:00.000Z',
        priority: 'High',
        status: 'Pending',
      },
    });
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.title).toBe('Math Homework');
  });
});