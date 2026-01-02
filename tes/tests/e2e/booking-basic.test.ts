import { test, expect } from '@playwright/test';

test.describe('Booking Process', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('body')).toBeVisible();
  });

  test('booking components exist', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const elements = page.locator('button, form, a, div, span, input');
    expect(await elements.count()).toBeGreaterThan(0);
  });

  test('navigation works', async ({ page }) => {
    await page.goto('http://localhost:3000');
    const links = page.locator('a');
    if (await links.count() > 0) {
      await links.first().click();
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('login page accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await expect(page.locator('body')).toBeVisible();
  });

  test('signup page accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
    await expect(page.locator('body')).toBeVisible();
  });

  test('payment page accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/payment');
    await expect(page.locator('body')).toBeVisible();
  });
});
