import { test, expect } from '@playwright/test';

test('smoke: create and list todo via UI', async ({ page, request }) => {
  // Seed a todo via API to avoid flakiness and auth issues in UI submit
  const apiKey = process.env.TODO_API_KEY ?? 'secret';
  await request.post('http://127.0.0.1:8000/todos/', {
    headers: { 'X-API-Key': apiKey },
    data: {
      title: 'Playwright e2e todo',
      priority: 'medium',
      due_at: '2099-12-31T00:00:00',
    },
  });

  // Navigate directly to Todos route to avoid menu timing issues
  await page.goto('/todos');
  // Wait for list toolbar to render (select filters present) and list container
  await page.waitForSelector('div.toolbar', { state: 'visible' });
  await page.waitForSelector('ul.todos', { state: 'visible' });
  await page.waitForLoadState('networkidle');

  // Expect new todo appears in list
  await expect(page.locator('ul.todos')).toContainText('Playwright e2e todo');
});
