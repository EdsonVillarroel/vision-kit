/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ExcelJS from 'exceljs';
import * as path from 'path';

// Genera la plantilla Excel de migración manual de datos por tenant.
// Hojas: Instrucciones, Clientes, Productos, Ventas, Detalle_Ventas.
// Vínculos por claves legibles (documento del cliente, SKU del producto,
// y una "Referencia de venta" que el usuario asigna) — NO UUIDs.
//
// Uso:  npm run template:migration --workspace=apps/backend
// Salida: docs/migracion/plantilla-migracion-vision-kit.xlsx (relativo a la raíz)

const OUT = path.resolve(
  __dirname,
  '../../../docs/migracion/plantilla-migracion-vision-kit.xlsx',
);

// ── Estilos reutilizables ────────────────────────────────────────────────────
const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF4F46E5' }, // indigo (marca)
};
const REQUIRED_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF312E81' }, // indigo oscuro para columnas obligatorias
};
const EXAMPLE_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFEF3C7' }, // ámbar suave para la fila de ejemplo
};

type Col = {
  header: string;
  key: string;
  width: number;
  required?: boolean;
  help: string;
  example: string | number | boolean;
  /** Validación de lista (dropdown) — valores permitidos */
  list?: string[];
};

function buildSheet(wb: ExcelJS.Workbook, name: string, cols: Col[]) {
  const ws = wb.addWorksheet(name, {
    views: [{ state: 'frozen', ySplit: 2 }], // congela header + fila de ayuda
  });

  ws.columns = cols.map((c) => ({ key: c.key, width: c.width }));

  // Fila 1: encabezados
  const headerRow = ws.getRow(1);
  cols.forEach((c, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = c.required ? `${c.header} *` : c.header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = c.required ? REQUIRED_FILL : HEADER_FILL;
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } } };
  });
  headerRow.height = 24;

  // Fila 2: ayuda por columna
  const helpRow = ws.getRow(2);
  cols.forEach((c, i) => {
    const cell = helpRow.getCell(i + 1);
    cell.value = c.help;
    cell.font = { italic: true, size: 9, color: { argb: 'FF6B7280' } };
    cell.alignment = { vertical: 'top', wrapText: true };
  });
  helpRow.height = 40;

  // Fila 3: ejemplo (marcada, el usuario la borra)
  const exampleRow = ws.getRow(3);
  cols.forEach((c, i) => {
    const cell = exampleRow.getCell(i + 1);
    cell.value = c.example as any;
    cell.fill = EXAMPLE_FILL;
    cell.font = { color: { argb: 'FF92400E' } };
  });

  // Validaciones de lista (dropdowns) desde la fila 3 hacia abajo
  cols.forEach((c, i) => {
    if (!c.list) return;
    const colLetter = ws.getColumn(i + 1).letter;
    for (let r = 3; r <= 1000; r++) {
      ws.getCell(`${colLetter}${r}`).dataValidation = {
        type: 'list',
        allowBlank: !c.required,
        formulae: [`"${c.list.join(',')}"`],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Valor inválido',
        error: `Usa uno de: ${c.list.join(', ')}`,
      };
    }
  });

  return ws;
}

async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Vision Kit';
  wb.created = new Date(0); // determinista (no Date.now en scripts)

  // ── Hoja 0: Instrucciones ──────────────────────────────────────────────────
  const info = wb.addWorksheet('Instrucciones');
  info.getColumn(1).width = 110;
  const lines: Array<[string, boolean]> = [
    ['📋  PLANTILLA DE MIGRACIÓN — Vision Kit', true],
    ['', false],
    ['Cómo usar esta plantilla:', true],
    ['1. Llena una fila por registro en cada hoja. NO cambies los nombres de las columnas (fila 1).', false],
    ['2. Las columnas con * (fondo azul oscuro) son OBLIGATORIAS.', false],
    ['3. La fila de ejemplo (fondo ámbar) es una guía — BÓRRALA antes de importar.', false],
    ['4. La fila 2 (cursiva gris) explica cada campo — no la borres, se ignora al importar.', false],
    ['', false],
    ['Orden recomendado de carga:', true],
    ['   a) Productos  →  b) Clientes  →  c) Ventas + Detalle_Ventas', false],
    ['   (Las ventas necesitan que existan primero sus clientes y productos.)', false],
    ['', false],
    ['Cómo se vinculan las hojas:', true],
    ['• Ventas → Clientes: por el "Documento del cliente" (debe existir en la hoja Clientes o ya en el sistema).', false],
    ['• Detalle_Ventas → Ventas: por la "Referencia de venta" (un código que TÚ asignas, ej: V001, V002).', false],
    ['• Detalle_Ventas → Productos: por el "SKU" del producto (debe existir en la hoja Productos o en tu inventario).', false],
    ['', false],
    ['Formatos importantes:', true],
    ['• Fechas: formato AAAA-MM-DD (ej: 2026-03-28).', false],
    ['• Listas (alergias, condiciones): separa varios valores con punto y coma ; (ej: Polvo;Penicilina).', false],
    ['• Género: male, female u other.  Método de pago: cash, card, transfer, check, mixed.', false],
    ['• IVA: factor decimal (0.13 = 13%).  Descuentos: porcentaje (10 = 10%).', false],
    ['', false],
    ['Una venta puede tener varias líneas: repite la misma "Referencia de venta" en varias filas de Detalle_Ventas.', false],
  ];
  lines.forEach(([text, bold], i) => {
    const cell = info.getCell(i + 1, 1);
    cell.value = text;
    cell.font = { bold, size: bold ? 12 : 10 };
    cell.alignment = { wrapText: true };
  });

  // ── Hoja: Clientes ─────────────────────────────────────────────────────────
  buildSheet(wb, 'Clientes', [
    { header: 'Documento', key: 'identificationId', width: 18, required: true, help: 'ID/cédula/CI del cliente. Único — sirve para vincular ventas.', example: 'CI-1234567' },
    { header: 'Nombres', key: 'firstName', width: 18, required: true, help: 'Nombre(s) del cliente.', example: 'Ana' },
    { header: 'Apellidos', key: 'lastName', width: 18, required: true, help: 'Apellido(s) del cliente.', example: 'López' },
    { header: 'Fecha nacimiento', key: 'dateOfBirth', width: 16, required: true, help: 'AAAA-MM-DD', example: '1990-05-15' },
    { header: 'Género', key: 'gender', width: 12, required: true, help: 'male / female / other', example: 'female', list: ['male', 'female', 'other'] },
    { header: 'Teléfono', key: 'phone', width: 16, required: true, help: 'Incluye código de país si aplica.', example: '+591 70012345' },
    { header: 'Email', key: 'email', width: 22, help: 'Opcional. Debe ser un email válido.', example: 'ana@email.com' },
    { header: 'Dirección', key: 'address', width: 24, help: 'Opcional.', example: 'Av. Siempre Viva 123' },
    { header: 'Ciudad', key: 'city', width: 16, help: 'Opcional.', example: 'Santa Cruz' },
    { header: 'Departamento', key: 'state', width: 16, help: 'Opcional.', example: 'Santa Cruz' },
    { header: 'Código postal', key: 'zipCode', width: 12, help: 'Opcional.', example: '0000' },
    { header: 'Alergias', key: 'allergies', width: 20, help: 'Opcional. Varias separadas por ; ', example: 'Polvo;Polen' },
    { header: 'Condiciones médicas', key: 'medicalConditions', width: 22, help: 'Opcional. Varias separadas por ; ', example: 'Diabetes' },
    { header: 'Notas', key: 'notes', width: 26, help: 'Opcional. Observaciones del cliente.', example: 'Cliente frecuente desde 2020' },
    { header: 'Contacto emergencia — Nombre', key: 'ec_name', width: 24, help: 'Recomendado.', example: 'Juan López' },
    { header: 'Contacto emergencia — Parentesco', key: 'ec_relationship', width: 22, help: 'Recomendado. Ej: Padre, Cónyuge.', example: 'Padre' },
    { header: 'Contacto emergencia — Teléfono', key: 'ec_phone', width: 20, help: 'Recomendado.', example: '+591 70098765' },
    { header: 'Seguro — Aseguradora', key: 'ins_provider', width: 20, help: 'Opcional.', example: '' },
    { header: 'Seguro — N° Póliza', key: 'ins_policyNumber', width: 18, help: 'Opcional.', example: '' },
    { header: 'Seguro — N° Grupo', key: 'ins_groupNumber', width: 16, help: 'Opcional.', example: '' },
  ]);

  // ── Hoja: Productos ────────────────────────────────────────────────────────
  buildSheet(wb, 'Productos', [
    { header: 'SKU', key: 'sku', width: 18, required: true, help: 'Código único del producto. Sirve para vincular el detalle de ventas.', example: 'LEN-001' },
    { header: 'Nombre', key: 'name', width: 28, required: true, help: 'Nombre del producto.', example: 'Lente monofocal antirreflejo' },
    { header: 'Categoría', key: 'category', width: 18, help: 'Opcional. Ej: Lentes, Armazones, Accesorios.', example: 'Lentes' },
    { header: 'Precio', key: 'price', width: 12, required: true, help: 'Precio de venta unitario (número).', example: 350 },
    { header: 'Stock inicial', key: 'stock', width: 12, help: 'Opcional. Cantidad actual en inventario.', example: 20 },
    { header: 'Costo', key: 'cost', width: 12, help: 'Opcional. Costo de compra unitario.', example: 180 },
  ]);

  // ── Hoja: Ventas (cabecera) ────────────────────────────────────────────────
  buildSheet(wb, 'Ventas', [
    { header: 'Referencia de venta', key: 'saleReference', width: 20, required: true, help: 'Código que TÚ asignas (ej: V001). Vincula con Detalle_Ventas.', example: 'V001' },
    { header: 'Documento del cliente', key: 'clientId', width: 22, required: true, help: 'El "Documento" de un cliente (hoja Clientes o ya existente).', example: 'CI-1234567' },
    { header: 'Fecha', key: 'date', width: 14, required: true, help: 'AAAA-MM-DD', example: '2026-03-28' },
    { header: 'Método de pago', key: 'paymentMethod', width: 16, required: true, help: 'cash / card / transfer / check / mixed', example: 'card', list: ['cash', 'card', 'transfer', 'check', 'mixed'] },
    { header: 'IVA (factor)', key: 'tax', width: 12, required: true, help: 'Decimal. 0.13 = 13%. Usa 0 si no aplica.', example: 0.13 },
    { header: 'Descuento global %', key: 'discount', width: 16, help: 'Opcional. Porcentaje sobre el total (ej: 10).', example: 0 },
    { header: 'Notas', key: 'notes', width: 26, help: 'Opcional.', example: 'Entrega en 3 días' },
    { header: 'Requiere receta', key: 'prescriptionRequired', width: 16, help: 'Opcional. true / false', example: false, list: ['true', 'false'] },
    { header: 'Garantía — Vence', key: 'warrantyExpiryDate', width: 16, help: 'Opcional. AAAA-MM-DD', example: '' },
    { header: 'Garantía — Términos', key: 'warrantyTerms', width: 24, help: 'Opcional.', example: '' },
  ]);

  // ── Hoja: Detalle_Ventas (líneas) ──────────────────────────────────────────
  buildSheet(wb, 'Detalle_Ventas', [
    { header: 'Referencia de venta', key: 'saleReference', width: 20, required: true, help: 'Debe coincidir con una fila de la hoja Ventas. Repite para varias líneas.', example: 'V001' },
    { header: 'SKU del producto', key: 'productSku', width: 18, required: true, help: 'El "SKU" de un producto (hoja Productos o ya existente).', example: 'LEN-001' },
    { header: 'Cantidad', key: 'quantity', width: 12, required: true, help: 'Entero ≥ 1.', example: 2 },
    { header: 'Precio unitario', key: 'unitPrice', width: 14, required: true, help: 'Precio por unidad al momento de la venta.', example: 350 },
    { header: 'Descuento %', key: 'discount', width: 14, help: 'Opcional. Porcentaje sobre la línea (ej: 5).', example: 0 },
  ]);

  await wb.xlsx.writeFile(OUT);
  console.log(`✅ Plantilla generada: ${OUT}`);
}

main().catch((e) => {
  console.error('❌ Error al generar la plantilla:', e);
  process.exit(1);
});
