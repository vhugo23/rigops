import { test, expect } from '@playwright/test';

test('dashboard to well detail to alerts happy path', async ({ page }) => {
  // Start at the Wells page (root redirects here)
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Wells' })).toBeVisible();

  // Click into a well
  await page.getByRole('link', { name: 'Well 03' }).click();
  await expect(page).toHaveURL(/\/wells\/\d+/);
  await expect(page.getByRole('heading', { name: 'Well 03' })).toBeVisible({ timeout: 10000 });

  // Telemetry section should be present
  await expect(page.getByRole('heading', { name: 'Telemetry' })).toBeVisible();

  // Navigate to Alerts via the sidebar
  await page.getByRole('link', { name: 'Alerts' }).click();
  await expect(page).toHaveURL(/\/alerts/);
  await expect(page.getByRole('heading', { name: 'Alerts' })).toBeVisible();

  // System Health should also be reachable
  await page.getByRole('link', { name: 'System Health' }).click();
  await expect(page).toHaveURL(/\/system-health/);
  await expect(page.getByRole('heading', { name: 'System Health' })).toBeVisible();
});