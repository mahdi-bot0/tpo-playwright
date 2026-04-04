import { test, expect } from '@playwright/test';

test('seed test - app loads', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example/);
});