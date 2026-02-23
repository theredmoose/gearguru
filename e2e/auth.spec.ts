import { test, expect } from '@playwright/test';

test.describe('Auth page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ── Branding ──────────────────────────────────────────────────────────────

  test('displays Gear Guru branding', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Gear Guru' })).toBeVisible();
    await expect(page.getByText('Sports Equipment Sizing')).toBeVisible();
  });

  // ── Sign-in form ──────────────────────────────────────────────────────────

  test('shows sign-in form by default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('shows social sign-in buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Continue with Google/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue with Facebook/ })).toBeVisible();
  });

  test('shows forgot password link', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Forgot password?' })).toBeVisible();
  });

  test('shows sign-up link', async ({ page }) => {
    await expect(page.getByText('No account?')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });

  // ── Sign-up mode ──────────────────────────────────────────────────────────

  test('switches to sign-up form when Sign Up clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  });

  test('switches back to sign-in from sign-up', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  // ── Password reset mode ───────────────────────────────────────────────────

  test('switches to password reset form when Forgot password clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Forgot password?' }).click();
    await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Reset Email' })).toBeVisible();
  });

  test('returns to sign-in from password reset form', async ({ page }) => {
    await page.getByRole('button', { name: 'Forgot password?' }).click();
    await page.getByRole('button', { name: /Back to Sign In/ }).click();
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  // ── Form validation ───────────────────────────────────────────────────────

  test('email field requires a valid email format', async ({ page }) => {
    await page.getByLabel('Email').fill('notanemail');
    await page.getByRole('button', { name: 'Sign In' }).click();
    // Browser native validation prevents submission — field should still be visible
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('password field has minLength of 6 on sign-up', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();
    const pwInput = page.getByLabel('Password');
    await expect(pwInput).toHaveAttribute('minlength', '6');
  });

  test('sign-up Name field is required', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByLabel('Name')).toHaveAttribute('required', '');
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  test('page title is Gear Guru', async ({ page }) => {
    await expect(page).toHaveTitle(/Gear Guru/);
  });

  test('email input has type email', async ({ page }) => {
    await expect(page.getByLabel('Email')).toHaveAttribute('type', 'email');
  });

  test('password input has type password', async ({ page }) => {
    await expect(page.getByLabel('Password')).toHaveAttribute('type', 'password');
  });
});
