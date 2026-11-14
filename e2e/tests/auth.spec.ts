import { expect, test } from '@playwright/test';
import { API_URL } from '../playwright.config';
import { apiToken, loginUI, PASSWORD, USERS } from './helpers';

test('login correcto entra al panel', async ({ page }) => {
  await loginUI(page, USERS.admin);
  await expect(page.getByText('Admin Principal').first()).toBeVisible();
});

test('contraseña incorrecta muestra error y no entra', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type=email]', USERS.admin);
  await page.fill('input[type=password]', 'incorrecta');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator('form').getByText(/credenciales|incorrect|inválid/i)).toBeVisible();
});

test('la respuesta del login nunca incluye el hash de la contraseña', async ({ request }) => {
  const res = await request.post(`${API_URL}/auth/login`, { data: { email: USERS.admin, password: PASSWORD } });
  expect(res.ok()).toBeTruthy();
  expect(await res.text()).not.toMatch(/passwordHash|\$2[aby]\$/);
  expect((await apiToken(request, USERS.admin, 'incorrecta')).status).toBe(401);
});
