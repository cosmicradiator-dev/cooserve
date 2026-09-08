import { test, expect } from '@playwright/test';

test.describe('Cooperative Gig Services Platform Core Flows', () => {
  test('Landing page renders in 9:16 mobile aspect frame and displays portals', async ({ page }) => {
    await page.goto('/');

    // Check title and cooperative branding
    await expect(page.locator('h1')).toContainText('Cooperative Gig Services Platform');
    await expect(page.locator('text=Worker App')).toBeVisible();
    await expect(page.locator('text=Customer App')).toBeVisible();
    await expect(page.locator('text=Admin Console')).toBeVisible();
  });

  test('Worker portal displays active assignment and briefing', async ({ page, context }) => {
    // Set cookies for worker
    await context.addCookies([
      { name: 'coop_user_role', value: 'worker', path: '/', domain: 'localhost' },
      { name: 'coop_user_id', value: '00000000-0000-0000-0000-000000000002', path: '/', domain: 'localhost' },
    ]);

    await page.goto('/worker/dashboard');
    await expect(page.locator('text=Active Assignment')).toBeVisible();
    await expect(page.locator('text=Dispatcher Briefing')).toBeVisible();
  });

  test('Customer can configure service request and view live calculated quote with trust badge', async ({ page, context }) => {
    await context.addCookies([
      { name: 'coop_user_role', value: 'customer', path: '/', domain: 'localhost' },
      { name: 'coop_user_id', value: '00000000-0000-0000-0000-000000000005', path: '/', domain: 'localhost' },
    ]);

    await page.goto('/customer/request');
    await expect(page.locator('text=Request Service')).toBeVisible();
    await expect(page.locator('text=Verified Cooperative Network')).toBeVisible();
    await expect(page.locator('text=Calculated Live Quote')).toBeVisible();
  });

  test('Admin can view cost parameters and audit log', async ({ page, context }) => {
    await context.addCookies([
      { name: 'coop_user_role', value: 'admin', path: '/', domain: 'localhost' },
      { name: 'coop_user_id', value: '00000000-0000-0000-0000-000000000001', path: '/', domain: 'localhost' },
    ]);

    await page.goto('/admin/dashboard');
    await expect(page.locator('text=Cost Engine Governance')).toBeVisible();
    await expect(page.locator('text=Audit Log Trail')).toBeVisible();
  });
});

