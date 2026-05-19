"use client";

import { Download } from "lucide-react";

export default function ExportPdfButton({ targetId, filename = "oris-export.pdf" }) {
  async function exportPdf() {
    const target = document.getElementById(targetId);
    if (!target) return;
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
    const canvas = await html2canvas(target, {
      backgroundColor: "#050914",
      scale: 2
    });
    const image = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(image, "PNG", 0, 0, width, Math.min(height, pdf.internal.pageSize.getHeight()));
    pdf.save(filename);
  }

  return (
    <button
      className="inline-flex items-center gap-2 rounded-md border border-cyan-signal/25 px-3 py-2 text-xs font-medium text-cyan-bright transition hover:bg-cyan-signal/10"
      onClick={exportPdf}
      type="button"
    >
      <Download className="h-4 w-4" />
      PDF
    </button>
  );
}
