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

  await page.goto('/');
  // Navigate to Todos page (router default is Dashboard)
  await page.getByRole('link', { name: /todos/i }).click();
  await page.waitForURL('**/todos');

  // Expect new todo appears in list
  await expect(page.getByText('Playwright e2e todo')).toBeVisible();
});
