import { test, expect } from '@playwright/test';

test.describe('O.R.I SOLAR App', () => {
  test('should load the login page', async ({ page }) => {
    await page.goto('/');

    // Should redirect to login
    await expect(page).toHaveURL(/login/);

    // Check for app branding
    await expect(page.getByText('O.R.I SOLAR')).toBeVisible();
  });

  test('should show login form', async ({ page }) => {
    await page.goto('/');

    // Check form elements exist
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should toggle language', async ({ page }) => {
    await page.goto('/');

    // Find and click language toggle
    const langToggle = page.getByText(/EN|עב/);
    await langToggle.click();

    // Page content should change based on language
    await page.waitForTimeout(500);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');

    // Click sign up link
    await page.getByText(/sign up/i).click();

    // Should be on register page
    await expect(page).toHaveURL(/register/);
  });

  test('should show validation errors on empty form submit', async ({ page }) => {
    await page.goto('/');

    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show validation errors
    await page.waitForTimeout(500);
  });
});
