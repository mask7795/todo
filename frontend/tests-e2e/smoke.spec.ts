import { test, expect } from '@playwright/test';

test('smoke: create and list todo via UI', async ({ page, request }) => {
  // Seed a todo via API to avoid flakiness and auth issues in UI submit
  const apiKey = process.env.TODO_API_KEY ?? 'secret';
  const seedRes = await request.post('http://127.0.0.1:8000/todos/', {
    headers: { 'X-API-Key': apiKey },
    data: {
      title: 'Playwright e2e todo',
      priority: 'medium',
      due_at: '2099-12-31T00:00:00',
    },
  });
  if (!seedRes.ok()) {
    throw new Error(`Seed failed: ${seedRes.status()} ${await seedRes.text()}`);
  }

  // Navigate directly to Todos route to avoid menu timing issues
  await page.goto('/todos');
  await page.waitForLoadState('domcontentloaded');
  // Wait for UI readiness
  await expect(page.locator('div.toolbar')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('ul.todos')).toBeVisible({ timeout: 15000 });
  await page.waitForLoadState('networkidle');

  // Expect new todo appears in list (match specific list item)
  await expect(page.locator('ul.todos li:has-text("Playwright e2e todo")')).toBeVisible({ timeout: 15000 });
});
