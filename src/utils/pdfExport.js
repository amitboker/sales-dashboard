import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RUBIK_REGULAR, RUBIK_BOLD } from "./pdfFonts.js";

// ─── Constants ───
const MARGIN = 14;
const SCALE = 3;
const ACCENT_COLOR = [218, 253, 104];
const TEXT_PRIMARY = [0, 0, 0];
const TEXT_SECONDARY = [130, 130, 130];
const ROW_ALT = [249, 249, 249];
const BORDER_COLOR = [229, 229, 229];
const ACCENT_LINE_FROM_BOTTOM = 10.5;

const FONT_TITLE = 18;
const FONT_SECTION = 13.5;
const FONT_BODY = 10.5;
const FONT_KPI_NUMBER = 21;
const FONT_KPI_LABEL = 9;
const FONT_KPI_DELTA = 8;
const FONT_FOOTER = 7.5;
const FONT_TABLE_HEAD = 8;
const FONT_TABLE_BODY = 8;

const SPACE_AFTER_TITLE = 8.5;
const SPACE_AFTER_KPI = 6.3;
const SPACE_AFTER_CHART = 8.5;
const SPACE_AFTER_SECTION_TITLE = 5;

// ─── RTL / Bidi Fix ───
// jsPDF's setR2L(true) reverses the ENTIRE string character-by-character.
// This works for Hebrew text but breaks pure LTR content (numbers, latin, symbols).
// Fix: pre-reverse pure-LTR strings so jsPDF's reversal restores them correctly.
// Mixed Hebrew+LTR strings work correctly with jsPDF's reversal as-is.
function fixRtl(str) {
  const s = String(str);
  if (/[\u0590-\u05FF]/.test(s)) return s;
  return [...s].reverse().join("");
}

// Process all table cell values through bidi fix
function fixTableRows(rows) {
  return rows.map((row) => row.map((cell) => fixRtl(String(cell))));
}

function registerFonts(doc) {
  doc.addFileToVFS("Rubik-Regular.ttf", RUBIK_REGULAR);
  doc.addFont("Rubik-Regular.ttf", "Rubik", "normal");
  doc.addFileToVFS("Rubik-Bold.ttf", RUBIK_BOLD);
  doc.addFont("Rubik-Bold.ttf", "Rubik", "bold");
  doc.setFont("Rubik", "normal");
  doc.setR2L(true);
}

function svgToImage(svgElement, width, height) {
  return new Promise((resolve, reject) => {
    const clone = svgElement.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", width);
    clone.setAttribute("height", height);

    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(clone);

    if (!svgString.includes("xmlns:xlink")) {
      svgString = svgString.replace(
        "<svg",
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }

    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * SCALE;
      canvas.height = height * SCALE;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(SCALE, SCALE);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png", 1.0));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function getPageDimensions(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  return { pageWidth, pageHeight, contentWidth };
}

function addFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const { pageWidth, pageHeight } = getPageDimensions(doc);

    doc.setDrawColor(...ACCENT_COLOR);
    doc.setLineWidth(0.7);
    doc.line(
      MARGIN,
      pageHeight - ACCENT_LINE_FROM_BOTTOM,
      pageWidth - MARGIN,
      pageHeight - ACCENT_LINE_FROM_BOTTOM
    );

    doc.setFontSize(FONT_FOOTER);
    doc.setFont("Rubik", "normal");
    doc.setTextColor(...TEXT_SECONDARY);
    // Footer is mixed Hebrew+Latin+numbers — R2L handles it correctly
    doc.text(
      `${pageCount} מתוך ${i} עמוד  |  RevOps Intelligence  |  מוקד בסקייל`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  }
}

function checkPageBreak(doc, yPos, needed) {
  const { pageHeight } = getPageDimensions(doc);
  if (yPos + needed > pageHeight - ACCENT_LINE_FROM_BOTTOM - 5) {
    doc.addPage();
    return MARGIN;
  }
  return yPos;
}

function formatDateHebrew() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export async function generatePDF(config) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  registerFonts(doc);

  const { pageWidth, contentWidth } = getPageDimensions(doc);
  let yPos = MARGIN;

  // ─── Header ───
  doc.setFontSize(FONT_TITLE);
  doc.setFont("Rubik", "bold");
  doc.setTextColor(...TEXT_PRIMARY);
  doc.text(config.pageTitle, pageWidth - MARGIN, yPos, { align: "right" });
  yPos += 7;

  doc.setFontSize(FONT_BODY);
  doc.setFont("Rubik", "normal");
  doc.setTextColor(...TEXT_SECONDARY);
  const dateDisplay = new Date().toLocaleDateString("he-IL");
  // Mixed Hebrew+numbers string — R2L handles correctly
  doc.text(`${dateDisplay} :תאריך הפקה`, pageWidth - MARGIN, yPos, {
    align: "right",
  });
  yPos += 3;

  doc.setDrawColor(...ACCENT_COLOR);
  doc.setLineWidth(0.7);
  doc.line(MARGIN, yPos, pageWidth - MARGIN, yPos);
  yPos += SPACE_AFTER_TITLE;

  // ─── KPI Metrics ───
  if (config.metrics && config.metrics.length > 0) {
    const count = config.metrics.length;
    const boxGap = 3;
    const boxWidth = (contentWidth - boxGap * (count - 1)) / count;
    const boxHeight = 28;
    const boxPadding = 5.3; // ~20px

    for (let i = 0; i < count; i++) {
      const metric = config.metrics[i];
      const x = pageWidth - MARGIN - (i + 1) * boxWidth - i * boxGap;
      const boxCenterX = x + boxWidth / 2;

      doc.setFillColor(245, 245, 245);
      doc.roundedRect(x, yPos, boxWidth, boxHeight, 2, 2, "F");

      // Label — Hebrew, centered
      doc.setFontSize(FONT_KPI_LABEL);
      doc.setFont("Rubik", "normal");
      doc.setTextColor(...TEXT_SECONDARY);
      doc.text(metric.label, boxCenterX, yPos + 7, { align: "center" });

      // Value — may be pure LTR (₪6,931,000) or mixed (4 ימים), centered
      doc.setFontSize(FONT_KPI_NUMBER);
      doc.setFont("Rubik", "bold");
      doc.setTextColor(...TEXT_PRIMARY);
      doc.text(fixRtl(String(metric.value)), boxCenterX, yPos + 19, {
        align: "center",
        maxWidth: boxWidth - boxPadding * 2,
      });

      // Delta
      if (metric.delta) {
        const arrow = metric.deltaDirection === "up" ? "▲" : "▼";
        const color =
          metric.deltaDirection === "up" ? [76, 153, 76] : [204, 68, 68];
        doc.setFontSize(FONT_KPI_DELTA);
        doc.setFont("Rubik", "normal");
        doc.setTextColor(...color);
        doc.text(fixRtl(`${arrow} ${metric.delta}`), boxCenterX, yPos + 25, {
          align: "center",
        });
      }
    }
    yPos += boxHeight + SPACE_AFTER_KPI;
  }

  // ─── Charts ───
  if (config.chartRefs && config.chartRefs.length > 0) {
    for (const chart of config.chartRefs) {
      if (!chart.ref?.current) continue;
      const svgEl = chart.ref.current.querySelector("svg");
      if (!svgEl) continue;

      yPos = checkPageBreak(doc, yPos, 95);

      doc.setFontSize(FONT_SECTION);
      doc.setFont("Rubik", "bold");
      doc.setTextColor(...TEXT_PRIMARY);
      doc.text(chart.title, pageWidth - MARGIN, yPos, { align: "right" });
      yPos += SPACE_AFTER_SECTION_TITLE;

      try {
        const bbox = svgEl.getBoundingClientRect();
        const imgData = await svgToImage(svgEl, bbox.width, bbox.height);
        const aspectRatio = bbox.height / bbox.width;
        const imgWidth = contentWidth;
        const imgHeight = Math.min(imgWidth * aspectRatio, 85);
        doc.addImage(imgData, "PNG", MARGIN, yPos, imgWidth, imgHeight);
        yPos += imgHeight + SPACE_AFTER_CHART;
      } catch {
        yPos += 5;
      }
    }
  }

  // ─── Tables ───
  if (config.tables && config.tables.length > 0) {
    for (const table of config.tables) {
      yPos = checkPageBreak(doc, yPos, 45);

      doc.setFontSize(FONT_SECTION);
      doc.setFont("Rubik", "bold");
      doc.setTextColor(...TEXT_PRIMARY);
      doc.text(table.title, pageWidth - MARGIN, yPos, { align: "right" });
      yPos += SPACE_AFTER_SECTION_TITLE;

      // Fix bidi for all cell values
      const fixedRows = fixTableRows(table.rows);

      autoTable(doc, {
        startY: yPos,
        head: [table.columns],
        body: fixedRows,
        styles: {
          font: "Rubik",
          halign: "right",
          fontSize: FONT_TABLE_BODY,
          cellPadding: { top: 3.2, bottom: 3.2, left: 4.2, right: 4.2 },
          textColor: TEXT_PRIMARY,
          lineColor: BORDER_COLOR,
          lineWidth: 0.26,
        },
        headStyles: {
          fillColor: TEXT_PRIMARY,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: FONT_TABLE_HEAD,
          cellPadding: { top: 3.2, bottom: 3.2, left: 4.2, right: 4.2 },
        },
        alternateRowStyles: {
          fillColor: ROW_ALT,
        },
        columnStyles: table.columnStyles || {},
        margin: { left: MARGIN, right: MARGIN },
        tableWidth: contentWidth,
        tableLineColor: BORDER_COLOR,
        tableLineWidth: 0.26,
      });

      yPos = doc.lastAutoTable.finalY + SPACE_AFTER_CHART;
    }
  }

  // ─── Footer ───
  addFooter(doc);

  // ─── Save ───
  const reportType = config.reportType || "ביצועים";
  const dateFile = formatDateHebrew();
  doc.save(`דוח-${reportType}-${dateFile}.pdf`);
}
