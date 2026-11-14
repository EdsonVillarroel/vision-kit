import { expect, test } from '@playwright/test';
import { apiGet, apiToken, loginUI, trackApiErrors, USERS } from './helpers';

interface Product { id: string; sku: string; stock: number; category: string }
interface Patient { id: string; firstName: string }
interface Sale { id: string; total: string; items: { productSku: string }[] }

test('venta con montura + lentes y materiales: total en pantalla = total guardado y solo baja stock de la montura', async ({ page, request }) => {
  const { token } = await apiToken(request, USERS.admin);
  const products = await apiGet<Product[]>(request, token!, '/inventory');
  const frameBefore = products.find((p) => p.sku === 'ARZ-RB-001')!;
  const lensesBefore = await apiGet<Product[]>(request, token!, '/inventory?category=lens_options');
  const [patient] = await apiGet<Patient[]>(request, token!, '/patients');

  // El inventario normal NO debe mezclar los lentes y materiales
  expect(products.some((p) => p.sku.startsWith('LEN-'))).toBe(false);

  const errors = trackApiErrors(page);
  await loginUI(page, USERS.admin);
  await page.goto(`/sales/new?patientId=${patient.id}`);

  // Montura (precio 1200) con 10% de descuento en la línea
  await page.getByPlaceholder('Buscar por nombre o SKU...').fill('ARZ-RB-001');
  await page.getByRole('button', { name: /Armazón Ray-Ban Classic/ }).click();
  await page.locator("xpath=//label[normalize-space()='Descuento (%)']/following::input[1]").first().fill('10');
  await page.locator('button', { hasText: /^Agregar$/ }).click();

  // Lentes y materiales: Progresivo (precio editado a 700) + Antirreflejo (180)
  await page.getByRole('button', { name: /Progresivo/ }).click();
  await page.getByRole('button', { name: /Antirreflejo/ }).click();
  await page.getByLabel('Precio de Progresivo').fill('700');

  // 5% de descuento global
  await page.locator("xpath=//label[contains(normalize-space(),'Descuento Global')]/following::input[1]").first().fill('5');

  // (1200 + 700 + 180) = 2080; -120 línea; -104 global = 1856; IVA 13% = 241.28 → 2097.28
  const totalRow = page.getByText('Total:', { exact: true }).last().locator('..');
  await expect(totalRow).toContainText(/2[.,]?097[.,]28/);

  const saleResponse = page.waitForResponse((r) => r.url().endsWith('/sales') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Completar Venta' }).click();
  const res = await saleResponse;
  expect(res.status(), await res.text()).toBe(201);
  const created = (await res.json()) as Sale;

  const saved = await apiGet<Sale>(request, token!, `/sales/${created.id}`);
  expect(Number(saved.total)).toBeCloseTo(2097.28, 2);
  expect(saved.items.map((i) => i.productSku).sort()).toEqual(['ARZ-RB-001', 'LEN-AR', 'LEN-PROG']);

  const frameAfter = (await apiGet<Product[]>(request, token!, '/inventory')).find((p) => p.sku === 'ARZ-RB-001')!;
  expect(frameAfter.stock).toBe(frameBefore.stock - 1);
  const lensesAfter = await apiGet<Product[]>(request, token!, '/inventory?category=lens_options');
  expect(lensesAfter.map((l) => [l.sku, l.stock]).sort()).toEqual(lensesBefore.map((l) => [l.sku, l.stock]).sort());

  expect(errors).toEqual([]);
});

test('la configuración muestra el IVA como porcentaje entero', async ({ page }) => {
  await loginUI(page, USERS.admin);
  await page.goto('/settings/clinic');
  const row = page.getByText('Porcentaje de IVA aplicado a las ventas').locator('../..');
  await expect(row).toContainText('13%');
});
