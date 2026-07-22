import jsPDF from "jspdf";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import type {
  ProductSalesDetailRow,
  ProductSalesFilterOption,
  ProductSalesFilters,
  ProductSalesSummary
} from "@/types/product-sales-analytics";

type CellValue = string | number;

interface ProductSalesReportPayload {
  filters: ProductSalesFilters;
  options?: {
    cashiers?: ProductSalesFilterOption[];
    categories?: ProductSalesFilterOption[];
    products?: ProductSalesFilterOption[];
    branches?: ProductSalesFilterOption[];
  };
  summary?: ProductSalesSummary;
  details: ProductSalesDetailRow[];
  generatedAt: Date;
}

interface ZipEntry {
  path: string;
  content: string;
}

const detailColumns = [
  "Fecha",
  "Cajero",
  "Sucursal",
  "Categoria",
  "Producto",
  "Unidad",
  "Cantidad",
  "Precio antes descuento",
  "Precio unitario final",
  "Descuento",
  "Subtotal",
  "Metodo pago"
] as const;

function findLabel(options: ProductSalesFilterOption[] | undefined, value?: string) {
  if (!value) return "Todas";
  return options?.find((option) => option.value === value)?.label ?? value;
}

function appliedFilters(payload: ProductSalesReportPayload) {
  return [
    ["Desde", payload.filters.from || "Inicio del mes"],
    ["Hasta", payload.filters.to || "Fin del mes"],
    ["Cajero", findLabel(payload.options?.cashiers, payload.filters.cashierId)],
    ["Categoria", findLabel(payload.options?.categories, payload.filters.categoryId)],
    ["Producto", findLabel(payload.options?.products, payload.filters.productId)],
    ["Sucursal", findLabel(payload.options?.branches, payload.filters.branchId)]
  ];
}

function summaryRows(payload: ProductSalesReportPayload): CellValue[][] {
  const summary = payload.summary;
  const rows: CellValue[][] = [
    ["Reporte", "Ventas de productos"],
    ["Generado", payload.generatedAt.toLocaleString("es-NI")],
    ["Registros detalle", payload.details.length],
    [],
    ["Filtros aplicados", ""],
    ...appliedFilters(payload),
    [],
    ["KPIs", ""]
  ];

  if (!summary) {
    rows.push(["Resumen", "No disponible"]);
    return rows;
  }

  rows.push(
    ["Total vendido", summary.totalRevenue],
    ["Productos vendidos", summary.totalQuantity],
    ["Ventas con productos", summary.salesCount],
    ["Ticket promedio", summary.averageTicket],
    ["Producto mas vendido", summary.topProductByQuantity?.name ?? "Sin datos"],
    ["Producto con mayor ingreso", summary.topProductByRevenue?.name ?? "Sin datos"],
    ["Total descuentos", summary.totalDiscount],
    [],
    ["Totales del detalle exportado", ""],
    ["Cantidad", payload.details.reduce((total, row) => total + row.quantity, 0)],
    ["Subtotal", payload.details.reduce((total, row) => total + row.subtotal, 0)],
    ["Descuento", payload.details.reduce((total, row) => total + row.discount, 0)]
  );

  return rows;
}

function detailRows(details: ProductSalesDetailRow[]): CellValue[][] {
  return [
    [...detailColumns],
    ...details.map((row) => [
      formatDate(row.date),
      row.cashierName,
      row.branchName,
      row.categoryName,
      row.productName,
      row.unitName,
      row.quantity,
      row.priceBeforeDiscount,
      row.finalUnitPrice,
      row.discount,
      row.subtotal,
      row.paymentMethod
    ])
  ];
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function columnName(index: number) {
  let name = "";
  let current = index + 1;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }

  return name;
}

function worksheetXml(rows: CellValue[][]) {
  const body = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((cell, columnIndex) => {
          const reference = `${columnName(columnIndex)}${rowIndex + 1}`;
          if (typeof cell === "number") {
            return `<c r="${reference}"><v>${Number.isFinite(cell) ? cell : 0}</v></c>`;
          }

          return `<c r="${reference}" t="inlineStr"><is><t>${escapeXml(cell)}</t></is></c>`;
        })
        .join("");

      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="1" width="18" customWidth="1"/>
    <col min="2" max="12" width="24" customWidth="1"/>
  </cols>
  <sheetData>${body}</sheetData>
</worksheet>`;
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function pushUint16(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff);
}

function pushUint32(target: number[], value: number) {
  target.push(value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff);
}

function appendBytes(target: number[], bytes: Uint8Array | number[]) {
  for (const byte of bytes) {
    target.push(byte);
  }
}

function createZip(entries: ZipEntry[]) {
  const encoder = new TextEncoder();
  const output: number[] = [];
  const centralDirectory: number[] = [];

  entries.forEach((entry) => {
    const nameBytes = encoder.encode(entry.path);
    const contentBytes = encoder.encode(entry.content);
    const localOffset = output.length;
    const checksum = crc32(contentBytes);

    pushUint32(output, 0x04034b50);
    pushUint16(output, 20);
    pushUint16(output, 0);
    pushUint16(output, 0);
    pushUint16(output, 0);
    pushUint16(output, 0);
    pushUint32(output, checksum);
    pushUint32(output, contentBytes.length);
    pushUint32(output, contentBytes.length);
    pushUint16(output, nameBytes.length);
    pushUint16(output, 0);
    appendBytes(output, nameBytes);
    appendBytes(output, contentBytes);

    pushUint32(centralDirectory, 0x02014b50);
    pushUint16(centralDirectory, 20);
    pushUint16(centralDirectory, 20);
    pushUint16(centralDirectory, 0);
    pushUint16(centralDirectory, 0);
    pushUint16(centralDirectory, 0);
    pushUint16(centralDirectory, 0);
    pushUint32(centralDirectory, checksum);
    pushUint32(centralDirectory, contentBytes.length);
    pushUint32(centralDirectory, contentBytes.length);
    pushUint16(centralDirectory, nameBytes.length);
    pushUint16(centralDirectory, 0);
    pushUint16(centralDirectory, 0);
    pushUint16(centralDirectory, 0);
    pushUint16(centralDirectory, 0);
    pushUint32(centralDirectory, 0);
    pushUint32(centralDirectory, localOffset);
    appendBytes(centralDirectory, nameBytes);
  });

  const centralDirectoryOffset = output.length;
  appendBytes(output, centralDirectory);

  pushUint32(output, 0x06054b50);
  pushUint16(output, 0);
  pushUint16(output, 0);
  pushUint16(output, entries.length);
  pushUint16(output, entries.length);
  pushUint32(output, centralDirectory.length);
  pushUint32(output, centralDirectoryOffset);
  pushUint16(output, 0);

  return new Uint8Array(output);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function filename(extension: "xlsx" | "pdf") {
  return `ventas-productos-${new Date().toISOString().slice(0, 10)}.${extension}`;
}

export function exportProductSalesExcel(payload: ProductSalesReportPayload) {
  const entries: ZipEntry[] = [
    {
      path: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`
    },
    {
      path: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
    },
    {
      path: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Resumen" sheetId="1" r:id="rId1"/>
    <sheet name="Detalle" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>`
    },
    {
      path: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
</Relationships>`
    },
    { path: "xl/worksheets/sheet1.xml", content: worksheetXml(summaryRows(payload)) },
    { path: "xl/worksheets/sheet2.xml", content: worksheetXml(detailRows(payload.details)) }
  ];

  downloadBlob(
    new Blob([createZip(entries)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }),
    filename("xlsx")
  );
}

export function exportProductSalesPdf(payload: ProductSalesReportPayload) {
  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  let y = 14;

  const addHeader = () => {
    doc.setFillColor(9, 9, 11);
    doc.rect(0, 0, pageWidth, 24, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("SoulFit", margin, 12);
    doc.setFontSize(10);
    doc.setTextColor(34, 211, 238);
    doc.text("Reporte de ventas de productos", margin, 18);
    doc.setTextColor(230, 230, 235);
    doc.text(`Generado: ${payload.generatedAt.toLocaleString("es-NI")}`, pageWidth - margin, 14, {
      align: "right"
    });
  };

  addHeader();
  y = 34;

  doc.setTextColor(35, 35, 42);
  doc.setFontSize(10);
  doc.text("Filtros aplicados", margin, y);
  y += 6;
  doc.setFontSize(8);
  appliedFilters(payload).forEach(([label, value], index) => {
    const x = margin + (index % 3) * 90;
    const rowY = y + Math.floor(index / 3) * 6;
    doc.text(`${label}: ${value}`, x, rowY);
  });

  y += 18;
  doc.setFontSize(10);
  doc.text("Resumen", margin, y);
  y += 6;
  doc.setFontSize(8);

  const summary = payload.summary;
  const summaryData = summary
    ? [
        ["Total vendido", formatCurrency(summary.totalRevenue)],
        ["Productos vendidos", formatNumber(summary.totalQuantity)],
        ["Ventas con productos", formatNumber(summary.salesCount)],
        ["Ticket promedio", formatCurrency(summary.averageTicket)],
        ["Descuentos", formatCurrency(summary.totalDiscount)]
      ]
    : [["Resumen", "No disponible"]];

  summaryData.forEach(([label, value], index) => {
    const x = margin + index * 54;
    doc.setFillColor(247, 247, 249);
    doc.roundedRect(x, y - 4, 48, 14, 2, 2, "F");
    doc.setTextColor(80, 80, 88);
    doc.text(label, x + 3, y);
    doc.setTextColor(20, 20, 24);
    doc.setFontSize(9);
    doc.text(value, x + 3, y + 6);
    doc.setFontSize(8);
  });

  y += 26;
  const totals = payload.details.reduce(
    (accumulator, row) => ({
      quantity: accumulator.quantity + row.quantity,
      discount: accumulator.discount + row.discount,
      subtotal: accumulator.subtotal + row.subtotal
    }),
    { quantity: 0, discount: 0, subtotal: 0 }
  );

  doc.setTextColor(35, 35, 42);
  doc.setFontSize(10);
  doc.text(
    `Detalle (${formatNumber(payload.details.length)} registros) | Cantidad: ${formatNumber(
      totals.quantity
    )} | Subtotal: ${formatCurrency(totals.subtotal)} | Descuento: ${formatCurrency(
      totals.discount
    )}`,
    margin,
    y
  );
  y += 8;

  const widths = [20, 32, 28, 28, 40, 16, 17, 23, 23, 22, 22, 24];
  const drawTableHeader = () => {
    let x = margin;
    doc.setFillColor(205, 24, 39);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    detailColumns.forEach((column, index) => {
      doc.text(column.slice(0, 22), x + 1.5, y);
      x += widths[index];
    });
    y += 8;
  };

  drawTableHeader();
  payload.details.forEach((row, index) => {
    if (y > pageHeight - 14) {
      doc.addPage("landscape");
      addHeader();
      y = 34;
      drawTableHeader();
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 250);
      doc.rect(margin, y - 5, pageWidth - margin * 2, 8, "F");
    }

    const values = [
      formatDate(row.date),
      row.cashierName,
      row.branchName,
      row.categoryName,
      row.productName,
      row.unitName,
      formatNumber(row.quantity),
      formatCurrency(row.priceBeforeDiscount),
      formatCurrency(row.finalUnitPrice),
      formatCurrency(row.discount),
      formatCurrency(row.subtotal),
      row.paymentMethod
    ];
    let x = margin;
    doc.setTextColor(35, 35, 42);
    doc.setFontSize(7);
    values.forEach((value, columnIndex) => {
      doc.text(value.slice(0, columnIndex === 4 ? 28 : 18), x + 1.5, y);
      x += widths[columnIndex];
    });
    y += 8;
  });

  doc.save(filename("pdf"));
}
