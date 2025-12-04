import { test, expect } from '@playwright/test';

test('smoke: create and list todo via UI', async ({ page }) => {
  await page.goto('/');

  // Fill form
  await page.getByPlaceholder('New todo title').fill('Playwright e2e todo');
  await page.locator('select[name="priority"]').selectOption('medium');
  await page.locator('input[name="due_at"]').fill('2099-12-31T00:00');

  // Submit
  await page.getByRole('button', { name: /add/i }).click();

  // Expect new todo appears in list
  await expect(page.getByText('Playwright e2e todo')).toBeVisible();
});
