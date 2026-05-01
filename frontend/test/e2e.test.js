import { test, expect } from '@playwright/test';

test.describe('Student Task Manager - Frontend Tests', () => {
  test('Login page loads and has form elements', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Register page loads and has form elements', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test('Dashboard requires authentication', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('Can navigate between pages', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.click('a[href="/register"]');
    await expect(page.locator('input[name="name"]')).toBeVisible();

    await page.click('a[href="/login"]');
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });
});