import type {
  Content,
  TDocumentDefinitions,
  TableCell,
} from 'pdfmake/interfaces';
import type { CommissionReportRow } from '../types';

interface ExportPdfOptions {
  rows: CommissionReportRow[];
  from: string;
  to: string;
  clinicName: string;
  clinicLogo?: string;
}

const bobFormatter = new Intl.NumberFormat('es-BO', {
  style: 'currency',
  currency: 'BOB',
});

const formatCurrency = (value: number) => bobFormatter.format(value);
const formatRate = (rate: number) => `${rate.toFixed(2)}%`;

const formatDate = (ymd: string): string => {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-');
  if (!y || !m || !d) return ymd;
  return `${d}/${m}/${y}`;
};

const formatTimestamp = (): string => {
  const now = new Date();
  return now.toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// pdfmake (~2 MB) y vfs_fonts (~1.5 MB) son pesados — cargar bajo demanda
// y cachear la promesa para que futuros exports no re-descarguen el chunk.
type PdfMakeModule = {
  createPdf: (doc: TDocumentDefinitions) => { download: (filename: string) => void };
  vfs?: unknown;
};

let pdfMakeLoader: Promise<PdfMakeModule> | null = null;

async function loadPdfMake(): Promise<PdfMakeModule> {
  if (!pdfMakeLoader) {
    pdfMakeLoader = (async () => {
      const [pdfMakeModule, vfsModule] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
      ]);
      // pdfmake expone el namespace como default o como el módulo mismo según el bundler.
      const raw: unknown =
        (pdfMakeModule as { default?: unknown }).default ?? pdfMakeModule;
      const pdfMake = raw as PdfMakeModule;

      // El export de vfs_fonts varía según versión de la librería.
      const vfsSource = vfsModule as unknown as Record<string, unknown>;
      const vfs =
        (vfsSource?.pdfMake as { vfs?: unknown } | undefined)?.vfs ??
        ((vfsSource?.default as { pdfMake?: { vfs?: unknown } } | undefined)?.pdfMake?.vfs) ??
        vfsSource?.vfs ??
        vfsSource?.default ??
        vfsSource;

      if (vfs) {
        pdfMake.vfs = vfs;
      }
      return pdfMake;
    })();
  }
  return pdfMakeLoader;
}

export async function exportCommissionsPdf({
  rows,
  from,
  to,
  clinicName,
  clinicLogo,
}: ExportPdfOptions): Promise<void> {
  const pdfMake = await loadPdfMake();

  const totals = rows.reduce(
    (acc, r) => ({
      salesCount: acc.salesCount + r.salesCount,
      grossBase: acc.grossBase + r.grossBase,
      commissionAmount: acc.commissionAmount + r.commissionAmount,
    }),
    { salesCount: 0, grossBase: 0, commissionAmount: 0 },
  );

  const tableHeaderRow: TableCell[] = [
    { text: 'Vendedor', style: 'tableHeader' },
    { text: '# Ventas', style: 'tableHeader', alignment: 'right' },
    { text: 'Base (Bs)', style: 'tableHeader', alignment: 'right' },
    { text: '%', style: 'tableHeader', alignment: 'right' },
    { text: 'Comisión (Bs)', style: 'tableHeader', alignment: 'right' },
  ];

  const bodyRows: TableCell[][] = rows.map((r) => [
    { text: r.name },
    { text: String(r.salesCount), alignment: 'right' },
    { text: formatCurrency(r.grossBase), alignment: 'right' },
    { text: formatRate(r.commissionRate), alignment: 'right' },
    {
      text: formatCurrency(r.commissionAmount),
      alignment: 'right',
      bold: true,
    },
  ]);

  const footerRow: TableCell[] = [
    { text: 'Totales', style: 'tableFooter' },
    {
      text: String(totals.salesCount),
      alignment: 'right',
      style: 'tableFooter',
    },
    {
      text: formatCurrency(totals.grossBase),
      alignment: 'right',
      style: 'tableFooter',
    },
    { text: '—', alignment: 'right', style: 'tableFooter' },
    {
      text: formatCurrency(totals.commissionAmount),
      alignment: 'right',
      style: 'tableFooter',
    },
  ];

  const emptyRow: TableCell[] = [
    {
      text: 'No hay ventas completadas en este rango.',
      colSpan: 5,
      alignment: 'center',
      italics: true,
      color: '#6b7280',
      margin: [0, 8, 0, 8],
    },
    {},
    {},
    {},
    {},
  ];

  const tableBody: TableCell[][] = [
    tableHeaderRow,
    ...(rows.length === 0 ? [emptyRow] : bodyRows),
    footerRow,
  ];

  // Encabezado visual: logo (solo si es data URL base64) + título
  const headerColumns: Content[] = [];
  if (clinicLogo && clinicLogo.startsWith('data:')) {
    headerColumns.push({
      image: clinicLogo,
      width: 60,
      margin: [0, 0, 12, 0],
    });
  }
  headerColumns.push({
    stack: [
      { text: clinicName, style: 'clinicName' },
      { text: 'Reporte de Comisiones', style: 'subtitle' },
    ],
  });

  const content: Content[] = [
    {
      columns: headerColumns,
      columnGap: 10,
    },
    {
      text: `Rango: ${formatDate(from)} — ${formatDate(to)}`,
      margin: [0, 10, 0, 0],
      style: 'meta',
    },
    {
      text: `Generado: ${formatTimestamp()}`,
      style: 'meta',
      margin: [0, 2, 0, 12],
    },
    {
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
        body: tableBody,
      },
      layout: {
        fillColor: (rowIndex: number) => {
          if (rowIndex === 0) return '#4f46e5';
          const footerIndex = (rows.length === 0 ? 1 : rows.length) + 1;
          if (rowIndex === footerIndex) return '#f3f4f6';
          return rowIndex % 2 === 0 ? '#fafafa' : null;
        },
        hLineColor: () => '#e5e7eb',
        vLineColor: () => '#e5e7eb',
      },
    },
    {
      text:
        'Reporte consultivo basado en ventas completadas al momento de emisión. ' +
        'Las ventas que sean reembolsadas después pueden alterar este cálculo.',
      italics: true,
      margin: [0, 16, 0, 0],
      style: 'disclaimer',
    },
  ];

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'LETTER',
    pageMargins: [40, 40, 40, 50],
    content,
    defaultStyle: { fontSize: 10, color: '#111827' },
    styles: {
      clinicName: { fontSize: 16, bold: true, color: '#111827' },
      subtitle: { fontSize: 11, color: '#4b5563', margin: [0, 2, 0, 0] },
      meta: { fontSize: 9, color: '#6b7280' },
      tableHeader: {
        bold: true,
        color: '#ffffff',
        fillColor: '#4f46e5',
        margin: [0, 4, 0, 4],
      },
      tableFooter: {
        bold: true,
        color: '#111827',
        fillColor: '#f3f4f6',
        margin: [0, 4, 0, 4],
      },
      disclaimer: { fontSize: 8.5, color: '#6b7280' },
    },
    footer: (currentPage: number, pageCount: number) => ({
      text: `Página ${currentPage} de ${pageCount}`,
      alignment: 'center',
      fontSize: 8,
      color: '#9ca3af',
      margin: [0, 20, 0, 0],
    }),
  };

  const filename = `comisiones-${from}-${to}.pdf`;
  pdfMake.createPdf(docDefinition).download(filename);
}
