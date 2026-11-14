import { expect, type Page, type APIRequestContext } from '@playwright/test';
import { API_URL } from '../playwright.config';

export const PASSWORD = '123456';
export const USERS = {
  admin: 'admin@visionkit.com',
  superAdmin: 'gerente@visionkit.com',
  optician: 'optico1@visionkit.com',
  optician2: 'optico2@visionkit.com',
} as const;

/** Login por la UI (el flujo real que usa la óptica). */
export async function loginUI(page: Page, email: string, password = PASSWORD) {
  await page.goto('/login');
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', password);
  await page.click('button[type=submit]');
  await expect(page).not.toHaveURL(/\/login/);
}

/** Login directo contra la API: para preparar datos o verificar lo guardado. */
export async function apiToken(request: APIRequestContext, email: string, password = PASSWORD) {
  const res = await request.post(`${API_URL}/auth/login`, { data: { email, password } });
  return { status: res.status(), token: res.ok() ? ((await res.json()).access_token as string) : null };
}

export async function apiGet<T>(request: APIRequestContext, token: string, path: string): Promise<T> {
  const res = await request.get(`${API_URL}${path}`, { headers: { authorization: `Bearer ${token}` } });
  expect(res.ok(), `GET ${path} → ${res.status()}`).toBeTruthy();
  return res.json();
}

/** Falla la prueba si el frontend recibe un 4xx/5xx inesperado del backend (como el 400 del IVA). */
export function trackApiErrors(page: Page, allowed: (url: string, status: number) => boolean = () => false) {
  const errors: string[] = [];
  page.on('response', (r) => {
    if (r.url().startsWith(API_URL) && r.status() >= 400 && !allowed(r.url(), r.status())) {
      errors.push(`${r.status()} ${r.request().method()} ${r.url().replace(API_URL, '')}`);
    }
  });
  return errors;
}
