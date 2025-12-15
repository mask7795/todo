import { test, expect } from '@playwright/test';

test.setTimeout(120000);

test('edit todo updates title and persists', async ({ page, request }) => {
  const apiKey = process.env.TODO_API_KEY ?? 'secret';
  const oldTitle = `e2e-edit-old-${Date.now()}`;
  const newTitle = `e2e-edit-new-${Date.now()}`;

  // Create a todo via the UI quick-add so it appears on the current page
  await page.goto('/todos');
  await page.fill('input[placeholder="Quick add todo..."]', oldTitle);
  await page.click('button:has-text("Add")');
  // Wait for the item with the title to appear in the list
  await page.waitForSelector(`[data-testid="todo-item"] :text("${oldTitle}")`, { timeout: 10000 });
  // Find the created todo's id via the API list (to assert persistence later)
  const listAfterAdd = await request.get('/api/todos/?limit=50');
  const listBodyAfter = await listAfterAdd.json();
  const created = (listBodyAfter.items || []).find((it: any) => it.title === oldTitle);
  expect(created).toBeTruthy();
  const id = created.id;

  // Wait for app and list
  await page.waitForSelector('app-root', { state: 'attached', timeout: 30000 });
  await page.waitForSelector('[data-testid="todos-list"]', { state: 'attached', timeout: 30000 });



  // Iterate pages until the created todo appears (robust to ordering)
  const nextBtn = page.locator('.pager button').nth(1);
  let item = page.locator('[data-testid="todo-item"]').filter({ hasText: oldTitle }).first();
  let attempts = 0;
  while ((await item.count()) === 0 && attempts < 20) {
    if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(400);
      item = page.locator('[data-testid="todo-item"]').filter({ hasText: oldTitle }).first();
      attempts++;
      continue;
    }
    break;
  }
  await expect(item).toBeVisible({ timeout: 10000 });

  // Extract the DOM id (e.g. "todo-34") so we can scope actions
  const domId = await item.getAttribute('id');
  // Click Edit
  await item.scrollIntoViewIfNeeded();
  await item.locator('button:has-text("Edit")').click({ force: true });

  // Fill new title and Save
  const input = item.locator('.edit-input');
  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.fill(newTitle);
  await item.locator('button:has-text("Save")').click();

  // Expect snackbar
  await expect(page.locator('text=Todo updated!')).toBeVisible({ timeout: 5000 });

  // Verify via API the title changed
  const getRes = await request.get(`/api/todos/${id}`);
  const getBody = await getRes.json();
  expect(getBody.title).toBe(newTitle);
});
