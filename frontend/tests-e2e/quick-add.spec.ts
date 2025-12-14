import { test, expect } from '@playwright/test';

test('quick add creates todo and shows snackbar', async ({ page }) => {
  await page.goto('/todos');
  const title = `e2e-quick-add-${Date.now()}`;

  // Fill the quick-add input by placeholder and submit
  const input = page.getByPlaceholder('Quick add todo...');
  await input.fill(title);
  await page.getByRole('button', { name: 'Add' }).click();

  // Expect snackbar to appear
  await expect(page.locator('text=Todo added!')).toBeVisible({ timeout: 5000 });

  // The todo should appear in the list
  // The UI list may be paginated; verify persistence via the API to avoid paging flakes.
  const res = await page.request.get('/api/todos/?limit=50');
  const body = await res.json();
  const found = (body.items || []).some((it: any) => it.title === title);
  expect(found).toBeTruthy();

  // UI-level check: try to locate the created item in the visible list, paging forward if needed.
  let uiFound = false;
  for (let i = 0; i < 6; i++) {
    try {
      const loc = page.getByText(title).first();
      if (await loc.isVisible()) { uiFound = true; break; }
    } catch (e) {
      // ignore not-found and try paging
    }
    const nextBtn = page.getByRole('button', { name: 'Next' });
    try {
      if (await nextBtn.isEnabled()) {
        await nextBtn.click();
        await page.waitForTimeout(300);
        continue;
      }
    } catch (e) {
      // no next button or not enabled
    }
    break;
  }
  expect(uiFound).toBeTruthy();
});
