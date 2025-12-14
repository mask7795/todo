import { test, expect } from '@playwright/test';

test('create todo via UI', async ({ page }) => {
  await page.goto('/todos');
  await page.getByRole('link', { name: '+ Add Todo' }).click();
  await expect(page).toHaveURL(/\/todos\/create/);

  await page.getByLabel('Title *').fill('Playwright E2E Todo');
  await page.getByLabel('Description').fill('Created by Playwright test');
  await page.getByLabel('Priority').selectOption('high');
  // Optionally set due date
  // await page.getByLabel('Due Date').fill('2025-12-31');

  await page.getByRole('button', { name: /Create/ }).click();
  await expect(page).toHaveURL(/\/todos$/);
  // Should see the new todo in the list
  await expect(page.getByText('Playwright E2E Todo')).toBeVisible();
});
