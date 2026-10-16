// Browser-only helpers: text extraction and export. Imported dynamically.

export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    const worker = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = worker;
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      let s = "";
      for (const it of tc.items as Array<{ str?: string; hasEOL?: boolean }>) {
        s += (it.str ?? "") + (it.hasEOL ? "\n" : " ");
      }
      pages.push(s);
    }
    return clean(pages.join("\n\n"));
  }
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const r = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    return clean(r.value);
  }
  return clean(await file.text());
}

function clean(t: string) {
  return t.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").replace(/^Public Disclosure Authorized\s*$/gim, "").trim();
}

export function chunkText(text: string, size = 6000): string[] {
  const paras = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let cur = "";
  for (const p of paras) {
    if ((cur + "\n\n" + p).length > size && cur) {
      chunks.push(cur);
      cur = "";
    }
    if (p.length > size) {
      for (let i = 0; i < p.length; i += size) chunks.push(p.slice(i, i + size));
    } else cur = cur ? cur + "\n\n" + p : p;
  }
  if (cur.trim()) chunks.push(cur);
  return chunks;
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export async function exportPdf(title: string, summary: string, translation: string, filename: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 50;
  let y = M;
  const write = (text: string, size: number, bold = false, color: [number, number, number] = [20, 30, 50]) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    for (const line of doc.splitTextToSize(text, W - M * 2) as string[]) {
      if (y > H - M) {
        doc.addPage();
        y = M;
      }
      doc.text(line, M, y);
      y += size * 1.4;
    }
  };
  doc.setFillColor(15, 58, 128);
  doc.rect(0, 0, W, 8, "F");
  write("Esia Mvetsetsa", 10, true, [15, 58, 128]);
  y += 6;
  write(title, 18, true);
  y += 10;
  if (summary) {
    write("Chidule (Summary)", 14, true, [15, 58, 128]);
    write(summary, 11);
    y += 14;
  }
  if (translation) {
    write("Kumasulira Kwathunthu (Full Translation)", 14, true, [15, 58, 128]);
    write(translation, 11);
  }
  download(doc.output("blob"), filename + ".pdf");
}

export async function exportDocx(title: string, summary: string, translation: string, filename: string) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
  const paras = (t: string) =>
    t.split(/\n/).map((l) => new Paragraph({ children: [new TextRun({ text: l, font: "Arial", size: 22 })], spacing: { after: 80 } }));
  const children = [
    new Paragraph({ children: [new TextRun({ text: "Esia Mvetsetsa", bold: true, color: "0F3A80", font: "Arial" })] }),
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: title, font: "Arial" })] }),
  ];
  if (summary) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Chidule (Summary)", font: "Arial", color: "0F3A80" })] }));
    children.push(...paras(summary));
  }
  if (translation) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Kumasulira Kwathunthu (Full Translation)", font: "Arial", color: "0F3A80" })] }));
    children.push(...paras(translation));
  }
  const doc = new Document({
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 } } }, children }],
  });
  download(await Packer.toBlob(doc), filename + ".docx");
}
