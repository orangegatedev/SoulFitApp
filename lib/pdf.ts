import jsPDF from "jspdf";
import { formatDate } from "@/lib/utils";
import type { ReportResponse } from "@/types/reports";

export function generateReportPdf(report: ReportResponse) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 18;

  doc.setFillColor(5, 5, 6);
  doc.rect(0, 0, pageWidth, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(report.title, margin, y);
  doc.setFontSize(9);
  doc.setTextColor(235, 150, 175);
  doc.text(`Generado: ${formatDate(report.generatedAt)}`, margin, y + 8);

  y = 44;
  doc.setTextColor(40, 40, 45);
  doc.setFontSize(11);
  doc.text("Filtros aplicados", margin, y);
  y += 7;
  doc.setFontSize(9);
  const filters = Object.entries(report.filters).filter(([, value]) => Boolean(value));
  doc.text(filters.length ? filters.map(([key, value]) => `${key}: ${value}`).join(" | ") : "Sin filtros", margin, y);

  y += 14;
  doc.setFontSize(11);
  doc.text("Resumen estadistico", margin, y);
  y += 8;
  report.summary.forEach((item) => {
    doc.setFontSize(9);
    doc.text(`${item.label}: ${item.value}`, margin, y);
    y += 6;
  });

  y += 6;
  doc.setFontSize(11);
  doc.text("Tabla de datos", margin, y);
  y += 8;

  const columnWidth = (pageWidth - margin * 2) / report.columns.length;
  doc.setFillColor(255, 23, 68);
  doc.rect(margin, y - 5, pageWidth - margin * 2, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  report.columns.forEach((column, index) => {
    doc.text(column, margin + index * columnWidth + 2, y);
  });
  y += 8;

  doc.setTextColor(35, 35, 40);
  report.rows.forEach((row, rowIndex) => {
    if (y > 276) {
      doc.addPage();
      y = 18;
    }

    if (rowIndex % 2 === 0) {
      doc.setFillColor(247, 247, 249);
      doc.rect(margin, y - 5, pageWidth - margin * 2, 8, "F");
    }

    report.columns.forEach((column, index) => {
      const rawValue = row[column] ?? "";
      const value = String(rawValue);
      doc.text(value.slice(0, 28), margin + index * columnWidth + 2, y);
    });
    y += 8;
  });

  doc.save(`${report.type}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
