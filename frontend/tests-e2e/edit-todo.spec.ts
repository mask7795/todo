import { test, expect } from '@playwright/test';

test('edit todo updates title and persists', async ({ page, request, testInfo }) => {
  const apiKey = process.env.TODO_API_KEY ?? 'secret';
  const oldTitle = `e2e-edit-old-${Date.now()}`;
  const newTitle = `e2e-edit-new-${Date.now()}`;

  // Seed a todo via API so the UI has something to edit
  const seed = await request.post('/api/todos/', {
    headers: { 'X-API-Key': apiKey },
    data: { title: oldTitle },
  });
  expect(seed.ok()).toBeTruthy();
  const seeded = await seed.json();
  const id = seeded.id;

  // Navigate to todos page
  await page.goto('/todos');

  // Wait for app and list
  await page.waitForSelector('app-root', { state: 'attached', timeout: 30000 });
  await page.waitForSelector('[data-testid="todos-list"]', { state: 'attached', timeout: 30000 });

  // Find the seeded item via API to know which page it's on (avoid pagination flakes)
  const listRes = await request.get('/api/todos/?limit=50');
  const listBody = await listRes.json();
  const items = listBody.items || [];
  const idx = items.findIndex((it: any) => it.id === id);
  expect(idx).toBeGreaterThanOrEqual(0);
  const pageSize = 10;
  const targetPage = Math.floor(idx / pageSize);

  // Navigate pages if necessary
  for (let i = 0; i < targetPage; i++) {
    const nextBtn = page.getByRole('button', { name: 'Next' });
    try {
      if (await nextBtn.isEnabled()) {
        await nextBtn.click();
        await page.waitForTimeout(300);
        continue;
      }
    } catch (e) {
      break;
    }
    break;
  }

  // Scoped locator for the item
  const item = page.locator(`#todo-${id}`);
  await expect(item).toBeAttached();

  // Click Edit
  await item.locator('button:has-text("Edit")').click();

  // Fill new title and Save
  const input = item.locator('.edit-input');
  await input.waitFor({ state: 'visible', timeout: 5000 });
  await input.fill(newTitle);
  await item.locator('button:has-text("Save")').click();

  // Expect snackbar
  await expect(page.locator('text=Todo updated!')).toBeVisible({ timeout: 5000 });

  // Verify via API the title changed
  const getRes = await request.get(`/api/todos/${id}`);
  const getBody = await getRes.json();
  expect(getBody.title).toBe(newTitle);
});
