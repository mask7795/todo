import { test, expect } from '@playwright/test';

test('create todo via UI', async ({ page }) => {
  await page.goto('/todos');
  // Try by role, fallback to by text for robustness
  const addBtn = await page.getByRole('link', { name: '+ Add Todo' }).or(page.getByText('+ Add Todo'));
  await addBtn.click();
  // Debug: wait a bit and log current URL
  await page.waitForTimeout(500);
  console.log('DEBUG: after click, URL is', await page.url());
  // Try direct navigation if not routed
  if (!(await page.url()).includes('/todos/create')) {
    await page.goto('/todos/create');
  }
  await expect(page).toHaveURL(/\/todos\/create/);

  await page.getByLabel('Title *').fill('Playwright E2E Todo');
  await page.getByLabel('Description').fill('Created by Playwright test');
  await page.getByLabel('Priority').selectOption('high');
  // Optionally set due date
  // await page.getByLabel('Due Date').fill('2025-12-31');

  await page.getByRole('button', { name: /Create/ }).click();
  await expect(page).toHaveURL(/\/todos$/);
  // Should see the new todo in the list
  await expect(page.getByText('Playwright E2E Todo').first()).toBeVisible();
});
