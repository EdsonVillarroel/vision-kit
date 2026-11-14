import { expect, test } from '@playwright/test';
import { API_URL } from '../playwright.config';
import { apiToken, loginUI, trackApiErrors, USERS } from './helpers';

test('el admin restablece la contraseña de un óptico y este entra con la nueva', async ({ page, request }) => {
  const errors = trackApiErrors(page);
  await loginUI(page, USERS.admin);
  await page.goto('/settings/users');

  const row = page.locator('tr', { hasText: USERS.optician2 });
  // Regresión: el botón flotante "+" tapaba los clics en la columna de acciones
  await row.getByRole('button', { name: 'Restablecer contraseña' }).click();

  const input = page.getByLabel('Nueva contraseña');
  await expect(input).toHaveValue(/^.{8}$/);
  await input.fill('abc');
  await expect(page.getByRole('button', { name: 'Restablecer', exact: true })).toBeDisabled();
  await input.fill('nuevaE2E9');
  await page.getByRole('button', { name: 'Restablecer', exact: true }).click();
  await expect(page.getByText(/restablecida/)).toBeVisible();

  expect((await apiToken(request, USERS.optician2, '123456')).status).toBe(401);
  expect((await apiToken(request, USERS.optician2, 'nuevaE2E9')).token).toBeTruthy();
  expect(errors).toEqual([]);
});

test('no aparece "Restablecer contraseña" en la propia cuenta ni en la del super_admin (para un admin)', async ({ page }) => {
  await loginUI(page, USERS.admin);
  await page.goto('/settings/users');
  await expect(page.locator('tr', { hasText: USERS.admin }).getByRole('button', { name: 'Restablecer contraseña' })).toHaveCount(0);
  await expect(page.locator('tr', { hasText: USERS.superAdmin }).getByRole('button', { name: 'Restablecer contraseña' })).toHaveCount(0);
});

test('el óptico no puede restablecer contraseñas (API → 403)', async ({ request }) => {
  const { token } = await apiToken(request, USERS.optician);
  const admin = await apiToken(request, USERS.admin);
  const users = await (await request.get(`${API_URL}/users`, { headers: { authorization: `Bearer ${admin.token}` } })).json();
  const target = users.find((u: { email: string }) => u.email === USERS.admin);
  const res = await request.patch(`${API_URL}/users/${target.id}/reset-password`, {
    headers: { authorization: `Bearer ${token}` },
    data: { newPassword: 'hackeado1' },
  });
  expect(res.status()).toBe(403);
});
