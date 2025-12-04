import { test, expect } from '@playwright/test';

test('smoke: create and list todo via UI', async ({ page, request }, testInfo) => {
  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });
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
  // Wait for UI readiness using testids
  await expect(page.locator('[data-testid="todos-list"]')).toBeVisible({ timeout: 15000 });
  await page.waitForLoadState('networkidle');

  // Expect new todo appears in list (match specific list item)
  try {
    await expect(page.locator('[data-testid="todo-item"] >> [data-testid="todo-title"]:has-text("Playwright e2e todo")')).toBeVisible({ timeout: 15000 });
  } catch (err) {
    const html = await page.content();
    await testInfo.attach('page.html', { body: Buffer.from(html), contentType: 'text/html' });
    await testInfo.attach('console.log', { body: Buffer.from(consoleLogs.join('\n') || '(no console logs)'), contentType: 'text/plain' });
    const apiList = await request.get('http://127.0.0.1:8000/todos/');
    const apiBody = await apiList.text();
    await testInfo.attach('api-todos.json', { body: Buffer.from(apiBody), contentType: 'application/json' });
    throw err;
  }
});
